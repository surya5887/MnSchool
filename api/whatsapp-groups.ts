import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';

export const maxDuration = 60; // Extend timeout for Baileys init

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
        const { connection } = update;
        if (connection === 'open') {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
        } else if (connection === 'close') {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(new Error('Connection closed prematurely'));
          }
        }
      });
    });

    // Get the connected user's ID
    const myId = sock.user?.id?.split(':')[0];

    const groupsRaw = await sock.groupFetchAllParticipating();
    const groups = Object.values(groupsRaw).map(g => {
      
      let iAmAdmin = false;
      if (myId && g.participants) {
        const me = g.participants.find(p => p.id.includes(myId));
        if (me && (me.admin === 'admin' || me.admin === 'superadmin')) {
          iAmAdmin = true;
        }
      }

      const isAnnounceOnly = !!g.announce;
      const readOnly = isAnnounceOnly && !iAmAdmin; // Cannot send if it's announce-only and I'm not an admin

      // Community check: usually linkedParent indicates it's part of a community, 
      // or isCommunity / isCommunityAnnounce flags if present in Baileys.
      const isCommunity = !!(g as any).isCommunity || !!(g as any).linkedParent;
      const isCommunityAnnounce = !!(g as any).isCommunityAnnounce;

      return {
        id: g.id,
        name: g.subject || 'Unnamed Group',
        participantsCount: g.participants?.length || 0,
        isCommunity: isCommunity || isCommunityAnnounce,
        iAmAdmin,
        readOnly
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    sock.end(undefined);

    return res.status(200).json({ groups });
  } catch (error: any) {
    console.error('Group fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch WhatsApp groups.' });
  }
}
