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

    # Replace <img src="/images/logo_circular.png" ... />
    content = content.replace('src="/images/logo_circular.png"', 'src={settings?.logoUrl || "/images/logo_circular.png"}')
    
    # Replace background-image: url('/images/logo_circular.png')
    content = content.replace("backgroundImage: `url('/images/logo_circular.png')`", "backgroundImage: `url('${settings?.logoUrl || '/images/logo_circular.png'}')`")
    content = content.replace("background-image: url('/images/logo_circular.png');", "")

    # For any inline styles using it, wait, let's see if background-image is in css strings
    content = re.sub(r'background-image:\s*url\([\'"]/images/logo_circular\.png[\'"]\);', '', content)
    
    # We might need to add it inline if it was removed from css strings
    if '.rc-watermark' in content:
        content = content.replace('className="rc-watermark"', 'className="rc-watermark" style={{ backgroundImage: `url(\'${settings?.logoUrl || "/images/logo_circular.png"}\')` }}')
        
    if '.tc-watermark' in content or '.cc-watermark' in content or '.bc-watermark' in content:
        content = content.replace('className="tc-watermark"', 'className="tc-watermark" style={{ backgroundImage: `url(\'${settings?.logoUrl || "/images/logo_circular.png"}\')` }}')
        content = content.replace('className="cc-watermark"', 'className="cc-watermark" style={{ backgroundImage: `url(\'${settings?.logoUrl || "/images/logo_circular.png"}\')` }}')
        content = content.replace('className="bc-watermark"', 'className="bc-watermark" style={{ backgroundImage: `url(\'${settings?.logoUrl || "/images/logo_circular.png"}\')` }}')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated print views to use dynamic logo")
