const fs = require('fs');

let api = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const oldLogic = `if (me && (me.admin === 'admin' || me.admin === 'superadmin')) {`;
const newLogic = `if (me && (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.admin === true || me.admin === 1)) {`;

api = api.replace(oldLogic, newLogic);

// What if the user is not found by ID? Let's also check if they are the owner!
const ownerLogicOld = `const readOnly = isAnnounceOnly && !iAmAdmin;`;
const ownerLogicNew = `// Sometimes the creator/owner is an admin implicitly
      if (g.owner && g.owner.startsWith(myId + '@')) {
        iAmAdmin = true;
      }
      const readOnly = isAnnounceOnly && !iAmAdmin;`;

api = api.replace(ownerLogicOld, ownerLogicNew);

fs.writeFileSync('api/whatsapp-groups.ts', api, 'utf8');
console.log("Updated admin logic!");
