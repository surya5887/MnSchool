import os
import re

# 1. Report Card Patch
rc_file = 'src/components/ReportCardPrintView.tsx'
with open(rc_file, 'r', encoding='utf-8') as f:
    rc_content = f.read()

# Remove white-space: nowrap
rc_content = rc_content.replace('white-space: nowrap;', '')
# Change center to left align in rc-header-text
rc_content = rc_content.replace('.rc-header-text { flex: 1; text-align: center; padding: 0 10px; }', '.rc-header-text { flex: 1; text-align: left; padding: 0 10px 0 30px; }')

with open(rc_file, 'w', encoding='utf-8') as f:
    f.write(rc_content)

# 2. TC, CC, BC Patch
other_files = [
    'src/components/TransferCertificatePrintView.tsx',
    'src/components/CharacterCertificatePrintView.tsx',
    'src/components/BirthCertificatePrintView.tsx'
]

for file_path in other_files:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The header structure is:
    # <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
    #    <img src="/images/logo_circular.png" style={{ width: '100px', height: '100px' }} alt="Logo Left" />
    #    <div style={{ textAlign: 'center' }}>
    
    # Let's change the layout to left aligned, and maybe remove the right logo if it's there
    # Removing right logo makes it consistent with RC and looks much better for left-aligned text.
    # The right logo image tag: <img src="/images/logo_circular.png" style={{ width: '100px', height: '100px' }} alt="Logo Right" />
    content = re.sub(r'<img src="/images/logo_circular\.png" style=\{\{ width: \'100px\', height: \'100px\' \}\} alt="Logo Right" />', '', content)
    
    # Change flex container from center to flex-start
    content = content.replace("justifyContent: 'center'", "justifyContent: 'flex-start'")
    
    # Change text container from center to left
    content = content.replace("<div style={{ textAlign: 'center' }}>", "<div style={{ textAlign: 'left', flex: 1, paddingLeft: '20px' }}>")
    
    # Allow h1 to wrap and remove nowrap if it has it (it doesn't have it explicitly, but let's make sure it wraps)
    # The font size might be too big if it wraps, maybe leave it as is, the browser will wrap it automatically
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Alignment patched!")
