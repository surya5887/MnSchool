import React from 'react';
import { ArrowLeft, Printer, Circle, Square, Triangle, Hexagon, Octagon, Star, Diamond, Minus } from 'lucide-react';

const renderShape = (shape: any) => {
  let Icon = Circle;
  switch (shape.type) {
    case 'circle': Icon = Circle; break;
    case 'square': Icon = Square; break;
    case 'triangle': Icon = Triangle; break;
    case 'hexagon': Icon = Hexagon; break;
    case 'octagon': Icon = Octagon; break;
    case 'star': Icon = Star; break;
    case 'diamond': Icon = Diamond; break;
    case 'line': Icon = Minus; break;
    default: Icon = Circle; break;
  }
  
  return (
    <Icon 
      style={{ 
        width: '100%', 
        height: '100%', 
        color: shape.color, 
        fill: shape.type !== 'line' ? shape.color : 'none', 
        transform: `rotate(${shape.rotation}deg) scaleX(${shape.flipX ? -1 : 1}) scaleY(${shape.flipY ? -1 : 1})`,
        display: 'block'
      }} 
      strokeWidth={1}
    />
  );
};
import type { QuestionPaperData } from '../services/examService';

interface QuestionPaperProps {
  paperData: QuestionPaperData;
  onClose: () => void;
}

