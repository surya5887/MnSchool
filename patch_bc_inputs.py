import re
import os

file_path = 'src/components/BirthCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix inline inputs
content = re.sub(
    r'&nbsp;<InputLine name="admissionNumber" value=\{formData\.admissionNumber\} onChange=\{handleChange\} width="120px" />',
    r'&nbsp;<input name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} className="tc-dotted-input" style={{ width: \'120px\', border: \'none\', borderBottom: \'1.5px dotted #000\', outline: \'none\', background: \'transparent\', fontWeight: \'bold\', fontSize: \'15px\', padding: \'0 4px\', textAlign: \'center\', fontFamily: \'inherit\' }} />',
    content
)

content = re.sub(
    r'<InputLine name="dobWords" value=\{formData\.dobWords\} onChange=\{handleChange\} placeholder="e.g. Fifteenth of August Two Thousand and Ten" />',
    r'<input name="dobWords" value={formData.dobWords} onChange={handleChange} placeholder="e.g. Fifteenth of August Two Thousand and Ten" className="tc-dotted-input" style={{ width: \'500px\', border: \'none\', borderBottom: \'1.5px dotted #000\', outline: \'none\', background: \'transparent\', fontWeight: \'bold\', fontSize: \'18px\', padding: \'0 4px\', textAlign: \'left\', fontFamily: \'inherit\' }} />',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed BC inline inputs.")
