import React, { useState } from 'react';
import type { WordBankBlock } from '../../services/examService';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  block: WordBankBlock;
  onChange: (block: WordBankBlock) => void;
}

const WordBankBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const [newWord, setNewWord] = useState('');

  const addWord = () => {
    if (newWord.trim()) {
      onChange({ ...block, words: [...(block.words || []), newWord.trim()] });
      setNewWord('');
    }
  };

  const removeWord = (idx: number) => {
    const newWords = [...(block.words || [])];
    newWords.splice(idx, 1);
    onChange({ ...block, words: newWords });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'white' }}>
        {(block.words || []).length === 0 && <span style={{ color: 'var(--text-muted)' }}>No words added.</span>}
        {(block.words || []).map((word, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.05)', padding: '6px 12px', borderRadius: '16px' }}>
            <span style={{ fontWeight: 600 }}>{word}</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--danger)', display: 'flex', alignItems: 'center' }} onClick={() => removeWord(idx)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          className="glass-input" 
          placeholder="Type a word..." 
          value={newWord} 
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWord()}
        />
        <button className="btn-secondary" onClick={addWord}><Plus size={16} /> Add Word</button>
      </div>

    </div>
  );
};

export default WordBankBlockEditor;
