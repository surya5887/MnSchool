import React, { useState } from 'react';
import type { PaperBlock, KidsActivityBlock } from '../../services/examService';
import { Plus, Trash, Edit, MoveUp, MoveDown, Grid, LayoutTemplate } from 'lucide-react';
import KidsActivityEditor from './KidsActivityEditor';
import { KIDS_TEMPLATES } from '../../services/KidsTemplates';

interface Props {
  blocks: PaperBlock[];
  onChange: (blocks: PaperBlock[]) => void;
}

const KidsBlockCanvas: React.FC<Props> = ({ blocks, onChange }) => {
  const [editingBlock, setEditingBlock] = useState<KidsActivityBlock | null>(null);
  const [showAppStore, setShowAppStore] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  
  const kidsBlocks = blocks.filter(b => b.type === 'kids_activity') as KidsActivityBlock[];

  const handleCreateNew = (templateId: string) => {
    const template = KIDS_TEMPLATES.find(t => t.id === templateId)!;
    const newBlock: KidsActivityBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'kids_activity',
      category: 'VISUAL_DISCRIMINATION', // fallback, not really used in rendering anymore
      subType: template.title,
      instruction: template.description,
      layoutType: template.layoutEngine as any,
      items: [],
      config: { columns: 4 }
    };
    setEditingBlock(newBlock);
    setShowAppStore(false);
  };

  const handleSave = (block: KidsActivityBlock) => {
    const exists = blocks.find(b => b.id === block.id);
    if (exists) {
      onChange(blocks.map(b => b.id === block.id ? block : b));
    } else {
      onChange([...blocks, block]);
    }
    setEditingBlock(null);
  };

  const categories = ['All', ...Array.from(new Set(KIDS_TEMPLATES.map(t => t.category)))];

  return (
    <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#111827' }}>Kids Worksheet Builder</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Select from 52+ specialized tools to build your worksheet.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAppStore(true)}>
          <Plus size={16} /> App Store (Add Activity)
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {kidsBlocks.map((block, i) => (
          <div key={block.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {block.subType}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{block.instruction}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                {block.items.length} items • Layout: {block.layoutType} {block.marks ? `• ${block.marks} Marks` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setEditingBlock(block)}><Edit size={16} /> Edit</button>
              <button className="btn-danger" onClick={() => onChange(blocks.filter(b => b.id !== block.id))}><Trash size={16} /></button>
            </div>
          </div>
        ))}
        {kidsBlocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', border: '2px dashed #d1d5db', borderRadius: '8px' }}>
            No activities added yet. Click "App Store" to select a tool.
          </div>
        )}
      </div>

      {showAppStore && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '90vw', maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><LayoutTemplate size={28} /> Activity App Store</h2>
              <button className="btn-secondary" onClick={() => setShowAppStore(false)}>Close</button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', padding: '0 24px', overflowX: 'auto' }}>
              {categories.map(c => (
                <button 
                  key={c}
                  style={{ 
                    padding: '16px 20px', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: activeCategoryFilter === c ? '3px solid var(--primary-color)' : '3px solid transparent',
                    color: activeCategoryFilter === c ? 'var(--primary-color)' : '#6b7280',
                    fontWeight: activeCategoryFilter === c ? 'bold' : 'normal',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => setActiveCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {KIDS_TEMPLATES.filter(t => activeCategoryFilter === 'All' || t.category === activeCategoryFilter).map(template => (
                  <div 
                    key={template.id} 
                    style={{ 
                      background: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px', 
                      padding: '24px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => handleCreateNew(template.id)}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>{template.icon}</div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{template.title}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>{template.description}</p>
                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                      <span style={{ fontSize: '12px', background: '#f3f4f6', color: '#4b5563', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {template.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBlock && (
        <KidsActivityEditor 
          block={editingBlock} 
          onSave={handleSave} 
          onClose={() => setEditingBlock(null)} 
        />
      )}
    </div>
  );
};

export default KidsBlockCanvas;