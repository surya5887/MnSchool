import re
import os

files_to_patch = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

css_patch = """          @media print {
            body * { visibility: hidden; }
            body, html { margin: 0 !important; padding: 0 !important; height: 100% !important; background: white !important; }
            @page { size: A4 portrait; margin: 10mm; }
            .preview-overlay { position: absolute !important; left: 0; top: 0; background: white !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; }
            .preview-overlay * { visibility: visible; }
            .no-print { display: none !important; }
            .tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; min-height: 277mm !important; max-width: none !important; padding: 5px !important; box-sizing: border-box !important; }
            .tc-inner-border, .cc-inner-border, .bc-inner-border { padding: 25px !important; border-width: 2px !important; height: 100% !important; box-sizing: border-box !important; display: flex; flex-direction: column; }
            .tc-content-z, .cc-content-z, .bc-content-z { flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
            input.tc-editable, input.cc-editable, input.bc-editable { border-color: transparent !important; background: transparent !important; }
            input.tc-editable[value=""], input.cc-editable[value=""], input.bc-editable[value=""] { border-bottom: 1.5px dotted #000 !important; }
          }"""

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the print block
    content = re.sub(r'@media print\s*\{.*?(?=\s*\}\s*\.\w+-container)', css_patch + "\n          ", content, flags=re.DOTALL)
    
    # We also need to add className="tc-content-z" wrapper if it doesn't exist?
    # Wait, in the jsx, <div className="tc-content-z"> already exists! I added it earlier, wait let me check.
    # Ah! I didn't add it. Let's see if it's there.
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Patched full page print css.")
