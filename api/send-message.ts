import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';
export const maxDuration = 60; // Extend Vercel timeout to 60 seconds

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { phone, message, base64Pdf, pdfName, sessionId = 'school_erp' } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message required' });
  }

  try {
    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    // Setup proxy if WA_PROXY_URL is defined in Vercel
    // We only want to connect, send, and disconnect immediately.
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false, // very important for speed!
      generateHighQualityLinkPreview: false,});

    sock.ev.on('creds.update', saveCreds);

    // Wait for connection to open
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout: Could not connect to WhatsApp. Is your phone internet on?')), 45000);
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
    const formattedPhone = `${phone}@s.whatsapp.net`;
    
    // SAFE TIME: Random delay between 2 to 6 seconds to prevent ban
    const safeDelay = Math.floor(Math.random() * 4000) + 2000;
    await new Promise(resolve => setTimeout(resolve, safeDelay));

    if (base64Pdf) {
      const buffer = Buffer.from(base64Pdf.split(',')[1] || base64Pdf, 'base64');
      await sock.sendMessage(formattedPhone, { 
        document: buffer, 
        mimetype: 'application/pdf', 
        fileName: pdfName || 'Receipt.pdf',
        caption: message 
      });
    } else {
      await sock.sendMessage(formattedPhone, { text: message });
    }
    
    // Disconnect so Vercel can sleep
    sock.ws.close();
    
    return res.status(200).json({ success: true, message: 'Message sent' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Failed to send' });
  }
}
