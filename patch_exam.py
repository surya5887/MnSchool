import re

file_path = 'src/pages/Examination.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_header = "              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600, padding: '0 16px' }}>"
new_header = "              <div className=\"marks-grid-header\">"

old_row = "                  <div key={subj} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center', background: 'var(--bg-color)', padding: '12px 16px', borderRadius: '12px', marginBottom: '12px' }}>"
new_row = "                  <div key={subj} className=\"marks-grid-row\">"

old_input1 = "className=\"glass-input\" style={{ width: '100px', padding: '8px' }}/>"
new_input1 = "className=\"glass-input marks-input\" />"

content = content.replace(old_header, new_header)
content = content.replace(old_row, new_row)
content = content.replace(old_input1, new_input1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Examination.tsx")
