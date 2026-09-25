import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAX7iZ_CTxIt99Cu2Sysw6rJ31vubxTw_I",
  authDomain: "mn-public-school.firebaseapp.com",
  projectId: "mn-public-school",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const qs = await getDocs(collection(db, "school_classes"));
  qs.forEach(doc => {
    const data = doc.data();
    if (data.sections && data.sections.length > 1) {
      console.log("MULTI:", doc.id, data.className, data.sections);
    }
  });
}
check();
