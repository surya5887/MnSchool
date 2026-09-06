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

    if "flex: width === '100%' ? 1 : 'none'" not in content:
        content = content.replace("width: width,\n      outline:", "width: width,\n      flex: width === '100%' ? 1 : 'none',\n      outline:")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed InputLine flex.")
