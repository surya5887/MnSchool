import React from 'react';
import type { PaperBlock } from '../../services/examService';
import TextBlockEditor from './TextBlockEditor';
import MCQBlockEditor from './MCQBlockEditor';
import TableBlockEditor from './TableBlockEditor';
import ImageGroupBlockEditor from './ImageGroupBlockEditor';
import WordBankBlockEditor from './WordBankBlockEditor';
import HeaderBlockEditor from './HeaderBlockEditor';
import MatchBlockEditor from './MatchBlockEditor';
import SplitColumnBlockEditor from './SplitColumnBlockEditor';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface BlockCanvasProps {
  blocks: PaperBlock[];
  onChange: (blocks: PaperBlock[]) => void;
  hideToolbar?: boolean;
}

const BlockCanvas: React.FC<BlockCanvasProps> = ({ blocks, onChange, hideToolbar = false }) => {
  const addBlock = (type: PaperBlock['type']) => {
    const newBlock: any = {
      id: Math.random().toString(36).substring(7),
      type,
    };

    switch (type) {
      case 'header':
        newBlock.title = 'MN PUBLIC SCHOOL';
        newBlock.subtitle = 'Half Yearly Examination';
        newBlock.fields = [{ label: 'Name', value: '' }, { label: 'Roll No', value: '' }];
        break;
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
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    onChange(newBlocks);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {blocks.map((block, index) => (
        <div key={block.id} style={{ 
          background: 'var(--bg-color)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Block Header Toolbar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '8px 16px', 
            background: 'rgba(0,0,0,0.03)',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-muted)' }}>
              <GripVertical size={16} />
              <span style={{ textTransform: 'capitalize' }}>{block.type.replace('_', ' ')} Block</span>
            </div>
            
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={block.showMarks || false} onChange={(e) => updateBlock(block.id, { ...block, showMarks: e.target.checked })} /> Show Marks
                </label>
                {block.showMarks && (
                  <input type="number" className="glass-input" style={{ width: '50px', padding: '4px' }} placeholder="E.g. 5" value={block.marks || ''} onChange={(e) => updateBlock(block.id, { ...block, marks: Number(e.target.value) })} />
                )}
              </div>

              <button className="btn-secondary" style={{ padding: '6px', color: 'var(--danger)', marginLeft: '8px' }} onClick={() => removeBlock(block.id)}><Trash2 size={16} /></button>
            </div>
          </div>

          {/* Block Body */}
          <div style={{ padding: '16px' }}>
            {block.type === 'text' && <TextBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'mcq' && <MCQBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'table' && <TableBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'image_group' && <ImageGroupBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'match' && <MatchBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'split_column' && <SplitColumnBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'header' && <HeaderBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {block.type === 'word_bank' && <WordBankBlockEditor block={block as any} onChange={(b) => updateBlock(block.id, b)} />}
            {['marks_box'].includes(block.type) && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {block.type} editor coming soon...
              </div>
            )}
          </div>
        </div>
      ))}

      {!hideToolbar && (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', padding: '16px', border: '2px dashed var(--glass-border)', borderRadius: '12px', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={() => addBlock('header')}>+ Header</button>
        <button className="btn-secondary" onClick={() => addBlock('text')}>+ Text/Math</button>
        <button className="btn-secondary" onClick={() => addBlock('mcq')}>+ MCQ</button>
        <button className="btn-secondary" onClick={() => addBlock('match')}>+ Match</button>
        <button className="btn-secondary" onClick={() => addBlock('table')}>+ Table/Grid</button>
        <button className="btn-secondary" onClick={() => addBlock('image_group')}>+ Images</button>
        <button className="btn-secondary" onClick={() => addBlock('word_bank')}>+ Word Bank</button>
        <button className="btn-secondary" onClick={() => addBlock('split_column')}>+ Split Columns</button>
      </div>
      )}
    </div>
  );
};

export default BlockCanvas;
