import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAX7iZ_CTxIt99Cu2Sysw6rJ31vubxTw_I",
  authDomain: "mn-public-school.firebaseapp.com",
  projectId: "mn-public-school",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  await setDoc(doc(db, "whatsapp_auth", "test_doc"), { hello: "world" });
  console.log("Success!");
  process.exit(0);
}

test();
