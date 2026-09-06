import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('style={ objectFit: "contain" }', 'style={{ objectFit: "contain" }}')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed double brace syntax error.")
