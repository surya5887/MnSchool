require('dotenv').config({ path: '.env' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixLogs() {
  const querySnapshot = await getDocs(collection(db, 'audit_logs'));
  let count = 0;
  for (const document of querySnapshot.docs) {
    const data = document.data();
    if (data.action && data.action.includes('?')) {
        const fixedAction = data.action.replace(/\?/g, '?');
        await updateDoc(doc(db, 'audit_logs', document.id), { action: fixedAction });
        count++;
    }
  }
  console.log(`Fixed ${count} logs`);
}

fixLogs().catch(console.error);
