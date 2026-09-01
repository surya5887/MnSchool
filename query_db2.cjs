require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

if (firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    async function run() {
        const docRef = doc(db, 'whatsapp_auth', 'school_erp_creds');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            console.log("CREDS.ME:", snap.data().data.me);
        } else {
            console.log("Doc not found");
        }
        process.exit(0);
    }
    run();
} else {
    console.log("No config");
}
