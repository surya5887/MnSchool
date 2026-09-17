import React from 'react';
import type { SplitColumnBlock } from '../../services/examService';
import BlockCanvas from './BlockCanvas';

interface Props {
  block: SplitColumnBlock;
  onChange: (block: SplitColumnBlock) => void;
}

const SplitColumnBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: '24px', borderTop: '1px dashed var(--glass-border)', paddingTop: '16px' }}>
      
      <div style={{ flex: 1, borderRight: '1px dashed var(--glass-border)', paddingRight: '24px' }}>
        <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-muted)' }}>Left Column</h4>
        <BlockCanvas 
          blocks={block.leftBlocks || []} 
          onChange={(newBlocks) => onChange({ ...block, leftBlocks: newBlocks })} 
        />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-muted)' }}>Right Column</h4>
        <BlockCanvas 
          blocks={block.rightBlocks || []} 
          onChange={(newBlocks) => onChange({ ...block, rightBlocks: newBlocks })} 
        />
      </div>

    </div>
  );
};

export default SplitColumnBlockEditor;
