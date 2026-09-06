import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<button onClick=\{handleSaveAndPrint\}.*?>\s*\{saving \? \'Saving\.\.\.\' : <><Printer size=\{18\} /> Save & Print</>\}\s*</button>', re.DOTALL)

new_buttons = """<div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleSaveAndPrint('front')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : <><Printer size={18} /> Print Front</>}
            </button>
            <button onClick={() => handleSaveAndPrint('back')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#f59e0b', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : <><Printer size={18} /> Print Back</>}
            </button>
          </div>"""

content = pattern.sub(new_buttons, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replace buttons done.")
