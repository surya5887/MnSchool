import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove onBlur entirely
content = content.replace("onBlur={() => setSelectedId(null)}", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed onBlur.")
