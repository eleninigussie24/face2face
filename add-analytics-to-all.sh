#!/bin/bash

# Face2Face - Add Google Analytics to ALL HTML files
# This script adds Google Analytics to any HTML file that doesn't have it yet

echo "🔧 Adding Google Analytics to all HTML files"
echo "=============================================="
echo ""

MEASUREMENT_ID="G-XX6ZT39L6L"
FILES_UPDATED=0
FILES_SKIPPED=0

# Analytics code to insert
ANALYTICS_CODE='    <!-- Google Analytics -->\n    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XX6ZT39L6L"><\/script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('\''js'\'', new Date());\n      gtag('\''config'\'', '\''G-XX6ZT39L6L'\'');\n    <\/script>\n'

cd /Users/eleni/faceface-app/public

for file in *.html; do
    if [ -f "$file" ]; then
        # Check if file already has Analytics
        if grep -q "googletagmanager\|G-XX6ZT39L6L" "$file"; then
            echo "⏭️  $file (already has Analytics)"
            ((FILES_SKIPPED++))
        else
            # Check if file has a <head> tag
            if grep -q "<head>" "$file"; then
                # Add Analytics after <head> tag
                sed -i '' "/<head>/a\\
$ANALYTICS_CODE
" "$file"
                echo "✅ $file (Analytics added)"
                ((FILES_UPDATED++))
            else
                echo "⚠️  $file (no <head> tag found)"
            fi
        fi
    fi
done

echo ""
echo "=============================================="
echo "✅ Complete!"
echo "   Files updated: $FILES_UPDATED"
echo "   Files skipped (already had Analytics): $FILES_SKIPPED"
echo ""
echo "📤 Next steps:"
echo "1. Review changes: git diff"
echo "2. Commit: git add . && git commit -m 'Add Google Analytics to all pages'"
echo "3. Deploy: git push origin main"
echo ""

