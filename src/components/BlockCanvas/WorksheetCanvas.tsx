import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Type, Image as ImageIcon, Square, Minus, Trash2, Edit2, Check } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  imageUrl?: string;
  border?: boolean;
}

interface Props {
  elements: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
}

const WorksheetCanvas: React.FC<Props> = ({ elements, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addElement = (type: CanvasElement['type']) => {
    const newEl: CanvasElement = {
      id: Math.random().toString(36).substring(7),
      type,
      x: 50,
      y: 50,
      width: type === 'line' ? 200 : 200,
      height: type === 'line' ? 5 : (type === 'image' ? 200 : 100),
      content: type === 'text' ? '<p>Click to edit text</p>' : '',
      border: type === 'shape'
    };
    onChange([...elements, newEl]);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    onChange(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const removeElement = (id: string) => {
    onChange(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editingId === id) setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const newEl: CanvasElement = {
          id: Math.random().toString(36).substring(7),
          type: 'image',
          x: 50,
          y: 50,
          width: 250,
          height: (250 * height) / width,
          imageUrl: canvas.toDataURL('image/jpeg', 0.8)
        };
        onChange([...elements, newEl]);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', background: 'white', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'sticky', top: '16px', zIndex: 100 }}>
        <button className="btn-secondary" onClick={() => addElement('text')}><Type size={18} style={{ marginRight: '8px' }} /> Text Box</button>
        <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}><ImageIcon size={18} style={{ marginRight: '8px' }} /> Image</button>
        <button className="btn-secondary" onClick={() => addElement('shape')}><Square size={18} style={{ marginRight: '8px' }} /> Box/Border</button>
        <button className="btn-secondary" onClick={() => addElement('line')}><Minus size={18} style={{ marginRight: '8px' }} /> Line</button>
        <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageUpload} />
      </div>

      {/* Canvas Area */}
      <div 
        style={{ 
          width: '800px', 
          height: '1130px', 
          background: 'white', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => { setSelectedId(null); setEditingId(null); }}
      >
        {elements.map(el => (
          <Rnd
            key={el.id}
            size={{ width: el.width, height: el.height }}
            position={{ x: el.x, y: el.y }}
            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              updateElement(el.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...position,
              });
            }}
            onClick={(e: any) => { e.stopPropagation(); setSelectedId(el.id); }}
            bounds="parent"
            style={{
              border: selectedId === el.id ? '2px dashed #3b82f6' : 'none',
              zIndex: selectedId === el.id ? 50 : 10,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Control Buttons when selected */}
            {selectedId === el.id && (
              <div style={{ position: 'absolute', top: -35, right: 0, display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 60 }}>
                {el.type === 'text' && (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }} onClick={() => setEditingId(editingId === el.id ? null : el.id)}>
                    {editingId === el.id ? <Check size={16} /> : <Edit2 size={16} />}
                  </button>
                )}
                {el.type === 'shape' && (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', fontSize: '12px', fontWeight: 'bold' }} onClick={() => updateElement(el.id, { border: !el.border })}>
                    Toggle Border
                  </button>
                )}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => removeElement(el.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* Element Content */}
            <div style={{ 
              width: '100%', 
              height: '100%', 
              border: el.type === 'shape' && el.border ? '2px solid #000' : 'none',
              background: el.type === 'shape' && !el.border ? '#e5e7eb' : (el.type === 'line' ? '#000' : 'transparent'),
              display: 'flex',
              overflow: 'hidden'
            }}>
              {el.type === 'text' && (
                <div style={{ width: '100%', height: '100%', padding: '4px' }}>
                  {editingId === el.id ? (
                    <div style={{ width: '100%', height: '100%', overflowY: 'auto' }} onMouseDown={e => e.stopPropagation()}>
                      <RichTextEditor value={el.content || ''} onChange={(v) => updateElement(el.id, { content: v })} />
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: el.content || '' }} style={{ width: '100%', height: '100%' }} />
                  )}
                </div>
              )}
              {el.type === 'image' && el.imageUrl && (
                <img src={el.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
              )}
            </div>
          </Rnd>
        ))}
      </div>

    </div>
  );
};

export default WorksheetCanvas;
