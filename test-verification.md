# Verifizierung Testen

## Voraussetzungen

1. MongoDB muss laufen
2. Server muss gestartet sein: `cd backend && npm start`
3. Browser öffnen: `http://localhost:3000`

## Test-Szenario 1: Normale Email

### Schritt 1: Registrierung
1. Öffne `http://localhost:3000/register.html`
2. Fülle das Formular aus:
   - Name: `Test User`
   - Email: `test@example.com`
   - Passwort: `Test1234`
   - Passwort bestätigen: `Test1234`
3. Klicke auf "Registrieren"

### Schritt 2: Verifizierungscode erhalten
1. Du wirst zu `/verify-code.html?email=test@example.com` weitergeleitet
2. **Im Terminal** (wo der Server läuft) siehst du:
   ```
   New user registered: test@example.com
   Verification code sent to: test@example.com (Code: XXXXXX)
   ```
3. Notiere den 6-stelligen Code

### Schritt 3: Code eingeben
1. Gib den 6-stelligen Code ein (jede Ziffer in ein separates Feld)
2. Der Code wird automatisch gesendet, wenn alle 6 Ziffern eingegeben sind
3. Du solltest "Email erfolgreich bestätigt!" sehen
4. Du wirst zu `/login.html` weitergeleitet

### Schritt 4: Login
1. Gib die Email und das Passwort ein
2. Klicke auf "Anmelden"
3. Du solltest eingeloggt werden und zu `/gruppen.html` weitergeleitet werden ✓

## Test-Szenario 2: Email mit Sonderzeichen (Der Bug-Fall)

### Schritt 1: Registrierung
1. Öffne `http://localhost:3000/register.html`
2. Fülle das Formular aus:
   - Name: `Test User Plus`
   - Email: `test+feature@example.com` (mit +)
   - Passwort: `Test1234`
   - Passwort bestätigen: `Test1234`
3. Klicke auf "Registrieren"

### Schritt 2: Verifizierungscode erhalten
1. Du wirst zu `/verify-code.html?email=test%2Bfeature@example.com` weitergeleitet
2. Die Email sollte korrekt als `test+feature@example.com` angezeigt werden
3. **Im Terminal** siehst du:
   ```
   Verification code sent to: test+feature@example.com (Code: XXXXXX)
   ```

### Schritt 3: Code eingeben
1. Gib den Code ein
2. **VORHER (mit Bug):** Fehler "Ungültiger Code oder Email-Adresse"
3. **NACHHER (behoben):** "Email erfolgreich bestätigt!" ✓

## Test-Szenario 3: Code erneut senden

### Schritt 1: Registrierung
1. Registriere einen neuen User

### Schritt 2: Code erneut senden
1. Auf der `/verify-code.html` Seite, klicke auf "Code erneut senden"
2. Ein neuer Code wird generiert und im Terminal angezeigt
3. Gib den NEUEN Code ein (nicht den alten!)
4. Die Verifizierung sollte erfolgreich sein ✓

## Test-Szenario 4: Login ohne Verifizierung

### Schritt 1: Registrierung
1. Registriere einen neuen User
2. **NICHT** den Verifizierungscode eingeben

### Schritt 2: Versuch zu loggen
1. Öffne `http://localhost:3000/login.html`
2. Gib Email und Passwort ein
3. Klicke auf "Anmelden"
4. Du solltest eine Fehlermeldung sehen: "Bitte bestätige zuerst deine Email-Adresse" ✓
5. Login wird blockiert ✓

## Test-Szenario 5: Falscher Code

### Schritt 1: Registrierung
1. Registriere einen neuen User

### Schritt 2: Falschen Code eingeben
1. Gib einen falschen 6-stelligen Code ein (z.B. `000000`)
2. Du solltest "Ungültiger Code oder Email-Adresse" sehen
3. Die Input-Felder werden rot und der Code wird gelöscht
4. Du kannst es erneut versuchen ✓

## Erwartete Console-Logs

### Bei Registrierung:
```
New user registered: test@example.com
Verification code sent to: test@example.com (Code: 123456)
```

### Bei Code-Resend:
```
Verification code resent to: test@example.com (Code: 789012)
```

### Bei erfolgreicher Verifizierung:
```
Email verified for user: test@example.com
Welcome email sent to: test@example.com
```

### Bei Login ohne Verifizierung:
```
Login attempt with unverified email: test@example.com
```

## Debugging

Falls die Verifizierung immer noch nicht funktioniert:

1. **Prüfe die Console im Browser** (F12 → Console)
   - Sollte keine Fehler zeigen

2. **Prüfe die Network-Tab** (F12 → Network)
   - POST zu `/verify-code` sollte Status 200 zurückgeben
   - Response sollte `{"success": true, ...}` enthalten

3. **Prüfe die MongoDB Datenbank:**
   ```bash
   cd backend
   node -e "
   const mongoose = require('mongoose');
   require('dotenv').config();
   mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faceface_db')
     .then(() => {
       const User = require('./models/User');
       User.find().then(users => {
         console.log(users.map(u => ({
           email: u.email,
           emailVerified: u.emailVerified,
           verificationToken: u.verificationToken
         })));
         process.exit();
       });
     });
   "
   ```

4. **Prüfe die Email-Normalisierung:**
   - Die Email in der DB sollte lowercase sein
   - Die Email beim Verifizieren sollte gleich formatiert sein

## Erfolg!

Wenn alle Tests bestanden sind, funktioniert die Verifizierung jetzt korrekt! 🎉

