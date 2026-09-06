import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I currently have it at 30px in the local file.
content = content.replace("marginTop: '30px', display: 'flex'", "marginTop: '35px', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied footer margin adjustment to 35px.")
