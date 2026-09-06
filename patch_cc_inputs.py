import re
import os

file_path = 'src/components/CharacterCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the inline inputs (session and character)
content = re.sub(
    r'&nbsp;<InputLine name="session" value=\{formData\.session\} onChange=\{handleChange\} width="140px" />',
    r'&nbsp;<input name="session" value={formData.session} onChange={handleChange} className="tc-dotted-input" style={{ width: \'130px\', border: \'none\', borderBottom: \'1.5px dotted #000\', outline: \'none\', background: \'transparent\', fontWeight: \'bold\', fontSize: \'20px\', padding: \'0 4px\', textAlign: \'center\', fontFamily: \'inherit\' }} />',
    content
)

content = re.sub(
    r'&nbsp;<InputLine name="character" value=\{formData\.character\} onChange=\{handleChange\} width="180px" />&nbsp;',
    r'&nbsp;<input name="character" value={formData.character} onChange={handleChange} className="tc-dotted-input" style={{ width: \'160px\', border: \'none\', borderBottom: \'1.5px dotted #000\', outline: \'none\', background: \'transparent\', fontWeight: \'bold\', fontSize: \'20px\', padding: \'0 4px\', textAlign: \'center\', fontFamily: \'inherit\' }} />&nbsp;',
    content
)

# Fix the footer (place and signature alignment)
old_footer = r'<div style=\{\{\s*display:\s*\'flex\',\s*flexDirection:\s*\'column\',\s*marginTop:\s*\'140px\',\s*alignItems:\s*\'flex-end\',\s*fontSize:\s*\'16px\',\s*fontWeight:\s*\'bold\'\s*\}\}>.*?</div>\s*</div>\s*</div>'
new_footer = """<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '140px', fontSize: '16px', fontWeight: 'bold' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '8px' }}>
                   <span style={{ marginRight: '10px' }}>Place:</span>
                   <input name="place" value={formData.place} onChange={handleChange} className="tc-dotted-input" style={{ width: '180px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '18px', padding: '0 4px', fontFamily: 'inherit' }} placeholder="City/Town" />
                </div>
                
                <div style={{ textAlign: 'center', width: '250px' }}>
                   <div style={{ borderBottom: '1.5px solid #000', height: '20px', marginBottom: '10px' }}></div>
                   <div style={{ fontSize: '18px' }}>Signature of Principal</div>
                   <div style={{ fontSize: '16px', color: '#444' }}>(Seal / Stamp)</div>
                </div>
             </div>"""

content = re.sub(old_footer, new_footer, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed CC inline inputs and footer.")
