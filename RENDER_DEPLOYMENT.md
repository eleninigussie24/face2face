# 🚀 Deployment auf Render.com (Kostenlos)

Diese Anleitung zeigt dir Schritt für Schritt, wie du deine FaceFace-App kostenlos auf Render deployen kannst.

## 📋 Voraussetzungen

- Ein GitHub-Account
- Dein Code muss in einem GitHub-Repository sein
- Ein MongoDB Atlas Account (kostenlos)

---

## Schritt 1: MongoDB Atlas einrichten (kostenlose Datenbank)

### 1.1 MongoDB Atlas Account erstellen
1. Gehe zu [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Registriere dich mit deiner E-Mail oder Google Account
3. Wähle den **kostenlosen M0 Tier** aus (sollte vorausgewählt sein)

### 1.2 Cluster erstellen
1. Klicke auf **"Build a Database"**
2. Wähle **FREE** (M0 Tier - 512 MB Storage)
3. Wähle einen Cloud Provider und Region:
   - **Provider**: AWS (empfohlen)
   - **Region**: Wähle die nächstgelegene Region (z.B. Frankfurt für Deutschland)
4. Klicke auf **"Create Cluster"**

### 1.3 Datenbankbenutzer erstellen
1. Im Popup "Security Quickstart" oder unter **Database Access**:
2. Klicke auf **"Add New Database User"**
3. Wähle **"Password"** als Authentication Method
4. Erstelle einen Username und ein starkes Passwort (⚠️ SPEICHERE DIESE!)
5. Setze die Rolle auf **"Atlas Admin"** oder **"Read and write to any database"**
6. Klicke auf **"Add User"**

### 1.4 Netzwerkzugriff erlauben
1. Gehe zu **Network Access** (im linken Menü)
2. Klicke auf **"Add IP Address"**
3. Klicke auf **"Allow Access from Anywhere"** (für Render)
   - IP: `0.0.0.0/0`
4. Klicke auf **"Confirm"**

### 1.5 Connection String kopieren
1. Gehe zurück zu **Database**
2. Klicke bei deinem Cluster auf **"Connect"**
3. Wähle **"Connect your application"**
4. Kopiere den Connection String (sieht so aus):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Ersetze `<username>` mit deinem Benutzernamen und `<password>` mit deinem Passwort
6. Füge nach `.net/` den Datenbanknamen hinzu: `faceface_db`
   
   Beispiel:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/faceface_db?retryWrites=true&w=majority
   ```

---

## Schritt 2: Code auf GitHub pushen

### 2.1 Repository auf GitHub erstellen
1. Gehe zu [https://github.com/new](https://github.com/new)
2. Erstelle ein neues Repository:
   - **Name**: `faceface-app` (oder ein anderer Name)
   - **Visibility**: Public oder Private (beides funktioniert)
3. Klicke auf **"Create repository"**

### 2.2 Code pushen (falls noch nicht geschehen)
```bash
# Im Terminal, im Projektordner
git add .
git commit -m "Prepare for Render deployment"

# Verbinde mit GitHub (ersetze USERNAME und REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Schritt 3: Render.com Account erstellen und Web Service einrichten

### 3.1 Render Account erstellen
1. Gehe zu [https://render.com](https://render.com)
2. Klicke auf **"Get Started"**
3. Registriere dich mit deinem **GitHub Account** (empfohlen)
4. Autorisiere Render, auf deine GitHub Repositories zuzugreifen

### 3.2 Web Service erstellen
1. Im Render Dashboard, klicke auf **"New +"**
2. Wähle **"Web Service"**
3. Wähle dein Repository aus der Liste (z.B. `faceface-app`)
   - Falls nicht sichtbar: Klicke auf "Configure account" und gib Render Zugriff auf das Repository

### 3.3 Service konfigurieren

Fülle das Formular wie folgt aus:

**Name**: `faceface-app` (oder ein anderer Name - wird Teil der URL)

**Region**: `Frankfurt (EU Central)` (oder eine andere nahe Region)

**Branch**: `main`

**Root Directory**: `backend` (⚠️ WICHTIG!)

**Runtime**: `Node`

**Build Command**: 
```bash
npm install
```

**Start Command**: 
```bash
npm start
```

**Instance Type**: Wähle **"Free"** (0$/Monat)

### 3.4 Umgebungsvariablen hinzufügen

Scrolle runter zu **"Environment Variables"** und klicke auf **"Add Environment Variable"**.

Füge folgende Variablen hinzu:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Dein MongoDB Connection String von Schritt 1.5 |
| `SESSION_SECRET` | Ein zufälliger String (siehe unten) |
| `PORT` | `3000` (optional, Render setzt das automatisch) |

#### SESSION_SECRET generieren:
Öffne dein Terminal und führe aus:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Kopiere den generierten String und füge ihn als `SESSION_SECRET` ein.

#### Optionale Variablen (für Email-Funktionalität):
Wenn du Email-Verifikation nutzen möchtest:

| Key | Value |
|-----|-------|
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `deine-email@gmail.com` |
| `EMAIL_PASSWORD` | App-spezifisches Passwort (siehe Gmail Einstellungen) |

### 3.5 Web Service erstellen
1. Klicke auf **"Create Web Service"**
2. Render wird jetzt deinen Code deployen (dauert 2-5 Minuten)
3. Du siehst Live-Logs vom Build-Prozess

### 3.6 Deployment überprüfen
1. Warte bis der Status **"Live"** anzeigt (grüner Punkt)
2. Klicke auf die URL oben (z.B. `https://faceface-app.onrender.com`)
3. Deine App sollte jetzt online sein! 🎉

---

## Schritt 4: Testen der Deployment

### 4.1 Basis-Funktionalität testen
1. Öffne deine App-URL
2. Teste die Registrierung eines neuen Benutzers
3. Teste den Login
4. Teste das Erstellen einer Gruppe

### 4.2 Datenbank überprüfen (optional)
1. Gehe zu MongoDB Atlas → Database → Browse Collections
2. Du solltest deine Datenbank `faceface_db` und Collections sehen (users, groups, etc.)

---

## ⚠️ Wichtige Hinweise zum kostenlosen Tier

### Free Tier Einschränkungen:
- **Automatisches Herunterfahren**: Deine App "schläft" nach 15 Minuten Inaktivität
- **Erster Request nach dem Aufwachen**: Kann 30-60 Sekunden dauern
- **750 Stunden/Monat**: Ausreichend für kleine Projekte
- **Kein Custom Domain** im Free Tier (nur `.onrender.com` Subdomain)

### Tipps:
- Die App wacht automatisch auf, wenn jemand die URL öffnet
- Für Produktionseinsatz: Upgrade auf kostenpflichtige Tier ($7/Monat) für 24/7 Uptime

---

## 🔧 Troubleshooting

### Problem: Build schlägt fehl
**Lösung**: 
- Überprüfe, ob `Root Directory` auf `backend` gesetzt ist
- Überprüfe, ob `package.json` im `backend/` Ordner existiert
- Schaue in die Build-Logs für spezifische Fehlermeldungen

### Problem: "Application Error" beim Öffnen der URL
**Lösung**:
- Überprüfe die Logs in Render (Tab "Logs")
- Stelle sicher, dass `MONGODB_URI` korrekt gesetzt ist
- Stelle sicher, dass `SESSION_SECRET` gesetzt ist
- Überprüfe, ob MongoDB Atlas die IP `0.0.0.0/0` erlaubt

### Problem: Kann keine Verbindung zur Datenbank herstellen
**Lösung**:
- Überprüfe den MongoDB Connection String
- Stelle sicher, dass Username/Passwort korrekt sind (keine Sonderzeichen im Passwort)
- Überprüfe MongoDB Atlas Network Access Settings

### Problem: Statische Dateien (HTML/CSS) werden nicht geladen
**Lösung**:
- Überprüfe in `server.js`, ob der Pfad zu `public/` korrekt ist:
  ```javascript
  app.use(express.static(path.join(__dirname, '../public')));
  ```

---

## 🔄 Updates deployen

Jedes Mal, wenn du Änderungen pushst:

```bash
git add .
git commit -m "Beschreibung deiner Änderungen"
git push
```

Render deployed automatisch die neuen Änderungen! (Auto-Deploy ist standardmäßig aktiviert)

---

## 📊 Monitoring

### Logs anschauen:
1. Gehe zu deinem Service in Render
2. Klicke auf **"Logs"**
3. Hier siehst du alle Server-Logs in Echtzeit

### Metriken anschauen:
1. Klicke auf **"Metrics"**
2. Hier siehst du CPU, Memory, Request Count, etc.

---

## 🎉 Fertig!

Deine App ist jetzt live unter: `https://[dein-service-name].onrender.com`

Bei Fragen oder Problemen, schau in die [Render Dokumentation](https://render.com/docs) oder frag mich! 🚀

