import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_idx = code.find("  return (\\n    <div style={{ position: 'relative', display: 'flex'")
end_idx = code.find("      {/* RIGHT SIDEBAR: Property Inspector */}")

if start_idx != -1 and end_idx != -1:
    new_layout = '''  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      
      {/* CENTER: Live Canvas Area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setSelectedItem(null)}>
        <div style={{ margin: '40px 20px', minWidth: '850px', maxWidth: '850px', background: 'white', minHeight: '1100px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '2px', position: 'relative' }}>
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
      <div style={{ width: '100%', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '24px', overflowX: 'auto', zIndex: 10 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Structure:</span>
          <button className="btn-secondary" style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', fontSize: '13px' }} onClick={addSection}>
            <Plus size={14} style={{ color: '#64748b' }} /> Add Section
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Questions:</span>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => addQuestion('subjective')}>Subjective</button>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => addQuestion('objective')}>MCQ</button>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => addQuestion('true_false')}>True/False</button>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => addQuestion('match')}>Match</button>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => addQuestion('fill_in_the_blanks')}>Fill Blanks</button>
        </div>
        
        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Misc:</span>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => addQuestion('instruction')}>Instruction</button>
        </div>
      </div>

'''
    code = code[:start_idx] + new_layout + code[end_idx:]
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched successfully")
else:
    print("Could not find blocks", start_idx, end_idx)

