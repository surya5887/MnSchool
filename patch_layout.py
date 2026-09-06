import re
import os

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

    # 1. Change Grid to Flexbox
    content = content.replace("display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'", "display: 'flex', justifyContent: 'space-between'")
    
    # Add width: 48% to columns
    content = content.replace("/* LEFT COLUMN */\n                  <div>", "/* LEFT COLUMN */\n                  <div style={{ width: '48%' }}>")
    content = content.replace("/* LEFT COLUMN */\n                    <div>", "/* LEFT COLUMN */\n                    <div style={{ width: '48%' }}>")
    content = content.replace("/* RIGHT COLUMN */\n                  <div>", "/* RIGHT COLUMN */\n                  <div style={{ width: '48%' }}>")
    content = content.replace("/* RIGHT COLUMN */\n                    <div>", "/* RIGHT COLUMN */\n                    <div style={{ width: '48%' }}>")
    
    # 2. Reduce font sizes slightly for elegance
    content = content.replace("fontSize: '14px'", "fontSize: '13.5px'")
    content = content.replace("fontSize: '32px'", "fontSize: '28px'") # TC
    content = content.replace("fontSize: '30px'", "fontSize: '26px'") # CC, BC
    
    # 3. Reduce padding in print CSS to give more room
    content = content.replace("padding: 20px !important; border-width: 1.5px !important;", "padding: 15px !important; border-width: 1.5px !important;")
    
    # 4. Make sure bottom margin doesn't push it out
    content = content.replace("marginBottom: '30px'", "marginBottom: '15px'") # Main title margin
    content = content.replace("marginTop: '30px'", "marginTop: '15px'")
    content = content.replace("marginTop: '25px'", "marginTop: '10px'") # Subtitle margin
    
    # TC Specific fixes
    if 'TransferCertificate' in file_path:
        content = content.replace("marginBottom: '50px'", "marginBottom: '20px'")
        content = content.replace("marginTop: '60px'", "marginTop: '30px'") # Signatures spacing
        
    # CC Specific fixes
    if 'CharacterCertificate' in file_path:
        content = content.replace("marginTop: '80px'", "marginTop: '40px'")
        
    # BC Specific fixes
    if 'BirthCertificate' in file_path:
        content = content.replace("marginTop: '80px'", "marginTop: '40px'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Certificates layout patched.")
