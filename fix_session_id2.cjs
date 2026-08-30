const fs = require('fs');
let content = fs.readFileSync('api/generate-qr.ts', 'utf8');
content = content.replace(
    /const sessionId = 'school_1';/g,
    "const sessionId = 'school_erp';"
);
fs.writeFileSync('api/generate-qr.ts', content, 'utf8');
