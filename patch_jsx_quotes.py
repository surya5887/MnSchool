import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove all incorrect backslashes inside style tags
    content = content.replace("\\'", "'")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed JSX syntax error.")
