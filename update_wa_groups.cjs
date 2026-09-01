const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

// Replace the string matching logic
code = code.replace(/const me = g\.participants\.find\(\(p: any\) => p\.id && p\.id\.startsWith\(myId \+ '@'\)\);/g, 
    "const me = g.participants.find((p: any) => p.id && p.id.split('@')[0].split(':')[0] === myId);");

code = code.replace(/if \(!iAmAdmin && g\.owner && myId && g\.owner\.startsWith\(myId \+ '@'\)\)/g,
    "if (!iAmAdmin && g.owner && myId && g.owner.split('@')[0].split(':')[0] === myId)");

code = code.replace(/const meInParent = parent\.participants\.find\(\(p: any\) => p\.id && p\.id\.startsWith\(myId \+ '@'\)\);/g,
    "const meInParent = parent.participants.find((p: any) => p.id && p.id.split('@')[0].split(':')[0] === myId);");

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Updated matching logic in api/whatsapp-groups.ts");
