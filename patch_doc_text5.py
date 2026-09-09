import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add onMouseDown preventDefault to all formatting buttons so they don't steal selection
content = content.replace("onClick={() => execCmd('bold')}", "onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('bold')}")
content = content.replace("onClick={() => execCmd('italic')}", "onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('italic')}")
content = content.replace("onClick={() => execCmd('underline')}", "onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('underline')}")
content = content.replace("onClick={() => execCmd('justifyLeft')}", "onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('justifyLeft')}")
content = content.replace("onClick={() => execCmd('justifyCenter')}", "onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('justifyCenter')}")
content = content.replace("onClick={() => execCmd('justifyRight')}", "onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd('justifyRight')}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed formatting buttons stealing focus.")
