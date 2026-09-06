import re
import os

files_to_patch = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

css_patch = """          @media print {
            body * { visibility: hidden; }
            body, html { margin: 0 !important; padding: 0 !important; height: auto !important; background: white !important; }
            @page { size: A4 portrait; margin: 10mm; }
            .preview-overlay { position: static !important; left: 0; top: 0; background: white !important; padding: 0 !important; width: 100%; height: 100%; overflow: visible !important; }
            .preview-overlay * { visibility: visible; }
            .no-print { display: none !important; }
            .tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 auto !important; width: 100% !important; max-width: none !important; padding: 0 !important; border-width: 4px !important; }
            .tc-inner-border, .cc-inner-border, .bc-inner-border { padding: 20px !important; border-width: 1.5px !important; }
            input.tc-editable, input.cc-editable, input.bc-editable { border-color: transparent !important; background: transparent !important; }
            input.tc-editable[value=""], input.cc-editable[value=""], input.bc-editable[value=""] { border-bottom: 1.5px dotted #000 !important; }
            * { overflow: visible !important; }
          }"""

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the print media block and replace it
    # We will use regex to find @media print { ... } up to the next outer selector
    
    # Simple replace for the exact old block
    old_block_tc = """          @media print {
            body * { visibility: hidden; }
            .preview-overlay { position: absolute !important; left: 0; top: 0; background: white !important; padding: 0 !important; width: 100%; height: 100%; }
            .preview-overlay * { visibility: visible; }
            .no-print { display: none !important; }
            .tc-container { box-shadow: none !important; margin: 0 auto !important; width: 100% !important; padding: 20px !important; }
            input.tc-editable { border-color: transparent !important; }
            input.tc-editable[value=""] { border-bottom: 1.5px dotted #000 !important; }
          }"""
    
    old_block_cc = old_block_tc.replace('tc-', 'cc-')
    old_block_bc = old_block_tc.replace('tc-', 'bc-')
    
    if old_block_tc in content:
        content = content.replace(old_block_tc, css_patch)
    elif old_block_cc in content:
        content = content.replace(old_block_cc, css_patch)
    elif old_block_bc in content:
        content = content.replace(old_block_bc, css_patch)
    else:
        # If strict replace fails, use regex
        content = re.sub(r'@media print\s*\{.*?(?=\s*\}\s*\.\w+-container)', css_patch + "\n          ", content, flags=re.DOTALL)

    # Make sure text sizes are slightly scaled down to fit on A4 if they are too large
    # 38px font size is very large for A4, it wraps and pushes content down. Let's make it 32px.
    content = content.replace("fontSize: '38px'", "fontSize: '32px'")
    content = content.replace("fontSize: '36px'", "fontSize: '30px'") # For CC and BC
    content = content.replace("gap: '30px'", "gap: '20px'")
    content = content.replace("marginBottom: '12px'", "marginBottom: '8px'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Certificates patched for A4 Print.")
