import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make it slightly smaller
content = content.replace('padding: 5px 8px', 'padding: 4px 8px')
content = content.replace('.tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14.5px; }',
                          '.tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 14px; }')
content = content.replace('.tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 14.5px; font-family: inherit; font-weight: bold; color: #000; }',
                          '.tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 14px; font-family: inherit; font-weight: bold; color: #000; }')

# Reduce gap between table and footer
content = content.replace("marginTop: '40px', display: 'flex'", "marginTop: '15px', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied micro-adjustments.")
