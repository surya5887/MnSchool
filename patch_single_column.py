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

    # 1. Revert Logo alignment to left
    # The current flex container is:
    # <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
    content = content.replace("flexDirection: 'column', justifyContent: 'center', gap: '8px'", "alignItems: 'center', justifyContent: 'flex-start', gap: '24px'")
    content = content.replace("textAlign: 'center', flex: 1", "textAlign: 'left', flex: 1, paddingLeft: '20px'")
    
    # 2. Make the list single column
    # Current grid structure:
    # <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
    #    {/* LEFT COLUMN */}
    #    <div style={{ width: "48%" }}>
    #        ...
    #    </div>
    #    {/* RIGHT COLUMN */}
    #    <div style={{ width: "48%" }}>
    #        ...
    #    </div>
    # </div>
    #
    # Change to:
    # <div style={{ display: 'flex', flexDirection: 'column', fontSize: '16px' }}>
    #    <div style={{ width: "100%" }}>
    
    content = content.replace("display: 'flex', justifyContent: 'space-between'", "display: 'flex', flexDirection: 'column'")
    content = content.replace("<div style={{ width: \"48%\" }}>", "<div style={{ width: \"100%\" }}>")
    
    # We should probably reduce margin-bottom in .tc-field so it fits on 1 page!
    # Currently margin-bottom: 8px. Let's make it 6px.
    content = content.replace("margin-bottom: 8px;", "margin-bottom: 6px;")
    content = content.replace("marginBottom: '8px'", "marginBottom: '6px'")
    
    # 3. Add padding to the page to bring border inside
    # Current print css:
    # .tc-container, .cc-container, .bc-container { box-shadow: none !important; margin: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important; max-width: none !important; padding: 0 !important; box-sizing: border-box !important; border: 8px solid #1e3a8a !important; }
    # 
    # Let's change margin to 10mm auto !important; height: calc(100vh - 20mm) !important; width: calc(100vw - 20mm) !important;
    
    content = re.sub(
        r'margin: 0 !important; width: 100vw !important; height: 100vh !important; max-height: 100vh !important;',
        r'margin: 5mm auto !important; width: calc(100vw - 10mm) !important; height: calc(100vh - 10mm) !important; max-height: calc(100vh - 10mm) !important;',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Applied single column, left logo, and inner padding.")
