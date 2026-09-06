import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'<td style=\{\{\s*fontSize:\s*\'16px\'\s*\}\}>\{grandTotal\}\s*/\s*\{possibleTotal\}</td>\s*<td></td>',
    r'<td colSpan={2} style={{ fontSize: "15px", fontWeight: "bold" }}>{grandTotal} / {possibleTotal}</td>',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced total row.")
