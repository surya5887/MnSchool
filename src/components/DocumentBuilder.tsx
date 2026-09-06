import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useDragControls } from 'framer-motion';
import { Image, Type, Printer, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, Upload, Palette, Save, Circle, Square, Move } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface DocElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  content?: string;
  src?: string;
  width?: number | string;
  height?: number | string;
  shape?: 'square' | 'circle';
}

const FONTS = [
  "Arial", "Times New Roman", "Courier New", "Georgia", 
  "Verdana", "Tahoma", "Trebuchet MS", "Impact", 
  "Comic Sans MS", "Arial Black", "Palatino Linotype", "Lucida Sans Unicode"
];

const DraggableElement: React.FC<{
    el: DocElement,
    printing: boolean,
    selectedId: string | null,
    setSelectedId: (id: string | null) => void,
    elements: DocElement[],
    setElements: (els: DocElement[]) => void
}> = ({ el, printing, selectedId, setSelectedId, elements, setElements }) => {
    const controls = useDragControls();
    
    return (
        <motion.div
            key={el.id}
            drag={!printing}
            dragMomentum={false}
            dragListener={false}
            dragControls={controls}
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
                overflow: 'hidden',
                width: el.width || 'auto',
                height: el.height || 'auto'
            }}
            onMouseUp={(e) => {
                if (selectedId === el.id && !printing) {
                    const newElements = elements.map(e_inner => e_inner.id === el.id ? { ...e_inner, width: e.currentTarget.style.width, height: e.currentTarget.style.height } : e_inner);
                    setElements(newElements);
                }
            }}
        >
            {/* Drag Handle */}
            {!printing && selectedId === el.id && (
                <div 
                    onPointerDown={(e) => controls.start(e)}
                    style={{ position: 'absolute', top: '-24px', left: '-2px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'grab', fontSize: '12px', userSelect: 'none', zIndex: 20 }}
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
            ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: el.shape === 'circle' ? '50%' : '0', overflow: 'hidden' }}>
                    <img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                </div>
            )}
            
            {/* Custom visual indicator for resize corner */}
            {!printing && selectedId === el.id && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#3b82f6', pointerEvents: 'none', clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
            )}
        </motion.div>
    );
};

