import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change overflow to 'visible' for text, 'hidden' for images
old_style = "overflow: 'hidden',"
new_style = "overflow: el.type === 'image' ? 'hidden' : 'visible',"

content = content.replace(old_style, new_style)

# Let's also remove onPointerDown={(e) => e.stopPropagation()} from the contentEditable div if it's there
# wait, if I used useDragControls and dragListener={false}, we don't need onPointerDown={(e) => e.stopPropagation()} on the contentEditable!
# If it's still there, it might be blocking focus/selection natively on some browsers.
content = content.replace("onPointerDown={(e) => e.stopPropagation()} // FIX FOR TEXT SELECTION! Stops framer-motion drag interference", "")
content = content.replace("onPointerDown={(e) => e.stopPropagation()}", "")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed DocumentBuilder drag handle overflow and selection.")
