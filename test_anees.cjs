const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
process.env = { ...process.env, ...envConfig };

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

async function run() {
  const stdSnap = await getDocs(collection(db, "students"));
  const students = stdSnap.docs.map(d => ({id: d.id, ...d.data()}));
  const anees = students.find(s => s.firstName === "ANEES");
  console.log("Billed Months:", anees.billedMonths);
  console.log("Late Fees Applied:", anees.lateFeesApplied);
  process.exit(0);
}
run();
