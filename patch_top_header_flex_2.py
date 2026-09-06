import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the top headers block again
old_headers = r"<div style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*flexWrap:\s*'nowrap',\s*fontSize:\s*'14px',\s*fontWeight:\s*'bold',\s*marginTop:\s*'10px',\s*width:\s*'100%'\s*\}\}>.*?</div>\s*</div>"

new_headers = """<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, marginRight: '30px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>Book No</span>
                       <input name="bookNo" value={formData.bookNo} onChange={handleChange} className="tc-editable" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1.2, marginRight: '30px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>U-DISE</span>
                       <input name="udise" value={formData.udise} onChange={handleChange} className="tc-editable" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1.4, marginRight: '30px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>Recognition No</span>
                       <input name="recognitionNo" value={formData.recognitionNo} onChange={handleChange} className="tc-editable" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1 }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>T.C. No</span>
                       <input name="tcNo" value={formData.tcNo} onChange={handleChange} className="tc-editable" style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #000', outline: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '14px', padding: '0 4px', width: '10px' }} />
                    </div>
                 </div>"""

content = re.sub(old_headers, new_headers, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed top header row layout permanently.")
