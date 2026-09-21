import React, { useState } from 'react';
import { Plus, Settings, X, Trash2, Image as ImageIcon, LayoutTemplate, Grid, Shapes, Square, Lightbulb } from 'lucide-react';
import type { QuestionPaperData } from '../services/examService';
import QuestionPaperPrintView from './QuestionPaperPrintView';
import RichTextEditor from './RichTextEditor';
import BlockCanvas from './BlockCanvas/BlockCanvas';

export const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial', style: 'Arial, sans-serif' },
  { value: 'Helvetica', label: 'Helvetica', style: 'Helvetica, sans-serif' },
  { value: 'Times New Roman', label: 'Times New Roman', style: 'Times New Roman, sans-serif' },
  { value: 'Courier New', label: 'Courier New', style: 'Courier New, sans-serif' },
  { value: 'Verdana', label: 'Verdana', style: 'Verdana, sans-serif' },
  { value: 'Georgia', label: 'Georgia', style: 'Georgia, sans-serif' },
  { value: 'Palatino', label: 'Palatino', style: 'Palatino, sans-serif' },
  { value: 'Garamond', label: 'Garamond', style: 'Garamond, sans-serif' },
  { value: 'Bookman', label: 'Bookman', style: 'Bookman, sans-serif' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS', style: 'Comic Sans MS, sans-serif' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS', style: 'Trebuchet MS, sans-serif' },
  { value: 'Arial Black', label: 'Arial Black', style: 'Arial Black, sans-serif' },
  { value: 'Impact', label: 'Impact', style: 'Impact, sans-serif' },
  { value: 'Roboto', label: 'Roboto', style: 'Roboto, sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', style: 'Open Sans, sans-serif' },
  { value: 'Lato', label: 'Lato', style: 'Lato, sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', style: 'Montserrat, sans-serif' },
  { value: 'Oswald', label: 'Oswald', style: 'Oswald, sans-serif' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', style: 'Source Sans Pro, sans-serif' },
  { value: 'Slabo 27px', label: 'Slabo 27px', style: 'Slabo 27px, sans-serif' },
  { value: 'Raleway', label: 'Raleway', style: 'Raleway, sans-serif' },
  { value: 'PT Sans', label: 'PT Sans', style: 'PT Sans, sans-serif' },
  { value: 'Merriweather', label: 'Merriweather', style: 'Merriweather, sans-serif' },
  { value: 'Noto Sans', label: 'Noto Sans', style: 'Noto Sans, sans-serif' },
  { value: 'Nunito', label: 'Nunito', style: 'Nunito, sans-serif' },
  { value: 'Playfair Display', label: 'Playfair Display', style: 'Playfair Display, serif' },
  { value: 'Ubuntu', label: 'Ubuntu', style: 'Ubuntu, sans-serif' },
  { value: 'Rubik', label: 'Rubik', style: 'Rubik, sans-serif' },
  { value: 'Work Sans', label: 'Work Sans', style: 'Work Sans, sans-serif' },
  { value: 'Fira Sans', label: 'Fira Sans', style: 'Fira Sans, sans-serif' },
  { value: 'Quicksand', label: 'Quicksand', style: 'Quicksand, sans-serif' },
  { value: 'Titillium Web', label: 'Titillium Web', style: 'Titillium Web, sans-serif' },
  { value: 'Oxygen', label: 'Oxygen', style: 'Oxygen, sans-serif' },
  { value: 'Dosis', label: 'Dosis', style: 'Dosis, sans-serif' },
  { value: 'Cabin', label: 'Cabin', style: 'Cabin, sans-serif' },
  { value: 'Arimo', label: 'Arimo', style: 'Arimo, sans-serif' },
  { value: 'Anton', label: 'Anton', style: 'Anton, sans-serif' },
  { value: 'Josefin Sans', label: 'Josefin Sans', style: 'Josefin Sans, sans-serif' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', style: 'Libre Baskerville, serif' },
  { value: 'Lobster', label: 'Lobster', style: 'Lobster, cursive' },
  { value: 'Pacifico', label: 'Pacifico', style: 'Pacifico, cursive' },
  { value: 'Dancing Script', label: 'Dancing Script', style: 'Dancing Script, cursive' },
  { value: 'Indie Flower', label: 'Indie Flower', style: 'Indie Flower, cursive' },
  { value: 'Caveat', label: 'Caveat', style: 'Caveat, cursive' },
  { value: 'Shadows Into Light', label: 'Shadows Into Light', style: 'Shadows Into Light, cursive' },
  { value: 'Righteous', label: 'Righteous', style: 'Righteous, cursive' },
  { value: 'Fredoka One', label: 'Fredoka One', style: 'Fredoka One, cursive' },
  { value: 'Bree Serif', label: 'Bree Serif', style: 'Bree Serif, sans-serif' }
];

export const FontSelectOptions = () => (
  <>
    <option value="">Default Font</option>
    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.style }}>{f.label}</option>)}
  </>
);

