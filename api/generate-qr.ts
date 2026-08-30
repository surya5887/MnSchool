import makeWASocket from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState';

export default async function handler(req: any, res: any) {
  // This route generates a QR code string.
  // NOTE: On Vercel Hobby tier, keeping this alive to wait for a scan might timeout at 10s.
  // It's a "Jugaad" proof of concept.

  const sessionId = 'school_1';

  try {
    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    let qrSent = false;

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    // Promise that resolves when QR is received or connection opens (if already connected)
    await new Promise((resolve, reject) => {
      sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        
        if (qr && !qrSent) {
          qrSent = true;
          // Send QR code back to client
          res.status(200).json({ qr });
          // Note: The socket stays alive in the background of this execution context.
          // Vercel might kill it once we send the response, meaning the user scanning the QR
          // might fail unless they scan it BEFORE the response finishes (impossible).
          // Realistically, Serverless endpoints shouldn't terminate if we want to wait for scan,
          // but Vercel requires a response.
          // This is the core limitation of Serverless WhatsApp auth.
          resolve(true);
        }
        
        if (connection === 'open') {
          if (!qrSent) {
            qrSent = true;
            res.status(200).json({ connected: true, message: 'Already connected' });
            sock.ws.close();
            resolve(true);
          }
        }
      });
      
      // Safety timeout so function doesn't hang forever
      setTimeout(() => {
        if (!qrSent) {
          reject(new Error('Timeout waiting for QR'));
        }
      }, 8000);
    });

  } catch (error: any) {
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Failed to generate QR' });
    }
  }
}
