import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';

export const maxDuration = 60; // Extend timeout for Baileys init

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const sessionId = 'school_erp';

  try {
    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    // Check if auth exists (we assume user already linked)
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

    // Wait for connection to open
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

    // Fetch groups
    const groupsRaw = await sock.groupFetchAllParticipating();
    const groups = Object.values(groupsRaw).map(g => ({
      id: g.id,
      name: g.subject,
      desc: g.desc,
      participantsCount: g.participants.length,
      isCommunity: !!g.isCommunity,
      isCommunityAnnounce: !!g.isCommunityAnnounce
    })).sort((a, b) => a.name.localeCompare(b.name));

    // End connection gracefully
    sock.end(undefined);

    return res.status(200).json({ groups });
  } catch (error: any) {
    console.error('Group fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch WhatsApp groups.' });
  }
}
