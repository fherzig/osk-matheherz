// ═══════════════════════════════════════════════════════════════
// setup.js – Initiale Admin-Accounts erstellen
// Ausführen mit: node setup.js
// ═══════════════════════════════════════════════════════════════
const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');

if (!fs.existsSync('./data')) fs.mkdirSync('./data');
const db = new Database('./data/lerntheke.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    klasse TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    done_stations TEXT DEFAULT '[]',
    abgabe TEXT DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id)
  );
`);

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// ── Admin-Accounts (bitte Passwörter ändern!) ────────────────────
const admins = [
  { username: 'admin_10a', password: 'Lehrer2024!', klasse: '10a' },
  { username: 'admin_10b', password: 'Lehrer2024!', klasse: '10b' },
  { username: 'admin_10c', password: 'Lehrer2024!', klasse: '10c' },
  { username: 'admin_10d', password: 'Lehrer2024!', klasse: '10d' },
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO users (username, password_hash, klasse, role) VALUES (?,?,?,?)'
);

console.log('\n📚 Erstelle Admin-Accounts...\n');
for (const a of admins) {
  const r = insert.run(a.username, hashPassword(a.password), a.klasse, 'admin');
  if (r.changes) {
    console.log(`  ✓ ${a.username} (Klasse: ${a.klasse}) – Passwort: ${a.password}`);
  } else {
    console.log(`  ⚠ ${a.username} existiert bereits – übersprungen`);
  }
}

console.log('\n⚠️  Bitte Passwörter nach dem ersten Login ändern!');
console.log('\n✅ Setup abgeschlossen. Starten mit: node server.js\n');
