import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the buttons
old_buttons = '''          <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className={tn-} 
              onClick={() => {
                const newData = {...paperData} as any;
                delete newData.blocks;
                setPaperData(newData);
              }}
            >
              Use Legacy Form Builder
            </button>
            <button 
              className={tn-} 
              onClick={() => {
                const newData = {...paperData, blocks: (paperData?.blocks || []).filter(b => b.type !== 'kids_activity')} as any;
                setPaperData(newData);
              }}
            >
              Use Block Canvas (6th-12th)
            </button>
            <button 
              className={tn-} 
              onClick={() => {
                const newData = {...paperData, blocks: [...(paperData?.blocks || []).filter(b => b.type === 'kids_activity'), { id: Math.random().toString(), type: 'kids_activity', category: 'VISUAL_DISCRIMINATION', subType: 'Odd One Out', instruction: 'Circle the odd one out', layoutType: 'grid', items: [], config: { columns: 4 } }]} as any;
                setPaperData(newData);
              }}
            >
              Kids Worksheet Engine (Play-5th)
            </button>
          </div>'''

new_buttons = '''          <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className={tn-} 
              onClick={() => {
                const newData = {...paperData, blocks: (paperData?.blocks || []).filter(b => b.type !== 'kids_activity')} as any;
                if(!newData.blocks) newData.blocks = [];
                setPaperData(newData);
              }}
            >
              Regular Exam Builder (6th-12th)
            </button>
            <button 
              className={tn-} 
              onClick={() => {
                const newData = {...paperData, blocks: [...(paperData?.blocks || []).filter(b => b.type === 'kids_activity'), { id: Math.random().toString(), type: 'kids_activity', category: 'VISUAL_DISCRIMINATION', subType: 'Odd One Out', instruction: 'Circle the odd one out', layoutType: 'grid', items: [], config: { columns: 4 } }]} as any;
                setPaperData(newData);
              }}
            >
              Kids Worksheet Engine (Play-5th)
            </button>
          </div>'''

code = code.replace(old_buttons, new_buttons)

# Replace the rendering area
old_render = '''          {paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
            <KidsBlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : paperData?.blocks ? (
            <BlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : (
            <div>'''

new_render = '''          {paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
            <KidsBlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Advanced Blocks (Optional)</h3>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b' }}>Add complex elements like images, tables, matching columns, or split sections.</p>
                <BlockCanvas 
                  blocks={paperData?.blocks || []} 
                  onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
                />
              </div>
              
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>'''

code = code.replace(old_render, new_render)

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

with open('src/components/QuestionPaperPrintView.tsx', 'r', encoding='utf-8') as f:
    code_print = f.read()

old_print = '''          {/* Sections and Questions */}
          <div style={{ marginTop: '30px' }}>
            {paperData.blocks && paperData.blocks.length > 0 ? (
              <BlockPrintRenderer blocks={paperData.blocks} />
            ) : (
              paperData.sections && paperData.sections.map((section, sIdx) => {'''

new_print = '''          {/* Sections and Questions */}
          <div style={{ marginTop: '30px' }}>
            {paperData.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
              <BlockPrintRenderer blocks={paperData.blocks} />
            ) : (
              <>
                {paperData.blocks && paperData.blocks.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <BlockPrintRenderer blocks={paperData.blocks.filter(b => b.type !== 'kids_activity')} />
                  </div>
                )}
                {paperData.sections && paperData.sections.map((section, sIdx) => {'''

code_print = code_print.replace(old_print, new_print)

old_print_end = '''                      </div>
                    </div>
                  );
                })
            )}
          </div>'''

new_print_end = '''                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>'''

code_print = code_print.replace(old_print_end, new_print_end)

with open('src/components/QuestionPaperPrintView.tsx', 'w', encoding='utf-8') as f:
    f.write(code_print)
