import React from 'react';
import type { TableBlock } from '../../services/examService';

interface Props {
  block: TableBlock;
  onChange: (block: TableBlock) => void;
}

const TableBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const updateDims = (rows: number, cols: number) => {
    const newCells = [...block.cells];
    // Keep existing cells, add new ones if expanded
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newCells.find(cell => cell.rowIndex === r && cell.colIndex === c)) {
          newCells.push({ rowIndex: r, colIndex: c, content: '' });
        }
      }
    }
    onChange({ ...block, rows, cols, cells: newCells });
  };

  const updateCell = (r: number, c: number, content: string, hideBorder?: boolean) => {
    const newCells = [...block.cells];
    const idx = newCells.findIndex(cell => cell.rowIndex === r && cell.colIndex === c);
    if (idx >= 0) {
      newCells[idx] = { ...newCells[idx], content };
      if (hideBorder !== undefined) newCells[idx].hideBorder = hideBorder;
      onChange({ ...block, cells: newCells });
    }
  };

  const getCell = (r: number, c: number) => {
    return block.cells.find(cell => cell.rowIndex === r && cell.colIndex === c) || { content: '' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Rows:</label>
        <input 
          type="number" 
          min="1" max="20" 
          className="glass-input" 
          style={{ width: '80px' }} 
          value={block.rows} 
          onChange={e => updateDims(Number(e.target.value), block.cols)} 
        />
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Columns:</label>
        <input 
          type="number" 
          min="1" max="20" 
          className="glass-input" 
          style={{ width: '80px' }} 
          value={block.cols} 
          onChange={e => updateDims(block.rows, Number(e.target.value))} 
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {Array.from({ length: block.rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: block.cols }).map((_, c) => {
                  const cell = getCell(r, c);
                  return (
                    <td key={c} style={{ padding: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input 
                          type="text" 
                          className="glass-input"
                          style={{ 
                            width: '100px', 
                            textAlign: 'center', 
                            border: cell.hideBorder ? '1px dashed #ccc' : '1px solid var(--glass-border)' 
                          }}
                          value={cell.content}
                          onChange={e => updateCell(r, c, e.target.value)}
                          placeholder="Text"
                        />
                        <label style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', justifyContent: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={cell.hideBorder || false}
                            onChange={e => updateCell(r, c, cell.content, e.target.checked)}
                          />
                          Hide Border
                        </label>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Hidden borders are useful for crossword puzzles or blank spaces.</p>
    </div>
  );
};

export default TableBlockEditor;
