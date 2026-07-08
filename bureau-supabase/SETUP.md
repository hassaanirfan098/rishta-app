# Connecting the bureau tool to a shared Supabase database

This makes `rishta-profile-tool.html` (your team's internal tool) and
`rishta-customer-form.html` (the public customer-facing form) share one
live database — any profile any teammate saves, or any customer submits,
shows up for everyone immediately, on any device.

⚠️ This repo also contains a separate, unrelated Next.js app with its own
Supabase project. **Do not reuse that project.** Create a brand-new one
below — the SQL below is namespaced (`bureau_...`) so it can't collide,
but a separate project keeps the two products fully isolated anyway.

## 1. Create a new Supabase project (~3 minutes)

1. Go to [supabase.com](https://supabase.com) → sign in (free, no credit
   card) → **New project**.
2. Pick any name (e.g. "city-marriage-bureau"), a strong database
   password (save it somewhere — you likely won't need it again), and the
   region closest to Pakistan.
3. Wait ~2 minutes for it to finish provisioning.

## 2. Run the schema (~1 minute)

1. In your new project, open **SQL Editor** (left sidebar) → **New query**.
2. Paste the entire contents of `bureau-supabase/schema.sql` (in this
   folder) and click **Run**.
3. You should see "Success. No rows returned." — that's it, your tables
   exist.

## 3. Get your URL and key (~1 minute)

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   and the **anon public** key (a long string starting with `eyJ...`).
3. Open both `rishta-profile-tool.html` and `rishta-customer-form.html`,
   find these two lines near the top of the `<script>` section in each,
   and paste your values in:
   ```js
   const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_PROJECT_URL_HERE';
   const SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE';
   ```

## 4. Create logins for your team (~2 minutes per person)

Your team needs an account to open `rishta-profile-tool.html` — the
public customer form does **not** need one.

1. In Supabase: **Authentication** → **Users** → **Add user** → **Create
   new user**.
2. Enter each teammate's email + a password, and toggle **Auto Confirm
   User** on (so they can log in immediately, no confirmation email
   needed).
3. Give each teammate their email + password directly (e.g. via
   WhatsApp) — that's what they'll type into the tool's sign-in screen.

## 5. Try it

- Open `rishta-profile-tool.html`, sign in with a team login, save a test
  profile. If you had any profiles saved locally on this device from
  before, you'll see a one-time "syncing…" banner move them into the
  shared database automatically.
- Open `rishta-customer-form.html` (host it — see below — or just open
  the file), fill it out, and submit. It should appear immediately in the
  team tool's Matching Space on every device.

## 6. Hosting the customer form as a public link

`rishta-customer-form.html` needs a real URL to hand out to customers
(not a file to download). The free option: **GitHub Pages** on this repo
— Settings → Pages → deploy from a branch — which turns the file into a
stable link like:

```
https://<your-github-username>.github.io/rishta-app/rishta-customer-form.html
```

Keep `rishta-profile-tool.html` as a file you and your team download and
open locally (it needs a login, so there's no benefit to hosting it
publicly).

## Notes / limits

- Free Supabase tier: 500MB database + 5GB bandwidth/month — very
  comfortable for a bureau's scale.
- Photos are stored as embedded base64 inside each profile row (not a
  separate file bucket) — simple for now; if photo volume grows large we
  can move to Supabase Storage later without changing anything else.
- The bureau's WhatsApp number (set from **New Profile → Bureau WhatsApp
  no.** in the team tool) is shared automatically — the customer form
  always shows the current number on generated cards.
