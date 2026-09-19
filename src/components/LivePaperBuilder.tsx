import React, { useState } from 'react';
import { Plus, Settings, X, Trash2, Image as ImageIcon, LayoutTemplate, Grid, Shapes, Square, Lightbulb } from 'lucide-react';
import type { QuestionPaperData } from '../services/examService';
import QuestionPaperPrintView from './QuestionPaperPrintView';
import RichTextEditor from './RichTextEditor';
import BlockCanvas from './BlockCanvas/BlockCanvas';

interface Props {
  paperData: QuestionPaperData;
  setPaperData: (data: QuestionPaperData) => void;
}

const LivePaperBuilder: React.FC<Props> = ({ paperData, setPaperData }) => {
  const [selectedItem, setSelectedItem] = useState<{ type: 'section' | 'question', sIdx: number, qIdx?: number } | null>(null);

  // Quick add helpers
  const addQuestion = (type: string) => {
    const newSecs = [...(paperData.sections || [])];
    if (newSecs.length === 0) {
      newSecs.push({ sectionTitle: 'SECTION A', questions: [] });
    }
    const sIdx = newSecs.length - 1;
    newSecs[sIdx].questions.push({ text: 'New Question', marks: 1, type: type as any });
    setPaperData({ ...paperData, sections: newSecs });
    setSelectedItem({ type: 'question', sIdx, qIdx: newSecs[sIdx].questions.length - 1 });
  };

  const addSection = () => {
    const newSecs = [...(paperData.sections || [])];
    newSecs.push({ sectionTitle: 'NEW SECTION', questions: [] });
    setPaperData({ ...paperData, sections: newSecs });
    setSelectedItem({ type: 'section', sIdx: newSecs.length - 1 });
  };

  const updateQuestion = (sIdx: number, qIdx: number, updates: any) => {
    const newSecs = [...paperData.sections];
    newSecs[sIdx].questions[qIdx] = { ...newSecs[sIdx].questions[qIdx], ...updates };
    setPaperData({ ...paperData, sections: newSecs });
  };

  const updateSection = (sIdx: number, title: string) => {
    const newSecs = [...paperData.sections];
    newSecs[sIdx].sectionTitle = title;
    setPaperData({ ...paperData, sections: newSecs });
  };

  const addBlockToQuestion = (sIdx: number, qIdx: number, type: string) => {
    const newSecs = [...paperData.sections];
    if (!newSecs[sIdx].questions[qIdx].blocks) newSecs[sIdx].questions[qIdx].blocks = [];
    
    const newBlock: any = { id: Math.random().toString(36).substring(7), type };
    if (type === 'table') {
      newBlock.rows = 3; newBlock.cols = 3; newBlock.cells = [];
      for (let r=0; r<3; r++) for(let c=0; c<3; c++) newBlock.cells.push({rowIndex:r, colIndex:c, content:''});
    } else if (type === 'split_column') {
      newBlock.leftContent = ''; newBlock.rightContent = ''; newBlock.splitRatio = '50-50';
    }
    newSecs[sIdx].questions[qIdx].blocks!.push(newBlock);
    setPaperData({ ...paperData, sections: newSecs });
  };

  // We will build a highly interactive canvas
  // For now, we can render a custom interactive view, because QuestionPaperPrintView is strictly for printing
  // and doesn't accept onClick handlers on inner elements.

  return (
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
      </div>

      {/* RIGHT SIDEBAR: Property Inspector */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 100, boxShadow: selectedItem ? '-10px 0 30px rgba(0,0,0,0.1)' : 'none', width: selectedItem ? '400px' : '0px', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>
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
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Font Style</label>
                          <select className="glass-input" style={{ marginBottom: 0, background: 'white', fontFamily: q.fontFamily || 'inherit' }} value={q.fontFamily || ''} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { fontFamily: e.target.value })}>
                            <option value="">Default Font</option>
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Palatino">Palatino</option>
                            <option value="Garamond">Garamond</option>
                            <option value="Bookman">Bookman</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                            <option value="Trebuchet MS">Trebuchet MS</option>
                            <option value="Arial Black">Arial Black</option>
                            <option value="Impact">Impact</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Oswald">Oswald</option>
                            <option value="Source Sans Pro">Source Sans Pro</option>
                            <option value="Slabo 27px">Slabo 27px</option>
                            <option value="Raleway">Raleway</option>
                            <option value="PT Sans">PT Sans</option>
                            <option value="Merriweather">Merriweather</option>
                            <option value="Noto Sans">Noto Sans</option>
                            <option value="Nunito">Nunito</option>
                            <option value="Concert One">Concert One</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Rubik">Rubik</option>
                            <option value="Lora">Lora</option>
                            <option value="Ubuntu">Ubuntu</option>
                            <option value="Work Sans">Work Sans</option>
                            <option value="Fira Sans">Fira Sans</option>
                            <option value="Quicksand">Quicksand</option>
                            <option value="Inter">Inter</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Roboto Condensed">Roboto Condensed</option>
                            <option value="Karla">Karla</option>
                            <option value="Inconsolata">Inconsolata</option>
                            <option value="Bitter">Bitter</option>
                            <option value="Pacifico">Pacifico</option>
                            <option value="Dancing Script">Dancing Script</option>
                            <option value="Caveat">Caveat</option>
                            <option value="Righteous">Righteous</option>
                            <option value="Creepster">Creepster</option>
                            <option value="Lobster">Lobster</option>
                            <option value="Fredoka One">Fredoka One</option>
                            <option value="Comfortaa">Comfortaa</option>
                            <option value="Shadows Into Light">Shadows Into Light</option>
                            <option value="Cinzel">Cinzel</option>
                            <option value="Amatic SC">Amatic SC</option>
                            <option value="Bangers">Bangers</option>
                            <option value="Permanent Marker">Permanent Marker</option>
                            <option value="Courgette">Courgette</option>
                            <option value="Satisfy">Satisfy</option>
                            <option value="Alfa Slab One">Alfa Slab One</option>
                            <option value="Cookie">Cookie</option>
                            <option value="Chewy">Chewy</option>
                            <option value="Bree Serif">Bree Serif</option>
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
