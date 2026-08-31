import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';

export const maxDuration = 60;

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const sessionId = 'school_erp';

  try {
    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    if (!state.creds || !state.creds.me) {
      return res.status(401).json({ error: 'WhatsApp not connected. Please link your account first.' });
    }

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      browser: ['MN Public School ERP', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    await new Promise((resolve, reject) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          sock.end(undefined);
          reject(new Error('Connection timeout while fetching groups'));
        }
      }, 15000);

      sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
        } else if (update.connection === 'close') {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(new Error('Connection closed prematurely'));
          }
        }
      });
    });

    const rawMyId = sock.user?.id || state.creds?.me?.id;
    // Attempt to extract the true phone number JID
    const myId = rawMyId ? rawMyId.split(':')[0].split('@')[0] : null;

    const groupsRaw = await sock.groupFetchAllParticipating();
    const groupsMap = groupsRaw as any;

    // Helper to check admin status inside an array of participants
    const checkAdmin = (participants: any[], targetId: string) => {
      if (!participants || !targetId) return false;
      const me = participants.find((p: any) => p.id && p.id.split('@')[0].split(':')[0] === targetId);
      if (me) {
        return (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.isAdmin || me.admin === true || me.admin === 1);
      }
      return false;
    };

    const checkOwner = (ownerId: string | undefined, targetId: string) => {
      if (!ownerId || !targetId) return false;
      return ownerId.split('@')[0].split(':')[0] === targetId;
    };

    let groups = [];
    const groupValues = Object.values(groupsMap);

    for (const g of groupValues as any[]) {
      let iAmAdmin = false;
      
      // 1. Direct check in this group
      if (myId) {
        iAmAdmin = checkAdmin(g.participants, myId);
      }

      // 2. Owner check
      if (!iAmAdmin && myId) {
        iAmAdmin = checkOwner(g.owner, myId);
      }

      // 3. Parent community check
      if (!iAmAdmin && g.linkedParent && myId) {
        let parent = groupsMap[g.linkedParent];
        
        // If parent is not in groupsMap (not synced), fetch its metadata directly!
        if (!parent) {
          try {
             parent = await sock.groupMetadata(g.linkedParent);
          } catch (err) {
             console.log("Could not fetch parent metadata for", g.linkedParent);
          }
        }

        if (parent) {
           iAmAdmin = checkAdmin(parent.participants, myId);
           if (!iAmAdmin) {
             iAmAdmin = checkOwner(parent.owner, myId);
           }
        }
      }

      const isAnnounceOnly = !!g.announce;
      // If it's announceOnly and we STILL aren't admin, it's truly readOnly for us.
      const readOnly = isAnnounceOnly && !iAmAdmin;

      const isCommunity = !!g.isCommunity || !!g.linkedParent;
      const isCommunityAnnounce = !!g.isCommunityAnnounce;

      groups.push({
        id: g.id,
        name: g.subject || 'Unnamed Group',
        participantsCount: g.participants?.length || 0,
        isCommunity: isCommunity || isCommunityAnnounce,
        iAmAdmin,
        readOnly,
        isAnnounceOnly
      });
    }

    groups = groups.sort((a: any, b: any) => a.name.localeCompare(b.name));

    sock.end(undefined);

    return res.status(200).json({ groups });
  } catch (error: any) {
    console.error('Group fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch WhatsApp groups.' });
  }
}
