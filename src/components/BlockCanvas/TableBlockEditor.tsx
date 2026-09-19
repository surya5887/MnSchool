import React, { useState } from 'react';
import type { TableBlock } from '../../services/examService';
import { Settings } from 'lucide-react';

interface Props {
  block: TableBlock;
  onChange: (block: TableBlock) => void;
}

const TableBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);

  const updateDims = (rows: number, cols: number) => {
    const newCells = [...block.cells];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newCells.find(cell => cell.rowIndex === r && cell.colIndex === c)) {
          newCells.push({ rowIndex: r, colIndex: c, content: '' });
        }
      }
    }
    onChange({ ...block, rows, cols, cells: newCells });
  };

  const getCell = (r: number, c: number) => {
    return block.cells.find(cell => cell.rowIndex === r && cell.colIndex === c) || { rowIndex: r, colIndex: c, content: '' };
  };

  const updateCellObj = (r: number, c: number, updates: any) => {
    const newCells = [...block.cells];
    const idx = newCells.findIndex(cell => cell.rowIndex === r && cell.colIndex === c);
    if (idx >= 0) {
      newCells[idx] = { ...newCells[idx], ...updates };
      onChange({ ...block, cells: newCells });
    }
  };

  const activeCell = selectedCell ? getCell(selectedCell.r, selectedCell.c) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Rows:</label>
        <input 
          type="number" min="1" max="20" className="glass-input" style={{ width: '60px', marginBottom: 0, padding: '4px' }} 
          value={block.rows} onChange={e => updateDims(Number(e.target.value), block.cols)} 
        />
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Cols:</label>
        <input 
          type="number" min="1" max="20" className="glass-input" style={{ width: '60px', marginBottom: 0, padding: '4px' }} 
          value={block.cols} onChange={e => updateDims(block.rows, Number(e.target.value))} 
        />
      </div>

      <div style={{ overflowX: 'auto', background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {Array.from({ length: block.rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: block.cols }).map((_, c) => {
                  const cell = getCell(r, c);
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  return (
                    <td key={c} style={{ padding: '2px', position: 'relative' }}>
                      <input 
                        type="text" 
                        className="glass-input"
                        style={{ 
                          width: '100%',
                          minWidth: '60px',
                          marginBottom: 0,
                          textAlign: 'center',
                          fontWeight: cell.isHeader ? 'bold' : 'normal',
                          background: cell.bgColor || (cell.isHeader ? '#e2e8f0' : 'white'),
                          color: cell.textColor || '#000000',
                          border: isSelected ? '2px solid #3b82f6' : (cell.hideBorder ? '1px dashed #ccc' : '1px solid #94a3b8') 
                        }}
                        value={cell.content}
                        onChange={e => updateCellObj(r, c, { content: e.target.value })}
                        onFocus={() => setSelectedCell({r, c})}
                        placeholder="Text"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeCell && (
        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <Settings size={14} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Cell Options (R{activeCell.rowIndex + 1}, C{activeCell.colIndex + 1})</span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={activeCell.isHeader || false} onChange={e => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { isHeader: e.target.checked })} />
              Is Header
            </label>
            <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={activeCell.hideBorder || false} onChange={e => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { hideBorder: e.target.checked })} />
              Hide Border
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b' }}>ColSpan (Merge Right)</label>
              <input type="number" min="1" max="10" className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={activeCell.colSpan || 1} onChange={e => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { colSpan: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b' }}>RowSpan (Merge Down)</label>
              <input type="number" min="1" max="10" className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={activeCell.rowSpan || 1} onChange={e => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { rowSpan: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b' }}>Bg Color</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="color" value={activeCell.bgColor || '#ffffff'} onChange={e => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { bgColor: e.target.value })} style={{ width: '30px', height: '24px', padding: 0, border: 'none' }} />
                <button className="btn-secondary" style={{ padding: '2px 4px', fontSize: '10px' }} onClick={() => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { bgColor: '' })}>Clear</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#64748b' }}>Text Color</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="color" value={activeCell.textColor || '#000000'} onChange={e => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { textColor: e.target.value })} style={{ width: '30px', height: '24px', padding: 0, border: 'none' }} />
                <button className="btn-secondary" style={{ padding: '2px 4px', fontSize: '10px' }} onClick={() => updateCellObj(activeCell.rowIndex, activeCell.colIndex, { textColor: '' })}>Clear</button>
              </div>
            </div>
          </div>
          
          <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '12px' }}>* Tip: If you set ColSpan &gt; 1, the cells to the right will be hidden automatically in Print View.</p>
        </div>
      )}
    </div>
  );
};

export default TableBlockEditor;
