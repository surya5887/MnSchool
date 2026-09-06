import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the dobNum contentEditable span and replace it with a dotted input
    # The span looks like: <span contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, dobNum: e.currentTarget.textContent || ""})} style={{ border: "none", outline: "none", background: "transparent", fontWeight: "bold", fontFamily: "inherit", fontSize: "inherit", padding: 0, textAlign: "center", fontSize: '22px', color: 'inherit' , cursor: "text"}}>{formData.dobNum}</span>
    
    pattern = r'<span contentEditable suppressContentEditableWarning onBlur=\{\(e\) => setFormData\(\{\.\.\.formData, dobNum: e\.currentTarget\.textContent \|\| ""\}\)\} style=\{\{.*?\}\}>\{formData\.dobNum\}</span>'
    
    dotted_input = r'<input name="dobNum" value={formData.dobNum} onChange={handleChange} className="tc-dotted-input" style={{ width: \'130px\', border: \'none\', borderBottom: \'1.5px dotted #000\', outline: \'none\', background: \'transparent\', fontWeight: \'bold\', fontSize: \'18px\', padding: \'0 4px\', textAlign: \'center\', fontFamily: \'inherit\' }} placeholder="DD-MM-YYYY" />'
    
    content = re.sub(pattern, dotted_input, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Reverted DOB numeric to a dotted input.")
