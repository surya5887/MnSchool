import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the imports
if "LivePaperBuilder" not in code:
    code = code.replace("import KidsBlockCanvas from '../components/BlockCanvas/KidsBlockCanvas';", "import KidsBlockCanvas from '../components/BlockCanvas/KidsBlockCanvas';\nimport LivePaperBuilder from '../components/LivePaperBuilder';")

# Find where to start replacing
start_str = "            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>"
end_str = "          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>"

start_idx = code.find(start_str)
end_idx = code.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = '''            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button 
                className={tn-} 
                onClick={() => {
                  const newData = {...paperData} as any;
                  if(newData.blocks) newData.blocks = newData.blocks.filter(b => b.type !== 'kids_activity');
                  setPaperData(newData);
                }}
              >
                Live Paper Builder (6th-12th)
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
            </div>

            {paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
              <KidsBlockCanvas 
                blocks={paperData.blocks} 
                onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
              />
            ) : (
              <div style={{ marginTop: '24px' }}>
                <LivePaperBuilder paperData={paperData!} setPaperData={setPaperData as any} />
              </div>
            )}

'''
    code = code[:start_idx] + new_content + code[end_idx:]
    with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Successfully patched!")
else:
    print("Could not find blocks!", start_idx, end_idx)

