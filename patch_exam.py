import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add KidsBlockCanvas import
code = code.replace("import BlockCanvas from '../components/BlockCanvas/BlockCanvas';", "import BlockCanvas from '../components/BlockCanvas/BlockCanvas';\\nimport KidsBlockCanvas from '../components/BlockCanvas/KidsBlockCanvas';")

# Add the new button
code = code.replace(
'''              <button 
                className={tn-} 
                onClick={() => {
                  const newData = {...paperData, blocks: paperData?.blocks || []} as any;
                  delete newData.wordContent;
                  setPaperData(newData);
                }}
              >
                Use Block Canvas (6th-12th)
              </button>''',
'''              <button 
                className={tn-} 
                onClick={() => {
                  const newData = {...paperData, blocks: (paperData?.blocks || []).filter(b => b.type !== 'kids_activity')} as any;
                  delete newData.wordContent;
                  setPaperData(newData);
                }}
              >
                Use Block Canvas (6th-12th)
              </button>
              <button 
                className={tn-} 
                onClick={() => {
                  const newData = {...paperData, blocks: (paperData?.blocks || []).filter(b => b.type === 'kids_activity')} as any;
                  delete newData.wordContent;
                  setPaperData(newData);
                }}
              >
                Kids Worksheet Engine (Play-5th)
              </button>'''
)

# Render Logic Update
code = code.replace(
'''            ) : paperData?.blocks ? (
              <BlockCanvas 
                blocks={paperData.blocks} 
                onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
              />
            ) : (''',
'''            ) : paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
              <KidsBlockCanvas 
                blocks={paperData.blocks} 
                onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
              />
            ) : paperData?.blocks ? (
              <BlockCanvas 
                blocks={paperData.blocks} 
                onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
              />
            ) : ('''
)

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
