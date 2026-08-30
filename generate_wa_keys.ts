import { makeWASocket, DisconnectReason, BufferJSON, initAuthCreds } from '@whiskeysockets/baileys';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import * as QRCode from 'qrcode';
import * as fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyAX7iZ_CTxIt99Cu2Sysw6rJ31vubxTw_I",
  authDomain: "mn-public-school.firebaseapp.com",
  projectId: "mn-public-school",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sessionId = 'school_erp';
const collectionName = 'whatsapp_auth';

const useFirebaseAuthState = async () => {
  const writeData = async (data: any, id: string) => {
    const docRef = doc(db, collectionName, `${sessionId}_${id}`);
    await setDoc(docRef, { data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)) });
  };
  const readData = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, `${sessionId}_${id}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return JSON.parse(JSON.stringify(snap.data().data), BufferJSON.reviver);
      }
      return null;
    } catch (error) { return null; }
  };
  const removeData = async (id: string) => { /* skip */ };

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
    console.log("Fetching existing auth state from Firebase...");
    const { state, saveCreds } = await useFirebaseAuthState();
    
    console.log("Starting WhatsApp Socket...");
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("QR Code received. Generating image...");
            await QRCode.toFile('C:/Users/AneesChaudhary/Desktop/SCAN_ME_FOR_WHATSAPP.png', qr);
            console.log("Saved to desktop!");
        }

        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            if(shouldReconnect) {
                connectToWhatsApp();
            }
        } else if(connection === 'open') {
            console.log('?? OPENED CONNECTION! Keys are safely saved in Firebase.');
            fs.writeFileSync('C:/Users/AneesChaudhary/Desktop/SUCCESS_WHATSAPP_IS_NOW_LIVE.txt', 'Connection successful!');
            if (fs.existsSync('C:/Users/AneesChaudhary/Desktop/SCAN_ME_FOR_WHATSAPP.png')) {
                fs.unlinkSync('C:/Users/AneesChaudhary/Desktop/SCAN_ME_FOR_WHATSAPP.png');
            }
            process.exit(0);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();
