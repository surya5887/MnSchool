import re
import os

for file_path in ['src/components/CharacterCertificatePrintView.tsx', 'src/components/BirthCertificatePrintView.tsx']:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the entire Action Bar block and replace it
    old_action_bar_pattern = r'\{/\* Action Bar \(Hidden when printing\) \*/\}.*?</div>\s*</div>'
    
    new_action_bar = """{/* Action Bar */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: '950px', margin: '20px auto 24px auto', background: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Issue Date:</label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Printer size={18} /> Print Certificate
          </button>
        </div>
      </div>"""
    
    content = re.sub(old_action_bar_pattern, new_action_bar, content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed Action Bar layout.")