const DocumentBuilder: React.FC = () => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [elements, setElements] = useState<DocElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(1, (containerWidth - 40) / 794);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const docRef = doc(db, 'schoolSettings', 'documentBuilderTemplate');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().bgImage) {
          setBgImage(snap.data().bgImage);
        }
      } catch(e) {
        console.error("Error loading template", e);
      }
    };
    loadTemplate();
  }, []);

  const compressAndSaveBg = (dataUrl: string) => {
    const img = new window.Image();
    img.src = dataUrl;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > 1200) {
        h = (1200 / w) * h;
        w = 1200;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setBgImage(compressed);
        try {
          await setDoc(doc(db, 'schoolSettings', 'documentBuilderTemplate'), { bgImage: compressed });
          toast.success("Template saved to server!");
        } catch(e) {
          console.error(e);
          toast.error("Failed to save template to server.");
        }
      }
    };
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) compressAndSaveBg(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteTemplate = async () => {
    setBgImage(null);
    try {
      await setDoc(doc(db, 'schoolSettings', 'documentBuilderTemplate'), { bgImage: null });
      toast.success("Template deleted!");
    } catch(e) {
        console.error(e);
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
          width: 150, height: 150,
          shape: 'square'
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
      content: 'Click to edit text'
    }]);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (selectedId) {
       const el = document.getElementById(`editor-${selectedId}`);
       if (el) el.focus();
    }
  };

  const handlePrint = () => {
    setSelectedId(null);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const toggleShape = (id: string) => {
    setElements(elements.map(el => el.id === id ? { ...el, shape: el.shape === 'circle' ? 'square' : 'circle' } : el));
  };

  const renderCanvasContent = (printing: boolean) => (
    <div 
        ref={canvasRef}
        className={printing ? "builder-canvas print-portal" : "builder-canvas"}
        onClick={() => setSelectedId(null)}
        style={{ 
            width: '794px', 
            height: '1123px', 
            background: bgImage ? (printing ? 'transparent' : `url(${bgImage}) center/cover no-repeat`) : 'white',
            position: printing ? 'absolute' : 'relative',
            left: 0,
            top: 0,
            transform: printing ? 'scale(1)' : `scale(${scale})`,
            transformOrigin: 'top left',
            boxShadow: printing ? 'none' : '0 10px 25px rgba(0,0,0,0.1)',
            backgroundColor: printing ? 'transparent' : 'white',
            zIndex: printing ? 999999 : 1
        }}>
        
        {!printing && !bgImage && elements.length === 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8', textAlign: 'center' }}>
                <Upload size={48} style={{ opacity: 0.5, margin: '0 auto 16px auto' }} />
                <p>Upload a background template<br/>or add text boxes to start.</p>
            </div>
        )}

        {elements.map((el) => (
            <DraggableElement 
                key={el.id} 
                el={el} 
                printing={printing} 
                selectedId={selectedId} 
                setSelectedId={setSelectedId} 
                elements={elements} 
                setElements={setElements} 
            />
        ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="glass-panel no-print" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 100, position: 'relative' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {bgImage ? (
             <button className="btn-secondary" onClick={deleteTemplate} style={{ color: '#ef4444' }}><Trash2 size={18} /> Remove Template</button>
          ) : (
            <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> Upload Template
              <input type="file" hidden accept="image/*" onChange={handleBgUpload} />
            </label>
          )}
          
          <button className="btn-primary" onClick={addText}><Type size={18} /> Add Text Box</button>
          
          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image size={18} /> Add Image
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', opacity: selectedId ? 1 : 0.3, pointerEvents: selectedId ? 'auto' : 'none', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            
            <select onChange={(e) => execCmd('fontName', e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <option value="">Font Style</option>
                {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            
            <select onChange={(e) => execCmd('fontSize', e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <option value="">Size</option>
                {[1,2,3,4,5,6,7].map(s => <option key={s} value={s.toString()}>Size {s}</option>)}
            </select>

            <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }}></div>
            
            <button onClick={() => execCmd('bold')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Bold"><Bold size={18} /></button>
            <button onClick={() => execCmd('italic')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Italic"><Italic size={18} /></button>
            <button onClick={() => execCmd('underline')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Underline"><Underline size={18} /></button>
            
            <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }}></div>
            
            <button onClick={() => execCmd('justifyLeft')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Align Left"><AlignLeft size={18} /></button>
            <button onClick={() => execCmd('justifyCenter')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Align Center"><AlignCenter size={18} /></button>
            <button onClick={() => execCmd('justifyRight')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Align Right"><AlignRight size={18} /></button>
            
            <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Text Color">
                <Palette size={18} />
                <input type="color" onChange={(e) => execCmd('foreColor', e.target.value)} style={{ border: 'none', padding: 0, width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }} />
            </div>

            {selectedId && elements.find(e => e.id === selectedId)?.type === 'image' && (
               <button onClick={() => toggleShape(selectedId)} style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }} title="Toggle Circle/Square">
                  {elements.find(e => e.id === selectedId)?.shape === 'circle' ? <Square size={16} /> : <Circle size={16} />} Shape
               </button>
            )}

            {selectedId && (
                <button onClick={() => removeElement(selectedId)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', marginLeft: '12px' }} title="Delete Element"><Trash2 size={18} /></button>
            )}
        </div>

        <button className="btn-primary" onClick={handlePrint} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Printer size={18} /> Print Form</button>
      </div>

      <div ref={containerRef} className="builder-container no-print" style={{ width: '100%', overflow: 'hidden', display: 'flex', background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {renderCanvasContent(false)}
          </div>
      </div>

      {isPrinting && createPortal(renderCanvasContent(true), document.body)}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
            body > :not(.print-portal) { display: none !important; }
            body { margin: 0; padding: 0; background: white; }
            @page { size: A4 portrait; margin: 0; }
        }
      `}} />
    </div>
  );
};

export default DocumentBuilder;
