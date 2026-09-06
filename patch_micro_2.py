import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Increase footer margin slightly
content = content.replace("marginTop: '15px', display: 'flex'", "marginTop: '25px', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied footer margin adjustment.")
