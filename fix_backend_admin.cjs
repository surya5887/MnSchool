const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const newMapBody = `
      let iAmAdmin = false;
      
      // 1. Direct admin check
      if (myId && g.participants) {
        const me = g.participants.find((p: any) => p.id && p.id.split('@')[0].split(':')[0] === myId);
        if (me && (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.admin === true || me.admin === 1)) {
          iAmAdmin = true;
        }
      }

      // 2. Owner check
      if (!iAmAdmin && g.owner && myId && g.owner.split('@')[0].split(':')[0] === myId) {
        iAmAdmin = true;
      }

      // 3. Parent community admin check (for announcement groups)
      if (!iAmAdmin && g.linkedParent && groupsMap[g.linkedParent]) {
        const parent = groupsMap[g.linkedParent];
        if (myId && parent.participants) {
          const meInParent = parent.participants.find((p: any) => p.id && p.id.split('@')[0].split(':')[0] === myId);
          if (meInParent && (meInParent.admin === 'admin' || meInParent.admin === 'superadmin' || meInParent.isSuperAdmin || meInParent.admin === true || meInParent.admin === 1)) {
            iAmAdmin = true;
          }
        }
        // Check if I am the owner of the parent group
        if (!iAmAdmin && parent.owner && myId && parent.owner.split('@')[0].split(':')[0] === myId) {
          iAmAdmin = true;
        }
      }

      const isAnnounceOnly = !!g.announce;
      const readOnly = isAnnounceOnly && !iAmAdmin;

      const isCommunity = !!g.isCommunity || !!g.linkedParent;
      const isCommunityAnnounce = !!g.isCommunityAnnounce;

      return {
        id: g.id,
        name: g.subject || 'Unnamed Group',
        participantsCount: g.participants?.length || 0,
        isCommunity: isCommunity || isCommunityAnnounce,
        iAmAdmin,
        readOnly,
        isAnnounceOnly
      };
`;

const startIndex = code.indexOf('let iAmAdmin = false;');
const endIndex = code.indexOf('};', code.indexOf('isAnnounceOnly //')) + 2;

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + newMapBody.trim() + '\n    ' + code.substring(endIndex);
    fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
    console.log("Fixed API admin map logic");
} else {
    console.log("Could not find bounds");
}
