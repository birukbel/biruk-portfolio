# Review of the original prompt, and the corrected version

## What was wrong (and what I changed)

**Wedding leftovers that do not belong in a portfolio**
- Ethiopian-clock ↔ standard-time conversion, schedule tracks (groom/bride/guests), venues, add-to-calendar (.ics for "22 Nov 2026"), RSVP form and table, guest list with personalised links, Gifts (CBE/Telebirr), background music, "couple names", "invitation/closing text", headcount dashboard. All removed.
- **`noindex`** was required "so the invitation stays private". On a portfolio that hides you from Google and recruiters. Replaced with real SEO: indexable, canonical, sitemap, robots (admin/API disallowed), JSON-LD `Person`, OG image.
- OG image "with the names and date" became name + title.

**Missing for a portfolio**
- No content model for experience, projects, skills, services, education, certifications, CV download, contact form or social links. Added, using your real facts and clearly marked `{{placeholders}}` where I could not verify something.
- Garbled or empty lines ("professional DATA", empty Footer, orphan "Render as a vertical timeline") replaced by explicit sections.

**Engineering improvements**
- Ten-plus tables were over-normalised for this content. Now one `items` table (`kind` + zod-validated JSON) plus `site_settings`, `messages` and the two rate-limit tables. No migration per new section.
- Default language was Amharic. For recruiters and international clients English-first is safer; the toggle remembers the choice and a browser set to Amharic switches automatically. (One constant: `DEFAULT_LANG`.)
- Blob uploads: the `onUploadCompleted` webhook arrives **without** the admin cookie and would be blocked by the middleware, so it is not used.
- Seed made idempotent (never overwrites settings, inserts items only into an empty table). Import validates the whole file before any write, then writes in one batch.
- Added honeypot, CSV formula-injection protection, URL scheme allow-list, a fail-closed middleware, and tests that run the real route handlers against an in-process Postgres.
- Admin reordering uses ↑ ↓ buttons instead of drag-and-drop (reliable on phones).
- `blurDataURL` generation dropped (small gallery; a CSS placeholder is enough).
- Deployment step 6 kept: if `gh` / `vercel` / the DB provider are not logged in, stop and give exact commands.

## Corrected prompt

```
ROLE
You are a senior full-stack engineer and designer. Build a production-ready, mobile-first, bilingual
(English + Amharic) portfolio website with a built-in CMS at /admin for Biruk Belete (ብሩክ በለጠ).
Work in steps: scaffold, build, test, then deploy to Vercel. If gh/vercel/DB are not authenticated,
stop and give me the exact commands instead of guessing.

ABOUT ME (use only these facts; mark anything else {{PLACEHOLDER}})
- Instant Network School (DIY) Coach at Amref Health Africa; I run the youth digital center at
  Atse Zereyakob Youth Center, Debre Berhan.
- MBA (CPU College), BSc Computer Science (Wachemo University). Background: IT systems and digital marketing.
- Projects: bilingual invitation site with custom CMS; "Emaye's Tales" AI kids' stories (Ethiopian context);
  this portfolio.
- Languages: Amharic, English.

STACK
Next.js 15 App Router + TypeScript + Tailwind; Framer Motion (respect prefers-reduced-motion);
simple custom i18n (default English, remembers choice in localStorage, switches to Amharic if the browser
prefers it); Fontsource self-hosted fonts (Noto Sans/Serif Ethiopic, Cormorant Garamond, Inter);
Neon/Vercel Postgres via Drizzle; jose sessions; zod; Vercel Blob direct browser uploads
(@vercel/blob/client, token route checks the admin session, never send files through a server route,
client-side resize to 2400px); optional Resend email for contact messages.

CONTENT (one typed file src/config/portfolio.ts = fallback defaults + seed; UI strings in messages/en.json + am.json)
Hero (name, headline, CV download, socials), About, Services, Experience timeline, Projects (tags, live/code
links), Skills (grouped), Education, Certifications, optional Gallery, Contact form + direct email/phone, Footer.
Unfinished {{placeholders}} must never render for visitors.

DESIGN
Professional, minimal, futuristic: dark UI, teal + gold accents, subtle grid/glow, large serif headings,
a restrained Ethiopian-cross divider motif, fade-up reveals. Mobile-first (test 360px), Lighthouse
Performance > 90 and Accessibility > 95, 44px touch targets, skip link, visible focus.

SEO
Indexable. Canonical, OG image (app/opengraph-image.tsx, Latin text only), sitemap, robots (disallow /admin, /api),
JSON-LD Person.

CMS (/admin, usable on a phone)
Auth: single ADMIN_PASSWORD, jose-signed httpOnly SameSite=Lax cookie, 7 days, Secure only in production,
middleware protecting /admin/* and /api/admin/* (fail closed), logout. Login limited to 5 / 15 min / IP and the
contact form to 3 / hour / IP, both DATABASE-backed (never in-memory). Honeypot on the contact form.
Tables: site_settings(key, value_json), items(id, kind, sort_order, visible, data jsonb), messages,
login_attempts, rate_limit_hits. Seed must be idempotent and never overwrite.
Screens: Dashboard · Profile (bilingual fields, CV/portrait/hero upload) · one list editor per kind
(add/edit/delete/hide/reorder) · Messages (list, mark read, delete, CSV export with formula-injection protection) ·
Settings (section toggles, colours, JSON export / validated import).
Every save: zod-validate, then revalidateTag + revalidatePath. URLs limited to http(s).
If the DB is unreachable the public site serves the typed defaults; the build must succeed without a DB.

QUALITY BAR
Unit tests (schemas, i18n fallback, rate-limit decision, CSV, session, backup) and integration tests that run the
real route handlers against an in-process Postgres (PGlite). README with setup, editing guide, deploy steps.

DEPLOYMENT (report back after each)
1 git + PRIVATE GitHub repo (.env* ignored) · 2 create DB, drizzle-kit push, seed ONCE · 3 Vercel env vars
(DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET, BLOB_READ_WRITE_TOKEN, NEXT_PUBLIC_SITE_URL, optional
RESEND_API_KEY, NOTIFY_EMAIL) · 4 vercel --prod, set the real NEXT_PUBLIC_SITE_URL, redeploy · 5 verify on the
live URL (language toggle, contact message in /admin, admin edit visible publicly, photo + PDF upload, JSON export,
/admin redirects, OG preview, DB-down fallback) · 6 final URL + checklist of placeholders still to fill.
```
