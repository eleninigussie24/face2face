# 🚀 Deploy to Railway.app - Schritt für Schritt

Railway ist die **einfachste** Art, Node.js Apps zu deployen. Perfekt für Anfänger!

**Kosten:** $5/Monat (500 Stunden), danach $0.000231/Minute

---

## 📋 Voraussetzungen

- [x] GitHub Account
- [x] Git installiert
- [x] Dieser Code in einem Git Repository

---

## 🎯 Schritt 1: MongoDB Atlas Setup (15 Min) - KOSTENLOS

### 1.1 MongoDB Atlas Account erstellen
```
1. Gehe zu: https://www.mongodb.com/cloud/atlas
2. Klicke "Try Free"
3. Registriere dich (Google/Email)
```

### 1.2 Cluster erstellen
```
1. "Build a Database" klicken
2. Wähle: FREE (M0) ← WICHTIG!
3. Provider: AWS
4. Region: Frankfurt (eu-central-1) - näher = schneller
5. Cluster Name: FaceFaceCluster
6. "Create" klicken
```

### 1.3 Database User erstellen
```
1. Security → Database Access
2. "Add New Database User"
3. Authentication: Password
4. Username: faceface_admin
5. Password: [Generiere starkes Passwort] ← SPEICHERN!
6. Database User Privileges: "Read and write to any database"
7. "Add User"
```

### 1.4 Network Access erlauben
```
1. Security → Network Access
2. "Add IP Address"
3. "Allow Access from Anywhere" ← Für Railway
4. IP: 0.0.0.0/0
5. "Confirm"
```

### 1.5 Connection String kopieren
```
1. Database → Connect
2. "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Kopiere den Connection String:
   mongodb+srv://faceface_admin:<password>@facefacecluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

5. Ersetze <password> mit deinem echten Passwort!
6. SPEICHERE diesen String! Brauchst du gleich.
```

---

## 🎯 Schritt 2: Code auf GitHub pushen (5 Min)

### 2.1 Git Repository erstellen (wenn noch nicht gemacht)
```bash
cd /Users/eleni/faceface-app

# Git initialisieren (falls noch nicht gemacht)
git init

# Alle Dateien adden
git add .

# Ersten Commit
git commit -m "Ready for deployment"
```

### 2.2 GitHub Repository erstellen
```
1. Gehe zu: https://github.com/new
2. Repository name: faceface-app
3. Visibility: Private (empfohlen)
4. NICHT "Initialize with README" anklicken
5. "Create repository"
```

### 2.3 Code zu GitHub pushen
```bash
# GitHub Remote hinzufügen (ersetze YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/faceface-app.git

# Pushen
git branch -M main
git push -u origin main
```

---

## 🎯 Schritt 3: Railway Deployment (10 Min)

### 3.1 Railway Account erstellen
```
1. Gehe zu: https://railway.app/
2. "Start a New Project"
3. "Login with GitHub"
4. Autorisiere Railway
```

### 3.2 Projekt erstellen
```
1. "New Project"
2. "Deploy from GitHub repo"
3. Wähle: faceface-app
4. Railway startet automatisch das Deployment
```

### 3.3 Wichtig: Root Directory setzen
```
1. Klicke auf dein Service
2. Settings → Root Directory
3. Setze: backend
4. "Update" klicken
5. Railway wird neu deployen
```

### 3.4 Environment Variables setzen
```
1. Klicke auf dein Service
2. Variables Tab
3. "New Variable" klicken

Füge diese hinzu:

NODE_ENV=production

SESSION_SECRET=
[Generiere mit: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
Beispiel: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

MONGODB_URI=
[Dein MongoDB Atlas Connection String von Schritt 1.5]
Beispiel: mongodb+srv://faceface_admin:IhrPasswort@facefacecluster.xxxxx.mongodb.net/faceface_db?retryWrites=true&w=majority

BASE_URL=
[Wird automatisch von Railway gesetzt, siehe unten]

# Optional: Email Service (später)
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=Face2Face <noreply@faceface.app>

# Optional: Auth0 (später)
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_CALLBACK_URL=
```

### 3.5 BASE_URL setzen
```
1. Settings → Domains
2. "Generate Domain" klicken
3. Du bekommst: faceface-app-production.up.railway.app
4. Zurück zu Variables
5. BASE_URL setzen auf: https://faceface-app-production.up.railway.app
   (mit https:// und OHNE trailing slash!)
```

### 3.6 Deploy auslösen
```
1. Deployments Tab
2. "Redeploy" (falls nötig)
3. Warte 2-3 Minuten
4. Status sollte "Success" zeigen ✓
```

---

## 🎯 Schritt 4: Testen! (5 Min)

### 4.1 App öffnen
```
1. Klicke auf die Domain URL
2. Oder: Settings → Domains → [Deine URL]
3. Beispiel: https://faceface-app-production.up.railway.app
```

### 4.2 Registrierung testen
```
1. Gehe zu /register.html
2. Erstelle einen Test-User:
   - Name: Test User
   - Email: test@example.com
   - Passwort: Test1234

3. Du wirst zu /verify-code.html weitergeleitet
```

### 4.3 Verifizierungscode finden
```
1. Railway → Deployments → [Latest]
2. View Logs
3. Suche nach: "Verification code sent to:"
4. Kopiere den 6-stelligen Code

WICHTIG: Ohne EMAIL_SERVICE siehst du den Code nur in den Logs!
Das ist OK für Testing.
```

