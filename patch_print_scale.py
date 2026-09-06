import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Revert sizes halfway
content = content.replace('padding: 3px 8px', 'padding: 5px 8px')
content = content.replace('.tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13.5px; }',
                          '.tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14.5px; }')
content = content.replace('.tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 13.5px; font-family: inherit; font-weight: bold; color: #000; }',
                          '.tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 14.5px; font-family: inherit; font-weight: bold; color: #000; }')

content = content.replace("style={{ width: '80px', height: '80px' }} alt=\"Logo\"", "style={{ width: '90px', height: '90px' }} alt=\"Logo\"")
content = content.replace("fontSize: '24px'", "fontSize: '26px'")
content = content.replace("fontSize: '14px', color: '#1e3a8a'", "fontSize: '15px', color: '#1e3a8a'")
content = content.replace("padding: '6px 25px', borderRadius: '4px', marginTop: '10px', fontSize: '17px'", 
                          "padding: '6px 30px', borderRadius: '4px', marginTop: '12px', fontSize: '18px'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied perfect scaling.")
