import re

with open('src/pages/Examination.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import
code = code.replace("import WorksheetCanvas from '../components/BlockCanvas/WorksheetCanvas';", "import WordDocumentCanvas from '../components/BlockCanvas/WordDocumentCanvas';")

# Update buttons
code = code.replace("!paperData?.blocks && !paperData?.worksheetElements", "!paperData?.blocks && paperData?.wordContent === undefined")
code = code.replace("delete newData.worksheetElements;", "delete newData.wordContent;")
code = code.replace("paperData?.worksheetElements ? 'primary'", "paperData?.wordContent !== undefined ? 'primary'")
code = code.replace(
'''              <button 
                className={tn-} 
                onClick={() => {
                  const newData = {...paperData, worksheetElements: paperData?.worksheetElements || []} as any;
                  delete newData.blocks;
                  setPaperData(newData);
                }}
              >
                Visual Designer (Nursery-5th)
              </button>''',
'''              <button 
                className={tn-} 
                onClick={() => {
                  const newData = {...paperData, wordContent: paperData?.wordContent || '<p><br></p>'} as any;
                  delete newData.blocks;
                  setPaperData(newData);
                }}
              >
                MS Word Mode (Freeform)
              </button>'''
)

# Render logic
code = code.replace(
'''          {paperData?.worksheetElements ? (
            <WorksheetCanvas 
              elements={paperData.worksheetElements} 
              onChange={(newElements) => setPaperData(prev => prev ? {...prev, worksheetElements: newElements} : null)} 
            />
          ) : paperData?.blocks ? (''',
'''          {paperData?.wordContent !== undefined ? (
            <WordDocumentCanvas 
              content={paperData.wordContent} 
              onChange={(newContent) => setPaperData(prev => prev ? {...prev, wordContent: newContent} : null)} 
            />
          ) : paperData?.blocks ? ('''
)

with open('src/pages/Examination.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
