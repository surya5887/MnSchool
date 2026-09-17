const fs = require('fs');
const content = import React from 'react';
import { PaperBlock } from '../../services/examService';
import TextBlockEditor from './TextBlockEditor';
import MCQBlockEditor from './MCQBlockEditor';
import TableBlockEditor from './TableBlockEditor';
import ImageGroupBlockEditor from './ImageGroupBlockEditor';
import MatchBlockEditor from './MatchBlockEditor';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface BlockCanvasProps {
  blocks: PaperBlock[];
  onChange: (blocks: PaperBlock[]) => void;
}

const BlockCanvas: React.FC<BlockCanvasProps> = ({ blocks, onChange }) => {
  const addBlock = (type: PaperBlock['type']) => {
    const newBlock: any = {
      id: Math.random().toString(36).substring(7),
      type,
    };

    switch (type) {
      case 'text':
        newBlock.content = '';
        break;
      case 'mcq':
        newBlock.question = '';
        newBlock.layout = '1-col';
        newBlock.options = [{ text: '' }, { text: '' }];
        break;
      case 'table':
        newBlock.rows = 3;
        newBlock.cols = 3;
        newBlock.cells = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            newBlock.cells.push({ rowIndex: r, colIndex: c, content: '' });
          }
        }
        break;
      case 'image_group':
        newBlock.layout = 'grid';
        newBlock.images = [];
        break;
      case 'match':
        newBlock.leftColumn = [{ text: '' }];
        newBlock.rightColumn = [{ text: '' }];
        break;
      case 'word_bank':
        newBlock.words = [''];
        break;
      case 'marks_box':
        newBlock.text = '[1x5=5]';
        break;
      case 'split_column':
        newBlock.leftBlocks = [];
        newBlock.rightBlocks = [];
        break;
    }

    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updatedBlock: PaperBlock) => {
    onChange(blocks.map(b => b.id === id ? updatedBlock : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {blocks.map((block, index) => (
        <div key={block.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--bg-color)', padding: '16px', position: 'relative' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
                <GripVertical size={20} />
              </div>
              <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {block.type.replace('_', ' ')} Block
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn-secondary" style={{ padding: '4px' }} onClick={() => moveBlock(index, 'up')} disabled={index === 0}><ChevronUp size={16} /></button>
              <button className="btn-secondary" style={{ padding: '4px' }} onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}><ChevronDown size={16} /></button>
              <button className="btn-secondary" style={{ padding: '4px', color: 'var(--danger)' }} onClick={() => removeBlock(block.id)}><Trash2 size={16} /></button>
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            {block.type === 'text' && <TextBlockEditor block={block} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'mcq' && <MCQBlockEditor block={block} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'table' && <TableBlockEditor block={block} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'image_group' && <ImageGroupBlockEditor block={block} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'match' && <MatchBlockEditor block={block} onChange={(b) => updateBlock(block.id, b)} />}
            {['split_column', 'word_bank', 'marks_box'].includes(block.type) && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {block.type} editor coming soon...
              </div>
            )}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', padding: '16px', border: '2px dashed var(--glass-border)', borderRadius: '12px', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={() => addBlock('text')}>+ Text/Math</button>
        <button className="btn-secondary" onClick={() => addBlock('mcq')}>+ MCQ</button>
        <button className="btn-secondary" onClick={() => addBlock('match')}>+ Match</button>
        <button className="btn-secondary" onClick={() => addBlock('table')}>+ Table/Grid</button>
        <button className="btn-secondary" onClick={() => addBlock('image_group')}>+ Images</button>
        <button className="btn-secondary" onClick={() => addBlock('word_bank')}>+ Word Bank</button>
        <button className="btn-secondary" onClick={() => addBlock('split_column')}>+ Split Columns</button>
      </div>
    </div>
  );
};

export default BlockCanvas;
\;
fs.writeFileSync('src/components/BlockCanvas/BlockCanvas.tsx', content);
