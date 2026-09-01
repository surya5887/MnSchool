const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

code = code.replace(/me\.isSuperAdmin \|\| me\.admin === true \|\| me\.admin === 1/g, 
    "me.isSuperAdmin || me.isAdmin || me.admin === true || me.admin === 1");

code = code.replace(/meInParent\.isSuperAdmin \|\| meInParent\.admin === true \|\| meInParent\.admin === 1/g,
    "meInParent.isSuperAdmin || meInParent.isAdmin || meInParent.admin === true || meInParent.admin === 1");

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Added isAdmin to checks");
