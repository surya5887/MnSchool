const fs = require('fs');

function updatePrintView(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Add 'instructions' to the interface type
    content = content.replace(
        "type: 'section' | 'question' | 'endText'",
        "type: 'section' | 'question' | 'endText' | 'instructions'"
    ).replace(
        "type: 'section' | 'question' | 'endText'",
        "type: 'section' | 'question' | 'endText' | 'instructions'"
    );

    // Make instructions clickable
    const oldInst = `          {/* General Instructions */}
          {paperData.generalInstructions && paperData.generalInstructions.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>General Instructions:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
                {paperData.generalInstructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>
          )}`;
          
    const newInst = `          {/* General Instructions */}
          {paperData.generalInstructions && paperData.generalInstructions.length > 0 && (
            <div 
              style={{ 
                marginBottom: '20px', 
                cursor: isEditor ? 'pointer' : 'default',
                outline: isEditor && selectedItem?.type === 'instructions' ? '2px solid #3b82f6' : 'none'
              }}
              onClick={(e) => {
                if (isEditor) {
                  e.stopPropagation();
                  onItemClick?.({ type: 'instructions' } as any);
                }
              }}
              onMouseEnter={(e: any) => { if (isEditor && selectedItem?.type !== 'instructions') e.currentTarget.style.outline = '2px dashed #cbd5e1'; }}
              onMouseLeave={(e: any) => { if (isEditor && selectedItem?.type !== 'instructions') e.currentTarget.style.outline = 'none'; }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>General Instructions:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
                {paperData.generalInstructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>
          )}`;
    
    if(content.includes('General Instructions:</div>')) {
        // Just replacing the block using a regex since exact match might fail due to spaces
        const match = content.match(/\{\/\* General Instructions \*\/\}\s*\{paperData\.generalInstructions.*?<\/div>\s*\)\}/s);
        if (match) {
            content = content.replace(match[0], newInst);
            fs.writeFileSync(filepath, content);
            console.log('Updated ' + filepath);
        } else {
            console.log('Instructions block not found in PrintView');
        }
    }
}

function updateBuilder(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Update state type
    content = content.replace(
        "useState<{ type: 'section' | 'question' | 'endText',",
        "useState<{ type: 'section' | 'question' | 'endText' | 'instructions',"
    );

    // Add UI editor block for instructions inside the right sidebar
    const endTextEditorBlock = `{selectedItem.type === 'endText' && (`;
    
    const instEditorBlock = `{selectedItem.type === 'instructions' && (
                    <div>
                      <label className="input-label">General Instructions (One per line)</label>
                      <textarea 
                        className="glass-input" 
                        rows={6} 
                        style={{ width: '100%', resize: 'vertical' }} 
                        value={paperData.generalInstructions?.join('\\n') || ''}
                        onChange={(e) => setPaperData({ ...paperData, generalInstructions: e.target.value.split('\\n') })}
                      />
                    </div>
                  )}
                  
                  ` + endTextEditorBlock;

    if (content.includes(endTextEditorBlock) && !content.includes("selectedItem.type === 'instructions'")) {
        content = content.replace(endTextEditorBlock, instEditorBlock);
        fs.writeFileSync(filepath, content);
        console.log('Updated ' + filepath);
    }
}

updatePrintView('C:/Users/AneesChaudhary/Desktop/MN_Public_School/frontend/src/components/QuestionPaperPrintView.tsx');
updateBuilder('C:/Users/AneesChaudhary/Desktop/MN_Public_School/frontend/src/components/LivePaperBuilder.tsx');

updatePrintView('C:/Users/AneesChaudhary/Desktop/Rahimya_Model_School/frontend/src/components/QuestionPaperPrintView.tsx');
updateBuilder('C:/Users/AneesChaudhary/Desktop/Rahimya_Model_School/frontend/src/components/LivePaperBuilder.tsx');

