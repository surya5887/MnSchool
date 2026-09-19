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
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      
      {/* Font Previews for Dropdown */}
      <style dangerouslySetInnerHTML={{ __html: "@import url('https://fonts.googleapis.com/css2?family=Roboto&text=Robotoa'); @import url('https://fonts.googleapis.com/css2?family=Open+Sans&text=OpenSansa'); @import url('https://fonts.googleapis.com/css2?family=Lato&text=Latoa'); @import url('https://fonts.googleapis.com/css2?family=Montserrat&text=Montserrata'); @import url('https://fonts.googleapis.com/css2?family=Oswald&text=Oswalda'); @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro&text=SourceSansProa'); @import url('https://fonts.googleapis.com/css2?family=Slabo+27px&text=Slabo27pxa'); @import url('https://fonts.googleapis.com/css2?family=Raleway&text=Ralewaya'); @import url('https://fonts.googleapis.com/css2?family=PT+Sans&text=PTSansa'); @import url('https://fonts.googleapis.com/css2?family=Merriweather&text=Merriweathera'); @import url('https://fonts.googleapis.com/css2?family=Noto+Sans&text=NotoSansa'); @import url('https://fonts.googleapis.com/css2?family=Nunito&text=Nunitoa'); @import url('https://fonts.googleapis.com/css2?family=Concert+One&text=ConcertOnea'); @import url('https://fonts.googleapis.com/css2?family=Playfair+Display&text=PlayfairDisplaya'); @import url('https://fonts.googleapis.com/css2?family=Rubik&text=Rubika'); @import url('https://fonts.googleapis.com/css2?family=Lora&text=Loraa'); @import url('https://fonts.googleapis.com/css2?family=Ubuntu&text=Ubuntua'); @import url('https://fonts.googleapis.com/css2?family=Work+Sans&text=WorkSansa'); @import url('https://fonts.googleapis.com/css2?family=Fira+Sans&text=FiraSansa'); @import url('https://fonts.googleapis.com/css2?family=Quicksand&text=Quicksanda'); @import url('https://fonts.googleapis.com/css2?family=Inter&text=Intera'); @import url('https://fonts.googleapis.com/css2?family=Poppins&text=Poppinsa'); @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed&text=RobotoCondenseda'); @import url('https://fonts.googleapis.com/css2?family=Karla&text=Karlaa'); @import url('https://fonts.googleapis.com/css2?family=Inconsolata&text=Inconsolataa'); @import url('https://fonts.googleapis.com/css2?family=Bitter&text=Bittera'); @import url('https://fonts.googleapis.com/css2?family=Pacifico&text=Pacificoa'); @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&text=DancingScripta'); @import url('https://fonts.googleapis.com/css2?family=Caveat&text=Caveata'); @import url('https://fonts.googleapis.com/css2?family=Righteous&text=Righteousa'); @import url('https://fonts.googleapis.com/css2?family=Creepster&text=Creepstera'); @import url('https://fonts.googleapis.com/css2?family=Lobster&text=Lobstera'); @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&text=FredokaOnea'); @import url('https://fonts.googleapis.com/css2?family=Comfortaa&text=Comfortaaa'); @import url('https://fonts.googleapis.com/css2?family=Shadows+Into+Light&text=ShadowsIntoLighta'); @import url('https://fonts.googleapis.com/css2?family=Cinzel&text=Cinzela'); @import url('https://fonts.googleapis.com/css2?family=Amatic+SC&text=AmaticSCa'); @import url('https://fonts.googleapis.com/css2?family=Bangers&text=Bangersa'); @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&text=PermanentMarkera'); @import url('https://fonts.googleapis.com/css2?family=Courgette&text=Courgettea'); @import url('https://fonts.googleapis.com/css2?family=Satisfy&text=Satisfya'); @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&text=AlfaSlabOnea'); @import url('https://fonts.googleapis.com/css2?family=Cookie&text=Cookiea'); @import url('https://fonts.googleapis.com/css2?family=Chewy&text=Chewya'); @import url('https://fonts.googleapis.com/css2?family=Bree+Serif&text=BreeSerifa'); " }} />
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
                            <option value="Arial" style={{ fontFamily: "Arial, sans-serif" }}>Arial</option>
                            <option value="Helvetica" style={{ fontFamily: "Helvetica, sans-serif" }}>Helvetica</option>
                            <option value="Times New Roman" style={{ fontFamily: "Times New Roman, sans-serif" }}>Times New Roman</option>
                            <option value="Courier New" style={{ fontFamily: "Courier New, sans-serif" }}>Courier New</option>
                            <option value="Verdana" style={{ fontFamily: "Verdana, sans-serif" }}>Verdana</option>
                            <option value="Georgia" style={{ fontFamily: "Georgia, sans-serif" }}>Georgia</option>
                            <option value="Palatino" style={{ fontFamily: "Palatino, sans-serif" }}>Palatino</option>
                            <option value="Garamond" style={{ fontFamily: "Garamond, sans-serif" }}>Garamond</option>
                            <option value="Bookman" style={{ fontFamily: "Bookman, sans-serif" }}>Bookman</option>
                            <option value="Comic Sans MS" style={{ fontFamily: "Comic Sans MS, sans-serif" }}>Comic Sans MS</option>
                            <option value="Trebuchet MS" style={{ fontFamily: "Trebuchet MS, sans-serif" }}>Trebuchet MS</option>
                            <option value="Arial Black" style={{ fontFamily: "Arial Black, sans-serif" }}>Arial Black</option>
                            <option value="Impact" style={{ fontFamily: "Impact, sans-serif" }}>Impact</option>
                            <option value="Roboto" style={{ fontFamily: "Roboto, sans-serif" }}>Roboto</option>
                            <option value="Open Sans" style={{ fontFamily: "Open Sans, sans-serif" }}>Open Sans</option>
                            <option value="Lato" style={{ fontFamily: "Lato, sans-serif" }}>Lato</option>
                            <option value="Montserrat" style={{ fontFamily: "Montserrat, sans-serif" }}>Montserrat</option>
                            <option value="Oswald" style={{ fontFamily: "Oswald, sans-serif" }}>Oswald</option>
                            <option value="Source Sans Pro" style={{ fontFamily: "Source Sans Pro, sans-serif" }}>Source Sans Pro</option>
                            <option value="Slabo 27px" style={{ fontFamily: "Slabo 27px, sans-serif" }}>Slabo 27px</option>
                            <option value="Raleway" style={{ fontFamily: "Raleway, sans-serif" }}>Raleway</option>
                            <option value="PT Sans" style={{ fontFamily: "PT Sans, sans-serif" }}>PT Sans</option>
                            <option value="Merriweather" style={{ fontFamily: "Merriweather, sans-serif" }}>Merriweather</option>
                            <option value="Noto Sans" style={{ fontFamily: "Noto Sans, sans-serif" }}>Noto Sans</option>
                            <option value="Nunito" style={{ fontFamily: "Nunito, sans-serif" }}>Nunito</option>
                            <option value="Concert One" style={{ fontFamily: "Concert One, sans-serif" }}>Concert One</option>
                            <option value="Playfair Display" style={{ fontFamily: "Playfair Display, sans-serif" }}>Playfair Display</option>
                            <option value="Rubik" style={{ fontFamily: "Rubik, sans-serif" }}>Rubik</option>
                            <option value="Lora" style={{ fontFamily: "Lora, sans-serif" }}>Lora</option>
                            <option value="Ubuntu" style={{ fontFamily: "Ubuntu, sans-serif" }}>Ubuntu</option>
                            <option value="Work Sans" style={{ fontFamily: "Work Sans, sans-serif" }}>Work Sans</option>
                            <option value="Fira Sans" style={{ fontFamily: "Fira Sans, sans-serif" }}>Fira Sans</option>
                            <option value="Quicksand" style={{ fontFamily: "Quicksand, sans-serif" }}>Quicksand</option>
                            <option value="Inter" style={{ fontFamily: "Inter, sans-serif" }}>Inter</option>
                            <option value="Poppins" style={{ fontFamily: "Poppins, sans-serif" }}>Poppins</option>
                            <option value="Roboto Condensed" style={{ fontFamily: "Roboto Condensed, sans-serif" }}>Roboto Condensed</option>
                            <option value="Karla" style={{ fontFamily: "Karla, sans-serif" }}>Karla</option>
                            <option value="Inconsolata" style={{ fontFamily: "Inconsolata, sans-serif" }}>Inconsolata</option>
                            <option value="Bitter" style={{ fontFamily: "Bitter, sans-serif" }}>Bitter</option>
                            <option value="Pacifico" style={{ fontFamily: "Pacifico, sans-serif" }}>Pacifico</option>
                            <option value="Dancing Script" style={{ fontFamily: "Dancing Script, sans-serif" }}>Dancing Script</option>
                            <option value="Caveat" style={{ fontFamily: "Caveat, sans-serif" }}>Caveat</option>
                            <option value="Righteous" style={{ fontFamily: "Righteous, sans-serif" }}>Righteous</option>
                            <option value="Creepster" style={{ fontFamily: "Creepster, sans-serif" }}>Creepster</option>
                            <option value="Lobster" style={{ fontFamily: "Lobster, sans-serif" }}>Lobster</option>
                            <option value="Fredoka One" style={{ fontFamily: "Fredoka One, sans-serif" }}>Fredoka One</option>
                            <option value="Comfortaa" style={{ fontFamily: "Comfortaa, sans-serif" }}>Comfortaa</option>
                            <option value="Shadows Into Light" style={{ fontFamily: "Shadows Into Light, sans-serif" }}>Shadows Into Light</option>
                            <option value="Cinzel" style={{ fontFamily: "Cinzel, sans-serif" }}>Cinzel</option>
                            <option value="Amatic SC" style={{ fontFamily: "Amatic SC, sans-serif" }}>Amatic SC</option>
                            <option value="Bangers" style={{ fontFamily: "Bangers, sans-serif" }}>Bangers</option>
                            <option value="Permanent Marker" style={{ fontFamily: "Permanent Marker, sans-serif" }}>Permanent Marker</option>
                            <option value="Courgette" style={{ fontFamily: "Courgette, sans-serif" }}>Courgette</option>
                            <option value="Satisfy" style={{ fontFamily: "Satisfy, sans-serif" }}>Satisfy</option>
                            <option value="Alfa Slab One" style={{ fontFamily: "Alfa Slab One, sans-serif" }}>Alfa Slab One</option>
                            <option value="Cookie" style={{ fontFamily: "Cookie, sans-serif" }}>Cookie</option>
                            <option value="Chewy" style={{ fontFamily: "Chewy, sans-serif" }}>Chewy</option>
                            <option value="Bree Serif" style={{ fontFamily: "Bree Serif, sans-serif" }}>Bree Serif</option>
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
