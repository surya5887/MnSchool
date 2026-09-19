import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_idx = code.find("  return (")
end_idx = code.find("      {/* RIGHT SIDEBAR: Property Inspector */}")

if start_idx != -1 and end_idx != -1:
    new_layout = '''  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      
      {/* CENTER: Live Canvas Area */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setSelectedItem(null)}>
        <div style={{ margin: '40px 20px', width: '100%', maxWidth: '850px', background: 'white', minHeight: '1100px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '2px', position: 'relative' }}>
          <QuestionPaperPrintView 
            mode="inline" 
            paperData={paperData} 
            isEditor={true} 
            selectedItem={selectedItem} 
            onItemClick={setSelectedItem as any} 
          />
        </div>
      </div>

      {/* BOTTOM TOOLBAR: Insert Panel */}
      <div className="hide-scrollbar" style={{ width: '100%', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '16px 24px', gap: '16px', zIndex: 10, boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>Structure:</span>
          <button className="btn-secondary" style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px' }} onClick={addSection}>
            <Plus size={14} style={{ color: '#64748b' }} /> Add Section
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#cbd5e1', display: 'none' }} className="toolbar-divider"></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginRight: '4px', marginLeft: '12px' }}>Questions:</span>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => addQuestion('subjective')}>Subjective</button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => addQuestion('objective')}>MCQ</button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => addQuestion('true_false')}>True/False</button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => addQuestion('match')}>Match</button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => addQuestion('fill_in_the_blanks')}>Fill Blanks</button>
        </div>
        
        <div style={{ width: '1px', height: '24px', background: '#cbd5e1', display: 'none' }} className="toolbar-divider"></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginRight: '4px', marginLeft: '12px' }}>Misc:</span>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => addQuestion('instruction')}>Instruction</button>
        </div>
      </div>

'''
    code = code[:start_idx] + new_layout + code[end_idx:]
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched successfully")
else:
    print("Could not find bounds", start_idx, end_idx)

