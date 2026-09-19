import React from 'react';
import type { KidsActivityBlock } from '../../services/examService';

const KidsMatchRenderer: React.FC<{ block: KidsActivityBlock }> = ({ block }) => {
  const half = Math.ceil(block.items.length / 2);
  const leftItems = block.items.slice(0, half);
  const rightItems = block.items.slice(half);

  return (
    <div style={{ width: '100%', marginBottom: '24px', pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'Comic Sans MS, sans-serif' }}>{block.instruction}</h3>
        {block.marks !== undefined && <span style={{ fontWeight: 'bold' }}>[{block.marks}]</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {leftItems.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                {item.imageUrl && <img src={item.imageUrl} alt="" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />}
                {item.text && <div style={{ fontSize: '20px', fontFamily: 'Comic Sans MS, sans-serif', fontWeight: 'bold' }}>{item.text}</div>}
              </div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#000' }} />
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {rightItems.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#000' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                {item.imageUrl && <img src={item.imageUrl} alt="" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />}
                {item.text && <div style={{ fontSize: '20px', fontFamily: 'Comic Sans MS, sans-serif', fontWeight: 'bold' }}>{item.text}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KidsMatchRenderer;
