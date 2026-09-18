import re

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# REPLACE HEADER
code = code.replace(
'''        <div className="paper-container" style={{ fontSize: paperData.globalFontSize || '14px' }}>
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
  
          <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '0 0 20px 0' }} />''',

'''        <div className="paper-container" style={{ fontSize: paperData.globalFontSize || '14px', position: 'relative' }}>
          {paperData.worksheetElements && paperData.worksheetElements.length > 0 ? (
            <div style={{ position: 'relative', width: '100%', minHeight: '1130px' }}>
              {paperData.worksheetElements.map(el => (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    border: el.type === 'shape' && el.border ? '2px solid #000' : 'none',
                    background: el.type === 'shape' && !el.border ? '#e5e7eb' : (el.type === 'line' ? '#000' : 'transparent'),
                    display: 'flex',
                    overflow: 'hidden'
                  }}
                >
                  {el.type === 'text' && (
                    <div style={{ width: '100%', height: '100%', padding: '4px' }}>
                      <div dangerouslySetInnerHTML={{ __html: el.content || '' }} style={{ width: '100%', height: '100%' }} />
                    </div>
                  )}
                  {el.type === 'image' && el.imageUrl && (
                    <img src={el.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {!paperData.hideStandardHeader && (
                <>
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
                </>
              )}'''
)

# REPLACE FOOTER
code = code.replace(
'''          {/* Footer line */}
          <div style={{ textAlign: 'center', marginTop: '50px', fontStyle: 'italic', fontSize: '12px' }}>
            --- End of Question Paper ---
          </div>
        </div>
  
        {paperData.includeOMR && (''',

'''          {/* Footer line */}
          <div style={{ textAlign: 'center', marginTop: '50px', fontStyle: 'italic', fontSize: '12px' }}>
            --- End of Question Paper ---
          </div>
          </>
        )}
        </div>
  
        {paperData.includeOMR && ('''
)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
