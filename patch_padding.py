import re

with open('src/components/BlockPrintRenderer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("padding: '4px 8px', // Reduced padding", "padding: '2px 4px', // Reduced padding")
code = code.replace("height: '30px'", "height: '24px'")

with open('src/components/BlockPrintRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
