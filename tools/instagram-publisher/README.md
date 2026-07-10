# Instagram publisher (direct Graph API — $0/month)

Reads due rows from the `post_queue` Supabase table (populated by `rishtaprofiletool_batch.html`'s
Post & Schedule composer), uploads each queued image to a public Supabase Storage bucket, publishes
to Instagram via the Graph API, and marks the row `published` (or `failed`).

`post_type: 'highlight_card'` rows are saved with `status: 'ready_for_highlight'`, not `'ready'`, on
purpose — those are meant to be added to Instagram Highlights by hand and are never auto-published.

## One-time setup

### 1. Create a public Supabase Storage bucket
Supabase dashboard → Storage → New bucket → name it `post-media` → toggle **Public bucket** on.
(A different name works too — just set `SUPABASE_MEDIA_BUCKET` to match.)

### 2. Get the values below
- `SUPABASE_URL` — your project URL (same one already in `rishtaprofiletool_batch.html`).
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Project Settings → API → `service_role` key.
  **Never** put this in the HTML tool or anywhere client-side — it bypasses RLS. It only belongs
  in GitHub Actions secrets.
- `IG_USER_ID` — your **Instagram Business Account ID** (not the Meta App ID) — found on the
  Meta app's "API setup with Instagram login" page.
- `IG_ACCESS_TOKEN` — the long-lived access token from that same page.

### 3. Add them as GitHub Actions secrets
Repo → Settings → Secrets and variables → Actions → New repository secret, one for each of:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_MEDIA_BUCKET` (optional, defaults to
`post-media`), `IG_USER_ID`, `IG_ACCESS_TOKEN`.

That's it — `.github/workflows/publish-instagram.yml` runs this every 15 minutes for free on
GitHub's hosted runners (well within the free tier's monthly minutes for a job this short).

## Token refresh (every ~60 days)

Long-lived Instagram tokens expire after 60 days. Refresh **before** expiry (refreshing extends it
another 60 days from the refresh date; you can't refresh an already-expired token — you'd have to
redo the login flow):

```bash
curl -s "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=$IG_ACCESS_TOKEN"
```

Take the new token from the response and update the `IG_ACCESS_TOKEN` GitHub secret. (Automating
this refresh on its own schedule is a reasonable next step once the basic publishing flow is
confirmed working — ask if you want that added.)

## Running it locally instead of / before relying on GitHub Actions

```bash
cd tools/instagram-publisher
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... IG_USER_ID=... IG_ACCESS_TOKEN=... npm run publish
```

## Costs

$0. GitHub Actions free tier (2,000 min/month for private repos, unlimited for public) easily
covers a job this short running every 15 minutes; Supabase Storage's free tier (1GB) is far more
than these PNGs need; the Instagram Graph API itself has no per-call cost.
