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

    # Revert margin 5mm to 0
    content = re.sub(
        r'margin: 5mm auto !important; width: calc\(100vw - 10mm\) !important; height: calc\(100vh - 10mm\) !important; max-height: calc\(100vh - 10mm\) !important;',
        r'margin: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important;',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Reverted print margins to 0.")
