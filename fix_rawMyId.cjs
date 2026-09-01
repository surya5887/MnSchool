const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const correctLogic = `
    const rawMyId = sock.user?.phoneNumber || state.creds?.me?.phoneNumber || sock.user?.id || state.creds?.me?.id || "";
    // Attempt to extract the true phone number JID
    const myId = rawMyId ? rawMyId.split(':')[0].split('@')[0] : null;
`;

code = code.replace(/const meObj = sock\.user \|\| state\.creds\?\.me \|\| \{\};\r?\n\s*let rawMyId = meObj\.phoneNumber \|\| meObj\.id;\r?\n\s*if \(\!rawMyId\) rawMyId = "";\r?\n\s*\/\/\s*Attempt to extract the true phone number JID\r?\n\s*const myId = rawMyId \? rawMyId\.split\(':'\)\[0\]\.split\('@'\)\[0\] : null;/g, correctLogic.trim());

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Fixed rawMyId extraction");
