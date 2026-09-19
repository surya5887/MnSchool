import React, { useState, useEffect } from 'react';
import type { KidsActivityBlock, KidsActivityItem } from '../../services/examService';
import { KIDS_TEMPLATES } from '../../services/KidsTemplates';
import { Plus, Trash, X, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface Props {
  block: KidsActivityBlock;
  onSave: (block: KidsActivityBlock) => void;
  onClose: () => void;
}

const KidsActivityEditor: React.FC<Props> = ({ block, onSave, onClose }) => {
  const [data, setData] = useState<KidsActivityBlock>(block);
  
  const template = KIDS_TEMPLATES.find(t => t.title === data.subType) || KIDS_TEMPLATES[0];

  const handleImageUpload = async (file: File, itemId: string, isRightSide: boolean = false) => {
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 400 });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setData(prev => ({
          ...prev,
          items: prev.items.map(it => {
            if (it.id !== itemId) return it;
            if (isRightSide) return { ...it, matchId: base64 }; // Hack: using matchId to store second image for pairs temporarily
            return { ...it, imageUrl: base64 };
          })
        }));
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      alert("Error compressing image.");
    }
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(36).substr(2,9), text: '' }]
    }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id)
    }));
  };

  const updateItem = (id: string, updates: Partial<KidsActivityItem>) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === id ? { ...it, ...updates } : it)
    }));
  };

  const renderField = (field: any) => {
    if (field.type === 'text') {
      return (
        <div style={{ marginBottom: '16px' }}>
          <label className="input-label">{field.label}</label>
          <input className="glass-input" value={data.items[0]?.text || ''} onChange={e => {
            if (data.items.length === 0) addItem();
            else updateItem(data.items[0].id, { text: e.target.value });
          }} />
        </div>
      );
    }
    
    if (field.type === 'image_array') {
      return (
        <div>
          <label className="input-label" style={{ marginBottom: '12px', display: 'block' }}>{field.label}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
            {data.items.map((item, idx) => (
              <div key={item.id} style={{ position: 'relative', height: '120px', border: '2px dashed #d1d5db', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.imageUrl ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon color="#9ca3af" />}
                <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0], item.id)} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                <button style={{ position: 'absolute', top: 4, right: 4, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }} onClick={() => removeItem(item.id)}><Trash size={12} /></button>
              </div>
            ))}
            <button style={{ height: '120px', border: '2px dashed var(--primary-color)', borderRadius: '12px', background: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={addItem}>
              <Plus /> Add Image
            </button>
          </div>
        </div>
      );
    }

    if (field.type === 'image_pairs') {
      return (
        <div>
          <label className="input-label" style={{ marginBottom: '12px', display: 'block' }}>{field.label}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
                <div style={{ flex: 1, position: 'relative', height: '100px', border: '2px dashed #d1d5db', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.imageUrl ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>Left Image</span>}
                  <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0], item.id, false)} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
                <div>➡️</div>
                <div style={{ flex: 1, position: 'relative', height: '100px', border: '2px dashed #d1d5db', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.matchId ? <img src={item.matchId} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>Right Image</span>}
                  <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0], item.id, true)} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
                <button className="icon-btn" style={{ color: 'red' }} onClick={() => removeItem(item.id)}><Trash size={16} /></button>
              </div>
            ))}
            <button className="btn-secondary" style={{ width: '100%' }} onClick={addItem}><Plus size={16} /> Add Pair</button>
          </div>
        </div>
      );
    }
    
    return <div style={{ color: 'red' }}>Unsupported field type: {field.type}</div>;
  };

  const finalSave = () => {
    // If it's image_pairs, we need to convert the hacky matchId back into actual items for the match_columns renderer
    if (template.editorFields.some(f => f.type === 'image_pairs')) {
      const finalItems: KidsActivityItem[] = [];
      data.items.forEach(it => {
        finalItems.push({ id: it.id + '_L', imageUrl: it.imageUrl });
        finalItems.push({ id: it.id + '_R', imageUrl: it.matchId });
      });
      // The KidsMatchRenderer expects the first half to be left, second half to be right!
      const lefts = data.items.map(it => ({ id: it.id + '_L', imageUrl: it.imageUrl }));
      const rights = data.items.map(it => ({ id: it.id + '_R', imageUrl: it.matchId }));
      onSave({ ...data, items: [...lefts, ...rights] });
    } else {
      onSave(data);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '800px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '32px' }}>{template.icon}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>{template.title}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{template.category}</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label className="input-label">Question Text / Instruction for Kids</label>
            <input className="glass-input" value={data.instruction} onChange={e => setData({...data, instruction: e.target.value})} placeholder={template.description} style={{ fontSize: '16px', padding: '12px' }} />
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            {template.editorFields.map((field, i) => (
              <div key={i} style={{ marginBottom: '24px' }}>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f3f4f6', padding: '16px', borderRadius: '12px' }}>
             <div style={{ flex: 1 }}>
               <label className="input-label" style={{ marginBottom: 0 }}>Marks (Optional)</label>
             </div>
             <input type="number" className="glass-input" style={{ width: '100px' }} value={data.marks || ''} onChange={e => setData({...data, marks: parseInt(e.target.value) || undefined})} />
             {template.layoutEngine === 'grid' && (
               <>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Columns</label>
                </div>
                <select className="glass-input" style={{ width: '120px' }} value={data.config.columns || 4} onChange={e => setData({...data, config: {...data.config, columns: parseInt(e.target.value)}})}>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
               </>
             )}
          </div>
        </div>
        
        <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb', borderRadius: '0 0 16px 16px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '10px 24px' }}>Cancel</button>
          <button className="btn-primary" onClick={finalSave} style={{ padding: '10px 32px', fontSize: '16px' }}>Save {template.title}</button>
        </div>
      </div>
    </div>
  );
};

export default KidsActivityEditor;