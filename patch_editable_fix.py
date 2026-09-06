import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the style={ to style={{ and } /> to }} />
    content = content.replace("style={ border: \"none\"", "style={{ border: \"none\"")
    # Actually wait, there is a `}` at the end of the style object!
    content = content.replace(" 'uppercase' } />", " 'uppercase' }} />")
    content = content.replace(" 'inherit' } />", " 'inherit' }} />")
    content = content.replace(" '22px', color: 'inherit' } />", " '22px', color: 'inherit' }} />")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed JSX syntax errors.")