### 4.4 Verifizieren & Login
```
1. Gib den Code ein
2. Klicke "Code bestätigen"
3. Du solltest zu /login.html weitergeleitet werden
4. Logge dich ein
5. SUCCESS! ✅
```

---

## 🎯 Schritt 5: Email Service aktivieren (Optional)

### Option A: SendGrid (Empfohlen)

```
1. Gehe zu: https://sendgrid.com/
2. Registriere dich (kostenlos)
3. Email Verification durchführen
4. Settings → API Keys → Create API Key
5. Name: FaceFace Production
6. Permissions: Full Access
7. Kopiere API Key (NUR EINMAL sichtbar!)

Railway Variables:
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=[Dein API Key]
EMAIL_FROM=Face2Face <noreply@yourdomain.com>

8. Redeploy in Railway
```

### Option B: Gmail (Für kleine Apps)

```
1. Google Account → Security
2. 2-Factor Authentication aktivieren
3. App Passwords → Generate
4. App: Mail, Device: Other (Railway)
5. Kopiere 16-Zeichen Passwort

Railway Variables:
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=[16-Zeichen App Password]
EMAIL_FROM=Face2Face <your_email@gmail.com>

6. Redeploy in Railway
```

---

## 🎯 Schritt 6: Custom Domain (Optional)

### Eigene Domain verbinden
```
1. Kaufe Domain (z.B. bei Namecheap, GoDaddy)
2. Railway → Settings → Domains
3. "Custom Domain"
4. Domain eingeben: faceface.app
5. Kopiere CNAME Record
6. Bei deinem Domain Provider:
   - Type: CNAME
   - Name: @ oder www
   - Value: [Railway CNAME]
7. Warte 5-60 Minuten (DNS Propagation)
8. HTTPS wird automatisch aktiviert!
```

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas Cluster erstellt
- [ ] Database User angelegt
- [ ] Network Access konfiguriert (0.0.0.0/0)
- [ ] Connection String kopiert
- [ ] Code auf GitHub gepusht
- [ ] Railway Account erstellt
- [ ] Projekt deployed
- [ ] Root Directory auf `backend` gesetzt
- [ ] Environment Variables gesetzt:
  - [ ] NODE_ENV=production
  - [ ] SESSION_SECRET
  - [ ] MONGODB_URI
  - [ ] BASE_URL
- [ ] Deployment erfolgreich (grünes ✓)
- [ ] Registrierung getestet
- [ ] Verifizierung getestet (mit Logs)
- [ ] Login getestet
- [ ] Gruppe erstellen getestet
- [ ] (Optional) Email Service aktiviert
- [ ] (Optional) Custom Domain verbunden

---

## 🐛 Troubleshooting

### Deployment failed
```
1. Railway → Deployments → View Logs
2. Suche nach Fehlermeldungen
3. Häufige Probleme:
   - Root Directory nicht gesetzt → Settings → Root Directory: backend
   - package.json nicht gefunden → Root Directory falsch
   - Fehlende Dependencies → npm install lokal ausführen, committen
```

### Can't connect to MongoDB
```
1. Prüfe MONGODB_URI:
   - Muss mit mongodb+srv:// beginnen
   - Passwort darf keine Sonderzeichen unescaped haben
   - Sollte /faceface_db vor ?retryWrites enthalten

2. Prüfe Network Access in MongoDB Atlas:
   - 0.0.0.0/0 sollte erlaubt sein

3. Teste Connection String lokal:
   - Setze in .env
   - Starte Server lokal
```

### Sessions nicht persistent
```
1. Prüfe SESSION_SECRET ist gesetzt
2. Prüfe MONGODB_URI ist richtig
3. Prüfe in Railway Logs nach "MongoDB connected"
```

### Emails kommen nicht an
```
1. Ohne EMAIL_SERVICE → Nur Console Logs (OK für Testing)
2. Mit Gmail:
   - App Password korrekt?
   - 2FA aktiviert?
3. Mit SendGrid:
   - API Key korrekt?
   - Sender Verification durchgeführt?
```

### Domain zeigt nichts / 404
```
1. Warte 5-60 Minuten (DNS Propagation)
2. Prüfe CNAME Record beim Domain Provider
3. Teste mit Railway-Domain zuerst
```

---

## 💰 Kosten

### Railway
- **Kostenlos:** $5 Startguthaben
- **Danach:** ~$5-10/Monat für kleine Apps
- **Berechnung:** $0.000231/Minute Laufzeit

### MongoDB Atlas
- **M0 Cluster:** KOMPLETT KOSTENLOS!
- **Limits:** 512 MB Storage, Shared CPU (ausreichend für Start)

### SendGrid
- **Kostenlos:** 100 Emails/Tag
- **Danach:** $14.95/Monat für 50k emails

### Gesamt für kleine App:
**~$5-10/Monat** 🎉

---

## 🚀 Du bist LIVE!

Glückwunsch! Deine App ist jetzt online und kann von überall erreicht werden! 🎉

**Nächste Schritte:**
1. Teile die URL mit Freunden
2. Erstelle echte Accounts
3. Teste alle Features
4. Aktiviere Email Service
5. (Optional) Custom Domain
6. (Optional) Analytics hinzufügen

---

## 📞 Support

Bei Problemen:
1. Prüfe Railway Logs
2. Prüfe MongoDB Atlas Monitoring
3. Teste lokal mit gleichen Environment Variables
4. Railway Discord Community: https://discord.gg/railway

Viel Erfolg! 🚀

