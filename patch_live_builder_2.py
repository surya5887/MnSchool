import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_sidebar = "      {/* RIGHT SIDEBAR: Property Inspector */}\n      <div style={{ width: selectedItem ? '400px' : '0px', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>"
new_sidebar = "      {/* RIGHT SIDEBAR: Property Inspector */}\n      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 100, boxShadow: selectedItem ? '-10px 0 30px rgba(0,0,0,0.1)' : 'none', width: selectedItem ? '400px' : '0px', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>"

code = code.replace(old_sidebar, new_sidebar)

with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Patched sidebar float!")

