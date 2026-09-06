import re
import os

file_path = 'src/components/CharacterCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Bring content up
content = content.replace("marginBottom: '40px', fontSize: '15px'", "marginBottom: '15px', fontSize: '15px'")
content = content.replace("marginTop: '20px' }}>\n                <p", "marginTop: '0px' }}>\n                <p")

# 2. Fix text indents. Change ALL to 0 first, then selectively change the first one.
content = content.replace("textIndent: '50px'", "textIndent: '0'")
# The first paragraph has "This is to certify"
content = content.replace("<p style={{ margin: '0 0 12px 0', textIndent: '0' }}>\n                   This is to certify",
                          "<p style={{ margin: '0 0 12px 0', textIndent: '50px' }}>\n                   This is to certify")

# 3. Remove <br/> from DOB line so it flows naturally
content = content.replace("<br/> (in words:", "(in words:")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed layout and spacing.")
