import React, { useState } from 'react';
import type { KidsActivityBlock, KidsActivityItem, KidsCategory, KidsLayoutType } from '../../services/examService';
import { Plus, Trash, X, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface Props {
  block: KidsActivityBlock;
  onSave: (block: KidsActivityBlock) => void;
  onClose: () => void;
}

const TEMPLATES: Record<KidsCategory, { name: string, layout: KidsLayoutType }[]> = {
  TRACING: [
    { name: 'Line Tracing', layout: 'tracing' },
    { name: 'Shape Outline', layout: 'tracing' },
    { name: 'Alphabet Tracing', layout: 'tracing' }
  ],
  VISUAL_DISCRIMINATION: [
    { name: 'Odd One Out', layout: 'grid' },
    { name: 'Find and Circle', layout: 'grid' },
    { name: 'Shadow Matching', layout: 'match_columns' }
  ],
  PHONICS: [
    { name: 'Capital to Small Match', layout: 'match_columns' },
    { name: 'Beginning Sound', layout: 'grid' },
    { name: 'Missing Vowel (CVC)', layout: 'sequence' }
  ],
  NUMERACY: [
    { name: 'Count and Write', layout: 'grid' },
    { name: 'Visual Addition', layout: 'sequence' },
    { name: 'More vs Less', layout: 'grid' }
  ],
  PATTERNS: [
    { name: 'What Comes Next', layout: 'sequence' },
    { name: 'Sorting by Color', layout: 'grid' }
  ],
  EVS: [
    { name: 'Animal & Baby Match', layout: 'match_columns' },
    { name: 'Body Parts', layout: 'match_columns' }
  ]
};

const KidsActivityEditor: React.FC<Props> = ({ block, onSave, onClose }) => {
  const [data, setData] = useState<KidsActivityBlock>(block);

  const handleImageUpload = async (file: File, itemId: string) => {
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 800 });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setData(prev => ({
          ...prev,
          items: prev.items.map(it => it.id === itemId ? { ...it, imageUrl: base64 } : it)
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

  const updateItem = (id: string, updates: Partial<KidsActivityItem>) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === id ? { ...it, ...updates } : it)
    }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id)
    }));
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '900px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Edit Activity</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="input-label">Category</label>
              <select className="glass-input" value={data.category} onChange={e => {
                const cat = e.target.value as KidsCategory;
                setData({...data, category: cat, subType: TEMPLATES[cat][0].name, layoutType: TEMPLATES[cat][0].layout});
              }}>
                {Object.keys(TEMPLATES).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Sub-Type</label>
              <select className="glass-input" value={data.subType} onChange={e => {
                const subType = e.target.value;
                const layout = TEMPLATES[data.category].find(t => t.name === subType)?.layout || 'grid';
                setData({...data, subType, layoutType: layout});
              }}>
                {TEMPLATES[data.category].map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Instruction Text</label>
            <input className="glass-input" value={data.instruction} onChange={e => setData({...data, instruction: e.target.value})} placeholder="e.g. Circle the odd one out" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <div>
              <label className="input-label">Layout Engine</label>
              <select className="glass-input" value={data.layoutType} onChange={e => setData({...data, layoutType: e.target.value as KidsLayoutType})}>
                <option value="grid">Grid (Odd One Out, Counting)</option>
                <option value="match_columns">Match Columns (Draw lines)</option>
                <option value="tracing">Tracing (Letters/Paths)</option>
                <option value="sequence">Sequence (Patterns, Blanks)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Marks</label>
              <input type="number" className="glass-input" value={data.marks || ''} onChange={e => setData({...data, marks: parseInt(e.target.value) || undefined})} />
            </div>
            {data.layoutType === 'grid' && (
              <div>
                <label className="input-label">Grid Columns</label>
                <select className="glass-input" value={data.config.columns || 4} onChange={e => setData({...data, config: {...data.config, columns: parseInt(e.target.value)}})}>
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Items</h3>
              <button className="btn-secondary" onClick={addItem}><Plus size={16} /> Add Item</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.items.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f3f4f6', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'white', border: '1px dashed #d1d5db', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>No Image</span>
                    )}
                    <input type="file" accept="image/*" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} onChange={e => e.target.files && handleImageUpload(e.target.files[0], item.id)} />
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input className="glass-input" value={item.text || ''} onChange={e => updateItem(item.id, { text: e.target.value })} placeholder="Text (Optional)" />
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {data.layoutType === 'grid' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                          <input type="checkbox" checked={item.isTarget || false} onChange={e => updateItem(item.id, { isTarget: e.target.checked })} />
                          Is Target Answer
                        </label>
                      )}
                      {data.layoutType === 'match_columns' && (
                        <input className="glass-input" style={{ padding: '4px 8px' }} value={item.matchId || ''} onChange={e => updateItem(item.id, { matchId: e.target.value })} placeholder="Match ID (e.g. A)" />
                      )}
                    </div>
                  </div>
                  
                  <button className="icon-btn" style={{ color: 'red' }} onClick={() => removeItem(item.id)}><Trash size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(data)}>Save Activity</button>
        </div>
      </div>
    </div>
  );
};

export default KidsActivityEditor;
