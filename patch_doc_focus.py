import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modify wrapper onClick to only trigger for images, to prevent re-render on text click
content = content.replace(
    "onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}",
    "onClick={(e) => { e.stopPropagation(); if (el.type !== 'text') setSelectedId(el.id); }}"
)

# 2. Add an explicit onClick to the contentEditable that focuses it and sets selected ID after a tiny delay
# A timeout prevents the synchronous re-render from killing the native focus event!
old_text = """                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}"""

new_text = """                    id={`editor-${el.id}`}
                    contentEditable={!printing ? "true" : "false"}
                    suppressContentEditableWarning
                    onFocus={(e) => {
                        // Delay state update to allow browser to natively place caret
                        setTimeout(() => setSelectedId(el.id), 50);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setTimeout(() => setSelectedId(el.id), 50);
                    }}"""

content = content.replace(old_text, new_text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed focus re-render issue.")
