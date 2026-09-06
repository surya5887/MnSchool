import re
import os

file_path = 'src/components/CharacterCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Re-add textIndent: '50px' to the first paragraph
content = content.replace("margin: '0 0 20px 0', textIndent: '0'", "margin: '0 0 20px 0', textIndent: '50px'")

# 2. Reduce line space
content = content.replace("lineHeight: '2.5'", "lineHeight: '2.0'")

# 3. Move "I wish him/her..." up
content = content.replace("marginTop: '60px', fontStyle: 'italic'", "marginTop: '20px', fontStyle: 'italic'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)


# 4. Add more top/bottom padding to CC and BC print media
for fp in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(fp, 'r', encoding='utf-8') as f:
        cont = f.read()
    
    # Replace padding: 50px 40px with padding: 100px 40px
    cont = cont.replace("padding: 50px 40px !important;", "padding: 100px 40px !important;")
    
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(cont)

print("Applied user feedback adjustments to CC.")
