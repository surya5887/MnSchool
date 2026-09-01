const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const newChecks = `
    const checkAdmin = (participants: any[], targetId: string) => {
      if (!participants || !targetId) return false;
      const me = participants.find((p: any) => {
         const pid = p.id ? p.id.split('@')[0].split(':')[0] : null;
         const plid = p.lid ? p.lid.split('@')[0].split(':')[0] : null;
         return pid === targetId || plid === targetId;
      });
      if (me) {
        return (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.isAdmin || me.admin === true || me.admin === 1);
      }
      return false;
    };

    const checkOwner = (ownerId: string | undefined, targetId: string) => {
      if (!ownerId || !targetId) return false;
      return ownerId.split('@')[0].split(':')[0] === targetId;
    };
`;

code = code.replace(/const checkAdmin = \(participants: any\[\], targetId: string\) => \{[\s\S]*?const checkOwner = \(ownerId: string \| undefined, targetId: string\) => \{[\s\S]*?\};\r?\n/m, newChecks);

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Updated checkAdmin to use LID as well");
