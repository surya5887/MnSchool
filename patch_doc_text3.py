import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add back onPointerDown and userSelect to contentEditable
old_div = """                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}
                    style={{ 
                        outline: 'none', 
                        cursor: printing ? 'default' : 'text', """

new_div = """                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ 
                        outline: 'none', 
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        cursor: printing ? 'default' : 'text', """

content = content.replace(old_div, new_div)

# 2. To ensure absolutely NO React re-render interference with contentEditable typing, we should NOT call setElements on every single keystroke (onInput).
# We should ONLY update state when they blur or click outside!
# Wait, if they don't blur, and they click "Print", the latest text might not be in state?
# That's fine! We can just read the DOM on print! Or we can update state on blur.
# Let's revert onInput to onBlur. It is 1000x safer for contentEditable in React.
# BUT wait! We were having issues where if they clicked "Bold", or selected text, it wiped out their changes because it re-rendered BEFORE onBlur!
# How to fix that? 
# Simple: Instead of `dangerouslySetInnerHTML={{ __html: initialContent.current }}`, we can just let it be uncontrolled!
# React handles uncontrolled contentEditable if we ONLY pass dangerouslySetInnerHTML ONCE, and NEVER update the parent state UNTIL onBlur. But if parent state updates, the re-render happens.
# Since we use `initialContent.current`, it is truly uncontrolled. It will never reset to default text on re-render.
# So `onInput` is perfectly fine! It updates the state, but React ignores the prop since it hasn't changed.
# Let's keep `onInput`.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed userSelect and pointerDown.")
