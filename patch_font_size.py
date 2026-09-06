import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add fontSize: "inherit" to the inline inputs (those without explicit fontSize)
    # The ones that already have fontSize: '22px' will override it because it comes after in the style object? No, we should replace selectively.
    content = content.replace('fontFamily: "inherit", padding: 0', 'fontFamily: "inherit", fontSize: "inherit", padding: 0')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed font sizes for editable inline fields.")
