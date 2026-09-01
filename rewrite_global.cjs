const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const fragmentStart = '<>\n<div className="glass-table-container desktop-only">';
const mobileStart = '<div className="mobile-only" style={{ marginTop: \'16px\' }}>';

if (code.includes(fragmentStart) && code.includes(mobileStart)) {
    // We want to replace everything from fragmentStart to the last `</>` before `)}`
    const startIndex = code.indexOf(fragmentStart);
    
    // Find the mobile cards logic to keep
    const mapStart = '{filteredDefaulters.map((d) => (';
    const mapEnd = '</div>\n                  </div>\n                ))}';
    
    const mapStartIndex = code.indexOf(mapStart);
    const mapEndIndex = code.indexOf(mapEnd) + mapEnd.length;
    
    const cardMapLogic = code.substring(mapStartIndex, mapEndIndex);
    
    // Find the end of the block
    const endStr = '            </>\n        )}';
    const endIndex = code.indexOf(endStr, mapEndIndex);
    
    if (startIndex !== -1 && mapStartIndex !== -1 && endIndex !== -1) {
        const before = code.substring(0, startIndex);
        const after = code.substring(endIndex + '            </>'.length);
        
        const newBlock = `
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginTop: '16px' }}>
              ${cardMapLogic}
            </div>`;
            
        fs.writeFileSync('src/pages/DefaultersList.tsx', before + newBlock + after, 'utf8');
        console.log("Successfully converted to global cards!");
    } else {
        console.log("Indices not found correctly.");
    }
} else {
    console.log("Could not find fragmentStart or mobileStart");
}
