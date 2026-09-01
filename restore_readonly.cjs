const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

code = code.replace(/const readOnly = false; \/\/ Never block UI, let WhatsApp API handle rejection/g, 
    'const readOnly = isAnnounceOnly && !iAmAdmin;');

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Restored readOnly logic");
