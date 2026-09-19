import re

with open('src/components/BlockCanvas/TableBlockEditor.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_row = "          <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '12px' }}>* Tip: If you set ColSpan &gt; 1, the cells to the right will be hidden automatically in Print View.</p>"

new_row = '''          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px', flex: 1 }} onClick={() => {
              const newCells = [...block.cells];
              newCells.forEach(c => {
                if (c.rowIndex === activeCell.rowIndex) {
                  c.bgColor = activeCell.bgColor;
                  c.textColor = activeCell.textColor;
                }
              });
              onChange({ ...block, cells: newCells });
            }}>Apply Color to Entire Row</button>
            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px', flex: 1 }} onClick={() => {
              const newCells = [...block.cells];
              newCells.forEach(c => {
                if (c.colIndex === activeCell.colIndex) {
                  c.bgColor = activeCell.bgColor;
                  c.textColor = activeCell.textColor;
                }
              });
              onChange({ ...block, cells: newCells });
            }}>Apply Color to Entire Column</button>
          </div>
          <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '12px' }}>* Tip: If you set ColSpan &gt; 1, the cells to the right will be hidden automatically in Print View.</p>'''

code = code.replace(old_row, new_row)

with open('src/components/BlockCanvas/TableBlockEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
