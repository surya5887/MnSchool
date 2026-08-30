const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// I will just replace the exact lines
const exactBrokenStr = `                )}
              </AnimatePresence>
            </div>
            </div>
              <div onClick={() => setShowProfileSidebar(true)}`;
              
const fixedStr = `                )}
              </AnimatePresence>
            </div>
            <div onClick={() => setShowProfileSidebar(true)}`;
            
content = content.replace(exactBrokenStr, fixedStr);

fs.writeFileSync('src/components/Layout.tsx', content);
console.log('Fixed div tags');
