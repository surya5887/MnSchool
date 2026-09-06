import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("\\'", "'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax error.")
