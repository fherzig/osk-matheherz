// ═══════════════════════════════════════════════════════════════
// patch_lerntheke.js
// Liest lerntheke_kreise_zylinder.html und erstellt lerntheke.html
// mit eingebautem Login-Check + Server-Sync
// Ausführen mit: node patch_lerntheke.js
// ═══════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'lerntheke_kreise_zylinder.html');
const OUTPUT = path.join(__dirname, 'public', 'lerntheke.html');

if (!fs.existsSync(INPUT)) {
  console.error(`❌ Datei nicht gefunden: ${INPUT}`);
  console.error('   Bitte lerntheke_kreise_zylinder.html in den übergeordneten Ordner legen.');
  process.exit(1);
}

let html = fs.readFileSync(INPUT, 'utf-8');

// ── 1. Auth check + username display ───────────────────────────
const authScript = `
<script>
// ── Server Auth Check ──────────────────────────────────────────
(async function() {
  try {
    const me = await fetch('/api/me').then(r => r.json());
    if (!me.loggedIn) { window.location.href = '/'; return; }
    if (me.role === 'admin') { window.location.href = '/admin.html'; return; }
    window.__serverUser = me;
  } catch(e) {
    window.location.href = '/';
  }
})();
</script>
`;
html = html.replace('<head>', '<head>\n' + authScript);

// ── 2. Top-bar: add user info + logout button ───────────────────
const topBarPatch = `
<style>
#server-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,.95); backdrop-filter: blur(8px);
  border-bottom: 1.5px solid #e7e5e4; padding: 0 20px; height: 40px;
  font-size: 13px; color: #78716c; position: sticky; top: 0; z-index: 1000;
}
#server-bar strong { color: #1c1917; }
#server-bar button {
  padding: 5px 14px; border-radius: 7px; border: 1.5px solid #e7e5e4;
  background: white; font-size: 12px; cursor: pointer; font-weight: 600;
}
#server-bar button:hover { background: #f5f5f4; }
</style>
<div id="server-bar">
  <span>👋 Angemeldet als <strong id="sb-name">…</strong></span>
  <div style="display:flex;gap:8px;align-items:center;">
    <span id="sb-sync" style="font-size:11px;color:#94a3b8;"></span>
    <button onclick="serverLogout()">Abmelden</button>
  </div>
</div>
`;
html = html.replace('<body>', '<body>\n' + topBarPatch);

// ── 3. Server sync script (replaces localStorage) ──────────────
const syncScript = `
<script>
// ── Server Progress Sync ───────────────────────────────────────
let __syncTimeout = null;
let __lastSyncHash = '';

function __syncIndicator(text, color) {
  const el = document.getElementById('sb-sync');
  if (el) { el.textContent = text; el.style.color = color; }
}

async function serverLogout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
}

// Set username in bar
(async function waitForUser() {
  if (window.__serverUser) {
    const el = document.getElementById('sb-name');
    if (el) el.textContent = window.__serverUser.username;
  } else {
    setTimeout(waitForUser, 100);
  }
})();

// Override save() to also push to server
const __origSave = typeof save === 'function' ? save : null;

async function __serverSave(doneArr, abgabeObj) {
  const hash = JSON.stringify(doneArr) + JSON.stringify(abgabeObj);
  if (hash === __lastSyncHash) return;
  __lastSyncHash = hash;
  __syncIndicator('⏫ Speichern…', '#94a3b8');
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: doneArr, abgabe: abgabeObj })
    });
    __syncIndicator('✓ Gespeichert', '#16a34a');
    setTimeout(() => __syncIndicator('', ''), 2000);
  } catch(e) {
    __syncIndicator('⚠ Offline', '#d97706');
  }
}

// Load progress from server on start
async function __serverLoad() {
  try {
    const data = await fetch('/api/progress').then(r => r.json());
    if (data.done && data.done.length > 0) {
      // Override localStorage with server data
      done = new Set(data.done);
      abgabeState = data.abgabe || {};
      localStorage.setItem(KEY, JSON.stringify([...done]));
      localStorage.setItem('lerntheke_abgabe_v1', JSON.stringify(abgabeState));
      __lastSyncHash = JSON.stringify(data.done) + JSON.stringify(data.abgabe || {});
    }
  } catch(e) { console.log('Server load failed, using localStorage'); }
  buildOverview();
  showOv();
}

// Patch the save function after page loads
window.addEventListener('load', function() {
  const origSaveFn = window.save;
  window.save = function() {
    if (origSaveFn) origSaveFn();
    // Debounced server sync
    clearTimeout(__syncTimeout);
    __syncTimeout = setTimeout(() => {
      __serverSave([...done], abgabeState || {});
    }, 800);
  };

  // Also patch toggleAbgabe
  const origToggleAbgabe = window.toggleAbgabe;
  window.toggleAbgabe = function(g, val) {
    if (origToggleAbgabe) origToggleAbgabe(g, val);
    clearTimeout(__syncTimeout);
    __syncTimeout = setTimeout(() => {
      __serverSave([...done], abgabeState || {});
    }, 800);
  };

  // Load from server
  __serverLoad();
});
</script>
`;

html = html.replace('</body>', syncScript + '\n</body>');

fs.writeFileSync(OUTPUT, html, 'utf-8');
console.log(`✅ lerntheke.html erstellt (${Math.round(fs.statSync(OUTPUT).size/1024)} KB)`);
console.log(`   → ${OUTPUT}`);
