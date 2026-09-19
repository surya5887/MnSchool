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
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: '24px', position: 'relative' }}>
      {/* Live Canvas Area */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#e2e8f0', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '850px', background: 'white', minHeight: '1100px', padding: '64px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '4px', position: 'relative' }}>
          
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
                onClick={() => setSelectedItem({ type: 'section', sIdx })}
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  textDecoration: 'underline', 
                  marginBottom: '16px',
                  padding: '8px',
                  cursor: 'pointer',
                  border: selectedItem?.type === 'section' && selectedItem.sIdx === sIdx ? '2px dashed var(--primary-color)' : '2px solid transparent',
                  background: selectedItem?.type === 'section' && selectedItem.sIdx === sIdx ? '#f0f9ff' : 'transparent',
                  borderRadius: '4px'
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
                      border: isSelected ? '2px dashed var(--primary-color)' : '2px solid transparent',
                      background: isSelected ? '#f0f9ff' : 'transparent',
                      borderRadius: '8px',
                      position: 'relative'
                    }}
                  >
                    {q.type !== 'instruction' && (
                      <div style={{ fontWeight: 'bold', minWidth: '30px' }}>Q{globalQuestionIndex + 1}.</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div dangerouslySetInnerHTML={{ __html: q.text || '<span style="color:#9ca3af">Click to add text...</span>' }} />
                      
                      {/* Read-only previews of elements to show it's WYSIWYG */}
                      {q.type === 'true_false' && (
                        <div style={{ display: 'flex', gap: '32px', marginTop: '12px', opacity: 0.7 }}>
                          <span>[ ] True</span>
                          <span>[ ] False</span>
                        </div>
                      )}
                      
                      {q.blocks && q.blocks.length > 0 && (
                        <div style={{ marginTop: '12px', padding: '8px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px', fontSize: '12px', color: '#64748b' }}>
                          [ {q.blocks.length} Advanced Block(s) Attached ]
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
          
          <div style={{ height: '200px' }}></div> {/* Pad bottom */}
        </div>
      </div>

      {/* Right Sidebar (Property Inspector) */}
      {selectedItem && (
        <div style={{ width: '400px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              {selectedItem.type === 'section' ? 'Edit Section' : 'Edit Question'}
            </h3>
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
                
                <button className="btn-danger" style={{ width: '100%', marginTop: '24px' }} onClick={() => {
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
                  
                  {/* Word-like Formatting Area */}
                  <div>
                    <label className="input-label">Question Text (Format like MS Word)</label>
                    <RichTextEditor 
                      value={q.text} 
                      onChange={(html) => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { text: html })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="input-label">Type</label>
                      <select className="glass-input" value={q.type || 'subjective'} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { type: e.target.value })}>
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
                        <label className="input-label">Marks</label>
                        <input type="number" className="glass-input" value={q.marks} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { marks: parseInt(e.target.value) || 0 })} />
                      </div>
                    )}
                  </div>

                  {/* Add Elements */}
                  <div>
                    <label className="input-label">Attach Elements to this Question</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { images: [...(q.images||[]), { url: '' }] })}>
                        <ImageIcon size={14} /> Image
                      </button>
                      <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { shapes: [...(q.shapes||[]), { type: 'circle', color: '#000' }] })}>
                        <Shapes size={14} /> Shape
                      </button>
                      <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => addBlockToQuestion(selectedItem.sIdx, selectedItem.qIdx!, 'table')}>
                        <Grid size={14} /> Table/Grid
                      </button>
                      <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '12px' }} onClick={() => addBlockToQuestion(selectedItem.sIdx, selectedItem.qIdx!, 'split_column')}>
                        <LayoutTemplate size={14} /> Split Cols
                      </button>
                    </div>
                  </div>

                  {/* Render Editor for Attached Blocks */}
                  {q.blocks && q.blocks.length > 0 && (
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                      <label className="input-label">Edit Attached Blocks</label>
                      <BlockCanvas hideToolbar={true} blocks={q.blocks} onChange={(newBlocks) => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { blocks: newBlocks as any })} />
                    </div>
                  )}

                  <button className="btn-danger" style={{ width: '100%', marginTop: 'auto' }} onClick={() => {
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

      {/* Global Bottom Toolbox */}
      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '12px 24px', borderRadius: '100px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', gap: '16px', border: '1px solid #e2e8f0', zIndex: 100 }}>
        <button className="btn-primary" style={{ borderRadius: '100px', padding: '8px 20px' }} onClick={addSection}>
          <Plus size={18} /> Section
        </button>
        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 8px' }}></div>
        <button className="btn-secondary" style={{ borderRadius: '100px', padding: '8px 20px' }} onClick={() => addQuestion('subjective')}>
          + Subjective Q
        </button>
        <button className="btn-secondary" style={{ borderRadius: '100px', padding: '8px 20px' }} onClick={() => addQuestion('objective')}>
          + MCQ
        </button>
        <button className="btn-secondary" style={{ borderRadius: '100px', padding: '8px 20px' }} onClick={() => addQuestion('true_false')}>
          + True/False
        </button>
        <button className="btn-secondary" style={{ borderRadius: '100px', padding: '8px 20px' }} onClick={() => addQuestion('instruction')}>
          + Instruction
        </button>
      </div>

    </div>
  );
};

export default LivePaperBuilder;
