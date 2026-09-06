import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add non-breaking space before "(in words:"
    content = content.replace("</strong> (in words:", "</strong> &nbsp;(in words:")
    # Handle possible newline variations
    content = content.replace("</strong> \n                     (in words:", "</strong> &nbsp;(in words:")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Added space before (in words:).")
