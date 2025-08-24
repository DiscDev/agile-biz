#!/bin/bash

echo "🧹 Cleaning up old numbered folders..."
echo "⚠️  This will remove all numbered folders from project-documents/"
echo "   Content has already been migrated to category folders."
echo ""

# List folders to be removed
echo "📋 Folders to be removed:"
ls -1 project-documents/ | grep '^[0-9][0-9]-' | sort

echo ""
read -p "Continue with cleanup? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old numbered folders..."
    
    # Remove numbered folders
    for folder in project-documents/[0-9][0-9]-*; do
        if [ -d "$folder" ]; then
            echo "   Removing: $(basename "$folder")"
            rm -rf "$folder"
        fi
    done
    
    echo ""
    echo "✅ Cleanup complete!"
    echo ""
    echo "📁 Remaining structure:"
    ls -la project-documents/ | grep '^d' | grep -v '^\.$\|^\.\.$'
    
    echo ""
    echo "🔍 Verifying category folders have content:"
    echo "Orchestration files: $(find project-documents/orchestration -name "*.md" 2>/dev/null | wc -l)"
    echo "Business strategy files: $(find project-documents/business-strategy -name "*.md" 2>/dev/null | wc -l)"
    echo "Implementation files: $(find project-documents/implementation -name "*.md" 2>/dev/null | wc -l)"
    echo "Operations files: $(find project-documents/operations -name "*.md" 2>/dev/null | wc -l)"
    
else
    echo "❌ Cleanup cancelled."
    exit 1
fi