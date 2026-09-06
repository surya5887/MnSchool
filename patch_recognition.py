import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx', 'src/components/TransferCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # For CC and BC, replace the hardcoded "Affiliated..." paragraph with a dynamic one
    if "Affiliated to CBSE" in content:
        content = content.replace("<p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#444' }}>Affiliated to CBSE, New Delhi</p>",
                                  "{settings?.recognitionText && <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#444' }}>{settings.recognitionText}</p>}")

    # For TC, we need to insert it below the address
    elif 'TransferCertificatePrintView.tsx' in file_path:
        old_address_line = r"(<p style=\{\{\s*margin:\s*'4px 0 0 0',\s*fontWeight:\s*'bold',\s*fontSize:\s*'15px',\s*color:\s*'#1e3a8a'\s*\}\}>\{settings\?\.address \? settings\.address\.toUpperCase\(\) : 'HARSOLI-251001, DISTT\. MUZAFFARNAGAR \(U\.P\.\) INDIA'\}</p>)"
        new_address_line = r"\1\n                            {settings?.recognitionText && <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#444' }}>{settings.recognitionText}</p>}"
        content = re.sub(old_address_line, new_address_line, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated Recognition Text fetching.")
