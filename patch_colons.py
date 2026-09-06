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

    # Remove colons from any label, even with style
    content = re.sub(r'(<div[^>]*?>[^<]*?):(</div>)', r'\1\2', content)
    
    # And for top headers:
    # Book No. <InputLine
    content = content.replace("Book No. <InputLine", "Book No <InputLine")
    content = content.replace("U-DISE <InputLine", "U-DISE <InputLine")
    content = content.replace("Recognition No. <InputLine", "Recognition No <InputLine")
    content = content.replace("T.C. No. <InputLine", "T.C. No <InputLine")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Removed all colons.")
