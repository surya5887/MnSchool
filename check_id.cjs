const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const idExtraction = `
    const meObj = sock.user || state.creds?.me || {};
    let rawMyId = meObj.phoneNumber || meObj.id;
    if (!rawMyId) rawMyId = "";
    
    // Attempt to extract the true phone number JID
    const myId = rawMyId ? rawMyId.split(':')[0].split('@')[0] : null;
`;

code = code.replace(/const rawMyId = sock\.user\?\.id \|\| state\.creds\?\.me\?\.id;\r?\n\s*\/\/\s*Attempt to extract the true phone number JID\r?\n\s*const myId = rawMyId \? rawMyId\.split\(':'\)\[0\]\.split\('@'\)\[0\] : null;/g, idExtraction);

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Updated ID extraction");
