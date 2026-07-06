# Rishta — Project Handoff

Upload this file (plus the repo) to a new session to continue exactly where we left off.
Read `CLAUDE.md` first for architecture and commands; this file is the running status log.

Last updated: 2026-07-05 · Deploy branch: `main` (Vercel auto-deploys on push) · Dev branch: `claude/new-session-eertsp`

---

## 1. What Rishta is
A Muslim matrimonial PWA for Pakistan & diaspora (City Marriage Bureau), benchmarked visually against Muzz. Two tiers:
- **Member profiles** — swipe / like / match / chat; **Gold** subscription (Rs 2,000/mo, Rs 10,000/yr) unlocks "who liked you", boost, read receipts, advanced filters.
- **Directory profiles** — pay-per-unlock contact (Rs 500 single, Rs 5,000 bundle of 30). Phone number must never reach the client until an `unlocks` row exists.

Stack: Next.js 16 App Router + TypeScript + Tailwind v4 + Supabase (auth, Postgres, storage, realtime, RLS). Payments via Safepay. Push via VAPID. Brand = plum (`brand-*`) + gold (`gold-*`).

---

## 2. What's DONE (built + shipped to `main`)

**Wave 1 — core**
- Admin panel (approve/revoke profiles, directory CSV upload, reports) via service-role `/api/admin/*` routes (RLS-safe)
- Matches + realtime Chat (with read receipts)
- Safepay payments: unlock, bundle, Gold monthly/yearly (`/api/payment/create`, HMAC webhook `/api/webhook/payment`)
- Gold subscription gate ("Liked You" tab), profile boost
- Web Push notifications (VAPID, service worker)

**Wave 2 — profiles & social**
- Full profile view page `/profile/[id]`, self profile, Settings (photo mgmt, edit, change password, delete account)
- Report & Block (`/api/report`, `/api/block`)
- Like/Pass animations, Urdu language toggle, height field

**Wave 3 — polish/growth**
- Working Discover filters (age via DOB, sect, marital status, city, ethnicity, height)
- Admin reports dashboard, email notifications scaffold (Resend `/api/email/send`, `/api/webhook/notify`)

**Professional layer**
- Marketing landing page (`/`), Terms (`/terms`), Privacy (`/privacy`), branded 404, SEO + OpenGraph/Twitter share image, toast system, loading skeletons, error boundaries (`error.tsx`, `global-error.tsx`), robots + sitemap, security headers, PWA install prompt

**Brand + logo**
- Logo = interlocking gold/white rings + gold heart on burgundy (`src/components/Logo.tsx`, `public/icon.svg`); all app icons, favicon, OG image regenerated
- Full theme swap green → burgundy+gold (Tailwind `@theme` in `src/app/globals.css`)

**Muzz-style UI redesign (all screens)**
- Discover (full-bleed immersive cards, circular Pass/Like), Profile (immersive hero + clean sections), Matches (photo-tile grid + pill tabs), Chat, Settings, Onboarding (extrabold headings, pill CTAs, gold progress)

**Recent fixes**
- Onboarding no longer flashes "Get Started" for already-signed-in users (auth check gates render)
- Service worker v3 purges stale caches (fixes old logo showing on installed PWA)
- Onboarding photos now really upload to storage; first photo becomes the DP; all photos saved to `profile_photos`; profile page reads gallery from there
- Signup handles email-confirmation-on/off gracefully + "Resend email" button

---

## 3. Env vars (NAMES only — real values live in Vercel + your local `.env.local`)
Set every one of these in the Vercel project. `NEXT_PUBLIC_*` are safe on the client; the rest are server-only secrets.

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client, RLS-bound) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role — bypasses RLS, **server only** |
| `NEXT_PUBLIC_APP_URL` | Full site URL, e.g. `https://<your>.vercel.app` — used by OG images, email links, auth redirect |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web push public key |
| `VAPID_PRIVATE_KEY` | Web push private key |
| `VAPID_EMAIL` | `mailto:` contact for VAPID |
| `SAFEPAY_SECRET_KEY` | Safepay API secret (production) |
| `SAFEPAY_WEBHOOK_SECRET` | Safepay webhook HMAC secret |
| `RESEND_API_KEY` | *(optional, not yet set)* enables email notifications |
| `WEBHOOK_SECRET` | *(optional)* guards `/api/webhook/notify` for match/message emails |

Your actual key values: keep them in `SECRETS.local.md` (gitignored — see the template) and in Vercel. They are intentionally NOT in any committed file.

---

## 4. PENDING — operational tasks only YOU can do (dashboards)
These are not code; they're account/config steps. Nothing here blocks the code from building.

1. **Signup emails not arriving** — Supabase's built-in mailer is rate-limited/testing-only. Do ONE:
   - Fastest: Supabase → Authentication → Providers → Email → turn **off "Confirm email"** (users sign in immediately; code already handles this path). OR
   - Proper: Supabase → Authentication → Emails → **SMTP Settings** → configure a real sender (Resend). Also add your Vercel URL under Authentication → URL Configuration → Redirect URLs.
2. **Run pending SQL migrations** in Supabase SQL editor if not already applied: everything in `supabase/migrations/` (reports/blocks, boost/read_receipts columns, etc.). Migrations are applied by hand — adding a file does nothing on its own.
3. **Safepay** — complete merchant activation for live payments (account was in test mode with prod keys).
4. **Email notifications (optional)** — set `RESEND_API_KEY` + `WEBHOOK_SECRET` in Vercel, and add Supabase Database Webhooks on `matches` (INSERT) and `messages` (INSERT) pointing to `/api/webhook/notify` with the secret header.
5. **Admin access** — `is_admin = true` is set for `hassaanirfan098@gmail.com` and `kiqs098@gmail.com`. Add more via SQL.
6. **Custom domain (optional)** — add in Vercel so links aren't `*.vercel.app`; then update `NEXT_PUBLIC_APP_URL`.
7. **After any deploy** — hard-refresh (Cmd/Ctrl+Shift+R); for the installed PWA, close+reopen twice, and re-add to home screen if the icon is stale.

---

## 5. Known decisions / gotchas
- **Photos** = `profile_photos` table + `avatars` storage bucket + `profiles.avatar_url`. The `profiles.photo_urls` column is NOT used — don't read it.
- Middleware is **`src/proxy.ts`**, not `middleware.ts` (this Next version).
- Three Supabase clients (browser anon / server anon / service-role) — see CLAUDE.md.
- Discover interleaves member + directory cards; directory phone stays hidden until unlocked.
- Redesign followed Muzz for layout/spacing/typography but kept Rishta's own tabs (Matches/Liked You), not Muzz's social "Jamaa" feed. Discover uses tap-Like + scroll, not drag-to-swipe (open follow-up if you want the gesture).

---

## 6. Possible next work (not started)
- Drag-to-swipe gesture on Discover
- Deeper onboarding step-by-step Muzz rebuild (only shared components were restyled)
- Wali (guardian) mode surfacing in UI if desired
- Real email deliverability end-to-end test once SMTP is set
