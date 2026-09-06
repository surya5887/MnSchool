import re
import os

file_path = 'src/components/CharacterCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Reduce line height
content = content.replace("lineHeight: '2.0'", "lineHeight: '1.7'")

# 2. Reduce paragraph spacing
content = content.replace("margin: '0 0 20px 0'", "margin: '0 0 12px 0'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Adjust print padding for both CC and BC
for fp in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(fp, 'r', encoding='utf-8') as f:
        cont = f.read()
    
    # Replace padding: 100px 40px with padding: 80px 40px
    cont = cont.replace("padding: 100px 40px !important;", "padding: 80px 40px !important;")
    
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(cont)

print("Applied final tweaks.")
