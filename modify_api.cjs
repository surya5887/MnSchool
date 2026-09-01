const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

// Remove the continue statement that skips parent communities
code = code.replace(/\/\/ If it's a Parent Community Group.*?if \(g\.isCommunity && !g\.isCommunityAnnounce\) \{\r?\n\s*continue; \/\/ Skip this group\r?\n\s*\}/gs, '');

// Update the pushed object to include isParentCommunity and linkedParent
const newPush = `
      groups.push({
        id: g.id,
        name: g.subject || 'Unnamed Group',
        participantsCount: g.participants?.length || 0,
        isCommunity: isCommunity || isCommunityAnnounce,
        isCommunityAnnounce: !!g.isCommunityAnnounce,
        isParentCommunity: !!(g.isCommunity && !g.isCommunityAnnounce),
        linkedParent: g.linkedParent || null,
        iAmAdmin,
        readOnly: g.isCommunity && !g.isCommunityAnnounce ? true : readOnly, // Virtual parents are always readonly
        isAnnounceOnly
      });
`;

code = code.replace(/groups\.push\(\{\r?\n\s*id: g\.id,[\s\S]*?isAnnounceOnly\r?\n\s*\}\);/m, newPush.trim());

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("API modified");
