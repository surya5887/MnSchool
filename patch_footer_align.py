import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the entire footer
old_footer = r"\{/\*\s*FOOTER\s*\*/\}.*?<div style=\{\{\s*textAlign:\s*'center',\s*width:\s*'250px'\s*\}\}>.*?\n\s*</div>\n\s*</div>"

new_footer = """{/* FOOTER */}
                 <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                       <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '15px' }}>
                          <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>Date of Issue</div> 
                          <input name="writingDate" value={formData.writingDate} onChange={handleChange} className="tc-dotted-input" style={{ width: '160px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 8px', textAlign: 'left' }} /> 
                       </div>
                       <div style={{ width: '250px', borderBottom: '1.5px solid #000' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                       <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '15px', marginTop: '10px' }}>
                          <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>School Mohalla / Location</div> 
                          <input name="schoolMohalla" value={formData.schoolMohalla} onChange={handleChange} className="tc-dotted-input" style={{ width: '180px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 4px' }} />
                       </div>
                       <div style={{ textAlign: 'center', width: '250px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '17px', marginTop: '4px' }}>Signature of Principal</div>
                          <div style={{ fontSize: '16px', color: '#444' }}>(Seal / Stamp)</div>
                       </div>
                    </div>
                 </div>"""

content = re.sub(old_footer, new_footer, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Footer perfectly aligned.")
