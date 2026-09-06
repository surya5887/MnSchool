import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("font-size: 13px;", "font-size: 11px;")
content = content.replace("font-size: 14px;", "font-size: 12px;")
content = content.replace("font-size: 15px;", "font-size: 13px;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Font sizes reduced.")
