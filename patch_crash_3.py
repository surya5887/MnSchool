import re

file_path = 'src/components/Layout.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace using split
parts = content.split('const settings = await getSchoolSettings();')
if len(parts) > 1:
    content = parts[0] + 'const settings = await getSchoolSettings();\n        if (settings) { setSchoolSettings(settings); }' + parts[1]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced!")
