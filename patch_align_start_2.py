import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("marginTop: '-14px', marginBottom: '8px'", "marginBottom: '8px'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted margin tweak")
