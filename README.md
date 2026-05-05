# Lerntheke Kreise & Zylinder – Server

Multi-User-Server mit Login, Fortschrittsspeicherung und Admin-Dashboard.
Hosting: **fly.io** (dauerhaft kostenlos, EU-Server Frankfurt)

---

## Einrichten (einmalig, ca. 20 Minuten)

### Was du brauchst
- GitHub-Account (hast du bereits)
- Ein Terminal / eine Kommandozeile
  - **Mac:** Terminal (vorinstalliert, in Programme → Dienstprogramme)
  - **Windows:** PowerShell oder Windows Terminal

---

### Schritt 1: flyctl installieren

**Mac:**
```bash
brew install flyctl
```
*(Falls brew nicht installiert: https://brew.sh)*

**Windows (PowerShell als Administrator):**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://fly.io/install.ps1 | iex"
```

**Verifizieren:**
```bash
fly version
```
→ Sollte eine Versionsnummer zeigen.

---

### Schritt 2: fly.io Account erstellen & anmelden

```bash
fly auth signup
```
→ Öffnet Browser → Mit GitHub anmelden → Kreditkarte hinterlegen (wird **nicht** belastet, nur zur Verifikation)

Oder falls Account schon vorhanden:
```bash
fly auth login
```

---

### Schritt 3: Code auf deinen Computer laden

```bash
# GitHub Repo klonen (deine URL einsetzen)
git clone https://github.com/DEIN-USERNAME/lerntheke-kreise.git
cd lerntheke-kreise
```

---

### Schritt 4: App bei fly.io anlegen

```bash
fly launch --no-deploy
```

Fragen beantworten:
- **App name:** `lerntheke-kreise` (oder eigenen Namen wählen)
- **Region:** `fra` (Frankfurt) ← für DSGVO wichtig
- **Would you like to set up a PostgreSQL database?** → `No`
- **Would you like to set up an Upstash Redis database?** → `No`

---

### Schritt 5: Persistenten Speicher anlegen

```bash
fly volumes create lerntheke_data --region fra --size 1
```
→ Erstellt 1 GB Speicher für die Datenbank (dauerhaft, übersteht alle Updates)

---

### Schritt 6: SESSION_SECRET setzen

```bash
fly secrets set SESSION_SECRET=$(openssl rand -hex 32)
```

*Windows (PowerShell):*
```powershell
fly secrets set SESSION_SECRET=$(New-Guid)$(New-Guid)
```

---

### Schritt 7: Deployen!

```bash
fly deploy
```

→ Baut den Container und startet ihn (~3 Minuten)
→ Am Ende erscheint deine URL: `https://lerntheke-kreise.fly.dev`

---

### Schritt 8: App öffnen

```bash
fly open
```

Oder direkt im Browser: `https://lerntheke-kreise.fly.dev`

---

## Erste Anmeldung

Admin-Accounts sind automatisch angelegt:

| Benutzername | Passwort | Klasse |
|---|---|---|
| admin_m1m2 | admin123 | M1M2 |
| admin_m3m4 | admin123 | M3M4 |
| admin_m5m6 | admin123 | M5M6 |
| admin_m7m8 | admin123 | M7M8 |

**⚠️ Bitte sofort Passwort ändern!** (oben rechts → 🔑)

---

## Schüler:innen anlegen

Im Admin-Dashboard → „Bulk anlegen":

```
anna.mueller,Kreise24!
ben.schmidt,Kreise24!
clara.weber,Kreise24!
```

Format: `benutzername,passwort` – eine Zeile pro Person.

---

## Updates einspielen (neue Lerntheke oder Bugfix)

```bash
# Im Projektordner:
git pull                    # neuesten Stand holen
fly deploy                  # deployen
```

Oder direkt über GitHub: Dateien in GitHub aktualisieren, dann:
```bash
fly deploy
```

**Neue Lerntheke hinzufügen:**
1. HTML-Datei in `public/lerntheken/` legen
2. In GitHub hochladen (commit + push)
3. `fly deploy` ausführen
4. Erscheint automatisch im Dropdown

---

## Nützliche Befehle

```bash
fly logs              # Live-Logs anzeigen (Fehlersuche)
fly status            # Status der App
fly open              # App im Browser öffnen
fly ssh console       # Direkt auf den Server (Fortgeschrittene)
```

---

## Datenschutz / DSGVO

- Server läuft in **Frankfurt (EU)**
- Gespeichert werden nur: Benutzername, Passwort-Hash, Klasse, Lernfortschritt
- Keine Weitergabe an Dritte
- Datenbank kann jederzeit exportiert werden:
  ```bash
  fly ssh console -C "sqlite3 /data/lerntheke.db .dump" > backup.sql
  ```

---

## Kosten

**Dauerhaft kostenlos** im Rahmen des Free Allowance:
- 3 shared VMs mit je 256MB RAM
- 3 GB persistenter Speicher
- Ausreichend für ~200 gleichzeitige Nutzer

Erst ab sehr hohem Traffic entstehen Kosten (für Schulbetrieb nicht relevant).

---

## Umzug auf eigenen Server

```bash
# Datenbank sichern
fly ssh console -C "cat /data/lerntheke.db" > lerntheke.db

# Auf eigenem Linux-Server
npm install
DB_PATH=/var/data/lerntheke.db \
SESSION_SECRET=dein-secret \
node server.js
```

