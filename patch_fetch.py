import os
import re

files_to_patch = [
    'src/components/ReportCardPrintView.tsx',
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add fetch to fetchData if not present
    if 'setSettings(' not in content or 'getSchoolSettings()' not in content.split('const fetchData')[1]:
        # Inject at the beginning of fetchData
        fetch_data_match = re.search(r'const fetchData = async \(\) => \{\s*(setLoading\(true\);)?', content)
        if fetch_data_match:
            insertion_point = fetch_data_match.end()
            fetch_code = "\n      const set = await getSchoolSettings();\n      if(set) setSettings(set);\n"
            content = content[:insertion_point] + fetch_code + content[insertion_point:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done patching fetch code!")
