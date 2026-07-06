# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server (Turbopack). Port is often already taken by a stray server; use `PORT=3005 npm run dev` if `next dev` says another server is running.
- `npm run build` — production build; **run this to verify changes** (it fails on type errors, which `dev` tolerates).
- `npm run lint` — ESLint.
- No test suite exists. "Verify" means `npm run build` plus, for UI, rendering a page with a headless browser (see below).

## Deploy & branches

- Production deploys from the **`main`** branch on Vercel automatically on push. Active development happens on `claude/new-session-eertsp`; the workflow is: commit there, `git branch -f main <dev-branch>`, push both.
- Supabase migrations in `supabase/migrations/*.sql` are **applied by hand in the Supabase SQL editor**, not by a CLI. Adding a migration file does nothing until the user runs it. The network policy blocks `api.supabase.com` and `vercel.app`, so all Supabase/Vercel dashboard changes (SMTP, env var values, running SQL) are done by the user, not from here.
- Env var *names* live in `.env.local` (gitignored) and Vercel; only the user can set/read their values.

## Architecture

**Stack:** Next.js 16 App Router + TypeScript + Tailwind v4 + Supabase (auth, Postgres, storage, realtime, RLS). This is a Muslim matrimonial PWA; the brand is plum (`brand-*`) + gold (`gold-*`).

**Routing / middleware — `src/proxy.ts`, not `middleware.ts`** (this Next version renamed it). `proxy.ts` → `src/lib/supabase/middleware.ts:updateSession`, which is the single source of truth for: redirecting unauthed users off protected paths (`/discover`, `/matches`, `/chat`, `/directory`, `/profile`, `/settings`), bouncing authed users off `/login`/`/signup`, and forcing users with `onboarding_complete = false` into `/onboarding`. Route groups: `(auth)`, `(onboarding)`, `(app)` (this group's `layout.tsx` also hard-redirects unauthed users and mounts `BottomNav` + `PushInit`).

**Supabase clients — three, do not mix them up** (`src/lib/supabase/`):
- `client.ts` `createClient()` — browser, anon key, subject to RLS.
- `server.ts` `createClient()` — server components/route handlers, anon key + cookies.
- `server.ts` `createServiceClient()` and `createClient(url, SERVICE_ROLE_KEY)` — **bypasses RLS**, server-only. RLS blocks client-side admin reads, so every admin action goes through `/api/admin/*` routes that check `is_admin` then use the service role. Never expose the service key to the client.

**Data-flow gotchas learned the hard way:**
- **Photos** live in the `profile_photos` table (rows `{profile_id, url, order_index}`) uploaded to the `avatars` storage bucket, plus `profiles.avatar_url` for the main DP. There is a `profiles.photo_urls` column that is **not** the source of truth — don't read from it. Onboarding and Settings both write to `profile_photos`; the first photo also sets `avatar_url`.
- **Directory vs member profiles:** two tiers. Member `profiles` are swipeable/matchable; `directory_profiles` are pay-per-unlock (Rs 500 unlock / Rs 5000 bundle) whose phone number must never reach the client until an `unlocks` row exists. Both appear interleaved in Discover.
- **Matches/likes:** a mutual like creates a `matches` row (DB-side); "Liked You" is Gold-gated (`profiles.is_gold` + `gold_until`).

**Payments:** Safepay (Pakistani gateway) via `/api/payment/create` (amounts in paisas, requires `client:"WEB"` + `environment:"production"`) and `/api/webhook/payment` (HMAC-verified) which grants unlocks/credits/Gold.

**Notifications:** Web Push via VAPID (`web-push`, `public/sw.js`, `src/hooks/usePushNotifications.ts`, `/api/push/*`). Optional email via Resend (`/api/email/send`, `/api/webhook/notify`) — only active if `RESEND_API_KEY` is set. Supabase's built-in auth mailer is rate-limited/testing-only; reliable confirmation emails need SMTP configured in the Supabase dashboard.

**Theme:** burgundy+gold scales are defined in `src/app/globals.css` under `@theme` (Tailwind v4 — custom colors are CSS vars, not a config file). The logo is `src/components/Logo.tsx` (`LogoMark` tile, `LogoGlyph` bare with `onDark`/`onLight` variants); icon PNGs/favicon are generated from `public/icon.svg`.

**PWA:** `public/manifest.json` + `public/sw.js`. The SW purges all caches on `activate` and is registered with `updateViaCache:"none"`; bump the version comment in `sw.js` and the `?v=N` on manifest icons when shipping asset changes so installed PWAs refresh.

## Rendering UI for verification (no auth session available here)

Authenticated screens can't be logged into from this environment. To eyeball a component, make a throwaway `src/app/preview/page.tsx` rendering it with mock data, screenshot it with the pre-installed Chromium (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, driven via the global Playwright at `NODE_PATH=/opt/node22/lib/node_modules`), then delete the preview before committing.
