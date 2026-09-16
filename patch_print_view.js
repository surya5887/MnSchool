const fs = require('fs');
let code = fs.readFileSync('src/components/QuestionPaperPrintView.tsx', 'utf8');

const oldEnd = \          {/* Footer line */}
          <div style={{ textAlign: 'center', marginTop: '50px', fontStyle: 'italic', fontSize: '12px' }}>
            --- End of Question Paper ---
          </div>
        </div>
      </div>\;

const newEnd = \          {/* Footer line */}
          <div style={{ textAlign: 'center', marginTop: '50px', fontStyle: 'italic', fontSize: '12px' }}>
            --- End of Question Paper ---
          </div>
        </div>
        
        {paperData.includeOMR && (
          <div className="print-content omr-page" style={{ maxWidth: '800px', margin: '40px auto', background: 'white', padding: '60px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', pageBreakBefore: 'always', minHeight: '1123px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
              <h2 style={{ margin: '0 0 10px 0', textTransform: 'uppercase' }}>OMR ANSWER SHEET</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div style={{ textAlign: 'left', width: '45%' }}>
                  <div style={{ borderBottom: '1px dotted #000', padding: '5px 0', marginBottom: '10px' }}>Student Name:</div>
                  <div style={{ borderBottom: '1px dotted #000', padding: '5px 0' }}>Class/Sec:</div>
                </div>
                <div style={{ textAlign: 'right', width: '45%' }}>
                  <div style={{ borderBottom: '1px dotted #000', padding: '5px 0', marginBottom: '10px' }}>Roll No:</div>
                  <div style={{ borderBottom: '1px dotted #000', padding: '5px 0' }}>Date:</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
              {Array.from({ length: Math.max(20, (() => {
                  let cnt = 0;
                  paperData.sections.forEach(s => s.questions.forEach(q => { if(q.type !== 'instruction') cnt++ }));
                  return cnt;
                })()) }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ width: '25px', textAlign: 'right', fontWeight: 'bold' }}>{i + 1}.</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt} style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>{opt}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ borderTop: '1px solid #000', width: '30%', paddingTop: '5px', textAlign: 'center' }}>Invigilator Signature</div>
              <div style={{ borderTop: '1px solid #000', width: '30%', paddingTop: '5px', textAlign: 'center' }}>Examiner Signature</div>
            </div>
          </div>
        )}
      </div>\;

code = code.replace(oldEnd, newEnd);
fs.writeFileSync('src/components/QuestionPaperPrintView.tsx', code);
