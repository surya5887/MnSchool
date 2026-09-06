import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the top headers block
old_headers = r"<div style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*flexWrap:\s*'nowrap',\s*fontSize:\s*'14px',\s*fontWeight:\s*'bold',\s*marginTop:\s*'10px'\s*\}\}>.*?</div>\s*</div>"

new_headers = """<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>Book No</span>
                       <InputLine name="bookNo" value={formData.bookNo} onChange={handleChange} width="100%" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1.5, marginLeft: '15px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>U-DISE</span>
                       <InputLine name="udise" value={formData.udise} onChange={handleChange} width="100%" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1.5, marginLeft: '15px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>Recognition No</span>
                       <InputLine name="recognitionNo" value={formData.recognitionNo} onChange={handleChange} width="100%" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginLeft: '15px' }}>
                       <span style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>T.C. No</span>
                       <InputLine name="tcNo" value={formData.tcNo} onChange={handleChange} width="100%" />
                    </div>
                 </div>"""

content = re.sub(old_headers, new_headers, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed top header row layout.")
