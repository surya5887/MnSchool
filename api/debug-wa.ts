import makeWASocket from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';

export default async function handler(req: any, res: any) {
  const sessionId = 'school_erp';

  try {
    const { state } = await useFirebaseAuthState(sessionId);
    if (!state.creds || !state.creds.me) {
      return res.status(401).json({ error: 'WhatsApp not connected.' });
    }

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    await new Promise((resolve, reject) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          sock.end(undefined);
          resolve(true); // resolve anyway to get partial data
        }
      }, 8000);

      sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
        }
      });
    });

    const groupsRaw = await sock.groupFetchAllParticipating();
    const groupsMap = groupsRaw as any;
    
    let targetGroup = null;
    let targetParent = null;

    // Find "ASRV CINEMA" or any announce group
    for (const jid in groupsMap) {
       const g = groupsMap[jid];
       if (g.subject && g.subject.includes("ASRV")) {
           targetGroup = g;
           if (g.linkedParent) {
               try {
                  targetParent = await sock.groupMetadata(g.linkedParent);
               } catch(e) {}
           }
           break;
       }
    }

    sock.end(undefined);

    return res.status(200).json({ 
        me_sock: sock.user,
        me_creds: state.creds.me,
        myId_extracted: (sock.user?.id || state.creds?.me?.id)?.split(':')[0].split('@')[0],
        target_group: targetGroup,
        target_parent: targetParent
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
