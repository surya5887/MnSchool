require('dotenv').config({ path: '.env.local' });
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

async function fixDates() {
  const querySnapshot = await getDocs(collection(db, 'transactions'));
  let count = 0;
  for (const document of querySnapshot.docs) {
    const data = document.data();
    if (data.date && data.date.length === 10 && data.createdAt) {
        // e.g. date: "2026-08-30", createdAt: "2026-08-30T13:30:00.000Z"
        // Let's just use createdAt directly as the new date for automated billing transactions
        // Or construct local time so it matches the date exactly?
        // Actually, replacing it with createdAt is perfect because createdAt IS the exact time they were generated live
        await updateDoc(doc(db, 'transactions', document.id), { date: data.createdAt });
        count++;
    }
  }
  console.log(`Fixed ${count} dates`);
}

fixDates().catch(console.error);
