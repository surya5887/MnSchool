const fs = require('fs');
let code = fs.readFileSync('src/pages/Examination.tsx', 'utf8');

// Replace the entire button group
const oldButtons =           <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className={\tn-\\} 
              onClick={() => {
                const newData = {...paperData} as any;
                delete newData.blocks;
                delete newData.wordContent;
                setPaperData(newData);
              }}
            >
              Use Legacy Form Builder
            </button>
            <button 
              className={\tn-\\} 
              onClick={() => {
                const newData = {...paperData, blocks: paperData?.blocks || []} as any;
                delete newData.wordContent;
                setPaperData(newData);
              }}
            >
              Use Block Canvas (6th-12th)
            </button>
            <button 
              className={\tn-\\} 
              onClick={() => {
                const newData = {...paperData, worksheetElements: paperData?.worksheetElements || []} as any;
                delete newData.blocks;
                setPaperData(newData);
              }}
            >
              Visual Designer (Nursery-5th)
            </button>
          </div>;

const newButtons =           <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className={\tn-\\} 
              onClick={() => {
                const newData = {...paperData} as any;
                delete newData.blocks;
                setPaperData(newData);
              }}
            >
              Use Legacy Form Builder
            </button>
            <button 
              className={\tn-\\} 
              onClick={() => {
                const newData = {...paperData, blocks: (paperData?.blocks || []).filter(b => b.type !== 'kids_activity')} as any;
                setPaperData(newData);
              }}
            >
              Use Block Canvas (6th-12th)
            </button>
            <button 
              className={\tn-\\} 
              onClick={() => {
                const newData = {...paperData, blocks: [...(paperData?.blocks || []).filter(b => b.type === 'kids_activity'), { id: Math.random().toString(), type: 'kids_activity', category: 'VISUAL_DISCRIMINATION', subType: 'Odd One Out', instruction: 'Circle the odd one out', layoutType: 'grid', items: [], config: { columns: 4 } }]} as any;
                setPaperData(newData);
              }}
            >
              Kids Worksheet Engine (Play-5th)
            </button>
          </div>;

code = code.replace(oldButtons, newButtons);

// Next, replace the rendering logic
const oldRender =           {paperData?.wordContent !== undefined ? (
            <WordDocumentCanvas 
              content={paperData.wordContent} 
              onChange={(newContent) => setPaperData(prev => prev ? {...prev, wordContent: newContent} : null)} 
            />
          ) : paperData?.blocks ? (
            <BlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : (;

const newRender =           {paperData?.blocks && paperData.blocks.some(b => b.type === 'kids_activity') ? (
            <KidsBlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : paperData?.blocks ? (
            <BlockCanvas 
              blocks={paperData.blocks} 
              onChange={(newBlocks) => setPaperData(prev => prev ? {...prev, blocks: newBlocks} : null)} 
            />
          ) : (;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/pages/Examination.tsx', code);
