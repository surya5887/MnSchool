import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. We remove the global BlockCanvas from the rendering logic completely!
old_global = '''          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Advanced Blocks (Optional)</h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b' }}>Add complex elements like images, tables, matching columns, or split sections.</p>
                <BlockCanvas 
                  blocks={paperData?.blocks || []} 
                  onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
                />
              </div>
              
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>'''

new_global = '''          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>'''

code = code.replace(old_global, new_global)

# 2. Inject BlockCanvas into the individual question
old_question_end = '''                        ))}
                      </div>
                    )}
                  </div>
                )})}'''

new_question_end = '''                        ))}
                      </div>
                    )}
                    
                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <BlockCanvas 
                        blocks={q.blocks || []} 
                        onChange={(newBlocks) => {
                          const newSecs = [...paperData.sections];
                          newSecs[sIdx].questions[qIdx].blocks = newBlocks as any;
                          setPaperData({...paperData, sections: newSecs});
                        }} 
                      />
                    </div>
                  </div>
                )})}'''

code = code.replace(old_question_end, new_question_end)

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code_print = f.read()

# 3. Update QuestionPaperPrintView.tsx to NOT print the global BlockCanvas if it's not Kids, and DO print question blocks!
old_print_global = '''            {paperData.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
              <BlockPrintRenderer blocks={paperData.blocks} />
            ) : (
              <>
                {paperData.blocks && paperData.blocks.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <BlockPrintRenderer blocks={paperData.blocks.filter(b => b.type !== 'kids_activity')} />
                  </div>
                )}
                {paperData.sections && paperData.sections.map((section, sIdx) => {'''

new_print_global = '''            {paperData.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
              <BlockPrintRenderer blocks={paperData.blocks} />
            ) : (
              <>
                {paperData.sections && paperData.sections.map((section, sIdx) => {'''

code_print = code_print.replace(old_print_global, new_print_global)

old_print_q = '''                          {q.optionImages && q.optionImages[optIdx] && (
                            <img src={q.optionImages[optIdx]} alt="" style={{ height: '30px', alignSelf: 'flex-start' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}'''

new_print_q = '''                          {q.optionImages && q.optionImages[optIdx] && (
                            <img src={q.optionImages[optIdx]} alt="" style={{ height: '30px', alignSelf: 'flex-start' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.blocks && q.blocks.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <BlockPrintRenderer blocks={q.blocks} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}'''

code_print = code_print.replace(old_print_q, new_print_q)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code_print)
