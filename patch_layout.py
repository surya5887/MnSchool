import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove height: 100vh !important;
content = content.replace("height: 100vh !important;", "")

# 2. Fix the min-height in print mode by overriding it
if ".rc-front-page, .rc-back-page { min-height: auto !important; box-shadow: none !important; margin: 0 !important; }" not in content:
    content = content.replace("@media print {", "@media print {\n            .rc-front-page, .rc-back-page { min-height: auto !important; box-shadow: none !important; margin: 0 !important; max-width: none !important; border: none !important; }")

# 3. Remove inline width styles from th tags in the scholastic areas table
content = re.sub(r'style=\{\{\s*textAlign:\s*\'left\',\s*width:\s*\'18%\'\s*\}\}', r"style={{ textAlign: 'left' }}", content)
content = re.sub(r'style=\{\{\s*width:\s*\'[0-9]+%\'\s*\}\}', "", content)
# Wait, some might have other styles like width + something else.
# Looking at the code:
# <th rowSpan={2} style={{ textAlign: 'left', width: '18%' }}>
# <th rowSpan={2} style={{ width: '8%' }}>
# <th style={{ width: '9%' }}>
# <th style={{ width: '15%' }}>

# We'll just replace the exact strings
content = content.replace("style={{ width: '8%' }}", "")
content = content.replace("style={{ width: '9%' }}", "")
content = content.replace("style={{ width: '11%' }}", "")
content = content.replace("style={{ width: '15%' }}", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("CSS and widths patched.")
