import React, { useState } from 'react';
import type { PaperBlock, KidsActivityBlock, KidsCategory, KidsLayoutType } from '../../services/examService';
import { Plus, Trash, Edit, MoveUp, MoveDown } from 'lucide-react';
import KidsActivityEditor from './KidsActivityEditor';

interface Props {
  blocks: PaperBlock[];
  onChange: (blocks: PaperBlock[]) => void;
}

const KidsBlockCanvas: React.FC<Props> = ({ blocks, onChange }) => {
  const [editingBlock, setEditingBlock] = useState<KidsActivityBlock | null>(null);
  
  const kidsBlocks = blocks.filter(b => b.type === 'kids_activity') as KidsActivityBlock[];

  const handleAdd = () => {
    const newBlock: KidsActivityBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'kids_activity',
      category: 'VISUAL_DISCRIMINATION',
      subType: 'Odd One Out',
      instruction: 'Circle the odd one out',
      layoutType: 'grid',
      items: [],
      config: { columns: 4 }
    };
    setEditingBlock(newBlock);
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

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === kidsBlocks.length - 1) return;
    
    const newBlocks = [...kidsBlocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    
    // Merge back into original blocks
    const finalBlocks = blocks.filter(b => b.type !== 'kids_activity').concat(newBlocks);
    onChange(finalBlocks);
  };

  return (
    <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#111827' }}>Kids Worksheet Builder</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Build visual, tracing, and cognitive tasks for Nursery - 5th.</p>
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Add Activity
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {kidsBlocks.map((block, i) => (
          <div key={block.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button className="icon-btn" onClick={() => moveBlock(i, 'up')} disabled={i === 0}><MoveUp size={16} /></button>
              <button className="icon-btn" onClick={() => moveBlock(i, 'down')} disabled={i === kidsBlocks.length - 1}><MoveDown size={16} /></button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {block.category} • {block.subType}
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
            No activities added yet. Click "Add Activity" to create one.
          </div>
        )}
      </div>

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
