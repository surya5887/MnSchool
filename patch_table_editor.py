import re

with open('src/components/BlockCanvas/TableBlockEditor.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_header = '''      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
      </div>'''

new_header = '''      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Rows:</label>
          <input 
            type="number" min="1" max="20" className="glass-input" style={{ width: '60px', marginBottom: 0, padding: '4px' }} 
            value={block.rows} onChange={e => updateDims(Number(e.target.value), block.cols)} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Cols:</label>
          <input 
            type="number" min="1" max="20" className="glass-input" style={{ width: '60px', marginBottom: 0, padding: '4px' }} 
            value={block.cols} onChange={e => updateDims(block.rows, Number(e.target.value))} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Table Bg:</label>
          <input type="color" value={(block as any).tableBgColor || '#ffffff'} onChange={e => onChange({ ...block, tableBgColor: e.target.value } as any)} style={{ width: '24px', height: '24px', padding: 0, border: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Table Text:</label>
          <input type="color" value={(block as any).tableTextColor || '#000000'} onChange={e => onChange({ ...block, tableTextColor: e.target.value } as any)} style={{ width: '24px', height: '24px', padding: 0, border: 'none' }} />
        </div>
      </div>'''

code = code.replace(old_header, new_header)

with open('src/components/BlockCanvas/TableBlockEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
