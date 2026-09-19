import re

with open('src/components/BlockCanvas/BlockCanvas.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add hideToolbar to interface
code = code.replace("  onChange: (blocks: PaperBlock[]) => void;\n}", "  onChange: (blocks: PaperBlock[]) => void;\n  hideToolbar?: boolean;\n}")

# Update component signature
code = code.replace("const BlockCanvas: React.FC<BlockCanvasProps> = ({ blocks, onChange }) => {", "const BlockCanvas: React.FC<BlockCanvasProps> = ({ blocks, onChange, hideToolbar = false }) => {")

# Wrap the toolbar in a condition
old_toolbar = '''      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ padding: '4px 12px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => addBlock('header')}>+ Header</button>
          <button className="btn-secondary" onClick={() => addBlock('text')}>+ Text/Math</button>
          <button className="btn-secondary" onClick={() => addBlock('mcq')}>+ MCQ</button>
          <button className="btn-secondary" onClick={() => addBlock('match')}>+ Match</button>
          <button className="btn-secondary" onClick={() => addBlock('table')}>+ Table/Grid</button>
          <button className="btn-secondary" onClick={() => addBlock('image_group')}>+ Images</button>
          <button className="btn-secondary" onClick={() => addBlock('word_bank')}>+ Word Bank</button>
          <button className="btn-secondary" onClick={() => addBlock('split_column')}>+ Split Columns</button>
        </div>
      </div>'''

new_toolbar = '''      {!hideToolbar && (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ padding: '4px 12px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => addBlock('header')}>+ Header</button>
          <button className="btn-secondary" onClick={() => addBlock('text')}>+ Text/Math</button>
          <button className="btn-secondary" onClick={() => addBlock('mcq')}>+ MCQ</button>
          <button className="btn-secondary" onClick={() => addBlock('match')}>+ Match</button>
          <button className="btn-secondary" onClick={() => addBlock('table')}>+ Table/Grid</button>
          <button className="btn-secondary" onClick={() => addBlock('image_group')}>+ Images</button>
          <button className="btn-secondary" onClick={() => addBlock('word_bank')}>+ Word Bank</button>
          <button className="btn-secondary" onClick={() => addBlock('split_column')}>+ Split Columns</button>
        </div>
      </div>
      )}'''

code = code.replace(old_toolbar, new_toolbar)

with open('src/components/BlockCanvas/BlockCanvas.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
