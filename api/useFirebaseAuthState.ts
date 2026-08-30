import { initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase'; // Assuming Vercel allows importing from src

export const useFirebaseAuthState = async (sessionId: string) => {
  const collectionName = 'whatsapp_auth';
  
  const writeData = async (data: any, id: string) => {
    const docRef = doc(db, collectionName, `${sessionId}_${id}`);
    await setDoc(docRef, { data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)) });
  };

  const readData = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, `${sessionId}_${id}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const parsed = JSON.parse(JSON.stringify(snap.data().data), BufferJSON.reviver);
        return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const removeData = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, `${sessionId}_${id}`);
      // skip actual deletion for now to avoid accidental wipe
    } catch (error) {}
  };

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
                value = typeof value === 'object' && value !== null ? value : null; // sanity check
              }
              if (value) {
                data[id] = value;
              }
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
