import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def replacer(match):
        name = match.group(1)
        style_content = match.group(2)
        # We replace the entire <input ... /> with a <span contentEditable ...>
        span_tpl = '<span contentEditable suppressContentEditableWarning onBlur={(e) => setFormData({...formData, ' + name + ': e.currentTarget.textContent || ""})} style={{' + style_content + ', cursor: "text"}}>{formData.' + name + '}</span>'
        return span_tpl

    pattern = r'<input name="([^"]+)" value=\{formData\.[^}]+\} onChange=\{handleChange\} size=\{Math\.max\([^}]+\)\} style=\{\{(.*?)\}\} />'
    
    content = re.sub(pattern, replacer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Converted borderless inputs to contentEditable spans to fix spacing.")
