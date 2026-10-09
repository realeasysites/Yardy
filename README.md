# Yardie Ting — Website

Portland's OG Jamaican spot · Public Market House, 28 Monument Square, Portland, ME 04101 · (207) 835-0236
Built by Real Easy Sites on the standard TBLC pattern (Node/Express + SQLite + admin dashboard).

## How it fits with Square (read this first)
**Online ordering stays on Square.** Square already sends orders to the kitchen, takes payment,
handles tax, pickup times and sold-out items. This site does not replace any of that.

This site is the front door: the story, the full menu as real text Google can read, hours,
directions, reviews, gift cards, and a catering request form that lands in our dashboard.
Every **Order Pickup** button sends customers to Square, using one setting: `ORDER_URL`.

- `ORDER_URL` and `GIFT_CARD_URL` are Render environment variables. Change them there; no code upload needed.
- `/order` on this site is a short link to Square (good for flyers, QR codes, Instagram bio).
- Old Square links (`/s/order`, `/s/splash`, etc.) that Google or customers' bookmarks still have
  get forwarded to Square automatically after the domain switch.

## Switching the domain (do these in order)
Today `yardieting.com` points at Square Online, and the Square store lives at `yardieting.com/s/order`.
If the domain moves to Render before step 1, every Order button would point back at our own site.

1. **Give Square ordering its own address.** In the Square Dashboard → Online → Website → Domains,
   find the free `*.square.site` address (or set up a subdomain like `order.yardieting.com`).
   Open it and confirm the menu and checkout load.
2. **Set `ORDER_URL` on Render** to that address. Check the Order Pickup buttons on the
   `.onrender.com` URL go to the right place.
3. **Point the domain at Render.** Find where `yardieting.com` is registered (it may be inside Square).
   Add the custom domain in Render, then set DNS: `A @ → 216.24.57.1` and `CNAME www → <service>.onrender.com`.
4. **Set `SITE_URL=https://www.yardieting.com`** on Render so share previews and email links use the real domain.

## Run locally
```bash
npm install
cp .env.example .env   # then edit values
npm start              # http://localhost:3000
```

## Deploy on Render
- New **Web Service** from the GitHub repo · Build: `npm install` · Start: `npm start`
- Node is pinned to **20.x** (`.node-version` + `package.json` engines) because better-sqlite3 needs it.
- **Persistent disk:** attach a 1 GB disk mounted at `/var/data` and set `DB_PATH=/var/data/yardieting.db`
  so catering requests survive redeploys (same setup as MPS207).
- Set these env vars yourself in the Render dashboard:
  `ADMIN_PASSWORD` (8+ characters), `SESSION_SECRET` (long random string), `SMTP_USER` / `SMTP_PASS` (Gmail app password),
  `NOTIFY_EMAIL=yardieting207@gmail.com`, `ORDER_URL`, `SITE_URL`.
- **There is no default admin password.** `/admin` stays locked until `ADMIN_PASSWORD` is set.

## Folder layout
```
server.js          thin entry point (fills in ORDER_URL / GIFT_CARD_URL / SITE_URL, Square redirects)
db/database.js     SQLite setup (bookings table, DB_PATH aware)
lib/mailer.js      email alert on new catering requests (Reply goes straight to the customer)
lib/auth.js        admin login check (no default password)
routes/booking.js  POST /api/booking (catering form)
routes/admin.js    /admin dashboard + API (new → contacted → booked → completed / declined)
views/             admin login + dashboard pages
public/            the website (index.html, css, js, images)
```

## Easy edits (no coding)
| What | Where |
|---|---|
| Order / gift card links | Render → Environment → `ORDER_URL`, `GIFT_CARD_URL` |
| Gallery photos | drop files in `public/images/gallery/`, list them in `public/js/site-data.js` → `gallery` |
| Hours | `public/js/site-data.js` → `hours` (drives Open/Closed), plus the hours table, footer and schema block in `public/index.html` |
| Menu items | `public/index.html` → `#menu` section. Prices are intentionally NOT on the site; Square is the single source of truth for prices. |

## Before launch: confirm with the client
- Still upstairs (second floor) at the Public Market House? The copy says so.
- Instagram/Facebook handles: links point to `@yardieting` (from 2019 press); confirm they're current.
- Photo rights: `crew.jpg` and `owner.jpg` look like press photos. Confirm the client can use them or swap in their own.
- The "OG since 2019" story: any earlier history (pop-ups, catering, family recipes) would make it stronger.
- The Yelp quote in the reviews section is from press coverage; swap in 2–3 real Google reviews when available.
