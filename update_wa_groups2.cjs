const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const parentCheck = `      if (!iAmAdmin && g.linkedParent && groupsMap[g.linkedParent]) {
        const parent = groupsMap[g.linkedParent];
        if (myId && parent.participants) {
          const meInParent = parent.participants.find((p: any) => p.id && p.id.split('@')[0].split(':')[0] === myId);
          if (meInParent && (meInParent.admin === 'admin' || meInParent.admin === 'superadmin' || meInParent.isSuperAdmin || meInParent.admin === true || meInParent.admin === 1)) {
            iAmAdmin = true;
          }
        }
        if (!iAmAdmin && parent.owner && myId && parent.owner.split('@')[0].split(':')[0] === myId) {
          iAmAdmin = true;
        }
      }`;

// We will replace the old parent check with this new one
code = code.replace(/if \(\!iAmAdmin && g\.linkedParent && groupsMap\[g\.linkedParent\]\) \{[\s\S]*?\}\n      \}/, parentCheck);

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Updated parent owner logic");
