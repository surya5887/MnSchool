import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# For the statement span
old_tf1 = '''                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              {(!q.tfStyle || q.tfStyle !== 'none') && (
                                                <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                              )}
                                              <span>{q.trueLabel !== undefined ? q.trueLabel : 'True'}</span>
                                            </div>'''

new_tf1 = '''                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              {(!q.tfStyle || (q.tfStyle !== 'none' && q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only')) && (
                                                <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                              )}
                                              {(q.tfStyle === 'checkbox_only' || q.tfStyle === 'circle_only') && (
                                                <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle_only' ? '50%' : '0' }}></div>
                                              )}
                                              {q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only' && (
                                                <span>{q.trueLabel !== undefined ? q.trueLabel : 'True'}</span>
                                              )}
                                            </div>'''

old_tf2 = '''                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              {(!q.tfStyle || q.tfStyle !== 'none') && (
                                                <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                              )}
                                              <span>{q.falseLabel !== undefined ? q.falseLabel : 'False'}</span>
                                            </div>'''

new_tf2 = '''                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              {(!q.tfStyle || (q.tfStyle !== 'none' && q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only')) && (
                                                <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                              )}
                                              {(q.tfStyle === 'checkbox_only' || q.tfStyle === 'circle_only') && (
                                                <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle_only' ? '50%' : '0' }}></div>
                                              )}
                                              {q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only' && (
                                                <span>{q.falseLabel !== undefined ? q.falseLabel : 'False'}</span>
                                              )}
                                            </div>'''

code = code.replace(old_tf1, new_tf1)
code = code.replace(old_tf2, new_tf2)


old_tf3 = '''                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {(!q.tfStyle || q.tfStyle !== 'none') && (
                                          <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                        )}
                                        <span>{q.trueLabel !== undefined ? q.trueLabel : 'True'}</span>
                                      </div>'''

new_tf3 = '''                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {(!q.tfStyle || (q.tfStyle !== 'none' && q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only')) && (
                                          <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                        )}
                                        {(q.tfStyle === 'checkbox_only' || q.tfStyle === 'circle_only') && (
                                          <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle_only' ? '50%' : '0' }}></div>
                                        )}
                                        {q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only' && (
                                          <span>{q.trueLabel !== undefined ? q.trueLabel : 'True'}</span>
                                        )}
                                      </div>'''

old_tf4 = '''                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {(!q.tfStyle || q.tfStyle !== 'none') && (
                                          <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                        )}
                                        <span>{q.falseLabel !== undefined ? q.falseLabel : 'False'}</span>
                                      </div>'''

new_tf4 = '''                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {(!q.tfStyle || (q.tfStyle !== 'none' && q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only')) && (
                                          <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle' ? '50%' : '0' }}></div>
                                        )}
                                        {(q.tfStyle === 'checkbox_only' || q.tfStyle === 'circle_only') && (
                                          <div style={{ width: '16px', height: '16px', border: '1px solid #000', borderRadius: q.tfStyle === 'circle_only' ? '50%' : '0' }}></div>
                                        )}
                                        {q.tfStyle !== 'checkbox_only' && q.tfStyle !== 'circle_only' && (
                                          <span>{q.falseLabel !== undefined ? q.falseLabel : 'False'}</span>
                                        )}
                                      </div>'''

code = code.replace(old_tf3, new_tf3)
code = code.replace(old_tf4, new_tf4)


old_match = '''                                          <td style={{ padding: '8px', border: '1px solid transparent', textAlign: 'center' }}>—</td>'''
new_match = '''                                          <td style={{ padding: '8px', border: '1px solid transparent', textAlign: 'center', width: '40px' }}></td>'''
code = code.replace(old_match, new_match)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
