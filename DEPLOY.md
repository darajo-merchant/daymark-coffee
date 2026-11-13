# Deploying Daymark Coffee

This is a **Node.js (Next.js 16) application**. It cannot be served by plain
Apache/XAMPP or static file hosting — the host must run Node. The two paths
that fit this project are below; Vercel is the simplest.

## Before any deploy (both paths)

1. **Supabase is required in production.** The app refuses to start serving
   content without it (`lib/supabase.ts` enforces this). In the Supabase
   project, open **SQL Editor** and run all of [`supabase/schema.sql`](supabase/schema.sql)
   — it is safe to run more than once. This also fixes the page-view counter.
2. **Collect the environment values** (never commit them):

   | Variable | What it is |
   | --- | --- |
   | `SUPABASE_URL` | Project URL from Supabase API settings |
   | `SUPABASE_SECRET_KEY` | Server-only secret key (never `NEXT_PUBLIC_`) |
   | `ADMIN_SESSION_SECRET` | 32+ random chars; generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `ADMIN_PASSWORD` | First sign-in password (12+ chars) — see the password note below |
   | `NEXT_PUBLIC_SITE_URL` | The real domain, e.g. `https://daymarkcoffee.com` — feeds the share card, sitemap, robots.txt and Google data |

3. **Owner content**: prices, phone/WhatsApp/email, social links and the
   App Store / Google Play links are edited at `/admin` after deploy; no code
   changes needed. App badges stay hidden until a store link is added.

4. **Daymark Circle accounts (Supabase Auth)** — no SQL needed, but two
   settings in the Supabase dashboard:
   - **Authentication → URL Configuration**: set *Site URL* to the real
     domain and add both `https://<domain>/account/sign-in` and
     `https://<domain>/account/reset` to *Redirect URLs* (for local testing,
     also add the same two paths on `http://localhost:3010`). Otherwise the
     confirmation and password-reset links land on the wrong page.
   - **Email delivery — decide before launch.** Supabase's built-in sender is
     for testing: it is heavily rate-limited and (check under
     *Authentication → Emails*) may only deliver to members of the Supabase
     project team. Real customers could then never receive their
     confirmation or reset emails. Pick one:
     1. **Connect custom SMTP** (Resend, Postmark, Brevo…) in
        *Authentication → Emails → SMTP Settings* — recommended; confirmation
        and password reset both work for everyone.
     2. **Turn off "Confirm email"** (*Authentication → Providers → Email*).
        New members are signed in straight away (the site already handles
        this), but email addresses aren't verified and password reset still
        needs working email.
   - Members are listed (with CSV export) in `/admin` → *Circle members*.
   - Have the owner review `/privacy` against local data-protection rules
     before launch; it describes what the site actually stores but is not
     legal advice.

## Path A — Vercel (recommended)

1. Push the project to a Git repository (GitHub).
2. In Vercel: **New Project → import the repo**. Framework is auto-detected.
3. Add the five environment variables above (Production scope).
4. Deploy, then point the domain at Vercel and set `NEXT_PUBLIC_SITE_URL` to it.

**Password note for Vercel/serverless:** changing the admin password in the
dashboard writes `data/admin-auth.json`, and serverless hosts do not keep
files written at runtime. On Vercel, treat `ADMIN_PASSWORD` (the env var) as
the permanent owner password: rotate it in Vercel settings, and tell the owner
not to use the dashboard's "Account security" form. On a persistent server
(Path B) the dashboard password change works as designed.

## Path B — a VPS / persistent Node server

```bash
npm ci
npm run build
npm run start -- --port 3000
```

- Put the env values in `.env.local` (or the process manager's env) on the server.
- Run it under a process manager (pm2, systemd) and put Nginx/Caddy in front
  for HTTPS on the domain.
- `data/admin-auth.json` persists here, so the owner's dashboard password
  change works; after the first successful sign-in and password change,
  remove `ADMIN_PASSWORD` from the environment (see ADMIN-SETUP.md).

## After going live — 10-minute checklist

- [ ] Open the domain on a phone and a PC; scroll the whole home page.
- [ ] Share the link in WhatsApp — the espresso share card should appear.
- [ ] Join the Daymark Circle with a real inbox, click the confirmation email,
      sign in, edit details, and check the member appears in `/admin`.
- [ ] Sign in at `/admin`, set the real password (Path B) and confirm a saved
      edit appears on the public site.
- [ ] Check `https://<domain>/sitemap.xml` and `/robots.txt` load.
- [ ] Confirm the dashboard shows **Supabase connected** and, a day later,
      that page views are counting.
- [ ] Submit the domain in Google Search Console with the sitemap.

## Local preview (unchanged)

Development still runs with `Open Daymark Preview.cmd` (port 3010). The
production build writes to `.next` without touching the dev server's
`.next/dev` folder.
