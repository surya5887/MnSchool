import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the layout
old_layout = '''  return (
    <div style={{ position: 'relative', display: 'flex', height: 'calc(100vh - 160px)', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      
      {/* LEFT TOOLBAR: Insert Panel */}
      <div style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#334155' }}>
          Insert Elements
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Structure</div>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1' }} onClick={addSection}>
            <Plus size={16} style={{ color: '#64748b' }} /> Add New Section
          </button>
          
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginTop: '12px', marginBottom: '4px' }}>Questions</div>
          
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px' }} onClick={() => addQuestion('subjective')}>
            <span style={{ width: '24px', textAlign: 'center', opacity: 0.5 }}>S</span> Subjective Q
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px' }} onClick={() => addQuestion('objective')}>
            <span style={{ width: '24px', textAlign: 'center', opacity: 0.5 }}>☑</span> MCQ
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px' }} onClick={() => addQuestion('true_false')}>
            <span style={{ width: '24px', textAlign: 'center', opacity: 0.5 }}>T/F</span> True / False
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px' }} onClick={() => addQuestion('match')}>
            <span style={{ width: '24px', textAlign: 'center', opacity: 0.5 }}>⤫</span> Match Following
          </button>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px' }} onClick={() => addQuestion('fill_in_the_blanks')}>
            <span style={{ width: '24px', textAlign: 'center', opacity: 0.5 }}>_</span> Fill in Blanks
          </button>
          
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginTop: '12px', marginBottom: '4px' }}>Misc</div>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px' }} onClick={() => addQuestion('instruction')}>
            <span style={{ width: '24px', textAlign: 'center', opacity: 0.5 }}>ℹ</span> Instruction Text
          </button>

        </div>
      </div>

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
      </div>'''

# wait, the weird characters are in MCQ, Match following and instruction text. Let me check the exact characters first.
