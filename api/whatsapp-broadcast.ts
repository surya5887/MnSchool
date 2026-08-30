import makeWASocket, { DisconnectReason, delay } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';

export const maxDuration = 60; // Max timeout

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { groupJids, message, sessionId = 'school_erp' } = req.body;
  
  if (!groupJids || !Array.isArray(groupJids) || groupJids.length === 0 || !message) {
    return res.status(400).json({ error: 'Valid groupJids array and message required' });
  }

  try {
    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    if (!state.creds || !state.creds.me) {
      return res.status(401).json({ error: 'WhatsApp not connected.' });
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
          reject(new Error('Connection timeout'));
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
            reject(new Error('Connection closed'));
          }
        }
      });
    });

    let successCount = 0;
    const errors: string[] = [];

    // Send messages sequentially to avoid rate limiting
    for (const jid of groupJids) {
      try {
        await sock.sendMessage(jid, { text: message });
        successCount++;
        await delay(500); // 500ms delay between messages
      } catch (err: any) {
        errors.push(`Failed for ${jid}: ${err.message}`);
      }
    }

    // Give it a moment to save state
    await delay(1000);
    sock.end(undefined);

    return res.status(200).json({ 
      success: true, 
      sent: successCount,
      total: groupJids.length,
      errors: errors.length > 0 ? errors : undefined 
    });

  } catch (error: any) {
    console.error('Broadcast error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send broadcast.' });
  }
}
