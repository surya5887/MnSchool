const fs = require('fs');
let content = fs.readFileSync('src/pages/DefaultersList.tsx', 'utf8');
content = content.replace(/alert\("\? Serverless/g, 'alert("? Serverless');
fs.writeFileSync('src/pages/DefaultersList.tsx', content, 'utf8');
