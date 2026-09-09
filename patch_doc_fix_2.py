import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the ReferenceError!
content = content.replace("overflow: el.type === 'image' ? 'hidden' : 'visible', display: 'flex'", "overflow: 'hidden', display: 'flex'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed DocumentBuilder ReferenceError.")
