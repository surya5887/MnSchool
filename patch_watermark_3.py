import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'(\.rc-front-page,\s*\.rc-back-page\s*\{\s*)', r'\1position: relative; z-index: 1; overflow: hidden; ', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replace done")
