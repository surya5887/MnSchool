import React, { useRef } from 'react';
import type { MCQBlock } from '../../services/examService';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

interface Props {
  block: MCQBlock;
  onChange: (block: MCQBlock) => void;
}

const MCQBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeOptIndex, setActiveOptIndex] = React.useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeOptIndex === null) return;

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

        const newOpts = [...block.options];
        newOpts[activeOptIndex].imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        onChange({ ...block, options: newOpts });
        setActiveOptIndex(null);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <RichTextEditor 
        value={block.question} 
        onChange={(val) => onChange({ ...block, question: val })}
        placeholder="Enter MCQ question here..."
      />
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <strong>Tip:</strong> Use <code>{'{{ }}'}</code> for a blank line (e.g. <code>The cat is {'{{ }}'}</code>). Use <code>{'{{A/B/C}}'}</code> for inline options.
      </div>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Layout:</label>
        <select 
          className="glass-input" 
          style={{ width: '150px' }}
          value={block.layout} 
          onChange={(e) => onChange({ ...block, layout: e.target.value as any })}
        >
          <option value="1-col">1 Column (Vertical List)</option>
          <option value="2-col">2 Columns (Grid)</option>
          <option value="4-col">4 Columns (Single Line)</option>
          <option value="inline">Inline Boxes [ ]</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <input 
            type="checkbox" 
            checked={block.showBracket || false}
            onChange={(e) => onChange({ ...block, showBracket: e.target.checked })}
          />
          Show Right Answer Bracket [   ]
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: block.layout === '1-col' ? '1fr' : '1fr 1fr', gap: '12px' }}>
        {block.options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{String.fromCharCode(65 + i)}.</span>
              <input 
                type="text" 
                className="glass-input" 
                style={{ flex: 1 }}
                value={opt.text}
                onChange={(e) => {
                  const newOpts = [...block.options];
                  newOpts[i].text = e.target.value;
                  onChange({ ...block, options: newOpts });
                }}
                placeholder={Option }
              />
              <button 
                className="btn-secondary" 
                style={{ padding: '8px' }}
                onClick={() => {
                  setActiveOptIndex(i);
                  fileInputRef.current?.click();
                }}
                title="Add Image to Option"
              >
                <ImageIcon size={16} />
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '8px', color: 'var(--danger)' }}
                onClick={() => {
                  const newOpts = [...block.options];
                  newOpts.splice(i, 1);
                  onChange({ ...block, options: newOpts });
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {opt.imageUrl && (
              <div style={{ position: 'relative', alignSelf: 'flex-start', marginLeft: '24px' }}>
                <img src={opt.imageUrl} alt="" style={{ height: '60px', objectFit: 'contain', border: '1px solid var(--glass-border)', borderRadius: '4px' }} />
                <button 
                  className="btn-secondary" 
                  style={{ position: 'absolute', top: -8, right: -8, padding: '4px', borderRadius: '50%', color: 'var(--danger)' }}
                  onClick={() => {
                    const newOpts = [...block.options];
                    newOpts[i].imageUrl = undefined;
                    onChange({ ...block, options: newOpts });
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button 
        className="btn-secondary" 
        style={{ alignSelf: 'flex-start' }}
        onClick={() => onChange({ ...block, options: [...block.options, { text: '' }] })}
      >
        <Plus size={16} /> Add Option
      </button>

      <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageUpload} />
    </div>
  );
};

export default MCQBlockEditor;
