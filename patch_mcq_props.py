import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_idx = code.find("{q.type === 'match' && (")

if start_idx != -1:
    mcq_block = '''                    {q.type === 'objective' && (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                        <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>MCQ Options</span>
                          <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => {
                            const newOptions = [...(q.options || []), 'New Option'];
                            updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { options: newOptions });
                          }}>+ Add Option</button>
                        </label>
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 'bold', width: '24px', paddingTop: '8px' }}>{['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || optIdx+1})</span>
                              <input type="text" className="glass-input" style={{ marginBottom: 0, flex: 1 }} placeholder="Option Text" value={opt} onChange={e => {
                                const newOptions = [...q.options!]; newOptions[optIdx] = e.target.value;
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { options: newOptions });
                              }} />
                              <button className="btn-danger" style={{ padding: '8px' }} onClick={() => {
                                const newOptions = [...q.options!]; newOptions.splice(optIdx, 1);
                                const newImages = [...(q.optionImages || [])]; if (newImages.length > optIdx) newImages.splice(optIdx, 1);
                                const newShapes = [...(q.optionShapes || [])]; if (newShapes.length > optIdx) newShapes.splice(optIdx, 1);
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { options: newOptions, optionImages: newImages, optionShapes: newShapes });
                              }}><Trash2 size={14} /></button>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginLeft: '32px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Image URL (Optional)</label>
                                <input type="text" className="glass-input" style={{ marginBottom: 0, fontSize: '11px', padding: '4px 8px' }} placeholder="https://..." value={q.optionImages?.[optIdx] || ''} onChange={e => {
                                  const newImages = [...(q.optionImages || [])]; newImages[optIdx] = e.target.value;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { optionImages: newImages });
                                }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Shape (Optional)</label>
                                <select className="glass-input" style={{ marginBottom: 0, fontSize: '11px', padding: '4px 8px' }} value={q.optionShapes?.[optIdx]?.type || ''} onChange={e => {
                                  const newShapes = [...(q.optionShapes || [])]; 
                                  if (e.target.value) {
                                    newShapes[optIdx] = { type: e.target.value, color: '#000' };
                                  } else {
                                    newShapes[optIdx] = undefined;
                                  }
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { optionShapes: newShapes });
                                }}>
                                  <option value="">None</option>
                                  <option value="circle">Circle</option>
                                  <option value="square">Square</option>
                                  <option value="triangle">Triangle</option>
                                  <option value="star">Star</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

'''
    code = code[:start_idx] + mcq_block + code[start_idx:]
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Injected MCQ properties block!")
else:
    print("Could not find start_idx")
