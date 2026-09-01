const fs = require('fs');
let code = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');

const tableStart = '<div className="glass-table-container desktop-only">';
const mobileStart = '<div className="mobile-only" style={{ marginTop: \'16px\' }}>';

const startIndex = code.indexOf(tableStart);
const endIndex = code.indexOf(mobileStart);

if (startIndex !== -1 && endIndex !== -1) {
    const beforeTable = code.substring(0, startIndex);
    const afterTable = code.substring(endIndex);
    
    let newCode = beforeTable + afterTable;
    
    // Now convert mobile-only block to global grid
    const flexStart = "<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>";
    
    const p1 = '<div className="mobile-only" style={{ marginTop: \'16px\' }}>';
    const p1idx = newCode.indexOf(p1);
    const flexIdx = newCode.indexOf(flexStart, p1idx);
    
    if (p1idx !== -1 && flexIdx !== -1) {
        const replacement = "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginTop: '16px' }}>";
        const endOfFlex = flexIdx + flexStart.length;
        
        newCode = newCode.substring(0, p1idx) + replacement + newCode.substring(endOfFlex);
        
        // Remove one </div>
        // The original has:
        //               </div>
        //             </div>
        //             </>
        
        const closingTarget = '              </div>\r\n            </div>\r\n            </>';
        const closingTargetFallback = '              </div>\n            </div>\n            </>';
        const closingReplacement = '              </div>\r\n            </>';
        const closingReplacementFallback = '              </div>\n            </>';
        
        if (newCode.includes(closingTarget)) {
            newCode = newCode.replace(closingTarget, closingReplacement);
        } else if (newCode.includes(closingTargetFallback)) {
            newCode = newCode.replace(closingTargetFallback, closingReplacementFallback);
        } else {
            console.log("Could not find closing tags to replace. Manually replacing the last occurrences.");
            // Just find the last </>, and the two </div> before it, and remove one.
            const fragmentClose = newCode.lastIndexOf('</>');
            const prevDiv1 = newCode.lastIndexOf('</div>', fragmentClose);
            const prevDiv2 = newCode.lastIndexOf('</div>', prevDiv1 - 1);
            if (prevDiv1 !== -1 && prevDiv2 !== -1) {
                 newCode = newCode.substring(0, prevDiv2) + newCode.substring(prevDiv1);
            }
        }
        
        // Remove the fragment <> if it's there
        // Actually it's fine if the fragment stays. It just wraps a single div now.
        
        fs.writeFileSync('src/pages/DefaultersList.tsx', newCode, 'utf8');
        console.log("Done!");
    } else {
        console.log("Could not find flex container");
    }
} else {
    console.log("Could not find table or mobile container boundaries");
}
