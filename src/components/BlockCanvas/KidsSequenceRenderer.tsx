import React from 'react';
import type { KidsActivityBlock } from '../../services/examService';

const KidsSequenceRenderer: React.FC<{ block: KidsActivityBlock }> = ({ block }) => {
  return (
    <div style={{ width: '100%', marginBottom: '24px', pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'Comic Sans MS, sans-serif' }}>{block.instruction}</h3>
        {block.marks !== undefined && <span style={{ fontWeight: 'bold' }}>[{block.marks}]</span>}
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {block.items.map((item, idx) => (
          <React.Fragment key={item.id}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain' }} />
            ) : item.text ? (
              <div style={{ fontSize: '28px', fontFamily: 'Comic Sans MS, sans-serif', fontWeight: 'bold' }}>{item.text}</div>
            ) : (
              <div style={{ width: '80px', borderBottom: '2px solid #000' }} />
            )}
            
            {idx < block.items.length - 1 && (
              <div style={{ fontSize: '24px', color: '#9ca3af' }}>{block.subType.includes('Addition') ? '+' : block.subType.includes('Subtraction') ? '-' : '→'}</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default KidsSequenceRenderer;
