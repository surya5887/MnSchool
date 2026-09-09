import re

file_path = 'src/components/DocumentBuilder.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "flexShrink: 0, background: bgImage ? `url(${bgImage}) center/cover no-repeat` : 'white',",
    "flexShrink: 0, background: bgImage ? (printing ? 'transparent' : `url(${bgImage}) center/cover no-repeat`) : 'white',"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Reverted transparency fix")
