const fs = require('fs');

let api = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const oldMyIdLogic = "const myId = sock.user?.id?.split(':')[0];";
const newMyIdLogic = `const rawMyId = sock.user?.id || state.creds?.me?.id;
    const myId = rawMyId ? rawMyId.split(':')[0].split('@')[0] : null;
    console.log("My WhatsApp ID resolved to:", myId);`;

api = api.replace(oldMyIdLogic, newMyIdLogic);

const oldParticipantLogic = "const me = g.participants.find(p => p.id.includes(myId));";
const newParticipantLogic = "const me = g.participants.find(p => p.id && p.id.startsWith(myId + '@'));";

api = api.replace(oldParticipantLogic, newParticipantLogic);

fs.writeFileSync('api/whatsapp-groups.ts', api, 'utf8');
console.log("Updated api/whatsapp-groups.ts with robust ID logic");
