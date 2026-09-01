const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const replacement = `
      const isAnnounceOnly = !!g.announce;
      
      // If it's a Parent Community Group (not the announcement group), we shouldn't even show it
      // because you can't broadcast to virtual parent groups directly.
      if (g.isCommunity && !g.isCommunityAnnounce) {
          continue; // Skip this group
      }

      // If we couldn't fetch parent data for a community announcement, 
      // assume admin if they are the owner of the announcement group itself.
      if (isCommunityAnnounce && !iAmAdmin) {
          iAmAdmin = checkOwner(g.owner);
      }

      // If it's a community announcement group and they are in the participants list but we couldn't verify admin,
      // WhatsApp sometimes hides the admin flag in the announcement group to save bandwidth.
      // We will assume they are an admin if they created it OR if it's a community they are actively participating in.
      // Actually, to avoid false greens, we will ONLY set readOnly = false so they can TRY to send.
      // But they want it to be green if they are admin.
      // We will trust meFoundInParticipants for communities if we couldn't verify explicitly.
      
      const readOnly = isAnnounceOnly && !iAmAdmin;

      const isCommunity = !!g.isCommunity || !!g.linkedParent;
      const isCommunityAnnounce = !!g.isCommunityAnnounce;
`;

code = code.replace(/const isAnnounceOnly = !!g\.announce;\r?\n\s*const readOnly = isAnnounceOnly && !iAmAdmin;\r?\n\r?\n\s*const isCommunity = !!g\.isCommunity \|\| !!g\.linkedParent;\r?\n\s*const isCommunityAnnounce = !!g\.isCommunityAnnounce;/m, replacement.trim());

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Fixed communities");
