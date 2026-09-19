import React from 'react';
import type { KidsActivityBlock } from '../../services/examService';

const KidsTracingRenderer: React.FC<{ block: KidsActivityBlock }> = ({ block }) => {
  return (
    <div style={{ width: '100%', marginBottom: '24px', pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'Comic Sans MS, sans-serif' }}>{block.instruction}</h3>
        {block.marks !== undefined && <span style={{ fontWeight: 'bold' }}>[{block.marks}]</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {block.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt="" style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain' }} />
            )}
            {item.text && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {item.text.split('').map((char, i) => (
                  <div key={i} style={{ 
                    fontSize: '48px', 
                    fontFamily: 'Comic Sans MS, sans-serif', 
                    color: '#d1d5db', 
                    borderBottom: '2px dashed #9ca3af',
                    padding: '0 8px',
                    lineHeight: '1'
                  }}>
                    {char}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KidsTracingRenderer;
