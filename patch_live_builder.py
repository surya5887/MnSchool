import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the entire return statement
start_idx = code.find("  return (")
if start_idx != -1:
    new_render = '''  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 160px)', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setSelectedItem(null)}>
        <div style={{ width: '100%', maxWidth: '850px', background: 'white', minHeight: '1100px', padding: '64px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '2px', position: 'relative' }}>
          
          {/* Header Preview */}
          <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>MN PUBLIC SCHOOL</h1>
            <h2 style={{ margin: '8px 0', fontSize: '18px' }}>Half Yearly Examination</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '16px' }}>
              <span>Time Allowed: 3 Hours</span>
              <span>Maximum Marks: 100</span>
            </div>
          </div>

          {/* Render Sections & Questions */}
          {paperData.sections?.map((sec, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '32px' }}>
              <div 
                onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'section', sIdx }); }}
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  textDecoration: 'underline', 
                  marginBottom: '16px',
                  padding: '8px',
                  cursor: 'pointer',
                  border: selectedItem?.type === 'section' && selectedItem.sIdx === sIdx ? '2px solid #3b82f6' : '2px solid transparent',
                  background: selectedItem?.type === 'section' && selectedItem.sIdx === sIdx ? '#eff6ff' : 'transparent',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
              >
                {sec.sectionTitle || 'UNTITLED SECTION'}
              </div>

              {sec.questions?.map((q, qIdx) => {
                const isSelected = selectedItem?.type === 'question' && selectedItem.sIdx === sIdx && selectedItem.qIdx === qIdx;
                let globalQuestionIndex = 0;
                for (let i = 0; i < sIdx; i++) {
                  globalQuestionIndex += paperData.sections[i].questions.filter(qu => qu.type !== 'instruction').length;
                }
                globalQuestionIndex += sec.questions.slice(0, qIdx).filter(qu => qu.type !== 'instruction').length;
                
                return (
                  <div 
                    key={qIdx} 
                    onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'question', sIdx, qIdx }); }}
                    style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginBottom: '16px', 
                      padding: '12px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      borderRadius: '8px',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.border = '2px dashed #cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.border = '2px solid transparent';
                    }}
                  >
                    {q.type !== 'instruction' && (
                      <div style={{ fontWeight: 'bold', minWidth: '30px' }}>Q{globalQuestionIndex + 1}.</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div dangerouslySetInnerHTML={{ __html: q.text || '<span style="color:#9ca3af">Click to edit text...</span>' }} />
                      
                      {/* Previews */}
                      {q.type === 'true_false' && (
                        <div style={{ display: 'flex', gap: '32px', marginTop: '12px', opacity: 0.7 }}>
                          <span>[ ] True</span>
                          <span>[ ] False</span>
                        </div>
                      )}
                      
                      {q.type === 'match' && (
                         <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', opacity: 0.7 }}>
                           <table style={{ width: '80%', borderCollapse: 'collapse' }}>
                             <tbody>
                               {q.matchPairs?.map((pair, pIdx) => (
                                 <tr key={pIdx}>
                                   <td style={{ padding: '8px', border: '1px solid #000' }}>{pair.left || 'Left Item'}</td>
                                   <td style={{ padding: '8px', border: '1px solid #000' }}>{pair.right || 'Right Item'}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                      )}

                      {q.blocks && q.blocks.length > 0 && (
                        <div style={{ marginTop: '12px', padding: '8px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px', fontSize: '12px', color: '#64748b' }}>
                          [ {q.blocks.length} Attached Block(s): {q.blocks.map(b => b.type).join(', ')} - See Inspector to edit ]
                        </div>
                      )}
                    </div>
                    {q.type !== 'instruction' && (
                      <div style={{ fontWeight: 'bold' }}>[{q.marks}]</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          <div style={{ height: '100px' }}></div> {/* Pad bottom */}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Property Inspector */}
      <div style={{ width: selectedItem ? '400px' : '0px', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>
        {selectedItem && (
          <div style={{ width: '400px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} style={{ color: '#64748b' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                  {selectedItem.type === 'section' ? 'Section Inspector' : 'Question Inspector'}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setSelectedItem(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {selectedItem.type === 'section' && (
                <div>
                  <label className="input-label">Section Title</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    value={paperData.sections[selectedItem.sIdx].sectionTitle}
                    onChange={(e) => updateSection(selectedItem.sIdx, e.target.value)}
                  />
                  
                  <button className="btn-danger" style={{ width: '100%', marginTop: '32px' }} onClick={() => {
                    const newSecs = [...paperData.sections];
                    newSecs.splice(selectedItem.sIdx, 1);
                    setPaperData({ ...paperData, sections: newSecs });
                    setSelectedItem(null);
                  }}>
                    <Trash2 size={16} /> Delete Section
                  </button>
                </div>
              )}

              {selectedItem.type === 'question' && paperData.sections[selectedItem.sIdx]?.questions[selectedItem.qIdx!] && (() => {
                const q = paperData.sections[selectedItem.sIdx].questions[selectedItem.qIdx!];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div style={{ display: 'flex', gap: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ flex: 1 }}>
                        <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Question Type</label>
                        <select className="glass-input" style={{ marginBottom: 0, background: 'white' }} value={q.type || 'subjective'} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { type: e.target.value })}>
                          <option value="subjective">Subjective</option>
                          <option value="objective">Objective (MCQ)</option>
                          <option value="true_false">True / False</option>
                          <option value="match">Match the Following</option>
                          <option value="fill_in_the_blanks">Fill in Blanks</option>
                          <option value="instruction">Instruction</option>
                        </select>
                      </div>
                      {q.type !== 'instruction' && (
                        <div style={{ width: '80px' }}>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Marks</label>
                          <input type="number" className="glass-input" style={{ marginBottom: 0, background: 'white' }} value={q.marks} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { marks: parseInt(e.target.value) || 0 })} />
                        </div>
                      )}
                    </div>

                    {/* Word-like Formatting Area */}
                    <div>
                      <label className="input-label">Question Text</label>
                      <RichTextEditor 
                        value={q.text} 
                        onChange={(html) => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { text: html })}
                      />
                    </div>

                    {q.type === 'match' && (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label className="input-label">Matching Pairs</label>
                        {(q.matchPairs || []).map((pair, pIdx) => (
                           <div key={pIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                             <input type="text" className="glass-input" style={{ marginBottom: 0 }} placeholder="Left" value={pair.left} onChange={e => {
                               const newPairs = [...(q.matchPairs || [])]; newPairs[pIdx].left = e.target.value;
                               updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { matchPairs: newPairs });
                             }} />
                             <input type="text" className="glass-input" style={{ marginBottom: 0 }} placeholder="Right" value={pair.right} onChange={e => {
                               const newPairs = [...(q.matchPairs || [])]; newPairs[pIdx].right = e.target.value;
                               updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { matchPairs: newPairs });
                             }} />
                           </div>
                        ))}
                        <button className="btn-secondary" style={{ width: '100%', padding: '6px', fontSize: '12px' }} onClick={() => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { matchPairs: [...(q.matchPairs || []), {left:'', right:''}] })}>+ Add Pair</button>
                      </div>
                    )}

                    {/* Add Elements */}
                    <div>
                      <label className="input-label">Attach Extra Elements</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button className="btn-secondary" style={{ padding: '8px', fontSize: '12px' }} onClick={() => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: [...(q.images||[]), { url: '' }] })}>
                          <ImageIcon size={14} /> Image
                        </button>
                        <button className="btn-secondary" style={{ padding: '8px', fontSize: '12px' }} onClick={() => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: [...(q.shapes||[]), { type: 'circle', color: '#000' }] })}>
                          <Shapes size={14} /> Shape
                        </button>
                        <button className="btn-secondary" style={{ padding: '8px', fontSize: '12px' }} onClick={() => addBlockToQuestion(selectedItem.sIdx, selectedItem.qIdx!, 'table')}>
                          <Grid size={14} /> Table/Grid
                        </button>
                        <button className="btn-secondary" style={{ padding: '8px', fontSize: '12px' }} onClick={() => addBlockToQuestion(selectedItem.sIdx, selectedItem.qIdx!, 'split_column')}>
                          <LayoutTemplate size={14} /> Split Cols
                        </button>
                      </div>
                    </div>

                    {/* Render Editor for Attached Blocks */}
                    {q.blocks && q.blocks.length > 0 && (
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                        <label className="input-label">Attached Blocks Properties</label>
                        <BlockCanvas hideToolbar={true} blocks={q.blocks} onChange={(newBlocks) => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { blocks: newBlocks as any })} />
                      </div>
                    )}

                    <button className="btn-danger" style={{ width: '100%', marginTop: '32px' }} onClick={() => {
                      const newSecs = [...paperData.sections];
                      newSecs[selectedItem.sIdx].questions.splice(selectedItem.qIdx!, 1);
                      setPaperData({ ...paperData, sections: newSecs });
                      setSelectedItem(null);
                    }}>
                      <Trash2 size={16} /> Delete Question
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
export default LivePaperBuilder;
'''
    code = code[:start_idx] + new_render
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Successfully patched layout!")
else:
    print("Could not find return statement!")
