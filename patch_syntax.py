import re
import os

files_to_patch = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace("flex: width === \\'100%\\' ? 1 : \\'none\\',", "flex: width === '100%' ? 1 : 'none',")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed syntax error.")
