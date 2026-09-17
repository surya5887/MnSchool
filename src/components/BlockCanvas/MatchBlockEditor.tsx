import React from 'react';
import type { MatchBlock } from '../../services/examService';

interface Props {
  block: MatchBlock;
  onChange: (block: MatchBlock) => void;
}

const MatchBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  return (
    <div style={{ color: 'var(--text-muted)' }}>
      <p>Match The Following Builder is under construction.</p>
    </div>
  );
};

export default MatchBlockEditor;
