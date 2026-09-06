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

    # Import settings
    if 'getSchoolSettings' not in content:
        content = re.sub(
            r"(import React.*?from 'react';)",
            r"\1\nimport { getSchoolSettings, type SchoolSettingsData } from '../services/settingsService';",
            content,
            count=1
        )
    
    # Add settings state if not present
    if 'const [settings, setSettings]' not in content:
        # Find where component starts
        component_start = re.search(r'const [A-Za-z]+PrintView: React\.FC<.*?> = \(\{.*?\}\) => \{', content)
        if component_start:
            insertion_point = component_start.end()
            state_def = "\n  const [settings, setSettings] = useState<SchoolSettingsData | null>(null);"
            content = content[:insertion_point] + state_def + content[insertion_point:]

    # Add fetch to useEffect
    if 'setSettings(set)' not in content:
        # Find the first useEffect
        use_effect_match = re.search(r'useEffect\(\(\) => \{\s*const fetchData = async \(\) => \{', content)
        if use_effect_match:
            fetch_data_start = use_effect_match.end()
            fetch_code = "\n      const set = await getSchoolSettings();\n      if(set) setSettings(set);\n"
            content = content[:fetch_data_start] + fetch_code + content[fetch_data_start:]

    # Replace RC Header
    if 'ReportCard' in file_path:
        content = re.sub(
            r'<h1>M\.N\. PUBLIC SCHOOL</h1>\s*<h3>.*?</h3>\s*<p>Email: .*?</p>\s*<p>Harsoli .*?</p>',
            r"""<h1>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                      <h3>{settings?.recognitionText || 'Recognition from UP Board (CBSE Pattern for English Medium)'}</h3>
                      <p>Email: {settings?.email || 'info@mnpublicschool.com'} &nbsp;&nbsp;|&nbsp;&nbsp; Mobile No.: {settings?.phone || '9997125152, 8430707174'}</p>
                      <p>{settings?.address || 'Harsoli - 251001, Distt. Muzaffarnagar (U.P.) India'}</p>""",
            content
        )
        # Principal Name
        content = re.sub(r'<div>Principal<br/>M\.N\. Public School</div>', r'<div>Principal<br/>{settings?.schoolName || "M.N. Public School"}</div>', content)

    # Replace TC Header
    if 'Transfer' in file_path:
        content = re.sub(
            r'<h1([^>]*)>M\.N\. PUBLIC SCHOOL</h1>\s*<p([^>]*)>HARSOLI-251001, DISTT\. MUZAFFARNAGAR \(U\.P\.\) INDIA</p>',
            r"""<h1\1>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p\2>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>""",
            content
        )
        content = re.sub(r'PRINCIPAL<br/>M\.N\. PUBLIC SCHOOL', r'PRINCIPAL<br/>{settings?.schoolName?.toUpperCase() || "M.N. PUBLIC SCHOOL"}', content)

    # Replace CC Header
    if 'Character' in file_path:
        content = re.sub(
            r'<h1([^>]*)>M\.N\. PUBLIC SCHOOL</h1>\s*<p([^>]*)>HARSOLI-251001, DISTT\. MUZAFFARNAGAR \(U\.P\.\) INDIA</p>',
            r"""<h1\1>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p\2>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>""",
            content
        )
        content = re.sub(r'PRINCIPAL<br/>M\.N\. PUBLIC SCHOOL', r'PRINCIPAL<br/>{settings?.schoolName?.toUpperCase() || "M.N. PUBLIC SCHOOL"}', content)

    # Replace BC Header
    if 'Birth' in file_path:
        content = re.sub(
            r'<h1([^>]*)>M\.N\. PUBLIC SCHOOL</h1>\s*<p([^>]*)>HARSOLI-251001, DISTT\. MUZAFFARNAGAR \(U\.P\.\) INDIA</p>',
            r"""<h1\1>{settings?.schoolName || 'M.N. PUBLIC SCHOOL'}</h1>
                          <p\2>{settings?.address ? settings.address.toUpperCase() : 'HARSOLI-251001, DISTT. MUZAFFARNAGAR (U.P.) INDIA'}</p>""",
            content
        )
        content = re.sub(r'PRINCIPAL<br/>M\.N\. PUBLIC SCHOOL', r'PRINCIPAL<br/>{settings?.schoolName?.toUpperCase() || "M.N. PUBLIC SCHOOL"}', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done patching components!")
