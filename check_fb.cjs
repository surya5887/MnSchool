const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  const snapshot = await getDocs(collection(db, 'whatsapp_auth'));
  console.log("Documents in whatsapp_auth:", snapshot.size);
  process.exit(0);
})();
