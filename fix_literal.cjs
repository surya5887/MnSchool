const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');
content = content.replace("?{d.totalDue", "?{d.totalDue");
fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
