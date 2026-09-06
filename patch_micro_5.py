import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I currently have it at 35px in the local file. Let's set it to 30px which is a good sweet spot.
content = content.replace("marginTop: '35px', display: 'flex'", "marginTop: '30px', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Set to 30px.")
