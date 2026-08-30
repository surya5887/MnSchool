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
    const myId = rawMyId ? rawMyId.split(':')[0].split('@')[0] : null;

    const groupsRaw = await sock.groupFetchAllParticipating();
    const groupsMap = groupsRaw as any; // map of JID to group

    const groups = Object.values(groupsMap).map((g: any) => {
      
      let iAmAdmin = false;
      
      // 1. Direct admin check
      if (myId && g.participants) {
        const me = g.participants.find((p: any) => p.id && p.id.startsWith(myId + '@'));
        if (me && (me.admin === 'admin' || me.admin === 'superadmin' || me.isSuperAdmin || me.admin === true || me.admin === 1)) {
          iAmAdmin = true;
        }
      }

      // 2. Owner check
      if (!iAmAdmin && g.owner && myId && g.owner.startsWith(myId + '@')) {
        iAmAdmin = true;
      }

      // 3. Parent community admin check (for announcement groups)
      if (!iAmAdmin && g.linkedParent && groupsMap[g.linkedParent]) {
        const parent = groupsMap[g.linkedParent];
        if (myId && parent.participants) {
          const meInParent = parent.participants.find((p: any) => p.id && p.id.startsWith(myId + '@'));
          if (meInParent && (meInParent.admin === 'admin' || meInParent.admin === 'superadmin' || meInParent.isSuperAdmin || meInParent.admin === true || meInParent.admin === 1)) {
            iAmAdmin = true;
          }
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
        isAnnounceOnly // we'll pass this so UI knows it's an announce group
      };
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));

    sock.end(undefined);

    return res.status(200).json({ groups });
  } catch (error: any) {
    console.error('Group fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch WhatsApp groups.' });
  }
}
