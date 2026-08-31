require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const app = initializeApp({
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
});
const db = getFirestore(app);

async function run() {
    const docRef = doc(db, 'whatsapp_auth', 'school_erp_creds');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return console.log("no data");
    
    const data = docSnap.data().data;
    const creds = typeof data === 'string' ? JSON.parse(data) : data;
    const myId = creds.me.id.split(':')[0].split('@')[0];
    
    // To fetch groups, we need Baileys. But wait, Vercel Hobby serverless has 10s timeout, fetching might take longer?
    // We already do it in the API. Let's just create an endpoint or script to fetch and save to a JSON file.
}
run();
