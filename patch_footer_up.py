import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pull footer up
content = content.replace("marginTop: '40px', display: 'flex'", "marginTop: '15px', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Pulled footer up.")
