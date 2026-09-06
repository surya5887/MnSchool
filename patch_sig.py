import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify the rc-sig-block class to have max-width
old_sig_block = ".rc-sig-block { text-align: center; font-size: 16px; font-weight: bold; }"
new_sig_block = ".rc-sig-block { text-align: center; font-size: 14px; font-weight: bold; max-width: 220px; word-wrap: break-word; line-height: 1.3; }"
content = content.replace(old_sig_block, new_sig_block)

# The rc-sig-line should be centered within the block
old_sig_line = ".rc-sig-line { border-top: 1px solid #000; width: 220px; margin-bottom: 8px; }"
new_sig_line = ".rc-sig-line { border-top: 1px solid #000; width: 220px; margin: 0 auto 8px auto; }"
content = content.replace(old_sig_line, new_sig_line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed signature blocks in Report Card.")
