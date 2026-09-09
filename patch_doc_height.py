import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove width and height 100% from contentEditable
content = content.replace(
    "cursor: printing ? 'default' : 'text', pointerEvents: 'auto', \n                        width: '100%',\n                        height: '100%',",
    "cursor: printing ? 'default' : 'text', pointerEvents: 'auto', minHeight: '24px',"
)
# Just in case the regex doesn't match perfectly, let's use a robust replace
content = re.sub(r"width: '100%',\s*height: '100%',\s*minWidth: '100px',", "minWidth: '100px', minHeight: '24px',", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed 100% height/width from contentEditable.")