interface Props {
  paperData: QuestionPaperData;
  setPaperData: (data: QuestionPaperData) => void;
}

const LivePaperBuilder: React.FC<Props> = ({ paperData, setPaperData }) => {
  const [selectedItem, setSelectedItem] = useState<{ type: 'section' | 'question' | 'endText', sIdx?: number, qIdx?: number } | null>(null);

  // Quick add helpers
  const addQuestion = (type: string) => {
    const newSecs = [...(paperData.sections || [])];
    if (newSecs.length === 0) {
      newSecs.push({ sectionTitle: 'SECTION A', questions: [] });
    }
    const sIdx = newSecs.length - 1;
    const newQuestion: any = { text: 'New Question', marks: 1, type: type as any };
    if (type === 'objective') {
      newQuestion.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    if (type === 'true_false') {
      newQuestion.text = 'State True (✔) or False (✖) for the following:<br/><br/>New Question';
      newQuestion.trueLabel = 'True';
      newQuestion.falseLabel = 'False';
      newQuestion.tfStyle = 'checkbox';
    }
    if (type === 'fill_in_the_blanks') {
      newQuestion.text = 'Fill in the blanks with the correct words:';
      newQuestion.wordBank = [];
      newQuestion.fibStatements = ['New Statement __________________ .'];
    }
    newSecs[sIdx].questions.push(newQuestion);
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
        <div style={{ width: '100%', maxWidth: '850px', position: 'relative' }}>
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
            <button className="btn-secondary" style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '20px' }} onClick={() => setSelectedItem({ type: 'endText', sIdx: -1 })}>
              <Settings size={14} style={{ color: '#64748b' }} /> Footer Text
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
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 100, boxShadow: selectedItem ? '-10px 0 30px rgba(0,0,0,0.1)' : 'none', width: selectedItem ? '100%' : '0px', maxWidth: '400px', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>
        {selectedItem && (
          <div style={{ width: '100%', minWidth: '300px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} style={{ color: '#64748b' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                  {selectedItem.type === 'section' ? 'Section Inspector' : selectedItem.type === 'endText' ? 'Footer Inspector' : 'Question Inspector'}
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
                    value={paperData.sections[selectedItem.sIdx!].sectionTitle}
                    onChange={(e) => updateSection(selectedItem.sIdx!, e.target.value)}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div>
                      <label className="input-label">Font Family</label>
                      <select 
                        className="glass-input" 
                        value={paperData.sections[selectedItem.sIdx!].sectionFontFamily || ''}
                        onChange={(e) => {
                          const newSecs = [...paperData.sections];
                          newSecs[selectedItem.sIdx!].sectionFontFamily = e.target.value;
                          setPaperData({ ...paperData, sections: newSecs });
                        }}
                      >
                        <FontSelectOptions />
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Font Size</label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        placeholder="e.g. 16px"
                        value={paperData.sections[selectedItem.sIdx!].sectionFontSize || ''}
                        onChange={(e) => {
                          const newSecs = [...paperData.sections];
                          newSecs[selectedItem.sIdx!].sectionFontSize = e.target.value;
                          setPaperData({ ...paperData, sections: newSecs });
                        }}
                      />
                    </div>
                  </div>
                  
                  <button className="btn-danger" style={{ width: '100%', marginTop: '32px' }} onClick={() => {
                    const newSecs = [...paperData.sections];
                    newSecs.splice(selectedItem.sIdx!, 1);
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
                              <FontSelectOptions />
                          </select>
                        </div>
                        <div style={{ width: '80px' }}>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Font Size</label>
                          <input className="glass-input" style={{ marginBottom: 0, background: 'white' }} placeholder="16px" value={q.fontSize || ''} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { fontSize: e.target.value })} />
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

                                                            {q.type === 'objective' && (
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
                    {q.type === 'true_false' && (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                        <label className="input-label">True/False Properties</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>True Label</label>
                            <input type="text" className="glass-input" style={{ marginBottom: 0 }} value={q.trueLabel !== undefined ? q.trueLabel : 'True'} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { trueLabel: e.target.value })} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>False Label</label>
                            <input type="text" className="glass-input" style={{ marginBottom: 0 }} value={q.falseLabel !== undefined ? q.falseLabel : 'False'} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { falseLabel: e.target.value })} />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>Style</label>
                            <select className="glass-input" style={{ marginBottom: 0, width: '100%' }} value={q.tfStyle || 'checkbox'} onChange={e => updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { tfStyle: e.target.value as any })}>
                              <option value="checkbox">Square Box</option>
                              <option value="checkbox_only">Square Box (No Text)</option>
                              <option value="circle">Circle (Radio)</option>
                              <option value="circle_only">Circle (No Text)</option>
                              <option value="none">Text Only</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Statements (Lines)</span>
                            <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => {
                              const newStatements = [...(q.tfStatements || []), 'New Statement'];
                              updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { tfStatements: newStatements });
                            }}>+ Add Line</button>
                          </label>
                          {(q.tfStatements || []).map((stmt, stmtIdx) => (
                            <div key={stmtIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 'bold', width: '20px', paddingTop: '6px', fontSize: '12px' }}>{stmtIdx+1}.</span>
                              <input type="text" className="glass-input" style={{ marginBottom: 0, flex: 1 }} placeholder="Statement Text" value={stmt} onChange={e => {
                                const newStatements = [...q.tfStatements!]; newStatements[stmtIdx] = e.target.value;
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { tfStatements: newStatements });
                              }} />
                              <button className="btn-danger" style={{ padding: '8px' }} onClick={() => {
                                const newStatements = [...q.tfStatements!]; newStatements.splice(stmtIdx, 1);
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { tfStatements: newStatements });
                              }}><Trash2 size={14} /></button>
                            </div>
                          ))}
                          {(!q.tfStatements || q.tfStatements.length === 0) && (
                            <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No lines added. A single True/False block will appear below the question text.</p>
                          )}
                        </div>
                      </div>
                    )}
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

                    {q.type === 'fill_in_the_blanks' && (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                        <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Word Bank (Help Box)</span>
                          <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => {
                            const newBank = q.wordBank ? [...q.wordBank, 'new_word'] : ['new_word'];
                            updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { wordBank: newBank });
                          }}>+ Add Word</button>
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                          {q.wordBank && q.wordBank.map((word, wIdx) => (
                            <div key={wIdx} style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px 2px 8px' }}>
                              <input type="text" value={word} onChange={e => {
                                const newBank = [...q.wordBank!]; newBank[wIdx] = e.target.value;
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { wordBank: newBank });
                              }} style={{ border: 'none', background: 'transparent', outline: 'none', width: '60px', fontSize: '12px' }} />
                              <button className="icon-btn" style={{ padding: '2px', color: 'var(--danger)' }} onClick={() => {
                                const newBank = [...q.wordBank!]; newBank.splice(wIdx, 1);
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { wordBank: newBank.length > 0 ? newBank : undefined });
                              }}><X size={12} /></button>
                            </div>
                          ))}
                          {(!q.wordBank || q.wordBank.length === 0) && (
                            <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No words added. Word bank will be hidden.</p>
                          )}
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Blanks (Lines)</span>
                            <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => {
                              const newStatements = [...(q.fibStatements || []), 'New Statement __________________ .'];
                              updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { fibStatements: newStatements });
                            }}>+ Add Line</button>
                          </label>
                          {(q.fibStatements || []).map((stmt, stmtIdx) => (
                            <div key={stmtIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 'bold', width: '20px', paddingTop: '6px', fontSize: '12px' }}>{stmtIdx+1}.</span>
                              <input type="text" className="glass-input" style={{ marginBottom: 0, flex: 1 }} placeholder="Statement Text" value={stmt} onChange={e => {
                                const newStatements = [...q.fibStatements!]; newStatements[stmtIdx] = e.target.value;
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { fibStatements: newStatements });
                              }} />
                              <button className="btn-danger" style={{ padding: '8px' }} onClick={() => {
                                const newStatements = [...q.fibStatements!]; newStatements.splice(stmtIdx, 1);
                                updateQuestion(selectedItem.sIdx, selectedItem.qIdx!, { fibStatements: newStatements });
                              }}><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attach Images & Shapes */}
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
                        <div key={`img-${iIdx}`} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
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
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                              <label style={{ fontSize: '10px', color: '#64748b' }}>Border (px)</label>
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
                        <div key={`shape-${sIdx}`} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
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

                      {/* Advanced Tables (Replacing Old Blocks) */}
                      <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <label className="input-label">Advanced Table</label>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', width: '100%' }} onClick={() => addBlockToQuestion(selectedItem.sIdx, selectedItem.qIdx!, 'table')}>
                          <Grid size={14} /> Add Advanced Table
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

                

                {selectedItem.type === 'endText' && (
                  <div>
                    <label className="input-label">Footer Text</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      value={paperData.endText !== undefined ? paperData.endText : '--- End of Question Paper ---'}
                      onChange={(e) => setPaperData({ ...paperData, endText: e.target.value })}
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                      <div>
                        <label className="input-label">Font Family</label>
                        <select 
                          className="glass-input" 
                          value={paperData.endTextFontFamily || ''}
                          onChange={(e) => setPaperData({ ...paperData, endTextFontFamily: e.target.value })}
                        >
                          <FontSelectOptions />
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Font Size</label>
                        <input 
                          type="text" 
                          className="glass-input" 
                          placeholder="e.g. 12px"
                          value={paperData.endTextFontSize || ''}
                          onChange={(e) => setPaperData({ ...paperData, endTextFontSize: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )};
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
export default LivePaperBuilder;
