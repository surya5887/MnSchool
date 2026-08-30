const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  const docRef = doc(db, 'whatsapp_auth', 'school_erp_creds');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("Creds exist! Name:", snap.data().data.me.name);
  } else {
    console.log("Creds missing!");
  }
  process.exit(0);
})();
