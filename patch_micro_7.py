import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the table rows shorter to create physical space on the page
content = content.replace('padding: 4px 8px', 'padding: 2.5px 8px')
# Reduce font size just a tiny bit to make sure it doesn't get squished
content = content.replace('font-size: 14px;', 'font-size: 13.5px;')
content = content.replace('font-size: 14px; font-family', 'font-size: 13.5px; font-family')

# Adjust the footer margin
content = content.replace("marginTop: '45px', display: 'flex'", "marginTop: '20px', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Created physical space on page.")
