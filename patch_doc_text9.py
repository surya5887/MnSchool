import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"id={`editor-\$\{el\.id\}`\}[\s\S]*?contentEditable=\{\!printing\}"

new_props = """id={`editor-${el.id}`}
                    contentEditable={!printing}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}"""

content = re.sub(pattern, new_props, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added all event stoppers.")
