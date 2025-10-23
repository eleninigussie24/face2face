# Verifizierungs-Bug Fix

## Problem

Die Email-Verifizierung hat nicht funktioniert, weil die Email-Adresse **doppelt dekodiert** wurde.

### Technische Details

1. **Bei der Registrierung:**
   - Die Email wird mit `encodeURIComponent(email)` in die URL kodiert
   - Beispiel: `test+user@example.com` → `test%2Buser%40example.com`
   - Die URL wird: `/verify-code.html?email=test%2Buser%40example.com`

2. **Beim Lesen der URL (VORHER - FALSCH):**
   - `URLSearchParams.get('email')` dekodiert die Email **automatisch**
     → `test+user@example.com` ✓
   - Dann wurde sie **nochmal** mit `decodeURIComponent()` dekodiert
     → `test user@example.com` ✗ (+ wird zu Leerzeichen!)

3. **Beim Verifizieren:**
   - Die falsch dekodierte Email wurde an den Server gesendet
   - Der Server konnte den User nicht finden, weil die Email nicht übereinstimmte

### Betroffene Dateien

- `public/verify-code.html` - Email wurde doppelt dekodiert
- `public/verification-pending.html` - Email wurde doppelt dekodiert

## Lösung

**Entfernung des doppelten `decodeURIComponent()` Aufrufs:**

### verify-code.html

**Vorher:**
```javascript
const email = urlParams.get('email');
document.getElementById('userEmail').textContent = decodeURIComponent(email); // ✗ Doppelt dekodiert
body: JSON.stringify({ 
    email: decodeURIComponent(email), // ✗ Doppelt dekodiert
    code 
})
```

**Nachher:**
```javascript
const email = urlParams.get('email'); // Bereits dekodiert!
document.getElementById('userEmail').textContent = email; // ✓
body: JSON.stringify({ 
    email: email, // ✓
    code 
})
```

### verification-pending.html

Gleiche Änderungen wie oben.

### backend/server.js

Zusätzliche Verbesserung für Konsistenz:
- Bei `/resend-verification` wird die Email jetzt auch mit `toLowerCase().trim()` normalisiert, um konsistent mit anderen Endpoints zu sein.

## Testen

Um die Verifizierung zu testen:

1. **Registriere einen neuen User** mit einer Email, die Sonderzeichen enthält:
   - Beispiel: `test+feature@example.com`
   - Beispiel: `user.name@gmail.com`

2. **Überprüfe die Email:**
   - Ein 6-stelliger Verifizierungscode wird im Console-Log angezeigt (im Development-Modus)
   - Beispiel: `Verification code sent to: test+feature@example.com (Code: 123456)`

3. **Gib den Code ein:**
   - Öffne `/verify-code.html?email=...`
   - Gib den 6-stelligen Code ein
   - Die Verifizierung sollte jetzt erfolgreich sein! ✓

4. **Melde dich an:**
   - Nach erfolgreicher Verifizierung kannst du dich einloggen
   - Ohne Verifizierung wird der Login mit einer Fehlermeldung blockiert

## Weitere Verbesserungen

- **Email-Normalisierung:** Die Email wird jetzt konsistent mit `normalizeEmail()` von express-validator normalisiert
- **Case-Insensitive:** Alle Email-Suchen verwenden `toLowerCase().trim()` für Konsistenz
- **User-Model:** Das MongoDB User-Model hat bereits `lowercase: true` und `trim: true`, was zusätzliche Sicherheit bietet

## Sicherheit

Die Verifizierung bietet:
- ✓ 6-stellige numerische Codes (1.000.000 Möglichkeiten)
- ✓ Rate-Limiting (max 5 Versuche in 15 Minuten)
- ✓ Input-Validierung
- ✓ Code wird nach erfolgreicher Verifizierung gelöscht
- ✓ Login wird blockiert ohne Email-Verifizierung

