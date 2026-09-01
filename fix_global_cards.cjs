const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const tableStart = '<div className="glass-table-container desktop-only">';
const tableEnd = '</table>\r\n            </div>';
const tableEndFallback = '</table>\n            </div>';

let tableStartIndex = code.indexOf(tableStart);
let tableEndIndex = code.indexOf(tableEnd);

if (tableEndIndex === -1) {
    tableEndIndex = code.indexOf(tableEndFallback);
    if (tableEndIndex !== -1) {
        tableEndIndex += tableEndFallback.length;
    }
} else {
    tableEndIndex += tableEnd.length;
}

if (tableStartIndex !== -1 && tableEndIndex !== -1) {
    // Remove the table completely
    const beforeTable = code.substring(0, tableStartIndex);
    const afterTable = code.substring(tableEndIndex);
    
    // Now replace <div className="mobile-only" style={{ marginTop: '16px' }}>
    // with a grid container.
    let newCode = beforeTable + afterTable;
    
    const mobileStartStr = '<div className="mobile-only" style={{ marginTop: \'16px\' }}>\r\n              <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'20px\' }}>';
    const mobileStartStrFallback = '<div className="mobile-only" style={{ marginTop: \'16px\' }}>\n              <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'20px\' }}>';
    
    const replacement = '<div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fill, minmax(340px, 1fr))\', gap: \'24px\', marginTop: \'16px\' }}>';
    
    if (newCode.includes(mobileStartStr)) {
        newCode = newCode.replace(mobileStartStr, replacement);
    } else if (newCode.includes(mobileStartStrFallback)) {
        newCode = newCode.replace(mobileStartStrFallback, replacement);
    } else {
        // Just replace the two opening tags
        const p1 = '<div className="mobile-only"';
        const p1idx = newCode.indexOf(p1);
        if(p1idx !== -1) {
            const flexIdx = newCode.indexOf('<div style={{ display: \'flex\', flexDirection: \'column\'', p1idx);
            if (flexIdx !== -1) {
                const endOfFlex = newCode.indexOf('>', flexIdx) + 1;
                newCode = newCode.substring(0, p1idx) + replacement + newCode.substring(endOfFlex);
                // We also need to remove one closing `</div>` because we replaced 2 divs with 1 div!
                // The closing tags are `</div>\n            </div>\n            </>`
                const closingTags = '</div>\r\n            </div>\r\n            </>';
                const closingTagsFallback = '</div>\n            </div>\n            </>';
                if (newCode.includes(closingTags)) {
                    newCode = newCode.replace(closingTags, '</div>\r\n            </>');
                } else if (newCode.includes(closingTagsFallback)) {
                    newCode = newCode.replace(closingTagsFallback, '</div>\n            </>');
                } else {
                    console.log("Could not fix closing tags");
                }
            }
        }
    }
    
    fs.writeFileSync('src/pages/DefaultersList.tsx', newCode, 'utf8');
    console.log("Made cards global successfully!");
} else {
    console.log("Could not find table boundaries");
}
