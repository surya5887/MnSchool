const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const regex = /<\/AnimatePresence>\s*<\/div>\s*<\/div>\s*<div onClick=\{\(\) => setShowProfileSidebar\(true\)\}/g;
content = content.replace(regex, "</AnimatePresence>\n            </div>\n            <div onClick={() => setShowProfileSidebar(true)}");

fs.writeFileSync('src/components/Layout.tsx', content);
console.log("Fixed Layout via regex");
