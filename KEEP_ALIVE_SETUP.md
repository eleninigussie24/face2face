# 🔄 Keep-Alive Setup für Render Free Tier

Diese Anleitung zeigt Ihnen, wie Sie Ihre App auf Render Free Tier **fast 24/7** verfügbar halten können - **kostenlos!**

⚠️ **Hinweis:** Dies ist ein Workaround. Für echte 24/7 Verfügbarkeit empfehlen wir den Render Starter Plan ($7/Monat).

---

## Methode 1: UptimeRobot (Empfohlen)

UptimeRobot ist ein kostenloser Service, der Ihre Website alle 5 Minuten überprüft und sie dadurch wach hält.

### Schritt 1: UptimeRobot Account erstellen

1. Gehen Sie zu [https://uptimerobot.com/signUp](https://uptimerobot.com/signUp)
2. Registrieren Sie sich mit Ihrer E-Mail
3. Bestätigen Sie Ihre E-Mail-Adresse
4. Loggen Sie sich ein

### Schritt 2: Monitor erstellen

1. Klicken Sie auf **"Add New Monitor"**
2. Füllen Sie das Formular aus:

| Feld | Wert |
|------|------|
| **Monitor Type** | HTTP(s) |
| **Friendly Name** | FaceFace App |
| **URL** | `https://IHR-SERVICE-NAME.onrender.com/test` |
| **Monitoring Interval** | 5 minutes |

3. Klicken Sie auf **"Create Monitor"**

**Fertig!** UptimeRobot wird jetzt alle 5 Minuten Ihre App "pingen" und sie wach halten.

### ⚠️ Einschränkungen:

- **Render erlaubt maximal 750 Stunden/Monat im Free Tier**
  - Bei 24/7 = 720 Stunden → **reicht gerade so!**
- Trotzdem kann es kurze "Schlafphasen" geben
- Kein 100% Uptime-Garantie

---

## Methode 2: Cron-job.org

Ähnlich wie UptimeRobot, aber mit mehr Kontrolle.

### Schritt 1: Account erstellen

1. Gehen Sie zu [https://cron-job.org](https://cron-job.org)
2. Registrieren Sie sich kostenlos
3. Bestätigen Sie Ihre E-Mail

### Schritt 2: Cron Job erstellen

1. Klicken Sie auf **"Create cronjob"**
2. Füllen Sie aus:

| Feld | Wert |
|------|------|
| **Title** | FaceFace Keep Alive |
| **URL** | `https://IHR-SERVICE-NAME.onrender.com/test` |
| **Schedule** | Every 5 minutes |
| **Request method** | GET |

3. Klicken Sie auf **"Create"**

---

## Methode 3: Google Cloud Scheduler (Fortgeschritten)

Kostenlos bis zu 3 Jobs/Monat.

### Schritt 1: Google Cloud Console

1. Gehen Sie zu [https://console.cloud.google.com](https://console.cloud.google.com)
2. Erstellen Sie ein neues Projekt
3. Aktivieren Sie die Cloud Scheduler API

### Schritt 2: Job erstellen

```bash
gcloud scheduler jobs create http faceface-keepalive \
  --schedule="*/5 * * * *" \
  --uri="https://IHR-SERVICE-NAME.onrender.com/test" \
  --http-method=GET
```

---

## ✅ Test-Endpoint überprüfen

Stellen Sie sicher, dass Ihr `/test` Endpoint funktioniert:

1. Öffnen Sie in Ihrem Browser: `https://IHR-SERVICE-NAME.onrender.com/test`
2. Sie sollten sehen:
```json
{
  "message": "Server is working!",
  "secure": true,
  "authenticated": false
}
```

**Wenn ja:** Der Endpoint funktioniert! ✅

---

## 📊 Monitoring

### UptimeRobot Dashboard

Im UptimeRobot Dashboard sehen Sie:
- **Uptime %** (sollte ~99% sein)
- **Response Time** (sollte unter 1000ms sein nach dem Aufwachen)
- **Down Events** (sollte minimal sein)

### Email-Benachrichtigungen

UptimeRobot sendet Ihnen eine E-Mail, wenn Ihre App down ist!

---

## ⚠️ Wichtige Hinweise

### Render Free Tier Limits:
- **750 Stunden/Monat** = ~31 Tage × 24 Stunden = 744 Stunden
- Mit Keep-Alive Service nutzen Sie fast das komplette Limit
- Am Ende des Monats könnte die App trotzdem schlafen

### Bessere Alternative:
Wenn Sie **echte 24/7 Verfügbarkeit** brauchen:
- **Render Starter Plan**: $7/Monat
- **Railway**: $5 Free Credit/Monat + Pay-as-you-go
- **Fly.io**: Auch gute Free Tier Option

---

## 🎯 Zusammenfassung

**Kostenlose Lösung:**
✅ UptimeRobot alle 5 Minuten pingen
✅ Funktioniert für die meisten Use Cases
❌ Nicht 100% zuverlässig
❌ Kann am Monatsende ausgehen (750h Limit)

**Bezahlte Lösung ($7/Monat):**
✅ 100% Uptime garantiert
✅ Bessere Performance
✅ Kein Aufwand mit Keep-Alive Services
✅ Professionell

**Empfehlung:**
- **Für Testen/Entwicklung:** Free + UptimeRobot
- **Für Produktion/echte Nutzer:** Render Starter ($7/mo)

---

## 🚀 Nächste Schritte

1. Entscheiden Sie sich für eine Methode
2. Richten Sie UptimeRobot ein (dauert 2 Minuten)
3. Überprüfen Sie nach 1 Stunde, ob es funktioniert
4. Bei Problemen: Upgrade zu Render Starter

Viel Erfolg! 🎉

