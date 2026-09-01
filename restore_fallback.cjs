const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const updatedLogic = `
    let groups = [];
    const groupValues = Object.values(groupsMap);

    for (const g of groupValues as any[]) {
      let iAmAdmin = false;
      let meFoundInParticipants = false;
      
      // Helper inside the loop to track meFoundInParticipants
      const checkAdminAndFound = (participants: any[], targetId: string) => {
          if (!participants || !targetId) return false;
          const me = participants.find((p: any) => {
             const pid = p.id ? p.id.split('@')[0].split(':')[0] : null;
             const plid = p.lid ? p.lid.split('@')[0].split(':')[0] : null;
             return pid === targetId || plid === targetId;
          });
          if (me) {
            meFoundInParticipants = true;
            return (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.isAdmin || me.admin === true || me.admin === 1);
          }
          return false;
      };

      // 1. Direct check in this group
      if (myId) {
        iAmAdmin = checkAdminAndFound(g.participants, myId);
      }

      // 2. Owner check
      if (!iAmAdmin && myId) {
        iAmAdmin = checkOwner(g.owner, myId);
      }

      // 3. Parent community check
      if (!iAmAdmin && g.linkedParent && myId) {
        let parent = groupsMap[g.linkedParent];
        
        if (!parent) {
          try {
             parent = await sock.groupMetadata(g.linkedParent);
          } catch (err) {}
        }

        if (parent) {
           iAmAdmin = checkAdminAndFound(parent.participants, myId);
           if (!iAmAdmin) {
             iAmAdmin = checkOwner(parent.owner, myId);
           }
        }
      }
      
      // 4. Robust Fallback for truncated participants lists
      if (!iAmAdmin && !meFoundInParticipants) {
         iAmAdmin = true;
      }

      const isAnnounceOnly = !!g.announce;
      const readOnly = isAnnounceOnly && !iAmAdmin;

      const isCommunity = !!g.isCommunity || !!g.linkedParent;
      const isCommunityAnnounce = !!g.isCommunityAnnounce;
`;

const regex = /let groups = \[\];[\s\S]*?const isCommunityAnnounce = !!g\.isCommunityAnnounce;/;
code = code.replace(regex, updatedLogic.trim());

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Restored robust fallback and fixed helper");
