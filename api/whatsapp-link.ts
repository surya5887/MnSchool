import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { useFirebaseAuthState } from './useFirebaseAuthState.js';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { dbNode as db } from './firebase-node.js';


export const maxDuration = 60; 

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  // Set up Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const sessionId = 'school_erp';

    sendEvent({ status: 'info', message: 'Clearing previous session...' });

    // Wipe previous session
    const snapshot = await getDocs(collection(db, 'whatsapp_auth'));
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    sendEvent({ status: 'info', message: 'Starting WhatsApp client...' });

    const { state, saveCreds } = await useFirebaseAuthState(sessionId);
    
    let sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      browser: ['MN Public School ERP', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    let isConnected = false;

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        sendEvent({ status: 'qr', qr });
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          sendEvent({ status: 'info', message: 'Connection dropped, please refresh...' });
        } else {
          sendEvent({ status: 'error', message: 'Logged out. Please generate QR again.' });
        }
        res.end();
      } else if (connection === 'open') {
        isConnected = true;
        sendEvent({ status: 'success', message: 'WhatsApp Connected Successfully!' });
        
        // Wait just a moment to ensure creds are saved before disconnecting
        setTimeout(() => {
          sock.end(undefined); // Close connection gracefully
          res.end();
        }, 3000);
      }
    });

    // Cleanup if client closes connection
    req.on('close', () => {
      if (!isConnected && sock) {
        sock.end(undefined);
      }
    });

    // Safety timeout to prevent Vercel 504 error (Hobby is 60s max)
    setTimeout(() => {
      if (!isConnected) {
        sendEvent({ status: 'timeout', message: 'Time limit reached. Please generate QR again.' });
        sock.end(undefined);
        res.end();
      }
    }, 55000);

  } catch (error: any) {
    sendEvent({ status: 'error', message: error.message });
    res.end();
  }
}
