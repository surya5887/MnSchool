import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Type, Printer, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, Upload, Minus, Plus, Palette } from 'lucide-react';

interface DocElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  content?: string;
  src?: string;
  width?: number;
  height?: number;
}

const DocumentBuilder: React.FC = () => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [elements, setElements] = useState<DocElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Scale canvas to fit screen
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // A4 width is 794px
        const newScale = Math.min(1, (containerWidth - 40) / 794);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBgImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setElements([...elements, {
          id: Date.now().toString(),
          type: 'image',
          x: 100, y: 100,
          src: e.target?.result as string,
          width: 200, height: 200
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    setElements([...elements, {
      id: Date.now().toString(),
      type: 'text',
      x: 100, y: 100,
      content: 'New Text Box'
    }]);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    // Focus back on the editor
    if (selectedId) {
       const el = document.getElementById(`editor-${selectedId}`);
       if (el) el.focus();
    }
  };

  const handlePrint = () => {
    setSelectedId(null); // Deselect so borders disappear
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Helper to change font size via execCommand (uses 1-7 size mapping, which is terrible. Better to just apply style to selection via range, but execCommand is easier)
  const changeFontSize = (delta: number) => {
      // It's hard to accurately change font size of selection reliably with execCommand. 
      // An easier way is to just wrap the selection in a span with a specific size, but that requires complex range selection.
      // We will just let users use standard sizes, or apply a generic style to the whole box if they want.
      // Wait, document.execCommand('fontSize') takes 1-7.
      const sizes = ['1', '2', '3', '4', '5', '6', '7'];
      // Just a simple hack: prompt for size or just use a generic "larger/smaller"
      document.execCommand('fontSize', false, '5'); // Default large
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    document.execCommand('foreColor', false, e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toolbar */}
      <div className="glass-panel no-print" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} /> Background Template
            <input type="file" hidden accept="image/*" onChange={handleBgUpload} />
          </label>
          <button className="btn-secondary" onClick={addText}><Type size={18} /> Add Text</button>
          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image size={18} /> Add Image
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Text Formatting Toolbar (Visible when text selected) */}
        <div style={{ display: 'flex', gap: '8px', opacity: selectedId ? 1 : 0.3, pointerEvents: selectedId ? 'auto' : 'none', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button onClick={() => execCmd('bold')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Bold"><Bold size={18} /></button>
            <button onClick={() => execCmd('italic')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Italic"><Italic size={18} /></button>
            <button onClick={() => execCmd('underline')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Underline"><Underline size={18} /></button>
            <div style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }}></div>
            <button onClick={() => execCmd('justifyLeft')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Align Left"><AlignLeft size={18} /></button>
            <button onClick={() => execCmd('justifyCenter')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Align Center"><AlignCenter size={18} /></button>
            <button onClick={() => execCmd('justifyRight')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Align Right"><AlignRight size={18} /></button>
            <div style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Palette size={18} />
                <input type="color" onChange={handleColorChange} style={{ border: 'none', padding: 0, width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }} title="Text Color" />
            </div>
            {selectedId && (
                <button onClick={() => removeElement(selectedId)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', marginLeft: '12px' }} title="Delete Element"><Trash2 size={18} /></button>
            )}
        </div>

        <button className="btn-primary" onClick={handlePrint}><Printer size={18} /> Print Document</button>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="builder-container" style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', background: '#e2e8f0', padding: '20px', borderRadius: '12px' }}>
        <div 
            ref={canvasRef}
            className="builder-canvas"
            onClick={() => setSelectedId(null)}
            style={{ 
                width: '794px', // A4 pixel width at 96dpi
                height: '1123px', // A4 pixel height
                background: bgImage ? `url(${bgImage}) center/cover no-repeat` : 'white',
                position: 'relative',
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                backgroundColor: 'white'
            }}>
            
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    drag
                    dragMomentum={false}
                    onDragStart={() => setSelectedId(el.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                    style={{
                        position: 'absolute',
                        top: el.y,
                        left: el.x,
                        border: selectedId === el.id ? '2px dashed #3b82f6' : '2px solid transparent',
                        padding: '4px',
                        cursor: 'move',
                        minWidth: '50px',
                        minHeight: '20px',
                        zIndex: selectedId === el.id ? 10 : 1
                    }}
                >
                    {el.type === 'text' ? (
                        <div 
                            id={`editor-${el.id}`}
                            contentEditable
                            suppressContentEditableWarning
                            onFocus={() => setSelectedId(el.id)}
                            style={{ 
                                outline: 'none', 
                                cursor: 'text', 
                                minWidth: '100px', 
                                fontSize: '18px', 
                                fontFamily: 'Arial, sans-serif'
                            }}
                            dangerouslySetInnerHTML={{ __html: el.content || 'New Text Box' }}
                            onBlur={(e) => {
                                // Save content back to state
                                const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, content: e.currentTarget.innerHTML } : e_inner);
                                setElements(newElements);
                            }}
                        />
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
                            {/* Resizing handles could go here if we implement them */}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
            body * { visibility: hidden; }
            body, html { margin: 0 !important; padding: 0 !important; height: 100% !important; background: white !important; }
            @page { size: A4 portrait; margin: 0; }
            .no-print { display: none !important; }
            .builder-container { padding: 0 !important; background: transparent !important; }
            .builder-canvas { 
                visibility: visible !important; 
                position: fixed !important; 
                left: 0 !important; 
                top: 0 !important; 
                transform: scale(1) !important; 
                box-shadow: none !important; 
            }
            .builder-canvas * { visibility: visible; }
        }
      `}} />
    </div>
  );
};

export default DocumentBuilder;
