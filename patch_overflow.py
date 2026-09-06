import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add box-sizing to .report-card-page (both inside and outside media print)
content = re.sub(r'(\.report-card-page\s*\{[^}]*)', r'\1 box-sizing: border-box !important;', content)
# Ensure we don't add it twice if it's already there
content = content.replace("box-sizing: border-box !important; box-sizing: border-box !important;", "box-sizing: border-box !important;")

# 2. Add @page inside @media print
if "@page" not in content:
    content = content.replace("@media print {", "@media print {\n            @page { size: A4 portrait; margin: 10mm; }")

# 3. Reduce margin-bottom of tables to give more breathing room vertically
content = content.replace(".rc-table { width: 100%; border-collapse: collapse; margin-bottom: 40px;", ".rc-table { width: 100%; border-collapse: collapse; margin-bottom: 25px;")
content = content.replace(".rc-footer-info { width: 100%; border-collapse: collapse; margin-bottom: 40px;", ".rc-footer-info { width: 100%; border-collapse: collapse; margin-bottom: 25px;")

# 4. Reduce padding in table cells slightly
content = content.replace(".rc-table th, .rc-table td { border: 1px solid #000; padding: 10px 4px;", ".rc-table th, .rc-table td { border: 1px solid #000; padding: 6px 4px;")
content = content.replace(".rc-footer-info td { padding: 12px 15px;", ".rc-footer-info td { padding: 8px 15px;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Overflow fixed.")
