const fs = require('fs');
let content = fs.readFileSync('api/send-message.ts', 'utf8');
content = content.replace(
    /const \{ phone, message, sessionId = 'school_1' \} = req.body;/g,
    "const { phone, message, sessionId = 'school_erp' } = req.body;"
);
fs.writeFileSync('api/send-message.ts', content, 'utf8');
