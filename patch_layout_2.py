import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix .rc-front-page, .rc-back-page in @media print
# Old: .rc-front-page, .rc-back-page { min-height: auto !important; box-shadow: none !important; margin: 0 !important; max-width: none !important; border: none !important; }
# New: .rc-front-page, .rc-back-page { min-height: auto !important; box-shadow: none !important; margin: 0 auto !important; width: 100% !important; max-width: none !important; border: none !important; }
content = content.replace("margin: 0 !important; max-width: none !important;", "margin: 0 auto !important; width: 100% !important; max-width: none !important;")

# 2. Add table-layout: fixed to .rc-table
content = content.replace("border: 2px solid #000; font-family: 'Arial', sans-serif; }", "border: 2px solid #000; font-family: 'Arial', sans-serif; table-layout: fixed; }")
content = content.replace(".rc-footer-info { width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 2px solid #000; font-family: 'Arial', sans-serif;}", ".rc-footer-info { width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 2px solid #000; font-family: 'Arial', sans-serif; table-layout: fixed;}")
content = content.replace(".rc-grading-scale table { width: 100%; border-collapse: collapse; border: 2px solid #000; }", ".rc-grading-scale table { width: 100%; border-collapse: collapse; border: 2px solid #000; table-layout: fixed; }")

# 3. Add widths to Scholastic table headers
content = content.replace("<th rowSpan={2} style={{ textAlign: 'left' }}>Scholastic Areas</th>", "<th rowSpan={2} style={{ textAlign: 'left', width: '20%' }}>Scholastic Areas</th>")
content = content.replace("<th colSpan={3}>Half Yearly Examination</th>", "<th colSpan={3} style={{ width: '30%' }}>Half Yearly Examination</th>")
content = content.replace("<th colSpan={3}>Annual Examination</th>", "<th colSpan={3} style={{ width: '30%' }}>Annual Examination</th>")
content = content.replace("<th rowSpan={2} >Total<br/>(200)</th>", "<th rowSpan={2} style={{ width: '10%' }}>Total<br/>(200)</th>")
content = content.replace("<th rowSpan={2} >Grade</th>", "<th rowSpan={2} style={{ width: '10%' }}>Grade</th>")

# 4. Add widths to Co-Scholastic table headers
content = content.replace("<th style={{ textAlign: 'left' }}>Co-Scholastic Areas: [on a five point (A-E) grading scale]</th>", "<th style={{ textAlign: 'left', width: '85%' }}>Co-Scholastic Areas: [on a five point (A-E) grading scale]</th>")
content = content.replace("<th>Grade</th>", "<th style={{ width: '15%' }}>Grade</th>")
# We removed the 15% earlier with regex, so it might just be <th>Grade</th> now. Let's check:
content = re.sub(r'<th\s*>Grade</th>', "<th style={{ width: '15%' }}>Grade</th>", content)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Table layout and margins patched.")
