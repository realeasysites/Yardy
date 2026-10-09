// Yardie Ting — thin entry point. Logic lives in lib/ and routes/.
// Online ordering, payments and the kitchen tickets stay on Square; this site is the
// front door (story, menu, hours, directions) plus a catering request form + dashboard.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');

const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.startsWith('replace-'))) {
  console.warn('[security] SESSION_SECRET is not set — set a long random value on Render.');
}

app.set('trust proxy', 1); // Render sits behind a proxy

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      frameSrc: ['https://www.google.com'],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: IS_PROD, maxAge: 1000 * 60 * 60 * 8 }
}));

app.use('/api/booking', bookingRoutes);
app.use('/admin', adminRoutes);

// ---------- Homepage with live settings filled in ----------
// {{SITE_URL}}      absolute URLs for social-share previews
// {{ORDER_URL}}     every "Order Pickup" button → the Square ordering page
// {{GIFT_CARD_URL}} Square gift cards
// Change ORDER_URL / GIFT_CARD_URL on Render (Environment) — no code upload needed.
const DEFAULT_ORDER_URL = 'https://www.yardieting.com/s/order';
const DEFAULT_GIFT_URL = 'https://squareup.com/gift/AA0332GZSXGHB/order';
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const INDEX_HTML = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

function sendHome(req, res) {
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const html = INDEX_HTML
    .replaceAll('{{SITE_URL}}', attr(base))
    .replaceAll('{{ORDER_URL}}', attr(process.env.ORDER_URL || DEFAULT_ORDER_URL))
    .replaceAll('{{GIFT_CARD_URL}}', attr(process.env.GIFT_CARD_URL || DEFAULT_GIFT_URL));
  res.type('html').set('Cache-Control', 'no-cache').send(html);
}
app.get(['/', '/index.html'], sendHome);

// Handy short link for flyers, Instagram bio, QR codes: yardieting.com/order
// Also catches old Square Online links (yardieting.com/s/order, /s/splash …) that Google and
// customers' bookmarks still point at once the domain moves here — sends them to Square.
// Guard: never redirect to this same host (that would loop if ORDER_URL wasn't updated).
function toSquare(req, res, next) {
  const target = process.env.ORDER_URL || DEFAULT_ORDER_URL;
  try {
    if (new URL(target).host === req.get('host')) return next();
  } catch (_) { return next(); }
  res.redirect(302, target);
}
app.get('/order', toSquare);
app.get(/^\/s(\/.*)?$/, toSquare);

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '7d', index: false }));

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`Yardie Ting running on port ${PORT}`));
