const fs = require('fs');
let code = fs.readFileSync('api/whatsapp-groups.ts', 'utf8');

const finalIdLogic = `
    let myId = null;
    let myLid = null;

    // We know from DB that state.creds.me looks like:
    // { id: '919837957711:37@s.whatsapp.net', lid: '108916209926221:37@lid' }
    // sock.user might only have the lid as id.
    
    if (state.creds?.me?.id) {
       myId = state.creds.me.id.split(':')[0].split('@')[0];
    } else if (sock.user?.id && sock.user.id.includes('@s.whatsapp.net')) {
       myId = sock.user.id.split(':')[0].split('@')[0];
    }
    
    if (state.creds?.me?.lid) {
       myLid = state.creds.me.lid.split(':')[0].split('@')[0];
    } else if (sock.user?.id && sock.user.id.includes('@lid')) {
       myLid = sock.user.id.split(':')[0].split('@')[0];
    }
`;

const updatedCheckAdmin = `
      // Helper inside the loop to track meFoundInParticipants
      const checkAdminAndFound = (participants: any[]) => {
          if (!participants) return false;
          if (!myId && !myLid) return false;
          
          const me = participants.find((p: any) => {
             const pid = p.id ? p.id.split('@')[0].split(':')[0] : null;
             const plid = p.lid ? p.lid.split('@')[0].split(':')[0] : null;
             return (myId && pid === myId) || (myLid && plid === myLid) || (myId && plid === myId) || (myLid && pid === myLid);
          });
          if (me) {
            meFoundInParticipants = true;
            return (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.isAdmin || me.admin === true || me.admin === 1);
          }
          return false;
      };

      const checkOwner = (ownerId: string | undefined) => {
          if (!ownerId) return false;
          const oid = ownerId.split('@')[0].split(':')[0];
          return (myId && oid === myId) || (myLid && oid === myLid);
      };
`;

code = code.replace(/const rawMyId = sock\.user\?\.phoneNumber \|\| state\.creds\?\.me\?\.phoneNumber \|\| sock\.user\?\.id \|\| state\.creds\?\.me\?\.id \|\| "";\r?\n\s*\/\/\s*Attempt to extract the true phone number JID\r?\n\s*const myId = rawMyId \? rawMyId\.split\(':'\)\[0\]\.split\('@'\)\[0\] : null;/g, finalIdLogic.trim());

code = code.replace(/\/\/ Helper inside the loop to track meFoundInParticipants[\s\S]*?const checkOwner = \(ownerId: string \| undefined, targetId: string\) => \{[\s\S]*?\};\r?\n/m, updatedCheckAdmin.trim() + '\n');

// Also update the calls to checkAdminAndFound and checkOwner!
code = code.replace(/checkAdminAndFound\(g\.participants, myId\)/g, 'checkAdminAndFound(g.participants)');
code = code.replace(/checkOwner\(g\.owner, myId\)/g, 'checkOwner(g.owner)');
code = code.replace(/checkAdminAndFound\(parent\.participants, myId\)/g, 'checkAdminAndFound(parent.participants)');
code = code.replace(/checkOwner\(parent\.owner, myId\)/g, 'checkOwner(parent.owner)');

// Fix the direct check `if (myId)` because now we have myId and myLid
code = code.replace(/\/\/ 1\. Direct check in this group\r?\n\s*if \(myId\) \{/g, '// 1. Direct check in this group\n      if (myId || myLid) {');
code = code.replace(/\/\/ 2\. Owner check\r?\n\s*if \(\!iAmAdmin && myId\) \{/g, '// 2. Owner check\n      if (!iAmAdmin && (myId || myLid)) {');
code = code.replace(/\/\/ 3\. Parent community check\r?\n\s*if \(\!iAmAdmin && g\.linkedParent && myId\) \{/g, '// 3. Parent community check\n      if (!iAmAdmin && g.linkedParent && (myId || myLid)) {');

fs.writeFileSync('api/whatsapp-groups.ts', code, 'utf8');
console.log("Fixed final ID matching logic");
