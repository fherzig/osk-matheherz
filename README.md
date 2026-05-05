# Lerntheke Kreise & Zylinder – Server

Multi-User-Server mit Login, Fortschrittsspeicherung und Admin-Dashboard.

---

## Einrichten (einmalig, ~15 Minuten)

### Schritt 1: GitHub Repository anlegen

1. Gehe auf https://github.com → „New repository"
2. Name: `lerntheke-kreise` (privat oder öffentlich)
3. Klicke „Create repository"
4. Lade alle Dateien aus diesem Ordner hoch:
   - Klicke „uploading an existing file"
   - Ziehe alle Dateien rein (server.js, package.json, .gitignore, README.md)
   - Für den `public/` Ordner: erst Ordner anlegen, dann Dateien

> **Tipp:** Nutze GitHub Desktop (https://desktop.github.com) falls du kein Git kennst – einfacher zu bedienen.

---

### Schritt 2: Render.com einrichten

1. Gehe auf https://render.com → „Get Started for Free"
2. Mit GitHub-Account anmelden (empfohlen)
3. Klicke „New +" → „Web Service"
4. Verbinde dein `lerntheke-kreise` Repository
5. Einstellungen:
   - **Name:** lerntheke-kreise (frei wählbar)
   - **Region:** Frankfurt (EU) ← wichtig für DSGVO
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
6. Klicke „Advanced" → „Add Disk":
   - **Name:** data
   - **Mount Path:** /opt/render/project/src/data
   - **Size:** 1 GB
7. Unter „Environment Variables" hinzufügen:
   - `SESSION_SECRET` = (einen langen zufälligen String, z.B. aus https://passwordsgenerator.net)
   - `DB_PATH` = `/opt/render/project/src/data/lerntheke.db`
   - `SESSION_DB` = `/opt/render/project/src/data/sessions.db`
8. Klicke „Create Web Service"

→ Render baut und startet den Server (ca. 2 Minuten)
→ Du bekommst eine URL wie: `https://lerntheke-kreise.onrender.com`

---

### Schritt 3: Erste Anmeldung

Admin-Accounts sind bereits angelegt:

| Benutzername | Passwort | Klasse |
|---|---|---|
| admin_9a | admin123 | 9a |
| admin_9b | admin123 | 9b |
| admin_9c | admin123 | 9c |
| admin_9d | admin123 | 9d |

**Bitte sofort Passwort ändern!** (oben rechts → 🔑)

---

### Schritt 4: Schüler:innen anlegen

Im Admin-Dashboard → „Bulk anlegen":

```
anna.mueller,Kreise24!
ben.schmidt,Kreise24!
clara.weber,Kreise24!
```

Format: `benutzername,passwort` – eine Zeile pro Person.

**Tipp:** Du kannst allen das gleiche Startpasswort geben und sie auffordern es zu ändern.

---

## Updates einspielen

Wenn neue Versionen der Lerntheke verfügbar sind:
1. Neue `lerntheke.html` in GitHub hochladen (public/ Ordner)
2. Render deployed automatisch (ca. 2 Minuten)
3. Schülerdaten bleiben erhalten

---

## Datenschutz / DSGVO

- Daten liegen auf EU-Servern (Frankfurt)
- Gespeichert werden nur: Benutzername, Passwort-Hash, Klasse, Lernfortschritt
- Keine persönlichen Daten außer dem Benutzernamen (du bestimmst das Format)
- SQLite-Datenbank kann jederzeit exportiert/gelöscht werden

---

## Umzug auf eigenen Server

```bash
# Datenbank sichern
scp render-server:/opt/render/project/src/data/lerntheke.db ./backup.db

# Auf neuem Server
npm install
DB_PATH=./data/lerntheke.db node server.js
```

---

## Kosten

- GitHub: kostenlos
- Render Free Tier: kostenlos (schläft nach 15min Inaktivität, wacht beim nächsten Request auf)
- Render Starter ($7/Monat): kein Schlafmodus, empfohlen für Schulbetrieb

