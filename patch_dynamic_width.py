import re

with open('src/components/BlockPrintRenderer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_table = "<table style={{ borderCollapse: 'collapse', minWidth: '50%', maxWidth: '100%', tableLayout: 'fixed', width: '100%' }}>"
new_table = "<table style={{ borderCollapse: 'collapse', minWidth: '50%', maxWidth: '100%', tableLayout: 'fixed', width: (block as any).tableWidth !== undefined ? ${(block as any).tableWidth}% : '100%' }}>"
code = code.replace(old_table, new_table)

with open('src/components/BlockPrintRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
