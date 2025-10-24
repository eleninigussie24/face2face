# 🔐 Auth0 Setup für Google Login (FaceFace App)

## Problem
Google Login funktioniert nicht, weil die Auth0 Umgebungsvariablen nicht auf Render konfiguriert sind.

---

## 📋 Lösung: Auth0 einrichten (KOSTENLOS)

### Schritt 1: Auth0 Account erstellen

1. Gehe zu [https://auth0.com](https://auth0.com)
2. Klicke auf **"Sign Up"**
3. Erstelle einen kostenlosen Account (mit Email oder GitHub)
4. Wähle deinen Region: **EU** (für DSGVO-Konformität)

---

### Schritt 2: Application erstellen

1. Nach dem Login → Gehe zu **"Applications"** → **"Applications"**
2. Klicke auf **"Create Application"**
3. Name: `FaceFace App`
4. Typ: Wähle **"Regular Web Applications"**
5. Klicke **"Create"**

---

### Schritt 3: Google Connection aktivieren

1. Im linken Menü → **"Authentication"** → **"Social"**
2. Klicke auf **"+ Create Connection"**
3. Wähle **"Google"**
4. Du hast 2 Optionen:

#### Option A: Auth0 Developer Keys (SCHNELL - für Testing)
- ✅ **Empfohlen für den Anfang**
- Nutzt Auth0's eigene Google-Credentials
- Zeigt "Auth0 Development" beim Login
- **Aktiviere einfach den Toggle** und klicke **"Create"**

#### Option B: Eigene Google OAuth Credentials (für Production)
- Eigene Google Cloud Console App erstellen
- Siehe unten für detaillierte Anleitung
- Wird für Production empfohlen

**Für jetzt: Nutze Option A (Auth0 Developer Keys)**

5. Gehe zu **"Applications"** Tab in der Google Connection
6. **Aktiviere** deine "FaceFace App" Application
7. Klicke **"Save"**

---

### Schritt 4: Application Settings konfigurieren

1. Gehe zurück zu **"Applications"** → **"Applications"** → **"FaceFace App"**
2. Gehe zum **"Settings"** Tab

#### Wichtige Informationen kopieren:
- **Domain**: z.B. `dev-abc123xyz.eu.auth0.com`
- **Client ID**: Langer String, z.B. `abc123XYZ...`
- **Client Secret**: Langer geheimer String (❗ Niemals teilen!)

#### Scrolle zu "Application URIs":

**Allowed Callback URLs:**
```
https://your-app-name.onrender.com/auth/callback
```
> ⚠️ Ersetze `your-app-name` mit deinem echten Render App-Namen!

Wenn du lokal testen möchtest, füge auch hinzu (mit Komma getrennt):
```
https://your-app-name.onrender.com/auth/callback,http://localhost:3000/auth/callback
```

**Allowed Logout URLs:**
```
https://your-app-name.onrender.com
```

**Allowed Web Origins:**
```
https://your-app-name.onrender.com
```

4. Scrolle nach unten und klicke **"Save Changes"**

---

### Schritt 5: Umgebungsvariablen zu Render hinzufügen

1. Gehe zu deinem Render Dashboard
2. Öffne deinen Web Service (`faceface-app` oder wie du ihn genannt hast)
3. Gehe zu **"Environment"** im linken Menü
4. Klicke **"Add Environment Variable"**

Füge folgende **4 neue Variablen** hinzu:

| Key | Value | Beispiel |
|-----|-------|----------|
| `AUTH0_DOMAIN` | Deine Auth0 Domain | `dev-abc123xyz.eu.auth0.com` |
| `AUTH0_CLIENT_ID` | Deine Client ID | `abc123XYZ...` |
| `AUTH0_CLIENT_SECRET` | Dein Client Secret | `def456ABC...` |
| `AUTH0_CALLBACK_URL` | Callback URL | `https://your-app-name.onrender.com/auth/callback` |

5. Klicke **"Save Changes"**
6. Render wird automatisch neu deployen

---

### Schritt 6: Testen

1. Warte bis Render fertig deployed ist (Status: **"Live"** mit grünem Punkt)
2. Öffne deine App: `https://your-app-name.onrender.com`
3. Gehe zu **Login** oder **Register**
4. Klicke auf **"Mit Google anmelden"**
5. Du wirst zu Google weitergeleitet
6. Wähle deinen Google Account
7. Du wirst zurück zu deiner App weitergeleitet und bist eingeloggt! 🎉

---

## 🔧 Troubleshooting

### Problem 1: "Callback URL mismatch" Fehler
**Lösung:**
- Überprüfe, dass die Callback URL in Auth0 **EXAKT** mit der in Render gesetzten `AUTH0_CALLBACK_URL` übereinstimmt
- Keine Leerzeichen vor/nach der URL
- HTTPS (nicht HTTP) für Render
- Korrekte Schreibweise der Domain

### Problem 2: "invalid_client" Fehler
**Lösung:**
- Überprüfe `AUTH0_CLIENT_ID` und `AUTH0_CLIENT_SECRET` in Render
- Stelle sicher, dass du sie korrekt kopiert hast (ohne Leerzeichen)
- Überprüfe, ob die Application in Auth0 auf "Active" steht

### Problem 3: Google Connection erscheint nicht beim Login
**Lösung:**
- Stelle sicher, dass die Google Connection in Auth0 aktiviert ist
- Überprüfe, ob deine Application mit der Google Connection verknüpft ist (Authentication → Social → Google → Applications Tab)

### Problem 4: "Access Denied" nach Google Login
**Lösung:**
- Überprüfe die "Allowed Callback URLs" in Auth0
- Stelle sicher, dass alle 4 Environment Variables in Render gesetzt sind
- Checke die Render Logs für spezifische Fehlermeldungen

### Problem 5: App startet nicht nach dem Hinzufügen der Variablen
**Lösung:**
- Schaue in die Render Logs (Tab "Logs")
- Möglicherweise ist `MONGODB_URI` oder `SESSION_SECRET` nicht gesetzt

---

## 📊 Checklist

Bevor du testest, stelle sicher:

- [ ] Auth0 Account erstellt
- [ ] Application in Auth0 erstellt
- [ ] Google Connection aktiviert
- [ ] Google Connection mit deiner Application verknüpft
- [ ] Callback URLs in Auth0 konfiguriert
- [ ] Alle 4 Environment Variables in Render gesetzt:
  - [ ] `AUTH0_DOMAIN`
  - [ ] `AUTH0_CLIENT_ID`
  - [ ] `AUTH0_CLIENT_SECRET`
  - [ ] `AUTH0_CALLBACK_URL`
- [ ] Render hat erfolgreich neu deployed

---

## 🎯 Wichtige Hinweise

### Kostenlos?
- ✅ **JA!** Auth0 Free Tier: 7.000 aktive Nutzer/Monat
- Mehr als genug für kleine bis mittlere Apps

### Sicherheit
- ❗ **NIEMALS** `AUTH0_CLIENT_SECRET` öffentlich teilen oder in Git commiten!
- Auth0 managed die Google OAuth Tokens sicher
- Session wird über Cookies gehandhabt

### Production Best Practices
Für Production solltest du später:
1. Eigene Google OAuth Credentials nutzen (statt Auth0 Developer Keys)
2. Custom Domain für Auth0 einrichten (Optional, $$$)
3. Multi-Factor Authentication aktivieren (Optional)

---

## 🚀 Alternative: Eigene Google OAuth Credentials (Optional)

Falls du später eigene Google Credentials nutzen möchtest:

### 1. Google Cloud Console Setup
1. Gehe zu [https://console.cloud.google.com](https://console.cloud.google.com)
2. Erstelle ein neues Projekt: "FaceFace App"
3. Aktiviere **"Google+ API"**
4. Gehe zu **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Application Type: **"Web application"**
6. Name: `FaceFace Production`

**Authorized JavaScript origins:**
```
https://dev-abc123xyz.eu.auth0.com
```

**Authorized redirect URIs:**
```
https://dev-abc123xyz.eu.auth0.com/login/callback
```

7. Kopiere **Client ID** und **Client Secret**

### 2. Auth0 konfigurieren
1. Gehe zu Auth0 → Authentication → Social → Google
2. Klicke auf deine Google Connection
3. Toggle **"Use Auth0's Developer Keys"** AUS
4. Füge deine **Google Client ID** und **Client Secret** ein
5. Save

---

## ✅ Fertig!

Nach diesen Schritten sollte Google Login funktionieren! 🎉

Bei Problemen:
1. Checke die Render Logs
2. Checke die Auth0 Logs (Monitoring → Logs)
3. Nutze Browser Developer Tools (Console) für Frontend-Fehler

