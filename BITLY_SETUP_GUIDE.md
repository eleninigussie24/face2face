# 🔗 Bitly Setup Guide mit Tracking

## Warum UTM-Parameter?

Mit UTM-Parametern können Sie in Google Analytics GENAU sehen:
- Von welchem Plakat kommt der Traffic?
- Welcher Standort bringt die meisten Nutzer?
- QR-Code vs. Social Media Performance

---

## 📋 Schritt-für-Schritt Setup

### 1. Bitly Account erstellen

1. Gehen Sie zu: [bitly.com](https://bitly.com)
2. Klicken Sie auf "Get Started for Free"
3. Registrieren Sie sich mit Google oder Email
4. Email bestätigen

### 2. Links mit UTM-Parametern erstellen

**Wichtig:** Erst die volle URL mit UTM-Parametern, DANN zu Bitly!

#### Link 1: Mensa

**Volle URL:**
```
https://face2face-wq5b.onrender.com?utm_source=qr-code&utm_medium=poster&utm_campaign=mensa
```

**In Bitly:**
1. Klicken Sie "Create" → "Link"
2. **Destination:** (obige URL einfügen)
3. **Title:** "FaceFace Mensa"
4. **Custom back-half:** `ff-mensa` 
5. Klicken Sie "Create"

**Ergebnis:** `bit.ly/ff-mensa`

---

#### Link 2: Bibliothek

**Volle URL:**
```
https://face2face-wq5b.onrender.com?utm_source=qr-code&utm_medium=poster&utm_campaign=bibliothek
```

**In Bitly:**
- **Destination:** (obige URL)
- **Title:** "FaceFace Bibliothek"
- **Custom back-half:** `ff-bib`

**Ergebnis:** `bit.ly/ff-bib`

---

#### Link 3: Hörsaal H101

**Volle URL:**
```
https://face2face-wq5b.onrender.com?utm_source=qr-code&utm_medium=poster&utm_campaign=hoersaal-h101
```

**In Bitly:**
- **Destination:** (obige URL)
- **Title:** "FaceFace Hörsaal H101"
- **Custom back-half:** `ff-h101`

**Ergebnis:** `bit.ly/ff-h101`

---

#### Link 4: Instagram

**Volle URL:**
```
https://face2face-wq5b.onrender.com?utm_source=instagram&utm_medium=social&utm_campaign=launch
```

**In Bitly:**
- **Destination:** (obige URL)
- **Title:** "FaceFace Instagram"
- **Custom back-half:** `ff-insta`

**Ergebnis:** `bit.ly/ff-insta`

---

## 📊 Wo sehen Sie die Statistiken?

### In Bitly:
1. Dashboard → Ihr Link
2. Sehen Sie:
   - Anzahl Clicks
   - Wann geklickt
   - Von wo (Stadt, Land)
   - Geräte-Typ

### In Google Analytics (nach Setup):
1. Reports → Acquisition → Traffic acquisition
2. Filtern nach "utm_campaign"
3. Sehen Sie:
   - Welche Kampagne am besten performt
   - Wie viele konvertieren (registrieren sich)
   - Verweildauer
   - Bounce Rate

---

## 🎯 Empfohlene Link-Struktur

### QR-Codes (Plakate):
```
bit.ly/ff-mensa          → Mensa
bit.ly/ff-bib            → Bibliothek
bit.ly/ff-h101           → Hörsaal H101
bit.ly/ff-h105           → Hörsaal H105
bit.ly/ff-mathe-geb      → Mathe-Gebäude
bit.ly/ff-info-geb       → Informatik-Gebäude
bit.ly/ff-sport          → Sportzentrum
bit.ly/ff-wohnheim       → Studentenwohnheim
```

### Social Media:
```
bit.ly/ff-insta          → Instagram Bio
bit.ly/ff-tiktok         → TikTok Bio
bit.ly/ff-fb             → Facebook Posts
bit.ly/ff-wa             → WhatsApp Messages
```

### Email/Direct:
```
bit.ly/ff-email          → Email-Signatur
bit.ly/ff-newsletter     → Newsletter
```

---

## ✅ Testing Checklist

Nach dem Erstellen:

- [ ] Jeden Bitly-Link im Browser öffnen
- [ ] Prüfen: Leitet zur richtigen Seite weiter?
- [ ] QR-Code mit dem Bitly-Link erstellen
- [ ] QR-Code mit Handy scannen
- [ ] Funktioniert? ✅

---

## 💡 Pro-Tipps

### 1. Verwenden Sie klare Namen
❌ `bit.ly/abc123`
✅ `bit.ly/ff-mensa`

### 2. Tracken Sie alles
Für jedes Plakat einen eigenen Link!
So sehen Sie: Welcher Standort lohnt sich?

### 3. Regelmäßig checken
- Bitly Dashboard: Täglich
- Google Analytics: Wöchentlich

### 4. A/B Testing
Zwei verschiedene Plakate an ähnlichen Orten?
Verschiedene Links → Sehen Sie, welches Design besser funktioniert!

---

## 🎨 QR-Code mit Bitly-Link erstellen

1. Gehen Sie zu [qrcode-generator.de](https://www.qrcode-generator.de)
2. Wählen Sie "URL"
3. **Geben Sie Ihren Bitly-Link ein:**
   - `https://bit.ly/ff-mensa` (mit https://)
4. Design anpassen
5. **High Quality** wählen
6. Download als PNG oder SVG
7. In Ihr Plakat einfügen!

---

## 📈 Erwartete Ergebnisse

### Woche 1 (10 Plakate):
- 50-100 QR-Code Scans
- 10-20 Registrierungen (20% Conversion)

### Woche 2:
- 100-200 Scans
- 20-40 Registrierungen

### Beste Standorte (Erfahrungswert):
1. 🥇 Mensa (höchster Traffic!)
2. 🥈 Bibliothek (beste Conversion!)
3. 🥉 Schwarze Bretter vor Vorlesungen

---

## 🆘 Troubleshooting

**Problem:** "Custom back-half nicht verfügbar"
→ **Lösung:** Jemand nutzt schon `ff-mensa`, versuchen Sie `ff-mensa-tu` oder `faceface-mensa`

**Problem:** "Link funktioniert nicht"
→ **Lösung:** Prüfen Sie, ob Sie `https://` am Anfang haben

**Problem:** "QR-Code scanbar, aber keine Analytics-Daten"
→ **Lösung:** UTM-Parameter vergessen? Prüfen Sie die Destination-URL in Bitly

---

## ✅ Quick Checklist

Bevor Sie Plakate drucken:

- [ ] Bitly Account erstellt
- [ ] Mindestens 3 Links erstellt (Mensa, Bib, Hörsaal)
- [ ] Jeder Link getestet
- [ ] QR-Codes mit Bitly-Links erstellt
- [ ] QR-Codes mit Handy gescannt und getestet
- [ ] Links funktionieren alle ✅

**Dann: Drucken und aufhängen! 🚀**

---

Viel Erfolg! 📊





