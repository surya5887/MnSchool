import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's replace the whole {el.type === 'text' ? ( ... ) : ( block
pattern = r"\{el\.type === 'text' \? \([\s\S]*?\) : \("
new_block = """{el.type === 'text' ? (
                <div 
                    id={`editor-${el.id}`}
                    contentEditable={!printing}
                    suppressContentEditableWarning
                    onFocus={() => setSelectedId(el.id)}
                    style={{ 
                        outline: 'none', 
                        userSelect: 'auto',
                        WebkitUserSelect: 'auto',
                        cursor: printing ? 'default' : 'text', 
                        width: '100%',
                        height: '100%',
                        minWidth: '100px', 
                        fontSize: '18px', 
                        fontFamily: 'Arial, sans-serif'
                    }}
                    dangerouslySetInnerHTML={{ __html: initialContent.current || 'Click to edit text' }}
                    onBlur={(e) => {
                        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                        setElements(newElements);
                    }}
                />
            ) : ("""

content = re.sub(pattern, new_block, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Simplified contentEditable via regex.")
