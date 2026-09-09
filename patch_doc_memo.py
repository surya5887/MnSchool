import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Create MemoizedEditor
memoized_editor = """
const MemoizedEditor = React.memo<{ el: DocElement, printing: boolean }>(({ el, printing }) => {
    return (
        <div 
            id={`editor-${el.id}`}
            contentEditable="true"
            suppressContentEditableWarning
            style={{ 
                outline: 'none', 
                userSelect: 'text',
                WebkitUserSelect: 'text',
                cursor: printing ? 'default' : 'text', 
                pointerEvents: 'auto', 
                minWidth: '100px', 
                minHeight: '24px', 
                fontSize: '18px', 
                fontFamily: 'Arial, sans-serif'
            }}
            dangerouslySetInnerHTML={{ __html: el.content || 'Click to edit text' }}
        />
    );
}, () => true); // NEVER re-render

const DraggableElement"""

content = content.replace("const DraggableElement", memoized_editor)

# Replace the text element inside DraggableElement with MemoizedEditor
# And add onBlur and onFocus to the wrapper!

# We need to find the DraggableElement wrapper and add onBlur/onFocus
wrapper_pattern = r"<div\s+id=\{\`draggable-wrapper-\$\{el\.id\}\`\}\s+onClick=\{\(e\) => \{ e\.stopPropagation\(\); if \(el\.type !== 'text'\) setSelectedId\(el\.id\); \}\}"

new_wrapper = """<div
            id={`draggable-wrapper-${el.id}`}
            onClick={(e) => { e.stopPropagation(); if (el.type !== 'text') setSelectedId(el.id); }}
            onFocus={(e) => {
                if (el.type === 'text') setSelectedId(el.id);
            }}
            onBlur={(e) => {
                if (el.type === 'text') {
                    const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: (e.target as HTMLElement).innerHTML } : e_inner);
                    setElements(newElements);
                }
            }}"""
content = re.sub(wrapper_pattern, new_wrapper, content)

# Now replace the inner text block with <MemoizedEditor />
text_block_pattern = r"\{el\.type === 'text' \? \([\s\S]*?\) : \("
new_text_block = """{el.type === 'text' ? (
                <MemoizedEditor el={el} printing={printing} />
            ) : ("""
content = re.sub(text_block_pattern, new_text_block, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Implemented MemoizedEditor for bulletproof contentEditable.")
