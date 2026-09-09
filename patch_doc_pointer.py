import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add pointerEvents: 'auto'
content = content.replace(
    "cursor: printing ? 'default' : 'text',",
    "cursor: printing ? 'default' : 'text', pointerEvents: 'auto',"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added pointerEvents auto.")
