require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.projectId) {
    console.log("No firebase config found in env. Can't query directly from here if env is not loaded.");
} else {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    async function run() {
        const docRef = doc(db, 'whatsapp_auth', 'school_erp_creds');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data().data;
            console.log("CREDS.ME:", data.me);
        } else {
            console.log("Doc not found");
        }
    }
    run();
}
