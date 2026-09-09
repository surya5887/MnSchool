import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change onInput back to onBlur
# Wait, I also need to change dangerouslySetInnerHTML to NOT use initialContent, because if it's onBlur, we WANT it to update if the template loads!
# Let's revert DraggableElement's text block entirely to the most standard, working React contentEditable implementation.

old_text_block = """            {el.type === 'text' ? (
                <div 
                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ 
                        outline: 'none', 
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        cursor: printing ? 'default' : 'text', 
                        width: '100%',
                        height: '100%',
                        minWidth: '100px', 
                        fontSize: '18px', 
                        fontFamily: 'Arial, sans-serif'
                    }}
                    dangerouslySetInnerHTML={{ __html: initialContent.current }}
                    onInput={(e) => {
                        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                        setElements(newElements);
                    }}
                />
            )"""

new_text_block = """            {el.type === 'text' ? (
                <div 
                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onMouseDownCapture={(e) => e.stopPropagation()}
                    style={{ 
                        outline: 'none', 
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        cursor: printing ? 'default' : 'text', 
                        width: '100%',
                        height: '100%',
                        minWidth: '100px', 
                        fontSize: '18px', 
                        fontFamily: 'Arial, sans-serif'
                    }}
                    dangerouslySetInnerHTML={{ __html: el.content || 'Click to edit text' }}
                    onBlur={(e) => {
                        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                        setElements(newElements);
                    }}
                />
            )"""

content = content.replace(old_text_block, new_text_block)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Reverted to onBlur and added Capture stoppers.")