const QuestionPaperPrintView: React.FC<QuestionPaperProps> = ({ paperData, onClose }) => {
  let qCounter = 1;
  return (
    <div className="print-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#e5e7eb', zIndex: 100000, overflowY: 'auto' }}>
      <div className="print-hide" style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn-secondary" onClick={onClose}>
          <ArrowLeft size={20} /> Back
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer size={20} /> Print Question Paper
        </button>
      </div>

      <style>
        {`
          @media print {
            .print-hide { display: none !important; }
            body, html { margin: 0 !important; padding: 0 !important; height: auto !important; background: white !important; }
            body * { visibility: hidden; }
            .print-wrapper { position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; background: white !important; display: block !important; }
            .print-wrapper * { visibility: visible; }
            @page { 
              margin: 15mm; 
              size: A4 portrait; 
              @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-family: Arial, sans-serif;
                font-size: 10pt;
              }
            }
            
            .paper-container {
              margin: 0 auto !important;
              padding: 40px !important;
              width: 800px !important;
              max-width: 800px !important;
              box-sizing: border-box !important;
              page-break-after: always !important;
              height: auto !important;
              min-height: 1130px !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
          
          @media screen {
            .paper-container {
              width: 800px !important;
              max-width: 800px !important;
              min-height: 1130px !important;
              height: max-content !important;
              margin: 2rem auto;
              margin-bottom: 100px !important;
              background: white;
              padding: 40px;
              padding-bottom: 80px !important;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              position: relative;
              box-sizing: border-box;
              font-family: 'Times New Roman', serif;
              font-size: 14px;
              color: #000;
              display: flex !important;
              flex-direction: column !important;
            }
          }
          
          @media screen and (max-width: 768px) {
            .print-wrapper {
              overflow-x: auto !important;
              width: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
            }
            .paper-container {
              zoom: 0.45;
              -moz-transform: scale(0.45);
              -moz-transform-origin: top center;
              margin: 1rem auto;
            }
          }
          .header-table {
            width: 100%;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .header-table td {
            padding: 4px 0;
          }
        `}
      </style>

      <div className="paper-container" style={{ fontSize: paperData.globalFontSize || '14px' }}>
        {/* School Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', textTransform: 'uppercase' }}>MN PUBLIC SCHOOL</h1>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{paperData.examTerm} (2026-27)</h2>
        </div>

        {/* Paper Details Table */}
        <table className="header-table">
          <tbody>
            <tr>
              <td style={{ textAlign: 'left', width: '33%' }}>Class: {paperData.classId} {paperData.sectionId || ''}</td>
              <td style={{ textAlign: 'center', width: '33%', fontSize: '18px', textDecoration: 'underline' }}>{paperData.subject}</td>
              <td style={{ textAlign: 'right', width: '33%' }}>Max Marks: {paperData.maxMarks}</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ textAlign: 'left', paddingTop: '10px' }}>Time Allowed: {paperData.timeAllowed}</td>
            </tr>
          </tbody>
        </table>

        <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '0 0 20px 0' }} />

        {/* General Instructions */}
        {paperData.generalInstructions && paperData.generalInstructions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>General Instructions:</div>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
              {paperData.generalInstructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections and Questions */}
        <div style={{ marginTop: '30px' }}>
          {paperData.sections.map((section, sIdx) => {
            return (
              <div key={sIdx} style={{ marginBottom: '30px' }}>
                {section.sectionTitle && (
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', margin: '20px 0', textDecoration: 'underline', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
                    {section.sectionTitle}
                  </div>
                )}
                
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {section.questions.map((q, qIdx) => {
                      if (q.type === 'instruction') {
                        return (
                          <tr key={qIdx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <td colSpan={3} style={{ padding: '12px 0', fontWeight: 'bold' }}>
                              <div dangerouslySetInnerHTML={{ __html: q.text.replace(/\n/g, '<br/>') }} />
                            </td>
                          </tr>
                        );
                      }
                      
                      const currentQNum = qCounter++;
                      const label = q.label !== undefined ? q.label : `Q${currentQNum}.`;

                      return (
                        <tr key={qIdx} style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                          <td style={{ verticalAlign: 'top', width: '60px', padding: '8px 0', fontWeight: 'bold' }}>{label}</td>
                          <td style={{ verticalAlign: 'top', padding: '8px 10px', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                            {q.type === 'passage' ? (
                              <div style={{ border: '1px solid #000', padding: '12px', borderRadius: '4px', background: '#fdfdfd', marginBottom: '12px' }}>
                                <div dangerouslySetInnerHTML={{ __html: q.text.replace(/\n/g, '<br/>') }} />
                              </div>
                            ) : (
                              <div dangerouslySetInnerHTML={{ __html: q.text.replace(/\n/g, '<br/>') }} />
                            )}
                            
                            {q.image && (
                              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                <img src={q.image} alt="" style={{ maxWidth: '100%', height: 'auto' }} />
                              </div>
                            )}

                            {((q.images && q.images.length > 0) || (q.shapes && q.shapes.length > 0)) && (
                              <div style={{ overflow: 'hidden', width: '100%', marginTop: '12px' }}>
                                {q.images?.map((img, iIdx) => {
                                  const isCenter = (!img.align || img.align === 'center');
                                  const isRight = img.align === 'right';
                                  return (
                                    <div key={`img-${iIdx}`} style={{ 
                                      float: isCenter ? 'none' : (isRight ? 'right' : 'left'),
                                      margin: isCenter ? '0 auto' : '0',
                                      width: `${img.width || 100}%`, 
                                      textAlign: isCenter ? 'center' : (isRight ? 'right' : 'left'),
                                      padding: '4px',
                                      boxSizing: 'border-box'
                                    }}>
                                      <img src={img.url} alt="" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} />
                                    </div>
                                  );
                                })}
                                {q.shapes?.map((shape, sIdx) => {
                                  const isCenter = (!shape.align || shape.align === 'center');
                                  const isRight = shape.align === 'right';
                                  return (
                                    <div key={`shape-${sIdx}`} style={{ 
                                      float: isCenter ? 'none' : (isRight ? 'right' : 'left'),
                                      margin: isCenter ? '0 auto' : '0',
                                      width: `${shape.width || 10}%`, 
                                      textAlign: isCenter ? 'center' : (isRight ? 'right' : 'left'),
                                      padding: '4px',
                                      boxSizing: 'border-box'
                                    }}>
                                      <div style={{ display: 'inline-block', width: '100%', aspectRatio: shape.type === 'line' ? 'auto' : '1 / 1' }}>
                                        {renderShape(shape)}
                                      </div>
                                    </div>
                                  );
                                })}
                                <div style={{ clear: 'both' }}></div>
                              </div>
                            )}

                            {q.type === 'match' && q.matchPairs && (
                              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                <table style={{ width: '80%', borderCollapse: 'collapse' }}>
                                  <tbody>
                                    {q.matchPairs.map((pair, pIdx) => (
                                      <tr key={pIdx}>
                                        <td style={{ padding: '8px', border: '1px solid transparent' }}>{pIdx + 1}. {pair.left}</td>
                                        <td style={{ padding: '8px', border: '1px solid transparent', textAlign: 'center' }}>—</td>
                                        <td style={{ padding: '8px', border: '1px solid transparent' }}>({String.fromCharCode(97 + pIdx)}) {pair.right}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {q.type === 'fill_in_the_blanks' && q.wordBank && q.wordBank.length > 0 && (
                              <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #000', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
                                  {q.wordBank.map((word, wIdx) => (
                                    <span key={wIdx} style={{ fontWeight: 'bold' }}>{word}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {q.type === 'objective' && q.options && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <span>({['a', 'b', 'c', 'd'][optIdx]})</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {q.optionImages && q.optionImages[optIdx] && (
                                        <img src={q.optionImages[optIdx]} alt="" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                                      )}
                                      {opt && <span>{opt}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.type === 'true_false' && (
                              <div style={{ display: 'flex', gap: '32px', marginTop: '12px', paddingLeft: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '16px', height: '16px', border: '1px solid #000' }}></div>
                                  <span>True</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '16px', height: '16px', border: '1px solid #000' }}></div>
                                  <span>False</span>
                                </div>
                              </div>
                            )}

                            {q.type === 'tracing' && (
                              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0', borderTop: '1px solid #000', borderLeft: '1px solid #000' }}>
                                {q.text.replace(/<[^>]*>?/gm, '').split('').filter(char => char.trim() !== '').map((char, cIdx) => (
                                  <div key={cIdx} style={{ 
                                    borderRight: '1px solid #000', 
                                    borderBottom: '1px solid #000', 
                                    padding: '24px 0', 
                                    textAlign: 'center', 
                                    fontSize: '3rem', 
                                    fontFamily: 'Comic Sans MS, sans-serif',
                                    color: '#d1d5db',
                                    fontWeight: 'bold'
                                  }}>
                                    {char.toUpperCase()}
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.hint && (
                              <div style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9em', color: '#555' }}>
                                (Hint: {q.hint})
                              </div>
                            )}

                            {q.blankSpace !== undefined && q.blankSpace > 0 && (
                              <div style={{ height: `${q.blankSpace}px`, width: '100%' }} />
                            )}
                          </td>
                          <td style={{ verticalAlign: 'top', width: '50px', padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>[{q.marks}]</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
        
        {/* Footer line */}
        <div style={{ textAlign: 'center', marginTop: '50px', fontStyle: 'italic', fontSize: '12px' }}>
          --- End of Question Paper ---
        </div>
      </div>

      {paperData.includeOMR && (
        <div className="paper-container" style={{ marginTop: '20px', pageBreakBefore: 'always', padding: '40px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', textTransform: 'uppercase' }}>MN PUBLIC SCHOOL</h1>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>OMR ANSWER SHEET</h2>
          </div>

          <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ border: '1px solid #000', padding: '10px', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', textDecoration: 'underline' }}>INSTRUCTIONS FOR FILLING THE SHEET</div>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', lineHeight: '1.6' }}>
                  <li>Use Blue/Black Ball Point Pen only.</li>
                  <li>Darken the circle completely and properly.</li>
                  <li>Cutting and erasing on this sheet is not allowed.</li>
                  <li>Do not make any stray marks on the sheet.</li>
                  <li>Rough work must not be done on the answer sheet.</li>
                </ol>
                <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>Correct Method:</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#000' }}></div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #000' }}></div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #000' }}></div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #000' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>Wrong Method:</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✓</div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✗</div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#666' }}></div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #000' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                <tbody>
                  <tr><td style={{ border: '1px solid #000', padding: '8px 10px', fontWeight: 'bold' }}>Student Name</td><td style={{ border: '1px solid #000', padding: '8px 10px' }}></td></tr>
                  <tr><td style={{ border: '1px solid #000', padding: '8px 10px', fontWeight: 'bold' }}>Roll Number</td><td style={{ border: '1px solid #000', padding: '8px 10px' }}></td></tr>
                  <tr><td style={{ border: '1px solid #000', padding: '8px 10px', fontWeight: 'bold' }}>Class & Section</td><td style={{ border: '1px solid #000', padding: '8px 10px' }}>{paperData.classId} {paperData.sectionId}</td></tr>
                  <tr><td style={{ border: '1px solid #000', padding: '8px 10px', fontWeight: 'bold' }}>Subject</td><td style={{ border: '1px solid #000', padding: '8px 10px' }}>{paperData.subject}</td></tr>
                  <tr><td style={{ border: '1px solid #000', padding: '8px 10px', fontWeight: 'bold' }}>Date of Exam</td><td style={{ border: '1px solid #000', padding: '8px 10px' }}></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
            {[0, 1, 2, 3].map(colIdx => (
              <div key={colIdx}>
                {Array.from({ length: 15 }).map((_, rIdx) => {
                  const qNum = colIdx * 15 + rIdx + 1;
                  return (
                    <div key={rIdx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ width: '30px', fontWeight: 'bold', fontSize: '13px' }}>{qNum}.</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <div key={opt} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af' }}>{opt}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #000', paddingTop: '10px' }}>
            <div style={{ width: '200px', textAlign: 'center', borderTop: '1px dashed #666', paddingTop: '5px' }}>Signature of Candidate</div>
            <div style={{ width: '200px', textAlign: 'center', borderTop: '1px dashed #666', paddingTop: '5px' }}>Signature of Invigilator</div>
            <div style={{ width: '200px', textAlign: 'center', borderTop: '1px dashed #666', paddingTop: '5px' }}>Signature of Examiner</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPaperPrintView;




