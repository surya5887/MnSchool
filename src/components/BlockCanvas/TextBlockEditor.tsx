import React from 'react';
import type { TextBlock } from '../../services/examService';
import RichTextEditor from '../RichTextEditor';

interface Props {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
}

const TextBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  return (
    <div>
      <RichTextEditor 
        value={block.content} 
        onChange={(val) => onChange({ ...block, content: val })}
        placeholder="Enter text, instructions, or math equations here..."
      />
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        <strong>Tip:</strong> Use <code>{'{{ }}'}</code> for a blank line (e.g. <code>The cat is {'{{ }}'}</code>). Use <code>{'{{A/B/C}}'}</code> for inline options.
      </div>
    </div>
  );
};

export default TextBlockEditor;
