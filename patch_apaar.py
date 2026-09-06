import re
import os

file_path = 'src/components/TransferCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove APAAR ID from its current location
apaar_row = r'<tr><td className="label-col">APAAR ID</td><td><input name="apaarId" value={formData\.apaarId} onChange={handleChange} /></td></tr>\s*'
content = re.sub(apaar_row, '', content)

# 2. Insert APAAR ID right after PEN No.
pen_row = r'(<tr><td className="label-col">PEN No\.</td><td><input name="pen" value=\{formData\.pen\} onChange=\{handleChange\} /></td></tr>)'
new_apaar_row = '<tr><td className="label-col">APAAR ID</td><td><input name="apaarId" value={formData.apaarId} onChange={handleChange} /></td></tr>'

content = re.sub(pen_row, r'\1\n                         ' + new_apaar_row, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Moved APAAR ID to the top.")
