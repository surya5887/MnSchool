import re

with open('src/components/BlockPrintRenderer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_cell_style = '''                              backgroundColor: cell.bgColor || (cell.isHeader ? '#f1f5f9' : 'transparent'),
                              color: cell.textColor || '#000000','''

new_cell_style = '''                              backgroundColor: cell.bgColor || (cell.isHeader ? '#f1f5f9' : ((block as any).tableBgColor || 'transparent')),
                              color: cell.textColor || ((block as any).tableTextColor || '#000000'),'''

code = code.replace(old_cell_style, new_cell_style)

with open('src/components/BlockPrintRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
