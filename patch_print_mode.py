import re

file_path = 'src/components/ReportCardPrintView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add printMode state
if "const [printMode" not in content:
    content = content.replace(
        "const [saving, setSaving] = useState(false);", 
        "const [saving, setSaving] = useState(false);\n  const [printMode, setPrintMode] = useState<'both' | 'front' | 'back'>('both');"
    )

# 2. Update handleSaveAndPrint signature
content = content.replace(
    "const handleSaveAndPrint = async () => {",
    "const handleSaveAndPrint = async (mode: 'both' | 'front' | 'back') => {\n    setPrintMode(mode);"
)

# 3. Add print-hide rules to CSS
if "display: none !important;" not in content.split(".preview-toolbar")[1][:100]:
    pass # This is fine, we'll just inject right after `.preview-toolbar { display: none !important; }`
    
css_inject = """            .preview-toolbar { display: none !important; }
            ${printMode === 'front' ? '.rc-back-page { display: none !important; }' : ''}
            ${printMode === 'back' ? '.rc-front-page { display: none !important; }' : ''}"""
content = content.replace(".preview-toolbar { display: none !important; }", css_inject)

# 4. Replace buttons
old_buttons = """          <button onClick={handleSaveAndPrint} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#10b981', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            {saving ? 'Saving...' : <><Printer size={18} /> Save & Print</>}
          </button>"""
          
new_buttons = """          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleSaveAndPrint('front')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : <><Printer size={18} /> Print Front</>}
            </button>
            <button onClick={() => handleSaveAndPrint('back')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#f59e0b', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : <><Printer size={18} /> Print Back</>}
            </button>
          </div>"""
content = content.replace(old_buttons, new_buttons)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("ReportCardPrintView patched.")
