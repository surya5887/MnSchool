import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_wrapper = "    <div style={{ display: 'flex', height: 'calc(100vh - 160px)', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>"
new_wrapper = "    <div style={{ position: 'relative', display: 'flex', height: 'calc(100vh - 160px)', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>"

code = code.replace(old_wrapper, new_wrapper)

with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

