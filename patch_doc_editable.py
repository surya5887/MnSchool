import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Hardcode contentEditable to true
content = content.replace(
    'contentEditable={!printing ? "true" : "false"}',
    'contentEditable="true"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Hardcoded contentEditable.")
