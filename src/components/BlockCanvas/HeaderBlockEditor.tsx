import React, { useRef } from 'react';
import type { HeaderBlock } from '../../services/examService';
import { Upload, Trash2, Plus } from 'lucide-react';

interface Props {
  block: HeaderBlock;
  onChange: (block: HeaderBlock) => void;
}

const HeaderBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const leftLogoRef = useRef<HTMLInputElement>(null);
  const rightLogoRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
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
        
        if (side === 'left') onChange({ ...block, leftLogo: compressedUrl });
        else onChange({ ...block, rightLogo: compressedUrl });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateField = (idx: number, updates: any) => {
    const newFields = [...(block.fields || [])];
    newFields[idx] = { ...newFields[idx], ...updates };
    onChange({ ...block, fields: newFields });
  };

  const removeField = (idx: number) => {
    const newFields = [...(block.fields || [])];
    newFields.splice(idx, 1);
    onChange({ ...block, fields: newFields });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Logos & Titles */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        
        {/* Left Logo */}
        <div style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {block.leftLogo ? (
            <div style={{ position: 'relative' }}>
              <img src={block.leftLogo} alt="Left Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'white' }} />
              <button className="btn-secondary" style={{ position: 'absolute', top: -10, right: -10, padding: '4px', borderRadius: '50%', color: 'var(--danger)' }} onClick={() => onChange({ ...block, leftLogo: undefined })}><Trash2 size={14} /></button>
            </div>
          ) : (
            <button className="btn-secondary" style={{ width: '100px', height: '100px', flexDirection: 'column', fontSize: '0.7rem' }} onClick={() => leftLogoRef.current?.click()}>
              <Upload size={16} style={{ marginBottom: '4px' }} /> Left Logo
            </button>
          )}
          <input type="file" accept="image/*" style={{ display: 'none' }} ref={leftLogoRef} onChange={(e) => handleLogoUpload(e, 'left')} />
        </div>

        {/* Titles */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Main Title (School Name):</label>
            <input type="text" className="glass-input" style={{ width: '100%', fontWeight: 'bold', fontSize: '1.1rem' }} value={block.title || ''} onChange={e => onChange({ ...block, title: e.target.value })} placeholder="e.g. MN PUBLIC SCHOOL" />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Subtitle (Exam Name/Year):</label>
            <input type="text" className="glass-input" style={{ width: '100%' }} value={block.subtitle || ''} onChange={e => onChange({ ...block, subtitle: e.target.value })} placeholder="e.g. Half Yearly Examination 2026-27" />
          </div>
        </div>

        {/* Right Logo */}
        <div style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {block.rightLogo ? (
            <div style={{ position: 'relative' }}>
              <img src={block.rightLogo} alt="Right Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'white' }} />
              <button className="btn-secondary" style={{ position: 'absolute', top: -10, right: -10, padding: '4px', borderRadius: '50%', color: 'var(--danger)' }} onClick={() => onChange({ ...block, rightLogo: undefined })}><Trash2 size={14} /></button>
            </div>
          ) : (
            <button className="btn-secondary" style={{ width: '100px', height: '100px', flexDirection: 'column', fontSize: '0.7rem' }} onClick={() => rightLogoRef.current?.click()}>
              <Upload size={16} style={{ marginBottom: '4px' }} /> Right Logo
            </button>
          )}
          <input type="file" accept="image/*" style={{ display: 'none' }} ref={rightLogoRef} onChange={(e) => handleLogoUpload(e, 'right')} />
        </div>

      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

      {/* Info Fields */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Info Fields (e.g. Name, Roll No):</label>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => onChange({ ...block, fields: [...(block.fields || []), { label: 'New Field', value: '' }] })}>
            <Plus size={14} /> Add Field
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {(block.fields || []).map((f, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" className="glass-input" style={{ width: '120px', fontWeight: 'bold' }} value={f.label} onChange={e => updateField(idx, { label: e.target.value })} placeholder="Label" />
              <span>:</span>
              <input type="text" className="glass-input" style={{ flex: 1 }} value={f.value} onChange={e => updateField(idx, { value: e.target.value })} placeholder="Value (leave empty for blank line)" />
              <button className="btn-secondary" style={{ color: 'var(--danger)', padding: '8px' }} onClick={() => removeField(idx)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HeaderBlockEditor;
