import re
import os

def fix_certificate(file_path, prefix):
    if not os.path.exists(file_path):
        print(f"{file_path} not found.")
        return
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Action buttons
    old_buttons = r"<div className=\"no-print\" style=\{\{ display: 'flex', flexDirection: 'column', maxWidth: '950px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba\(0, 0, 0, 0\.1\)' \}\}>"
    new_buttons = "<div className=\"no-print\" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: '950px', margin: '0 auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>"
    content = re.sub(old_buttons, new_buttons, content)

    # 2. Container classes
    content = content.replace('className="certificate-container"', f'className="{prefix}-container"')
    content = content.replace('className="cert-inner-border"', f'className="{prefix}-inner-border"')
    content = content.replace('className="cert-content"', f'className="{prefix}-content-z"')

    # 3. Watermark
    old_watermark = r'<div className="cert-watermark"></div>'
    new_watermark = f'<img className="{prefix}-watermark" src={{settings?.logoUrl || "/images/logo_circular.png"}} alt="Watermark" style={{ objectFit: "contain" }} />'
    content = re.sub(old_watermark, new_watermark, content)

    # 4. Logo and Title
    old_logo_row = r'<div style=\{\{\s*display:\s*\'flex\',\s*alignItems:\s*\'center\',\s*alignItems:\s*\'center\',\s*justifyContent:\s*\'flex-start\',\s*gap:\s*\'24px\'\s*\}\}>\s*<img src=\{settings\?\.logoUrl \|\| "/images/logo_circular\.png"\} style=\{\{\s*width:\s*\'100px\',\s*height:\s*\'100px\'\s*\}\} alt="Logo Left" />\s*<div style=\{\{\s*textAlign:\s*\'left\',\s*flex:\s*1,\s*paddingLeft:\s*\'20px\'\s*\}\}>'
    new_logo_row = r"""<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                       <img src={settings?.logoUrl || "/images/logo_circular.png"} style={{ width: '90px', height: '90px' }} alt="Logo" />
                       <div style={{ textAlign: 'left' }}>"""
    content = re.sub(old_logo_row, new_logo_row, content)

    # Also shrink title font slightly to match TC
    content = content.replace("fontSize: '42px'", "fontSize: '26px'") # Wait, CC was 42px? TC is 26px. Let's make it 26px.
    content = content.replace("fontSize: '15px', color: '#1e3a8a'", "fontSize: '15px', color: '#1e3a8a'") # Same
    
    # 5. Fix Print CSS
    # Add .tc-dotted-input just in case, and fix margins if they are using 5mm
    content = content.replace('margin: 5mm auto !important; width: calc(100vw - 10mm) !important; height: calc(100vh - 10mm) !important; max-height: calc(100vh - 10mm) !important;',
                              'margin: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important;')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed {file_path}")


fix_certificate('src/components/CharacterCertificatePrintView.tsx', 'cc')
fix_certificate('src/components/BirthCertificatePrintView.tsx', 'bc')

