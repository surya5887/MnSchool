import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change flex-direction of action buttons
old_buttons = r"<div className=\"no-print\" style=\{\{ display: 'flex', flexDirection: 'column', maxWidth: '950px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba\(0, 0, 0, 0\.1\)' \}\}>"
new_buttons = "<div className=\"no-print\" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: '950px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>"

content = re.sub(old_buttons, new_buttons, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed action buttons UI.")
