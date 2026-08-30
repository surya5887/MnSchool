const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
process.env = { ...process.env, ...envConfig };

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  await setDoc(doc(db, "classes", "SEVENTH (7th)"), {
    className: "SEVENTH (7th)",
    sections: ["A", "B", "C"],
    monthlyBaseFee: 1500, // Rs 1500 per month
    createdAt: new Date().toISOString()
  });
  console.log("Class fee inserted!");
  process.exit(0);
}
run();
