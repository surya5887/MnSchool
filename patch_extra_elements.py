import re

with open('src/components/LivePaperBuilder.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the 'Attach Extra Elements' section completely.
old_attach = '''                      {/* Add Elements */}
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
                      </div>'''

new_attach = '''                      {/* Attach Images & Shapes */}
                      <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <label className="input-label">Images & Shapes</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', flex: 1 }} onClick={() => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: [...(q.images||[]), { url: '', width: 10, align: 'center', borderWidth: 0, borderColor: '#000000' }] })}>
                            <ImageIcon size={14} /> Add Image
                          </button>
                          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', flex: 1 }} onClick={() => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: [...(q.shapes||[]), { type: 'circle', width: 10, color: '#000000', rotation: 0, align: 'center' }] })}>
                            <Shapes size={14} /> Add Shape
                          </button>
                        </div>
                        
                        {/* Attached Images */}
                        {(q.images || []).map((img, iIdx) => (
                          <div key={img-} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Image {iIdx + 1}</span>
                              <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => {
                                const newImages = [...q.images!]; newImages.splice(iIdx, 1);
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: newImages });
                              }}><Trash2 size={12} /></button>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ flex: '1 1 100%' }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Select Local Image</label>
                                <input type="file" accept="image/*" style={{ fontSize: '11px', width: '100%' }} onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const newImages = [...q.images!]; newImages[iIdx].url = ev.target?.result as string;
                                      updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: newImages });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Width (%)</label>
                                <input type="number" min="5" max="100" className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={img.width || 10} onChange={e => {
                                  const newImages = [...q.images!]; newImages[iIdx].width = parseInt(e.target.value) || 10;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: newImages });
                                }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Align</label>
                                <select className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={img.align || 'center'} onChange={e => {
                                  const newImages = [...q.images!]; newImages[iIdx].align = e.target.value as any;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: newImages });
                                }}>
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Border Width (px)</label>
                                <input type="number" min="0" max="20" className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={img.borderWidth || 0} onChange={e => {
                                  const newImages = [...q.images!]; newImages[iIdx].borderWidth = parseInt(e.target.value) || 0;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: newImages });
                                }} />
                              </div>
                              <div>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Border Color</label>
                                <input type="color" value={img.borderColor || '#000000'} onChange={e => {
                                  const newImages = [...q.images!]; newImages[iIdx].borderColor = e.target.value;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: newImages });
                                }} style={{ width: '40px', height: '26px', padding: 0, border: 'none', cursor: 'pointer', display: 'block' }} />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Attached Shapes */}
                        {(q.shapes || []).map((shape, sIdx) => (
                          <div key={shape-} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Shape {sIdx + 1}</span>
                              <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => {
                                const newShapes = [...q.shapes!]; newShapes.splice(sIdx, 1);
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: newShapes });
                              }}><Trash2 size={12} /></button>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Type</label>
                                <select className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={shape.type} onChange={e => {
                                  const newShapes = [...q.shapes!]; newShapes[sIdx].type = e.target.value;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: newShapes });
                                }}>
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
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Width (%)</label>
                                <input type="number" min="1" max="100" className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={shape.width || 10} onChange={e => {
                                  const newShapes = [...q.shapes!]; newShapes[sIdx].width = parseInt(e.target.value) || 10;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: newShapes });
                                }} />
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Align</label>
                                <select className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={shape.align || 'center'} onChange={e => {
                                  const newShapes = [...q.shapes!]; newShapes[sIdx].align = e.target.value as any;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: newShapes });
                                }}>
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Color</label>
                                <input type="color" value={shape.color || '#000000'} onChange={e => {
                                  const newShapes = [...q.shapes!]; newShapes[sIdx].color = e.target.value;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: newShapes });
                                }} style={{ width: '100%', height: '26px', padding: 0, border: 'none', cursor: 'pointer', display: 'block' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#64748b' }}>Angle</label>
                                <input type="number" min="0" max="360" className="glass-input" style={{ marginBottom: 0, padding: '4px 8px', fontSize: '11px' }} value={shape.rotation || 0} onChange={e => {
                                  const newShapes = [...q.shapes!]; newShapes[sIdx].rotation = parseInt(e.target.value) || 0;
                                  updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: newShapes });
                                }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Advanced Tables (Replacing Old Blocks) */}
                      <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <label className="input-label">Advanced Table</label>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', width: '100%' }} onClick={() => addBlockToQuestion(selectedItem.sIdx, selectedItem.qIdx!, 'table')}>
                          <Grid size={14} /> Add Advanced Table
                        </button>
                      </div>'''

code = code.replace(old_attach, new_attach)

with open('src/components/LivePaperBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Replaced Extra Elements block")
