import { makeWASocket, DisconnectReason, BufferJSON, initAuthCreds } from '@whiskeysockets/baileys';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import * as QRCode from 'qrcode';
import * as http from 'http';

const firebaseConfig = {
  apiKey: "AIzaSyAX7iZ_CTxIt99Cu2Sysw6rJ31vubxTw_I",
  authDomain: "mn-public-school.firebaseapp.com",
  projectId: "mn-public-school",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const sessionId = 'school_erp';
const collectionName = 'whatsapp_auth';

let currentQR = "";
let isConnected = false;

// HTTP Server
const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if (isConnected) {
            res.end('<html><body style="text-align:center; padding:50px; font-family:sans-serif; background:#dcf8c6;"><h1>?? WhatsApp Successfully Connected!</h1><p>Keys are saved in Firebase. You can close this tab and go back to ERP.</p></body></html>');
        } else if (currentQR) {
            const qrImage = await QRCode.toDataURL(currentQR);
            res.end(`<html>
                <head>
                    <meta http-equiv="refresh" content="5">
                    <title>WhatsApp QR Scan</title>
                </head>
                <body style="text-align:center; padding:50px; font-family:sans-serif; background:#f0f2f5;">
                    <h2>Scan this with WhatsApp</h2>
                    <p>This page will auto-refresh every 5 seconds.</p>
                    <img src="${qrImage}" style="width: 300px; height: 300px; padding:20px; background:white; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);" />
                </body>
            </html>`);
        } else {
            res.end('<html><head><meta http-equiv="refresh" content="2"></head><body style="text-align:center; padding:50px;"><h2>Generating QR code, please wait...</h2></body></html>');
        }
    }
});
server.listen(3333, () => {
    console.log("Local Server running on http://localhost:3333");
});

const useFirebaseAuthState = async () => {
  const writeData = async (data: any, id: string) => {
    const docRef = doc(db, collectionName, `${sessionId}_${id}`);
    await setDoc(docRef, { data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)) });
  };
  const readData = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, `${sessionId}_${id}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) return JSON.parse(JSON.stringify(snap.data().data), BufferJSON.reviver);
      return null;
    } catch (error) { return null; }
  };
  const removeData = async (id: string) => { };

  const creds = await readData('creds') || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [key: string]: any } = {};
          await Promise.all(
            ids.map(async id => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = typeof value === 'object' && value !== null ? value : null;
              }
              if (value) data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => writeData(creds, 'creds')
  };
};

async function connectToWhatsApp () {
    const { state, saveCreds } = await useFirebaseAuthState();
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            currentQR = qr;
        }

        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            if(shouldReconnect) {
                connectToWhatsApp();
            }
        } else if(connection === 'open') {
            isConnected = true;
            console.log('?? OPENED CONNECTION! Keys are safely saved in Firebase.');
            setTimeout(() => {
                process.exit(0);
            }, 5000); // Wait a bit for browser to fetch success page
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();
