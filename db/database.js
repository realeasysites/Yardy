const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// On Render, set DB_PATH to a file on the persistent disk (e.g. /var/data/yardieting.db)
// so catering requests survive redeploys. Falls back to db/yardieting.db locally.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'yardieting.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    phone        TEXT NOT NULL,
    email        TEXT,
    service      TEXT NOT NULL,
    event_date   TEXT,
    location     TEXT,
    guest_count  TEXT,
    message      TEXT,
    status       TEXT NOT NULL DEFAULT 'new',
    notes        TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
`);

console.log(`[db] using ${DB_PATH}`);

module.exports = db;
