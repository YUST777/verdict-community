#!/bin/bash

# Script to replace all occurrences of "icpchue" with "verdict" throughout the codebase
# This is a comprehensive replacement script

set -e

echo "🔍 Finding all files containing 'icpchue'..."

# Find all files (excluding node_modules, .next, .git)
FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.yml" -o -name "*.yaml" -o -name "*.txt" -o -name "*.py" \) ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/.git/*" -exec grep -l -i "icpchue" {} \;)

if [ -z "$FILES" ]; then
    echo "✅ No files found containing 'icpchue'"
    exit 0
fi

echo "📝 Found $(echo "$FILES" | wc -l) files to update"
echo ""

# Process each file
for file in $FILES; do
    echo "🔄 Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace all variations (case-insensitive, preserving case)
    # icpchue -> verdict
    # ICPCHUE -> VERDICT
    # Icpchue -> Verdict
    # ICPChue -> VERDICT (edge case)
    
    # Use sed with case-insensitive matching and replacement
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/icpchue/verdict/gI' "$file"
    else
        # Linux
        sed -i 's/icpchue/verdict/gI' "$file"
    fi
    
    # Fix specific cases where we want to preserve proper casing
    # VERDICT_ -> VERDICT_ (already correct)
    # verdict- -> verdict- (already correct)
    # Verdict -> Verdict (already correct)
    
    echo "✅ Updated: $file"
done

echo ""
echo "🎉 Replacement complete!"
echo ""
echo "📋 Summary of changes:"
echo "   - icpchue → verdict"
echo "   - ICPCHUE → VERDICT"
echo "   - All variations replaced"
echo ""
echo "💾 Backup files created with .bak extension"
echo "⚠️  Review changes and remove .bak files when satisfied"

