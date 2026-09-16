import sys

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_map_start = '''                {section.questions.map((q, qIdx) => (
                  <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingLeft: '24px', borderLeft: '3px solid var(--primary-color)', paddingBottom: '12px' }}>
                    <div className="question-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span className="question-label" style={{ paddingTop: '8px', fontWeight: 'bold' }}>{q.type === 'instruction' ? 'Info:' : \Q\.\}</span>'''

new_map_start = '''                {section.questions.map((q, qIdx) => {
                  let globalQuestionIndex = 0;
                  for (let i = 0; i < sIdx; i++) {
                    globalQuestionIndex += paperData.sections[i].questions.filter(qu => qu.type !== 'instruction').length;
                  }
                  globalQuestionIndex += section.questions.slice(0, qIdx).filter(qu => qu.type !== 'instruction').length;
                  
                  const autoLabel = q.type === 'instruction' ? 'Info:' : \Q\.\;

                  return (
                    <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingLeft: '24px', borderLeft: '3px solid var(--primary-color)', paddingBottom: '12px' }}>
                      <div className="question-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <input 
                          type="text" 
                          className="glass-input" 
                          style={{ width: '70px', fontWeight: 'bold', padding: '6px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', marginTop: '4px' }} 
                          value={q.label !== undefined ? q.label : autoLabel}
                          onChange={(e) => {
                            const newSecs = [...paperData.sections];
                            newSecs[sIdx].questions[qIdx].label = e.target.value;
                            setPaperData({...paperData, sections: newSecs});
                          }}
                          onBlur={(e) => {
                            if (e.target.value.trim() === '') {
                              const newSecs = [...paperData.sections];
                              delete newSecs[sIdx].questions[qIdx].label;
                              setPaperData({...paperData, sections: newSecs});
                            }
                          }}
                        />'''

old_map_end = '''                  <button className="btn-secondary" style={{ marginTop: '8px', marginLeft: '24px', fontSize: '0.9rem', padding: '6px 12px' }} onClick={() => {
                    const newSecs = [...paperData.sections];
                    newSecs[sIdx].questions.push({ text: '', marks: 1 });
                    setPaperData({...paperData, sections: newSecs});
                  }}><Plus size={16} /> Add Question</button>
                </div>
              ))}
            </div>'''

new_map_end = '''                  <button className="btn-secondary" style={{ marginTop: '8px', marginLeft: '24px', fontSize: '0.9rem', padding: '6px 12px' }} onClick={() => {
                    const newSecs = [...paperData.sections];
                    newSecs[sIdx].questions.push({ text: '', marks: 1 });
                    setPaperData({...paperData, sections: newSecs});
                  }}><Plus size={16} /> Add Question</button>
                </div>
              )})}
            </div>'''

content = content.replace(old_map_start, new_map_start)
content = content.replace(old_map_end, new_map_end)

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
