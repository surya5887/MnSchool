import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

oldButtonsRegex = re.compile(r"<div style=\{\{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' \}\}>[\s\S]*?(?=\{paperData\?\.wordContent)", re.DOTALL)

newButtons = '''<div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className={tn-} 
              onClick={() => {
                const newData = {...paperData} as any;
                if(newData.blocks) {
                  newData.blocks = newData.blocks.filter(b => b.type !== 'kids_activity');
                }
                delete newData.wordContent;
                setPaperData(newData);
              }}
            >
              Regular Exam Builder (6th-12th)
            </button>
            <button 
              className={tn-} 
              onClick={() => {
                const newData = {...paperData, blocks: [...(paperData?.blocks || []).filter(b => b.type === 'kids_activity'), { id: Math.random().toString(), type: 'kids_activity', category: 'VISUAL_DISCRIMINATION', subType: 'Odd One Out', instruction: 'Circle the odd one out', layoutType: 'grid', items: [], config: { columns: 4 } }]} as any;
                delete newData.wordContent;
                setPaperData(newData);
              }}
            >
              Kids Worksheet Engine (Play-5th)
            </button>
          </div>\n\n          '''

code = oldButtonsRegex.sub(newButtons, code)

oldRenderRegex = re.compile(r"\{paperData\?\.wordContent !== undefined \? \([\s\S]*?\) : paperData\?\.blocks \? \([\s\S]*?\) : \(", re.DOTALL)
newRender = '''{paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
            <KidsBlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : ('''

code = oldRenderRegex.sub(newRender, code)

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
