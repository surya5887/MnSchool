import re
import os

file_path = 'src/components/CharacterCertificatePrintView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the flexbox issue on paragraphs
old_p_flex = r"display:\s*'flex',\s*alignItems:\s*'baseline',\s*flexWrap:\s*'wrap'"
content = re.sub(old_p_flex, r"textIndent: '0'", content)

# Also fix the text indentation of the first paragraph, and add standard spacing
content = content.replace("textIndent: '50px'", "textIndent: '0'")

# 2. Fix the "in words" layout for DOB to just be inline
content = content.replace("<br/> (in words:", "(in words:")
# Reduce width of dob words input so it wraps less aggressively
content = content.replace("width: '600px'", "width: '450px'")

# 3. Reduce footer margin to prevent it from pushing off the page
content = content.replace("marginTop: '140px'", "marginTop: '40px'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed CC text wrapping and footer overflow.")
