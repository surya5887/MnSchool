import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix top headers row layout
content = re.sub(
    r'<div style=\{\{\s*display:\s*\'flex\',\s*flexDirection:\s*\'column\',\s*fontSize:\s*\'16px\',\s*fontWeight:\s*\'bold\'\s*\}\}>\s*<div style=\{\{\s*display:\s*\'flex\',\s*alignItems:\s*\'center\'\s*\}\}>Book No',
    r'<div style={{ display: \'flex\', justifyContent: \'space-between\', flexWrap: \'nowrap\', fontSize: \'14px\', fontWeight: \'bold\' }}>\n                    <div style={{ display: \'flex\', alignItems: \'center\' }}>Book No',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed top headers.")
