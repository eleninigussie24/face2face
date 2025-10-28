#!/bin/bash

# Face2Face - Google Analytics Measurement ID Updater
# Dieses Skript aktualisiert die Measurement ID in allen relevanten Dateien

echo "🔧 Google Analytics Measurement ID Updater"
echo "=========================================="
echo ""

# Aktuelle ID anzeigen
CURRENT_ID=$(grep -oE "G-[A-Z0-9]{10,}" public/index.html | head -1)
echo "📍 Aktuelle ID: $CURRENT_ID"
echo ""

# Neue ID abfragen
echo "Bitte geben Sie Ihre neue Measurement ID ein (Format: G-XXXXXXXXXX):"
read -p "Neue ID: " NEW_ID

# Validierung
if [[ ! $NEW_ID =~ ^G-[A-Z0-9]{10,}$ ]]; then
    echo "❌ Fehler: Ungültiges Format! Die ID muss mit 'G-' beginnen, gefolgt von mindestens 10 Zeichen."
    echo "   Beispiel: G-ABC123XYZ0"
    exit 1
fi

echo ""
echo "📝 Aktualisiere Dateien..."
echo ""

# Counter
updated_count=0

# HTML-Dateien aktualisieren
for file in public/*.html; do
    if [ -f "$file" ]; then
        # Backup erstellen
        # cp "$file" "$file.backup"
        
        # ID ersetzen
        sed -i '' "s/G-[A-Z0-9X]\{10,\}/$NEW_ID/g" "$file"
        echo "✅ $(basename "$file")"
        ((updated_count++))
    fi
done

# analytics.js aktualisieren
if [ -f "public/analytics.js" ]; then
    sed -i '' "s/G-[A-Z0-9X]\{10,\}/$NEW_ID/g" "public/analytics.js"
    echo "✅ analytics.js"
    ((updated_count++))
fi

# test-analytics.html aktualisieren (falls vorhanden)
if [ -f "test-analytics.html" ]; then
    sed -i '' "s/G-[A-Z0-9X]\{10,\}/$NEW_ID/g" "test-analytics.html"
    echo "✅ test-analytics.html"
    ((updated_count++))
fi

echo ""
echo "=========================================="
echo "✅ Erfolgreich! $updated_count Dateien aktualisiert"
echo ""
echo "🔍 Überprüfung:"
grep -h "G-$NEW_ID" public/index.html > /dev/null && echo "✅ index.html enthält die neue ID" || echo "❌ Fehler in index.html"
grep -h "$NEW_ID" public/analytics.js > /dev/null && echo "✅ analytics.js enthält die neue ID" || echo "❌ Fehler in analytics.js"

echo ""
echo "📤 Nächste Schritte:"
echo "1. Überprüfen Sie die Änderungen:"
echo "   git diff"
echo ""
echo "2. Committen und pushen Sie die Änderungen:"
echo "   git add ."
echo "   git commit -m 'Update Google Analytics Measurement ID to $NEW_ID'"
echo "   git push origin main"
echo ""
echo "3. Warten Sie ~2 Minuten bis Render.com deployed"
echo "4. Testen Sie: https://face2face-wq5b.onrender.com/test-analytics.html"
echo "5. Überprüfen Sie Google Analytics Echtzeit-Berichte"
echo ""
echo "🎉 Fertig!"

