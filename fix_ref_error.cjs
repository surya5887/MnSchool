const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

code = code.replace(/if \(isCommunityAnnounce && !iAmAdmin\)/g, 'if (g.isCommunityAnnounce && !iAmAdmin)');

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Fixed ReferenceError");
