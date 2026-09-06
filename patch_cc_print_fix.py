import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix the blank print issue
    content = content.replace("<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>",
                              "<div className=\"preview-overlay\" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>")

    # 2. Fix the CC footer alignment
    if 'CharacterCertificatePrintView.tsx' in file_path:
        old_footer = r'<div style=\{\{\s*display:\s*\'flex\',\s*justifyContent:\s*\'space-between\',\s*alignItems:\s*\'flex-end\',\s*marginTop:\s*\'140px\',\s*fontSize:\s*\'16px\',\s*fontWeight:\s*\'bold\'\s*\}\}>.*?</div>\s*</div>\s*</div>'
        new_footer = """<div style={{ marginTop: '140px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '16px', fontWeight: 'bold' }}>
                      <div style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>Place:</div> 
                      <input name="place" value={formData.place} onChange={handleChange} className="tc-dotted-input" style={{ width: '200px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '18px', padding: '0 4px', textAlign: 'left', fontFamily: 'inherit' }} placeholder="City/Town" /> 
                   </div>
                   <div style={{ width: '250px', borderBottom: '1.5px solid #000' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                   <div style={{ textAlign: 'center', width: '250px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '17px', marginTop: '4px' }}>Signature of Principal</div>
                      <div style={{ fontSize: '16px', color: '#444' }}>(Seal / Stamp)</div>
                   </div>
                </div>
             </div>"""
        content = re.sub(old_footer, new_footer, content, flags=re.DOTALL)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed CC print blank issue and footer alignment.")
