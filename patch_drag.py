import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove dragListener={false} and dragControls={undefined}
content = content.replace("dragListener={false} // Disable dragging from the entire div", "")
content = content.replace("dragControls={undefined}", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed drag listener.")
