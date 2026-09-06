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

    # We need to add flex to InputLine style
    # Find the style={{ block and inject it
    if "flex: width === '100%'" not in content:
        content = re.sub(r'(style=\{\{\s*background:\s*\'transparent\',\s*border:\s*\'none\',)', 
                         r'\1\n        flex: width === \'100%\' ? 1 : \'none\',', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed InputLine flex.")
