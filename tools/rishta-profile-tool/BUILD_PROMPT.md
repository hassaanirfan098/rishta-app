# Build prompt: "Post & Schedule" composer for Rishta Profile Tool

Paste this whole prompt into a new Claude conversation (with the `rishtaprofiletool_batch.html` file and the `rishta-tool-handoff.md` doc attached) to build this feature.

---

## Context (read the attached handoff doc + file first)

This is a single-file HTML app (`rishtaprofiletool_batch.html`) for a matrimonial bureau. It already has:
- A batch pipeline: paste 20+ profiles → AI extraction (Groq/Cerebras) → a review table (tick/cross per field, Edit/Remove per row) → `proceedToScheduling()` saves approved profiles to Supabase.
- A "Create Post" tab with: profile filters (`runProfileFilter()`), a checkbox results table, 3 format cards (single/multi/story), and a hybrid scheduling table (`buildPostScheduleRows()` — set a start time + interval, "Apply to all" auto-fills every row, each row still individually editable).
- Render functions already built and working: `renderAllSlides(profile, 'portrait'|'square')` (5-slide carousel) and `drawSummary(ctx, profile, 'crop'|'full')` (highlight card — crop=1080×1350, full=1080×2050).
- `insertPostQueueItem(item)` writes finished posts to a Supabase `post_queue` table.

**Do not rebuild any of the above from scratch — extend and reuse it.** The Create Post tab already contains ~70% of what's needed below; this prompt describes evolving it into a dedicated composer view with a few new requirements layered on.

## What to build

### 1. Replace the current inline batch-scheduling panel with a "Post & Schedule" button
After `proceedToScheduling()` finishes saving a batch, instead of immediately showing the scheduling panel inline, show a single button: **"📤 Post & Schedule"**. Clicking it opens the composer described below (as a full-screen section within the same page — do not navigate to a separate URL, since this is a single-file app and losing in-memory state on navigation would break things).

### 2. Composer top bar: profile selection
- A "Select profiles" button opens a full table of **every saved profile** (not just the current batch) — reuse `runProfileFilter()` / `profiles` array.
- Track which profile IDs were saved in the **most recently completed batch** (a simple in-memory array set right after `proceedToScheduling()` succeeds is enough — no schema change needed). Rows for those profiles get a distinct light background color + a small "Last batch" badge, so they're visually distinguishable from older profiles in the same table.
- Checkboxes per row (reuse the selection pattern from the existing Create Post tab).
- A **"Schedule ✓ (N selected)"** button at the top of this table: clicking it takes the checked profiles into the composer body below and closes/collapses the table.

### 3. Format picker: exactly 4 presets (not 3 — extend the existing 3-card version)
Replace the current single/multi/story 3-card picker with 4 explicit cards:

1. **1080×1350 Single-profile carousel** — all 5 slides of one profile, portrait. Requires exactly 1 profile selected per carousel (see scheduling behavior below — this format can actually process MULTIPLE selected profiles, each becoming its own separate carousel post).
2. **1080×1080 Single-profile carousel** — same as #1, square format instead of portrait. Pass `'square'` instead of `'portrait'` to `renderAllSlides()`.
3. **1080×1350 Multi-profile carousel** — one combined carousel post where each selected profile contributes one highlight card (`drawSummary(ctx, p, 'crop')`). Needs 2–10 profiles.
4. **Portrait Story** — one individual Story post per selected profile (`drawSummary(ctx, p, 'full')`), each scheduled separately since Stories can't be carousels.

### 4. Per-format behavior

**Formats 1 & 2 (single-profile carousel, portrait or square):**
- Works on ALL the profiles selected in step 2 (not just one) — each becomes its own separate carousel post.
- Show an explicit toggle (not just an auto-fill default): **"Bulk schedule (start + interval)"** vs **"Customize each carousel's time individually"**. Both modes should produce the same underlying per-row editable table (reuse `buildPostScheduleRows()` pattern) — the toggle just decides whether "Apply to all" runs automatically first or the person fills every row by hand from a blank state.

**Format 3 (multi-profile carousel):**
- Show a "reselect with filters" option — reuse `runProfileFilter()` but expose ALL its filter fields prominently here (income, profession, city, nationality, marital status, gender, age range, caste), OR let the person proceed with whatever was already selected in step 2.
- After selection is finalized, show a **preview row of the actual rendered highlight-card thumbnails** (call `drawSummary()` for each selected profile and display the canvases, not just a text list) before scheduling — the person should see what they're about to post, not just names in a table.
- Then the scheduling time (single time for the whole carousel, since it's one post).

**Format 4 (Story):**
- Same reselect-with-filters-or-keep-selection pattern as format 3.
- Preview thumbnails (full-size `drawSummary('full')` renders) per selected profile.
- Scheduling: one row per profile (each Story posts individually) — reuse the hybrid table pattern.
- A "Schedule" button at the bottom, per your spec.

### 5. Features to add that weren't explicitly specified but are needed (use your judgment on exact placement/wording)

- **Running summary panel**: before the final Schedule/Queue button, show a one-line summary like "7 posts will be created, scheduled between Thu 8:00 PM and Sat 2:00 AM" so the person isn't confirming blind.
- **Collision warning**: if two posts in the same batch end up scheduled less than ~30 minutes apart, show a soft warning (not a hard block) — posting too close together looks spammy on Instagram.
- **Duplicate-schedule guard**: before queueing, check `post_queue` for any existing not-yet-published entry for the same profile_id, and warn if one exists ("Ahmed Khan already has a pending post scheduled for Friday — schedule another anyway?").
- **A way to see what's already queued**: a small "View queue" link/panel showing pending `post_queue` rows (profile, format, scheduled time, status) with a cancel/delete action — right now there's no way to review or undo something already queued.
- **Clear exit**: a "← Back" / "Cancel" control that returns to the normal tabs without losing the profiles that were already saved to the database (only the in-progress composer state should be discardable).
- **Format validity messaging**: keep the existing pattern from the Create Post tab (e.g. "this format needs 2 to 10 profiles — currently 1") for whichever format is selected.
- **Loading/progress feedback** during actual rendering (this can take a while for many profiles) — reuse the status-text pattern already used elsewhere in the file (e.g. "Rendering 3 of 12…").

### 6. What NOT to change
- Don't touch the batch extraction/review pipeline before `proceedToScheduling()` — only what happens after a successful save.
- Don't remove the existing Create Post tab's filter logic — extend/reuse it, don't duplicate it under a different name.
- Don't add authentication back in (removed intentionally).
- Keep using the existing Supabase `post_queue` schema (profile_id, catalog_id, post_type, category, images, scheduled_for, status) — extend it with new columns only if strictly necessary, and call that out explicitly if you do.

## Deliverable
Modify `rishtaprofiletool_batch.html` directly. Verify the file's inline `<script>` blocks still parse (e.g. via Node's `new Function()`) and that HTML tags remain balanced before calling it done, the same way prior iterations on this file were checked.
