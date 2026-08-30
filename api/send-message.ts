import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { phone, message, sessionId = 'school_1' } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message required' });
  }

  try {
    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    // We only want to connect, send, and disconnect immediately.
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false, // very important for speed!
      generateHighQualityLinkPreview: false
    });

    sock.ev.on('creds.update', saveCreds);

    // Wait for connection to open
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout: Could not connect to WhatsApp. Is your phone internet on?')), 8500);
      sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          clearTimeout(timeout);
          reject(new Error('WhatsApp Not Linked! Session expired. You need to re-scan the QR code.'));
        }
        
        if (connection === 'open') {
          clearTimeout(timeout);
          resolve(true);
        } else if (connection === 'close') {
          clearTimeout(timeout);
          reject(new Error('Connection closed or logged out.'));
        }
      });
    });

    // Format phone number for WhatsApp (e.g., 919876543210@s.whatsapp.net)
    const formattedPhone = phone.startsWith('91') ? `${phone}@s.whatsapp.net` : `91${phone}@s.whatsapp.net`;
    
    await sock.sendMessage(formattedPhone, { text: message });
    
    // Disconnect so Vercel can sleep
    sock.ws.close();
    
    return res.status(200).json({ success: true, message: 'Message sent' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Failed to send' });
  }
}
