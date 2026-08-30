const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  const docRef = doc(db, 'whatsapp_auth', 'school_1_creds');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data().data;
    console.log("Creds exist. me:", data.me);
  } else {
    console.log("Creds missing!");
  }
  process.exit(0);
})();
