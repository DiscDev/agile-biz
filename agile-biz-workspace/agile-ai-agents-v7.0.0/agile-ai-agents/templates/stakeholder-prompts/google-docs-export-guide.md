# Google Docs to Markdown Export Guide

## Quick Steps

1. **In Google Docs**: File → Download → Markdown (.md)
2. **Save to**: `project-documents/stakeholder-input/project-prompt.md`
3. **Verify**: Open in text editor to check formatting

## Detailed Instructions

### Step 1: Prepare Your Document

Before exporting, ensure your Google Doc is properly formatted:

- ✅ Use built-in heading styles (not just bold text)
- ✅ Use bulleted lists for items
- ✅ Use numbered lists for ordered items
- ✅ Keep tables simple (complex tables may need adjustment)
- ✅ Remove any images (add them separately if needed)

### Step 2: Export Process

1. **Open your completed prompt** in Google Docs
2. **Click** File menu
3. **Select** Download
4. **Choose** Markdown (.md)
5. **Save** with a clear filename like `project-prompt.md`

### Step 3: Post-Export Cleanup

Open the exported file in a text editor and check:

#### Headers
Google Docs export uses `#` for headers. Ensure:
- Document title has single `#`
- Main sections have `##`
- Subsections have `###`

#### Lists
Exported lists should look like:
```markdown
* Item one
* Item two
* Item three
```

If they show as `-` instead of `*`, that's fine - both work.

#### Checkboxes
Google Docs checkboxes export as:
```markdown
- [ ] Unchecked item
- [x] Checked item
```

#### Tables
Simple tables should export correctly:
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

Complex tables may need manual formatting.

### Step 4: Common Issues & Fixes

#### Issue: Extra Blank Lines
**Fix**: Remove excessive spacing between sections

#### Issue: Broken Tables
**Fix**: Manually align using pipes `|` and dashes `-`

#### Issue: Lost Formatting
**Fix**: Re-add markdown formatting:
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``

#### Issue: Special Characters
**Fix**: Ensure quotes are straight (`"`) not curly (`"`)

### Step 5: Validation

Before using your file:

1. **Preview** in a Markdown viewer
2. **Check** all sections are present
3. **Verify** formatting looks correct
4. **Ensure** file location is accessible

### Step 6: File Placement

Save your exported file to:
```
your-project/
└── project-documents/
    └── stakeholder-input/
        └── project-prompt.md
```

Create the folders if they don't exist.

## Alternative Export Methods

### Using Add-ons

1. **Docs to Markdown** (recommended add-on)
   - Install from Google Workspace Marketplace
   - Provides better code block handling
   - Preserves more formatting

2. **Manual Copy-Paste**
   - Copy from Google Docs
   - Paste into Markdown editor
   - Fix formatting manually

### Using Pandoc (Advanced)

```bash
# If you have the .docx file
pandoc input.docx -t markdown -o output.md
```

## Template Formatting Tips

### For Better Export Results

1. **Use Styles Consistently**
   - Heading 1 for title
   - Heading 2 for sections
   - Heading 3 for subsections
   - Normal text for content

2. **Lists**
   - Use the bullet/number buttons
   - Don't manually type * or -
   - Keep consistent indentation

3. **Tables**
   - Keep tables simple
   - Avoid merged cells
   - Use consistent column counts

4. **Code Blocks**
   - Use Courier New font
   - Or use ``` before and after

## Quick Quality Check

After export, your file should:
- ✅ Have clear section headers
- ✅ Show lists properly
- ✅ Include all filled content
- ✅ Be readable in plain text
- ✅ Pass our validator without errors

## Need Help?

If you encounter issues:

1. The validator will show specific problems
2. Our examples show correct formatting
3. The interview process handles minor issues
4. You can always paste content directly

Remember: The content matters more than perfect formatting. The system is designed to handle common export quirks.