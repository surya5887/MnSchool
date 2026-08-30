const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
process.env = { ...process.env, ...envConfig };

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const classesSnap = await getDocs(collection(db, "school_classes"));
  const classes = classesSnap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log("Real Classes:", JSON.stringify(classes, null, 2));

  process.exit(0);
}
run();
