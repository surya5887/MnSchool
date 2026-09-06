import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Footer
old_footer = r"\{/\*\s*FOOTER\s*\*/\}.*?<div style=\{\{\s*textAlign:\s*'center',\s*width:\s*'250px'\s*\}\}>"

new_footer = """{/* FOOTER */}
                 <div style={{ marginTop: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '10px', fontSize: '15px' }}>
                          <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>Date of Issue</div> 
                          <input name="writingDate" value={formData.writingDate} onChange={handleChange} className="tc-editable" style={{ width: '50px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 4px', textAlign: 'center' }} /> 
                          <div style={{ whiteSpace: 'nowrap', margin: '0 10px', fontWeight: 'bold' }}>Month</div> 
                          <input name="writingMonth" value={formData.writingMonth} onChange={handleChange} className="tc-editable" style={{ width: '50px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 4px', textAlign: 'center' }} /> 
                          <div style={{ whiteSpace: 'nowrap', margin: '0 10px', fontWeight: 'bold' }}>Year: 20</div> 
                          <input name="writingYear" value={formData.writingYear} onChange={handleChange} className="tc-editable" style={{ width: '50px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 4px', textAlign: 'center' }} />
                       </div>
                       <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '15px' }}>
                          <div style={{ whiteSpace: 'nowrap', marginRight: '10px', fontWeight: 'bold' }}>School Mohalla / Location</div> 
                          <input name="schoolMohalla" value={formData.schoolMohalla} onChange={handleChange} className="tc-editable" style={{ flex: 1, maxWidth: '300px', border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '15px', padding: '0 4px' }} />
                       </div>
                    </div>

                    <div style={{ textAlign: 'center', width: '250px' }}>"""

content = re.sub(old_footer, new_footer, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed footer.")
