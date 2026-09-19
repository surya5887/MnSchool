import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Patch addQuestion
old_add = '''  const addQuestion = (type: string) => {
    const newSecs = [...(paperData.sections || [])];
    if (newSecs.length === 0) {
      newSecs.push({ sectionTitle: 'SECTION A', questions: [] });
    }
    const sIdx = newSecs.length - 1;
    newSecs[sIdx].questions.push({ text: 'New Question', marks: 1, type: type as any });
    setPaperData({ ...paperData, sections: newSecs });
    setSelectedItem({ type: 'question', sIdx, qIdx: newSecs[sIdx].questions.length - 1 });
  };'''

new_add = '''  const addQuestion = (type: string) => {
    const newSecs = [...(paperData.sections || [])];
    if (newSecs.length === 0) {
      newSecs.push({ sectionTitle: 'SECTION A', questions: [] });
    }
    const sIdx = newSecs.length - 1;
    const newQuestion: any = { text: 'New Question', marks: 1, type: type as any };
    if (type === 'objective') {
      newQuestion.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    newSecs[sIdx].questions.push(newQuestion);
    setPaperData({ ...paperData, sections: newSecs });
    setSelectedItem({ type: 'question', sIdx, qIdx: newSecs[sIdx].questions.length - 1 });
  };'''

code = code.replace(old_add, new_add)

start_idx = code.find("{q.type === 'objective' && (")
end_idx = code.find("{q.type === 'match' && (")

if start_idx != -1 and end_idx != -1:
    new_mcq = '''                    {q.type === 'objective' && (
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
                              <span style={{ fontWeight: 'bold', width: '24px', paddingTop: '8px' }}>{['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][optIdx] || optIdx+1})</span>
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
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '32px' }}>
                              {/* Local Image Upload */}
                              <div>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Image (Local File)</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input type="file" accept="image/*" style={{ fontSize: '11px', width: '180px' }} onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const newImages = [...(q.optionImages || [])];
                                        newImages[optIdx] = ev.target?.result as string;
                                        updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { optionImages: newImages });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                                  {q.optionImages?.[optIdx] && (
                                    <button className="btn-danger" style={{ padding: '2px 8px', fontSize: '10px' }} onClick={() => {
                                      const newImages = [...(q.optionImages || [])]; newImages[optIdx] = undefined;
                                      updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { optionImages: newImages });
                                    }}>Remove Image</button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Shapes Config */}
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div>
                                  <label style={{ fontSize: '10px', color: '#64748b' }}>Shape</label>
                                  <select className="glass-input" style={{ marginBottom: 0, fontSize: '11px', padding: '4px 8px', width: '90px' }} value={q.optionShapes?.[optIdx]?.type || ''} onChange={e => {
                                    const newShapes = [...(q.optionShapes || [])]; 
                                    if (e.target.value) {
                                      newShapes[optIdx] = { type: e.target.value, color: q.optionShapes?.[optIdx]?.color || '#000000', rotation: q.optionShapes?.[optIdx]?.rotation || 0 } as any;
                                    } else {
                                      newShapes[optIdx] = undefined;
                                    }
                                    updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { optionShapes: newShapes });
                                  }}>
                                    <option value="">None</option>
                                    <option value="circle">Circle</option>
                                    <option value="square">Square</option>
                                    <option value="triangle">Triangle</option>
                                    <option value="hexagon">Hexagon</option>
                                    <option value="octagon">Octagon</option>
                                    <option value="diamond">Diamond</option>
                                    <option value="star">Star</option>
                                    <option value="line">Line</option>
                                  </select>
                                </div>
                                {q.optionShapes?.[optIdx] && (
                                  <>
                                    <div>
                                      <label style={{ fontSize: '10px', color: '#64748b' }}>Color</label>
                                      <input type="color" value={q.optionShapes[optIdx]!.color || '#000000'} onChange={e => {
                                        const newShapes = [...(q.optionShapes || [])];
                                        if (newShapes[optIdx]) { newShapes[optIdx]!.color = e.target.value; }
                                        updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { optionShapes: newShapes });
                                      }} style={{ width: '30px', height: '24px', padding: 0, border: 'none', cursor: 'pointer' }} />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '10px', color: '#64748b' }}>Angle ({q.optionShapes[optIdx]!.rotation || 0}°)</label>
                                      <input type="range" min="0" max="360" value={q.optionShapes[optIdx]!.rotation || 0} onChange={e => {
                                        const newShapes = [...(q.optionShapes || [])];
                                        if (newShapes[optIdx]) { newShapes[optIdx]!.rotation = parseInt(e.target.value); }
                                        updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { optionShapes: newShapes });
                                      }} style={{ width: '80px' }} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    '''
    
    code = code[:start_idx] + new_mcq + code[end_idx:]
    with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched properties!")
else:
    print("Could not find blocks")
