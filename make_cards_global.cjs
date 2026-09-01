const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

// The block to replace starts with the desktop table and ends with the mobile cards
const searchStart = '<div className="glass-table-container desktop-only">';
const searchEnd = '</div>\n            </div>\n              </>';

if (code.includes(searchStart) && code.includes(searchEnd)) {
    const beforeBlock = code.substring(0, code.indexOf(searchStart));
    const afterBlock = code.substring(code.indexOf(searchEnd) + searchEnd.length);

    // We can just extract the inner card map logic from the current code
    // It starts with `{filteredDefaulters.map((d) => (` and ends before `</div>\n            </div>\n              </>`
    const mapStart = '{filteredDefaulters.map((d) => (';
    const mapEnd = '</div>\n                  </div>\n                ))}';
    
    const startIndex = code.indexOf(mapStart);
    const endIndex = code.indexOf(mapEnd) + mapEnd.length;
    
    if (startIndex !== -1 && endIndex !== -1) {
        const cardMapLogic = code.substring(startIndex, endIndex);
        
        const newBlock = `
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginTop: '16px' }}>
              ${cardMapLogic}
            </div>
            `;
            
        // Wait, the original code had `<>` at the start of the block.
        // Let's replace the whole Fragment block.
        // Look at the original code structure around it:
        //          ) : (
        //            <>
        //              <div className="glass-table-container desktop-only">
        
        const replaceStart = '<>\n<div className="glass-table-container desktop-only">';
        const fullReplaceStart = code.indexOf(replaceStart) !== -1 ? replaceStart : '<>\n              <div className="glass-table-container desktop-only">';
        
        // Actually, let's just find the exact block to replace using substring to be safe.
        const replaceBlockStart = code.lastIndexOf('<>', code.indexOf(searchStart));
        const replaceBlockEnd = code.indexOf('</>', code.indexOf(searchEnd)) + 3;
        
        const finalBefore = code.substring(0, replaceBlockStart);
        const finalAfter = code.substring(replaceBlockEnd);
        
        fs.writeFileSync('src/pages/DefaultersList.tsx', finalBefore + newBlock.trim() + finalAfter, 'utf8');
        console.log("Cards applied to desktop view!");
    } else {
        console.log("Couldn't find card map logic");
    }
} else {
    console.log("Couldn't find start/end markers");
}
