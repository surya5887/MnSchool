const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const newLogic = `
      let iAmAdmin = false;
      let meFoundInParticipants = false;
      
      // 1. Direct admin check
      if (myId && g.participants) {
        const me = g.participants.find((p: any) => p.id && p.id.split('@')[0].split(':')[0] === myId);
        if (me) {
          meFoundInParticipants = true;
          if (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.isAdmin || me.admin === true || me.admin === 1) {
            iAmAdmin = true;
          }
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
          if (meInParent) {
            meFoundInParticipants = true; // We found them in the parent
            if (meInParent.admin === 'admin' || meInParent.admin === 'superadmin' || meInParent.isSuperAdmin || meInParent.isAdmin || meInParent.admin === true || meInParent.admin === 1) {
              iAmAdmin = true;
            }
          }
        }
        if (!iAmAdmin && parent.owner && myId && parent.owner.split('@')[0].split(':')[0] === myId) {
          iAmAdmin = true;
        }
      }

      // 4. Robust Fallback: If Baileys returned this group, the user is in it.
      // If we couldn't even FIND the user in the participants array, the array is incomplete
      // (which happens often for large WhatsApp Communities to save bandwidth).
      // We MUST NOT block the user from attempting to send if we don't have complete data.
      if (!iAmAdmin && !meFoundInParticipants) {
          iAmAdmin = true; // Assume true to unblock the UI. Server will reject if false.
      }

      const isAnnounceOnly = !!g.announce;
      const readOnly = isAnnounceOnly && !iAmAdmin;

      const isCommunity = !!g.isCommunity || !!g.linkedParent;
      const isCommunityAnnounce = !!g.isCommunityAnnounce;
`;

const startIndex = code.indexOf('let iAmAdmin = false;');
const endIndex = code.indexOf('return {', code.indexOf('isCommunityAnnounce = !!g.isCommunityAnnounce;'));

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + newLogic.trim() + '\n\n      ' + code.substring(endIndex);
    fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
    console.log("Updated with robust fallback logic");
} else {
    console.log("Could not find bounds");
}
