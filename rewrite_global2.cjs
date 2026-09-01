const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const mapStart = '{filteredDefaulters.map((d) => (';
const mapEnd = '</div>\r\n                  </div>\r\n                ))}';
const mapEndFallback = '</div>\n                  </div>\n                ))}';

const mapStartIndex = code.indexOf(mapStart);
let mapEndIndex = code.indexOf(mapEnd);
if (mapEndIndex === -1) {
    mapEndIndex = code.indexOf(mapEndFallback);
    if (mapEndIndex !== -1) mapEndIndex += mapEndFallback.length;
} else {
    mapEndIndex += mapEnd.length;
}

if (mapStartIndex !== -1 && mapEndIndex !== -1) {
    const cardMapLogic = code.substring(mapStartIndex, mapEndIndex);
    
    // Let's replace the whole block from the fragment start to the fragment end.
    // We can use a regex to match the ` <>\r\n...</div>\r\n            </>`
    
    // Find the `</>` that closes the mobile cards
    const fragmentEndIdx = code.indexOf('</>', mapEndIndex);
    
    // Find the `<>` that opens the table container
    const fragmentStartIdx = code.lastIndexOf('<>', code.indexOf('<div className="glass-table-container'));
    
    if (fragmentStartIdx !== -1 && fragmentEndIdx !== -1) {
        const before = code.substring(0, fragmentStartIdx);
        const after = code.substring(fragmentEndIdx + 3); // skip `</>`
        
        const newBlock = `
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginTop: '16px' }}>
              ${cardMapLogic}
            </div>
        `;
        
        fs.writeFileSync('src/pages/DefaultersList.tsx', before + newBlock + after, 'utf8');
        console.log("Successfully converted to global cards!");
    } else {
        console.log("Could not find <> or </>");
    }
} else {
    console.log("Could not find mapStart or mapEnd");
}
