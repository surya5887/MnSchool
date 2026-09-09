import re

file_path = 'src/components/DocumentBuilder.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace DraggableElement completely
old_draggable = r"const DraggableElement: React\.FC<\{[\s\S]*?\}\) => \{\n    const controls = useDragControls\(\);\n    const initialContent = useRef\(el\.content \|\| 'Click to edit text'\);[\s\S]*?    \);\n\};\n\nconst DocumentBuilder: React\.FC = \(\) => \{"

new_draggable = """const DraggableElement: React.FC<{
    el: DocElement,
    printing: boolean,
    selectedId: string | null,
    setSelectedId: (id: string | null) => void,
    elements: DocElement[],
    setElements: (els: DocElement[]) => void
}> = ({ el, printing, selectedId, setSelectedId, elements, setElements }) => {
    const initialContent = useRef(el.content || 'Click to edit text');
    
    // Custom drag logic
    const isDragging = useRef(false);
    const startPos = useRef({x: 0, y: 0});
    const currentPos = useRef({x: el.x, y: el.y});

    const handlePointerDown = (e: React.PointerEvent) => {
        if (printing) return;
        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        currentPos.current = { x: currentPos.current.x + dx, y: currentPos.current.y + dy };
        startPos.current = { x: e.clientX, y: e.clientY };
        
        const node = document.getElementById(`draggable-wrapper-${el.id}`);
        if (node) {
            node.style.left = `${currentPos.current.x}px`;
            node.style.top = `${currentPos.current.y}px`;
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
        
        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, x: currentPos.current.x, y: currentPos.current.y } : e_inner);
        setElements(newElements);
    };

    return (
        <div
            id={`draggable-wrapper-${el.id}`}
            onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
            style={{
                position: 'absolute',
                top: el.y,
                left: el.x,
                border: (!printing && selectedId === el.id) ? '2px dashed #3b82f6' : '2px solid transparent',
                padding: el.type === 'image' ? '0' : '4px',
                minWidth: '50px',
                minHeight: '20px',
                zIndex: selectedId === el.id ? 10 : 1,
                resize: printing ? 'none' : 'both',
                overflow: el.type === 'image' ? 'hidden' : 'visible',
                width: el.width || 'auto',
                height: el.height || 'auto'
            }}
            onMouseUp={(e) => {
                if (selectedId === el.id && !printing && !isDragging.current) {
                    const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, width: e.currentTarget.style.width, height: e.currentTarget.style.height } : e_inner);
                    setElements(newElements);
                }
            }}
        >
            {/* Drag Handle */}
            {!printing && selectedId === el.id && (
                <div 
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{ position: 'absolute', top: '-24px', left: '-2px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'grab', fontSize: '12px', userSelect: 'none', zIndex: 20, touchAction: 'none' }}
                >
                    <Move size={14} /> Drag
                </div>
            )}

            {el.type === 'text' ? (
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
                    dangerouslySetInnerHTML={{ __html: initialContent.current }}
                    onBlur={(e) => {
                        const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                        setElements(newElements);
                    }}
                />
            ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: el.shape === 'circle' ? '50%' : '0', overflow: 'hidden' }}>
                    <img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                </div>
            )}
            
            {/* Custom visual indicator for resize corner */}
            {!printing && selectedId === el.id && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#3b82f6', pointerEvents: 'none', clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
            )}
        </div>
    );
};

const DocumentBuilder: React.FC = () => {"""

content = re.sub(old_draggable, new_draggable, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced framer-motion with native drag.")
