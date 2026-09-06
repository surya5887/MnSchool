import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Increase print padding for CC and BC to squish content together
    old_css_line = r"\.tc-inner-border,\s*\.cc-inner-border,\s*\.bc-inner-border\s*\{.*?padding:\s*15px\s*!important;.*?\}"
    
    new_css_line = """.tc-inner-border { padding: 15px !important; border: 2px solid #b91c1c !important; margin: 4px !important; height: calc(100vh - 24px) !important; box-sizing: border-box !important; display: flex; flex-direction: column; }
              .cc-inner-border, .bc-inner-border { padding: 50px 40px !important; border: 2px solid #b91c1c !important; margin: 4px !important; height: calc(100vh - 24px) !important; box-sizing: border-box !important; display: flex; flex-direction: column; }"""

    content = re.sub(old_css_line, new_css_line, content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Applied 50px vertical padding for CC and BC prints.")
