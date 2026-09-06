import re
import os

file_path = 'src/components/BirthCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix footer layout
content = content.replace("display: 'flex', flexDirection: 'column', marginTop: '120px', alignItems: 'flex-end', fontSize: '16px'",
                          "display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '120px', alignItems: 'flex-end', fontSize: '16px'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed BC footer.")
