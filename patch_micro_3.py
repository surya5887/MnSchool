import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I currently have it at 25px in the local file because of the last python script.
content = content.replace("marginTop: '25px', display: 'flex'", "marginTop: '30px', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied footer margin adjustment to 30px.")
