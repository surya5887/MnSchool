import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAX7iZ_CTxIt99Cu2Sysw6rJ31vubxTw_I",
  authDomain: "mn-public-school.firebaseapp.com",
  projectId: "mn-public-school",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  // 1. Fetch U.K.G. (Tcz06Sz6H1pBnB9SZPbR) which has ['A', 'B']
  // 2. Fetch L.K.G. (82XqvwKc0WQh14gEa4rC) which has ['A', 'B']
  
  // We will leave 'A' in the original docs, and create NEW docs for 'B'.
  
  const ukgNewData = {
    className: "U.K.G.",
    sections: ["B"],
    subjects: ['ENGLISH', 'HINDI', 'MATHS', 'URDU'],
    classTeacher: "AISHA",
    monthlyBaseFee: 300,
    fees: [{ feeName: 'Monthly Tuition', amount: 300 }],
    order: 5,
    session: "2026-2027"
  };
  
  const lkgNewData = {
    className: "L.K.G.",
    sections: ["B"],
    subjects: ['ENGLISH', 'HINDI', 'MATHS', 'URDU'],
    classTeacher: "NASEEM",
    monthlyBaseFee: 300,
    fees: [{ feeName: 'Monthly Tuition', amount: 300 }],
    order: 13,
    session: "2026-2027"
  };
  
  const ukgB_Ref = await addDoc(collection(db, "school_classes"), ukgNewData);
  const lkgB_Ref = await addDoc(collection(db, "school_classes"), lkgNewData);
  
  console.log("Created U.K.G. B:", ukgB_Ref.id);
  console.log("Created L.K.G. B:", lkgB_Ref.id);
  
  // Update originals to only have 'A'
  await updateDoc(doc(db, "school_classes", "Tcz06Sz6H1pBnB9SZPbR"), { sections: ["A"] });
  await updateDoc(doc(db, "school_classes", "82XqvwKc0WQh14gEa4rC"), { sections: ["A"] });
  
  // Now update students
  let updatedCount = 0;
  const qs = await getDocs(collection(db, "students"));
  for (const studentDoc of qs.docs) {
    const data = studentDoc.data();
    
    // Check U.K.G B
    if ((data.classId === "Tcz06Sz6H1pBnB9SZPbR" || data.classId === "U.K.G.") && data.sectionId === "B") {
      await updateDoc(doc(db, "students", studentDoc.id), { classId: ukgB_Ref.id });
      updatedCount++;
    }
    
    // Check L.K.G B
    if ((data.classId === "82XqvwKc0WQh14gEa4rC" || data.classId === "L.K.G.") && data.sectionId === "B") {
      await updateDoc(doc(db, "students", studentDoc.id), { classId: lkgB_Ref.id });
      updatedCount++;
    }
  }
  
  console.log("Updated", updatedCount, "students");
}

migrate();
