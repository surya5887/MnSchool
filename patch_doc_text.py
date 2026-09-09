import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useRef to DraggableElement
# Find: const controls = useDragControls();
replacement_hook = """    const controls = useDragControls();
    const initialContent = useRef(el.content || 'Click to edit text');
"""
content = content.replace("    const controls = useDragControls();\n", replacement_hook)

# 2. Update dangerouslySetInnerHTML
# Find: dangerouslySetInnerHTML={{ __html: el.content || 'Click to edit text' }}
# Replace: dangerouslySetInnerHTML={{ __html: initialContent.current }}
content = content.replace("dangerouslySetInnerHTML={{ __html: el.content || 'Click to edit text' }}", "dangerouslySetInnerHTML={{ __html: initialContent.current }}")

# 3. Change onBlur to onInput for real-time state sync without cursor jumping
old_onblur = """                    onBlur={(e) => {
                        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                        setElements(newElements);
                    }}"""
new_oninput = """                    onInput={(e) => {
                        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                        setElements(newElements);
                    }}
                    onBlur={() => setSelectedId(null)}"""
content = content.replace(old_onblur, new_oninput)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed DocumentBuilder contentEditable reset bug.")
