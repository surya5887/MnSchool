import os
import re

files_to_patch = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Import useEffect if not present
    if 'useEffect' not in content:
        content = content.replace("import React, { useState }", "import React, { useState, useEffect }")
        
    # Inject useEffect for fetching settings if it doesn't already have one doing it
    if 'getSchoolSettings()' not in content:
        # Find the state definition
        state_match = re.search(r'const \[settings, setSettings\] = useState<SchoolSettingsData \| null>\(null\);', content)
        if state_match:
            insertion_point = state_match.end()
            use_effect_code = """
  useEffect(() => {
    getSchoolSettings().then(set => {
      if(set) setSettings(set);
    });
  }, []);
"""
            content = content[:insertion_point] + use_effect_code + content[insertion_point:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Added useEffect to TC, CC, BC.")
