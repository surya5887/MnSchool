import React, { useRef } from 'react';
import type { ImageGroupBlock } from '../../services/examService';
import { Upload, Trash2, AlignLeft, AlignCenter, AlignRight, CheckSquare } from 'lucide-react';

interface Props {
  block: ImageGroupBlock;
  onChange: (block: ImageGroupBlock) => void;
}

const ImageGroupBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
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

        const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);
        onChange({ 
          ...block, 
          images: [...block.images, { url: compressedUrl, width: 30, showTickBox: false }] 
        });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateImage = (idx: number, updates: any) => {
    const newImages = [...block.images];
    newImages[idx] = { ...newImages[idx], ...updates };
    onChange({ ...block, images: newImages });
  };

  const removeImage = (idx: number) => {
    const newImages = [...block.images];
    newImages.splice(idx, 1);
    onChange({ ...block, images: newImages });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Layout:</label>
        <select 
          className="glass-input" 
          style={{ width: '150px' }}
          value={block.layout} 
          onChange={(e) => onChange({ ...block, layout: e.target.value as any })}
        >
          <option value="row">Horizontal Row</option>
          <option value="grid">Wrapping Grid</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {block.images.map((img, idx) => (
          <div key={idx} style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', background: 'white', width: '220px' }}>
            <div style={{ position: 'relative', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
               <img src={img.url} alt="" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Caption (e.g. Apple)" 
                className="glass-input" 
                value={img.caption || ''} 
                onChange={(e) => updateImage(idx, { caption: e.target.value })} 
                style={{ fontSize: '0.8rem' }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem' }}>Size %:</span>
                <input 
                  type="number" 
                  min="5" max="100" 
                  className="glass-input" 
                  value={img.width} 
                  onChange={(e) => updateImage(idx, { width: Number(e.target.value) })} 
                  style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={img.showTickBox || false} 
                  onChange={(e) => updateImage(idx, { showTickBox: e.target.checked })} 
                />
                <CheckSquare size={14} /> Show Tick Box [ ]
              </label>

              <button 
                className="btn-secondary" 
                style={{ color: 'var(--danger)', padding: '6px', marginTop: '4px', width: '100%', justifyContent: 'center' }}
                onClick={() => removeImage(idx)}
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />
      <button 
        className="btn-secondary" 
        style={{ alignSelf: 'flex-start' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={16} /> Add Image
      </button>

    </div>
  );
};

export default ImageGroupBlockEditor;
