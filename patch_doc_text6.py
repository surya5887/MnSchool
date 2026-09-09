import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the text element entirely with a much simpler, highly robust implementation
old_text_block = """            {el.type === 'text' ? (
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

new_text_block = """            {el.type === 'text' ? (
                <div 
                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}
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
                    onBlur={(e) => {
                        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                        setElements(newElements);
                    }}
                >
                    {/* Render initial content via React to avoid dangerouslySetInnerHTML issues during re-renders */}
                    {/* Wait, standard React allows dangerouslySetInnerHTML to work if we only set it on mount? */}
                    {/* Let's just use dangerouslySetInnerHTML safely */}
                </div>
            )"""

# Actually, if I use a simple div, I can't put children inside it if it has dangerouslySetInnerHTML.
# Let's use dangerouslySetInnerHTML but REMOVE the capture events!

new_text_block = """            {el.type === 'text' ? (
                <div 
                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}
                    onPointerDown={(e) => e.stopPropagation()} 
                    onMouseDown={(e) => e.stopPropagation()}
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

print("Reverted capture events to normal events.")
