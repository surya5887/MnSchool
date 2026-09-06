import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change flex-end to flex-start
content = content.replace("align-items: flex-end;", "align-items: flex-start;")

# 2. Add margin-top to rc-sig-line to match Date line level
# Find: .rc-sig-line { border-top: 1px solid #000; width: 220px; margin: 0 auto 8px auto; }
content = content.replace("margin: 0 auto 8px auto;", "margin: 18px auto 8px auto;")

# 3. For Date block, ensure it doesn't have extra bottom margin pushing it down
# It currently has marginBottom: '8px'. 

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Aligned all signature lines.")
