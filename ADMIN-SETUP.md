# Daymark site manager

The owner dashboard is available at `/admin`. It manages menu items and prices, visit details, contact channels, and the café's social profile links. Saved changes appear on the public Home, Menu, Visit, and Contact pages.

## First-time setup

1. Copy `.env.example` to `.env.local` on the machine that runs the site.
2. Replace `ADMIN_PASSWORD` with a private password of at least 12 characters.
3. Set `ADMIN_SESSION_SECRET` to a unique random value. In PowerShell, generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. Restart the Next.js server and open `/admin` on the site domain.
5. After the first sign-in, use **Account security** to choose the owner's private password. The password is stored as a salted hash. Then remove `ADMIN_PASSWORD` from the host environment; keep `ADMIN_SESSION_SECRET` private and persistent.

Keep `.env.local` private. Never commit it or share its contents. Admin sessions use an HttpOnly, same-site cookie and expire after 12 hours.

## Saving and hosting

## Connect Supabase

1. In Supabase, create a project and open **SQL Editor**.
2. Run [`supabase/schema.sql`](supabase/schema.sql). It creates the site content table and a daily page-view counter, enables row-level security, and gives browser roles no direct table access.
3. In the project API settings, copy the Project URL and a server-only secret key. Add them to `.env.local` as `SUPABASE_URL` and `SUPABASE_SECRET_KEY`.
4. Restart Next.js. On its first read, the site copies the current local content into Supabase. The dashboard should then show **Supabase connected**. New saves and public page reads use that project.

The dashboard counts page views for the last 30 days after the updated schema has been run. It stores only daily totals by public page, with no IP address, cookie, or visitor identifier. It does not claim unique visitor counts. Guest reviews are not collected in the site manager; the dashboard shows zero until genuine reviews are added to the site.

Keep `SUPABASE_SECRET_KEY` only on the server. Never prefix it with `NEXT_PUBLIC_`, place it in a client component, or share it in chat. The app uses this key only from server code after checking the admin session. The table has RLS enabled and no grants for `anon` or `authenticated` clients.

When Supabase is not configured, development uses `data/site-content.json` so the preview remains editable. Production requires Supabase configuration. Admin credential and session files are private and excluded from source control.

The dashboard is not linked from public navigation. Use `/admin` directly.
