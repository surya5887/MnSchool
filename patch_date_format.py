import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the Date of Issue input width and add placeholder
content = content.replace(
    'name="writingDate" value={formData.writingDate} onChange={handleChange} className="tc-dotted-input" style={{ width: \'160px\', border: \'none\', borderBottom: \'1.5px dotted #000\', outline: \'none\', background: \'transparent\', fontWeight: \'bold\', fontSize: \'15px\', padding: \'0 8px\', textAlign: \'left\' }} />',
    'name="writingDate" value={formData.writingDate} onChange={handleChange} placeholder="DD-MM-YYYY" className="tc-dotted-input" style={{ width: \'110px\', border: \'none\', borderBottom: \'1.5px dotted #000\', outline: \'none\', background: \'transparent\', fontWeight: \'bold\', fontSize: \'15px\', padding: \'0 4px\', textAlign: \'center\' }} />'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Adjusted Date of Issue.")
