const crypto = require('crypto');

function safeEqual(a = '', b = '') {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// No default password: until ADMIN_PASSWORD (8+ chars) is set on the server, nobody can log in.
const PASSWORD_READY = typeof process.env.ADMIN_PASSWORD === 'string' && process.env.ADMIN_PASSWORD.length >= 8;
if (!PASSWORD_READY) {
  console.warn('[auth] ADMIN_PASSWORD is not set (or under 8 characters) — /admin login is disabled until it is.');
}

function checkCredentials(user, pass) {
  if (!PASSWORD_READY) return false;
  // Password-only login (no username).
  return safeEqual(pass, process.env.ADMIN_PASSWORD);
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  if (req.originalUrl.startsWith('/admin/api')) return res.status(401).json({ error: 'Not logged in' });
  return res.redirect('/admin/login');
}

module.exports = { checkCredentials, requireAdmin, PASSWORD_READY };
