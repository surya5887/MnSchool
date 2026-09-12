import { doc, getDoc } from 'firebase/firestore';
import { dbNode as db } from './firebase-node.js';
import { BufferJSON } from '@whiskeysockets/baileys';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    const docRef = doc(db, 'whatsapp_auth', 'school_erp_creds');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const dataStr = snap.data().data;
      if (dataStr) {
        const parsed = JSON.parse(JSON.stringify(dataStr), BufferJSON.reviver);
        if (parsed && parsed.me && parsed.me.id) {
          const number = parsed.me.id.split(':')[0].split('@')[0];
          return res.status(200).json({ connected: true, number: '+' + number });
        }
      }
    }
    return res.status(200).json({ connected: false });
  } catch (error) {
    return res.status(500).json({ connected: false, error: 'Internal Server Error' });
  }
}
