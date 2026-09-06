import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change flex-end to flex-start
content = content.replace("align-items: flex-end;", "align-items: flex-start;")

# For Date, let's remove the marginBottom: '8px' so it doesn't have weird spacing, or actually let's give it a margin-top so the text aligns well with the signature line
content = content.replace("alignItems: 'flex-end', marginBottom: '8px'", "alignItems: 'flex-end', marginTop: '-14px', marginBottom: '8px'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched align-items")
