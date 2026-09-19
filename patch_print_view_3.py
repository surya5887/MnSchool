import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_q_render = '''                      {section.questions.map((q, qIdx) => {
                        if (q.type === 'instruction') {
                          return (
                            <tr key={qIdx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', fontFamily: q.fontFamily || 'inherit' }}>
                              <td colSpan={3} style={{ padding: '12px 0', fontWeight: 'bold' }}>
                                <div dangerouslySetInnerHTML={{ __html: q.text.replace(/\\n/g, '<br/>') }} />
                              </td>
                            </tr>
                          );
                        }
                        
                        const currentQNum = qCounter++;
                        const label = q.label !== undefined ? q.label : Q.;
  
                        return (
                          <tr key={qIdx} style={{ pageBreakInside: "avoid", breakInside: "avoid", fontFamily: q.fontFamily || 'inherit' }}>'''

new_q_render = '''                      {section.questions.map((q, qIdx) => {
                        const isQSelected = isEditor && selectedItem?.type === 'question' && selectedItem.sIdx === sIdx && selectedItem.qIdx === qIdx;
                        const qProps = isEditor ? {
                          onClick: (e: any) => { e.stopPropagation(); onItemClick?.({ type: 'question', sIdx, qIdx }); },
                          onMouseEnter: (e: any) => { if (!isQSelected) e.currentTarget.style.outline = '2px dashed #cbd5e1'; },
                          onMouseLeave: (e: any) => { if (!isQSelected) e.currentTarget.style.outline = '2px solid transparent'; }
                        } : {};
                        const qStyle = {
                          pageBreakInside: 'avoid' as any, breakInside: 'avoid' as any, fontFamily: q.fontFamily || 'inherit',
                          cursor: isEditor ? 'pointer' : 'auto',
                          outline: isQSelected ? '2px solid #3b82f6' : '2px solid transparent',
                          background: isQSelected ? '#eff6ff' : 'transparent',
                          transition: 'all 0.2s'
                        };

                        if (q.type === 'instruction') {
                          return (
                            <tr key={qIdx} style={qStyle} {...qProps}>
                              <td colSpan={3} style={{ padding: '12px 0', fontWeight: 'bold' }}>
                                <div dangerouslySetInnerHTML={{ __html: q.text.replace(/\\n/g, '<br/>') }} />
                              </td>
                            </tr>
                          );
                        }
                        
                        const currentQNum = qCounter++;
                        const label = q.label !== undefined ? q.label : Q.;
  
                        return (
                          <tr key={qIdx} style={qStyle} {...qProps}>'''

code = code.replace(old_q_render, new_q_render)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

