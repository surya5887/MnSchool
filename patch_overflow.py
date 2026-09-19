import re

with open('src/components/BlockPrintRenderer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_table_tag = "<table style={{ borderCollapse: 'collapse', minWidth: '50%' }}>"
new_table_tag = "<table style={{ borderCollapse: 'collapse', minWidth: '50%', maxWidth: '100%', tableLayout: 'fixed', width: '100%' }}>"
code = code.replace(old_table_tag, new_table_tag)

old_cell_style = '''                              minWidth: '40px',
                              height: '24px'
                            }}>
                              <div dangerouslySetInnerHTML={{ __html: cell.content?.replace(/\\n/g, '<br/>') || '' }} />'''

new_cell_style = '''                              height: '24px',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}>
                              <div dangerouslySetInnerHTML={{ __html: cell.content?.replace(/\\n/g, '<br/>') || '' }} />'''

code = code.replace(old_cell_style, new_cell_style)

with open('src/components/BlockPrintRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
