import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. School name header font size
content = content.replace("font-size: 44px; font-weight: 900;", "font-size: 38px; font-weight: 900; white-space: nowrap;")

# 2. Push signatures to bottom by giving rc-front-page a min-height in print mode
if "height: auto !important;" in content:
    content = content.replace("height: auto !important;\n              min-height: 0 !important;", "height: auto !important;\n              min-height: 275mm !important;")

# 3. Merge total cells
total_row_old = """<td style={{ fontSize: '16px' }}>{grandTotal} / {possibleTotal}</td>
                        <td></td>"""
total_row_new = """<td colSpan={2} style={{ fontSize: '15px', fontWeight: 'bold' }}>{grandTotal} / {possibleTotal}</td>"""
content = content.replace(total_row_old, total_row_new)

# 4. Shorten Headers to prevent overflow
content = content.replace("<th >Periodic<br/>Test (20)</th>", "<th >Periodic<br/>(20)</th>")
content = content.replace("<th >Half Yearly<br/>Marks (80)</th>", "<th >Half Yr.<br/>(80)</th>")
content = content.replace("<th >Marks Obt<br/>(100)</th>", "<th >Obtained<br/>(100)</th>")
content = content.replace("<th >Annual<br/>Marks (80)</th>", "<th >Annual<br/>(80)</th>")

# 5. Fix Grade column width in grading scale tables
content = content.replace("<th style={{ width: '15%' }}>Grade</th>", "<th style={{ width: '25%' }}>Grade</th>")

# 6. Increase Font Sizes
content = content.replace("font-size: 11px !important;", "font-size: 12px !important;")
content = content.replace("text-align: center; font-size: 11px;", "text-align: center; font-size: 12px;")
content = content.replace(".rc-grading-scale { margin-top: auto; font-size: 11px;", ".rc-grading-scale { margin-top: auto; font-size: 12px;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied final fixes.")
