import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Top headers "uper se thoda niche karo"
content = content.replace("<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>",
                          "<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold', marginTop: '10px' }}>")

# 2. Logo and name center align together
content = re.sub(
    r'<div style=\{\{\s*display:\s*\'flex\',\s*alignItems:\s*\'center\',\s*alignItems:\s*\'center\',\s*justifyContent:\s*\'flex-start\',\s*gap:\s*\'24px\'\s*\}\}>\s*<img src=\{settings\?\.logoUrl \|\| "/images/logo_circular\.png"\} style=\{\{\s*width:\s*\'100px\',\s*height:\s*\'100px\'\s*\}\} alt="Logo Left" />\s*<div style=\{\{\s*textAlign:\s*\'left\',\s*flex:\s*1,\s*paddingLeft:\s*\'20px\'\s*\}\}>',
    r'<div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'center\', gap: \'20px\' }}>\n                       <img src={settings?.logoUrl || "/images/logo_circular.png"} style={{ width: \'100px\', height: \'100px\' }} alt="Logo" />\n                       <div style={{ textAlign: \'left\' }}>',
    content
)
# If the double alignItems isn't there, just fallback:
if 'alt="Logo"' not in content:
    content = re.sub(
        r'<div style=\{\{\s*display:\s*\'flex\',\s*alignItems:\s*\'center\',(?:\s*alignItems:\s*\'center\',)?\s*justifyContent:\s*\'flex-start\',\s*gap:\s*\'24px\'\s*\}\}>\s*<img[^>]+>\s*<div style=\{\{\s*textAlign:\s*\'left\',\s*flex:\s*1,\s*paddingLeft:\s*\'20px\'\s*\}\}>',
        r'<div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'center\', gap: \'20px\' }}>\n                       <img src={settings?.logoUrl || "/images/logo_circular.png"} style={{ width: \'100px\', height: \'100px\' }} alt="Logo" />\n                       <div style={{ textAlign: \'left\' }}>',
        content
    )

# 3. Table design
new_table_css = """
              .tc-details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 15px; }
              .tc-details-table td { border: 1.5px solid #444; padding: 6px 12px; vertical-align: middle; }
              .tc-details-table td.label-col { font-weight: bold; width: 40%; background-color: rgba(0, 0, 0, 0.03); }
              .tc-details-table input { width: 100%; border: none; background: transparent; outline: none; font-size: 15px; font-family: inherit; font-weight: bold; color: #000; }
"""
old_table_css = r'\.tc-details-table \{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; \}.*?\.tc-details-table input \{ width: 100%; border: none; background: transparent; outline: none; font-size: 14px; font-family: inherit; font-weight: bold; \}'

content = re.sub(old_table_css, new_table_css.strip(), content, flags=re.DOTALL)


# 4. Footer "thoda uper karo"
# Remove space-between from tc-content-z
content = content.replace("justify-content: space-between;", "justify-content: flex-start; gap: 15px;")
# Change footer margin
content = content.replace("<div style={{ marginTop: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: \n'space-between' }}>",
                          "<div style={{ marginTop: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>")
# Handle the line break in the JSX of my previous replace
content = re.sub(r'<div style=\{\{\s*marginTop:\s*\'50px\',\s*display:\s*\'flex\',\s*alignItems:\s*\'flex-end\',\s*justifyContent:\s*\'space-between\'\s*\}\}>',
                 r'<div style={{ marginTop: \'40px\', display: \'flex\', alignItems: \'flex-end\', justifyContent: \'space-between\' }}>', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied UI fixes.")
