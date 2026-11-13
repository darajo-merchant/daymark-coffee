# Daymark Coffee

A premium, story-led website for a specialty coffee house, built to feel calm, warm and unhurried. The page follows a cup from whole bean to first pour as you scroll, then helps guests find the café, browse the menu and join the Daymark Circle.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · GSAP 3 (ScrollTrigger, SplitText) · Lenis smooth scrolling · Supabase (content, analytics and member accounts)

## Highlights

- **Scroll storytelling.** A pinned five-chapter film (bean → roast → grind → pour → cup) with chapter snapping and a progress rail.
- **Motion that stays smooth.** Lenis smooth scrolling on GSAP's ticker, masked line reveals for headings, "developing print" photo reveals, a marquee that follows scroll speed, magnetic buttons, and a branded page-to-page curtain.
- **Accessible by default.** Full `prefers-reduced-motion` support, a skip link, semantic landmarks, keyboard-friendly navigation, and native touch scrolling on phones.
- **Pages:** Home, Menu, Visit, Our Story, Contact, Privacy, a 404 page, and member account pages (join, sign in, password reset).
- **Owner dashboard** at `/admin`: edit the menu, prices, visit details, contact channels and app-store links; see page-view totals; export members as CSV.
- **Member accounts** with Supabase Auth: profile, optional birthday and usual drink, marketing consent, and self-service account deletion.
- **SEO and sharing:** metadata, Open Graph card, sitemap, robots.txt and structured data.

## Getting started

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

Open http://localhost:3000. Without Supabase, the site runs on the local fallback content in `data/site-content.json`.

### Environment variables

See [`.env.example`](.env.example). Every secret lives only in `.env.local` or your host's environment settings, and none of them are committed.

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | First owner sign-in only. Change it in the dashboard, then remove it. |
| `ADMIN_SESSION_SECRET` | Signs admin and member session cookies (32+ random characters). |
| `NEXT_PUBLIC_SITE_URL` | The public address, used for share cards, the sitemap and links in emails. |
| `SUPABASE_URL` | Your Supabase project URL. |
| `SUPABASE_SECRET_KEY` | Server-only Supabase key. Never expose it to the browser. |

### Supabase

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor. [`ADMIN-SETUP.md`](ADMIN-SETUP.md) covers the owner dashboard, and [`DEPLOY.md`](DEPLOY.md) covers hosting, auth redirect URLs and email delivery.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Project structure

```
app/                 Pages, API routes and styles (App Router)
app/components/      Hero, story chapters, motion layer, header and footer, forms
lib/                 Site content, Supabase client, member auth helpers
public/              Images and the trimmed story clips
supabase/schema.sql  Database tables, row-level security and functions
```

## Credits

Photography and footage come from [Pexels](https://www.pexels.com) and [Unsplash](https://unsplash.com) under their free licenses. Fonts: Fraunces and Inter Tight via `next/font`.

## License

© Daymark Coffee. All rights reserved. The code is public to view; please ask before reusing the design or content.
