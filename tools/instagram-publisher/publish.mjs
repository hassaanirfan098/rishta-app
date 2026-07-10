#!/usr/bin/env node
/*
 * Publishes due posts from the Rishta Profile Tool's `post_queue` Supabase table to Instagram,
 * using the Instagram Graph API directly (no third-party posting service).
 *
 * Reads rows where status='ready' and scheduled_for <= now, uploads each queued image (currently
 * stored as base64 PNG data URLs) to a public Supabase Storage bucket to get a public URL (the
 * Instagram API requires a real public URL, not base64/local files), creates the appropriate
 * Instagram media container(s) — a single image, a carousel, or a Story — publishes it, and marks
 * the row `published` (or `failed` with the error visible in the workflow logs).
 *
 * `post_type: 'highlight_card'` rows are saved with status='ready_for_highlight', not 'ready', on
 * purpose (see rishtaprofiletool_batch.html) — those are meant to be added to Instagram Highlights
 * by hand and are intentionally never picked up here.
 *
 * Required environment variables (see README.md in this folder):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_MEDIA_BUCKET (default "post-media"),
 *   IG_USER_ID, IG_ACCESS_TOKEN
 */

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'post-media';
const IG_USER_ID = requireEnv('IG_USER_ID');
const IG_ACCESS_TOKEN = requireEnv('IG_ACCESS_TOKEN');
const GRAPH_VERSION = process.env.IG_GRAPH_VERSION || 'v21.0';
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) { console.error(`Missing required environment variable: ${name}`); process.exit(1); }
  return v;
}

function supaHeaders(extra) {
  return { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, ...extra };
}

async function fetchDuePosts() {
  const nowIso = new Date().toISOString();
  const url = `${SUPABASE_URL}/rest/v1/post_queue?status=eq.ready&scheduled_for=lte.${encodeURIComponent(nowIso)}&order=scheduled_for.asc&select=*`;
  const resp = await fetch(url, { headers: supaHeaders() });
  if (!resp.ok) throw new Error(`Could not fetch post_queue: ${resp.status} ${await resp.text()}`);
  return resp.json();
}

async function setStatus(id, status, note) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/post_queue?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: supaHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ status }),
  });
  if (!resp.ok) console.error(`Could not update status for ${id}: ${resp.status} ${await resp.text()}`);
  if (note) console.log(`  -> ${note}`);
}

// Instagram's API needs a real public URL per image, not base64 — upload each queued image to a
// public Supabase Storage bucket first (create it once via the Supabase dashboard: Storage ->
// New bucket -> name it "post-media" (or set SUPABASE_MEDIA_BUCKET) -> toggle "Public bucket" on).
async function uploadImageToStorage(rowId, index, dataUrl) {
  const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error(`Image ${index} for ${rowId} isn't a base64 data URL — got: ${String(dataUrl).slice(0, 40)}...`);
  const [, ext, b64] = match;
  const bytes = Buffer.from(b64, 'base64');
  const path = `post_queue/${rowId}/${index}.${ext}`;
  const resp = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_MEDIA_BUCKET}/${path}`, {
    method: 'POST',
    headers: supaHeaders({ 'content-type': `image/${ext}`, 'x-upsert': 'true' }),
    body: bytes,
  });
  if (!resp.ok) throw new Error(`Storage upload failed for ${path}: ${resp.status} ${await resp.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${path}`;
}

async function igFetch(path, params, method) {
  const url = new URL(`${GRAPH_BASE}/${path}`);
  const body = new URLSearchParams({ ...params, access_token: IG_ACCESS_TOKEN });
  const resp = await fetch(url, { method: method || 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json.error) throw new Error(`Instagram API error on ${path}: ${resp.status} ${JSON.stringify(json.error || json)}`);
  return json;
}

// Image containers (and carousels made of them) finish near-instantly, but polling briefly is
// cheap insurance against publishing before Instagram has actually finished processing the image.
async function waitUntilFinished(containerId, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 30000);
  while (Date.now() < deadline) {
    const { status_code } = await igFetch(containerId, { fields: 'status_code' }, 'GET');
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR') throw new Error(`Container ${containerId} failed processing`);
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`Container ${containerId} did not finish processing in time`);
}

async function publishRow(row) {
  console.log(`Publishing ${row.id} (${row.post_type}, ${row.catalog_id || row.profile_id || 'no id'})...`);
  const imageUrls = [];
  for (let i = 0; i < row.images.length; i++) imageUrls.push(await uploadImageToStorage(row.id, i, row.images[i]));

  const caption = row.caption || '';

  if (row.post_type === 'story') {
    const { id: containerId } = await igFetch(IG_USER_ID + '/media', { image_url: imageUrls[0], media_type: 'STORIES' });
    await waitUntilFinished(containerId);
    await igFetch(IG_USER_ID + '/media_publish', { creation_id: containerId });
    return;
  }

  if (imageUrls.length === 1) {
    const { id: containerId } = await igFetch(IG_USER_ID + '/media', { image_url: imageUrls[0], caption });
    await waitUntilFinished(containerId);
    await igFetch(IG_USER_ID + '/media_publish', { creation_id: containerId });
    return;
  }

  // Carousel: one child container per image (no caption on children), then a parent container
  // referencing all the children, published as a single carousel post.
  const childIds = [];
  for (const url of imageUrls) {
    const { id } = await igFetch(IG_USER_ID + '/media', { image_url: url, is_carousel_item: 'true' });
    await waitUntilFinished(id);
    childIds.push(id);
  }
  const { id: parentId } = await igFetch(IG_USER_ID + '/media', { media_type: 'CAROUSEL', children: childIds.join(','), caption });
  await waitUntilFinished(parentId);
  await igFetch(IG_USER_ID + '/media_publish', { creation_id: parentId });
}

async function main() {
  const due = await fetchDuePosts();
  console.log(`${due.length} post(s) due.`);
  for (const row of due) {
    try {
      await publishRow(row);
      await setStatus(row.id, 'published', 'published successfully');
    } catch (e) {
      console.error(`  !! Failed to publish ${row.id}: ${e.message}`);
      await setStatus(row.id, 'failed', `marked failed: ${e.message}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
