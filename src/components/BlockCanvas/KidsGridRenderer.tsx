import React from 'react';
import type { KidsActivityBlock } from '../../services/examService';

const KidsGridRenderer: React.FC<{ block: KidsActivityBlock }> = ({ block }) => {
  const columns = block.config.columns || 4;
  
  return (
    <div style={{ width: '100%', marginBottom: '24px', pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'Comic Sans MS, sans-serif' }}>{block.instruction}</h3>
        {block.marks !== undefined && <span style={{ fontWeight: 'bold' }}>[{block.marks}]</span>}
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${columns}, 1fr)`, 
        gap: '24px',
        alignItems: 'center',
        justifyItems: 'center'
      }}>
        {block.items.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt="" style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }} />
            )}
            {item.text && (
              <div style={{ fontSize: '24px', fontFamily: 'Comic Sans MS, sans-serif', fontWeight: 'bold' }}>
                {item.text}
              </div>
            )}
            {block.config.showCheckboxes && (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #000' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KidsGridRenderer;
