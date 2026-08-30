const fs = require('fs');
const dotenv = require('dotenv');
// parse .env.local manually
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
process.env = { ...process.env, ...envConfig };

// Now we need to mock import.meta.env
// But it's easier to just use firebase/firestore directly in JS
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const classesSnap = await getDocs(collection(db, "classes"));
  const classes = classesSnap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log("Classes:", classes);

  const stdSnap = await getDocs(collection(db, "students"));
  const students = stdSnap.docs.map(d => ({id: d.id, ...d.data()}));
  const anees = students.find(s => s.firstName === "ANEES");
  console.log("Anees:", anees);
  
  process.exit(0);
}
run();
