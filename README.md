# Biruk Belete: Portfolio + CMS

Bilingual (English / አማርኛ), mobile-first portfolio with a built-in `/admin` so every word, photo and link can be edited from a phone, with no code changes or redeploys.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion · Postgres (Neon / Vercel Postgres) via Drizzle · `jose` sessions · `zod` · Vercel Blob (direct browser uploads) · Vitest.

## Quick start

```bash
npm install
cp .env.example .env.local        # then fill it in (see below)
npm run db:push                   # create tables in your database
npm run db:seed                   # load the starter content ONCE (safe to re-run, never overwrites)
npm run dev                       # http://localhost:3000   admin: /admin
npm test                          # 44 tests (unit + integration on an in-process Postgres)
```

Without `DATABASE_URL` the public site still builds and runs from the typed defaults in `src/config/portfolio.ts`.

### Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon / Vercel Postgres connection string |
| `ADMIN_PASSWORD` | the single admin password (use a long passphrase) |
| `SESSION_SECRET` | `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | created when you connect a Blob store to the Vercel project |
| `NEXT_PUBLIC_SITE_URL` | the live URL (canonical, OG, sitemap) |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | optional: email you each contact message |

## Editing content

* **From the browser (normal way):** go to `/admin`, sign in, edit. Saves refresh the public site within seconds.
* **Tabs:** Dashboard · Profile · Services · Experience · Projects · Skills · Education · Certifications · Gallery · Messages · Settings.
* **Reorder** items with the ↑ ↓ buttons, **hide** an item with the Visible checkbox, **upload** photos / your CV PDF with *Choose file* (goes straight to Vercel Blob; images are resized to max 2400px first).
* **Backup:** Settings → *Export all content (JSON)*; *Import backup* restores it (validated first, replaces everything).
* **Defaults / seed data:** `src/config/portfolio.ts`. Anything written as `{{PLACEHOLDER}}` is hidden from visitors until you replace it.
* **UI wording:** `messages/en.json` and `messages/am.json` (a test fails if the two files drift apart).
* **Colours:** Settings → Colours.

### Placeholders still to fill in

`{{EMAIL}}`, `{{PHONE}}`, `{{LINKEDIN_URL}}`, `{{GITHUB_URL}}`, `{{TELEGRAM_URL}}`, `{{YOUTUBE_URL}}` (Profile) · job start date `{{START_YYYY-MM}}` and a measurable result in the Experience item · `{{YOUTUBE_CHANNEL_URL}}` and `{{GITHUB_REPO_URL}}` (Projects) · degree years and the certification entry (Education / Certifications). Also upload a CV PDF, a portrait and, optionally, a hero image. Please review the Skills list: it is inferred from your role and background, not from a full CV.

## Deploy (Vercel)

These need your logins, so run them yourself:

```bash
# 1. GitHub (private repo)
git init && git add -A && git commit -m "Portfolio"
gh auth login && gh repo create biruk-portfolio --private --source=. --push

# 2. Database: create a Neon (or Vercel Postgres) DB, put its URL in .env.local, then
npm run db:push && npm run db:seed     # once, from your machine, against the production URL

# 3. Vercel
npx vercel login && npx vercel link
npx vercel env add DATABASE_URL production       # repeat for ADMIN_PASSWORD, SESSION_SECRET,
                                                 # NEXT_PUBLIC_SITE_URL (https URL), RESEND_* (optional)
# Dashboard -> Storage -> Create Blob store -> connect to the project (adds BLOB_READ_WRITE_TOKEN)
npx vercel --prod
# 4. set NEXT_PUBLIC_SITE_URL to the real URL, then redeploy: npx vercel --prod
```

### Verify on the live URL

Language toggle (EN / አማ) · a contact message appears in `/admin` → Messages · an admin edit shows on the public page · photo and PDF upload · JSON export/import · `/admin` redirects to the login page when signed out · share the link in WhatsApp/Telegram to check the preview image · break `DATABASE_URL` in a preview deployment and confirm the public site still renders the defaults.

## Design decisions

* **One `items` table** (`kind` + validated JSON) instead of one table per section: adding a section needs no migration, and the form, validation and seed all come from `src/lib/kinds.ts`.
* **Resilience:** public reads go through `unstable_cache` with a tag; on any DB error they fall back to the typed defaults (errors are never cached, so it self-heals). The build needs no database.
* **Security:** signed httpOnly `SameSite=Lax` cookie (7 days, `Secure` in production); middleware guards `/admin/*` and `/api/admin/*` and fails closed; login limited to 5 per 15 min per IP and contact to 3 per hour per IP, both **database-backed**; honeypot field; zod on every input; URLs limited to http(s) (no `javascript:`); CSV export neutralises formula injection; React escapes all rendered text.
* **Uploads** go browser → Vercel Blob with a token route that checks the admin cookie; files never pass through a serverless function (4.5 MB limit). The upload-completed webhook is deliberately not used because it arrives without the cookie.
* **Accessibility / performance:** skip link, semantic headings, 44px touch targets, visible focus, `prefers-reduced-motion` respected, Ethiopic fonts self-hosted via Fontsource (no Google Fonts request), Amharic line-height 1.75, ISR page.

## Not verified yet

Lighthouse scores and a real-device 360px check (no browser was available while building), and the Vercel Blob upload path (needs a real token). Everything else listed above is covered by the build, typecheck and tests.
