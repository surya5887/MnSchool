import re

file_path = 'src/pages/SystemSettings.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to insert the new fields right before the academic session divider
pattern = re.compile(
    r'(<input type="email" className="glass-input"[^>]*value=\{settings\.email\}[^>]*onChange=\{e => setSettings\(\{\.\.\.settings,\s*email:\s*e\.target\.value\}\)\}\s*/>\s*</div>)'
)

new_fields = """
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                          <PenTool size={16} /> Recognition Text (Appears on Certificates)
                        </label>
                        <input type="text" className="glass-input" style={{ fontSize: '1.05rem', padding: '14px 20px', borderRadius: '16px' }} placeholder="e.g. Recognition from UP Board (CBSE Pattern)" value={settings.recognitionText || ''} onChange={e => setSettings({...settings, recognitionText: e.target.value})} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                          <Building2 size={16} /> Full Address
                        </label>
                        <input type="text" className="glass-input" style={{ fontSize: '1.05rem', padding: '14px 20px', borderRadius: '16px' }} placeholder="e.g. Harsoli - 251001, Distt. Muzaffarnagar (U.P.) India" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} />
                      </div>
"""

def replacement(m):
    return m.group(1) + new_fields

new_content = pattern.sub(replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Patched SystemSettings.tsx!")
