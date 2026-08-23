import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const migrateMissingSessions = async () => {
  try {
    const activeSession = localStorage.getItem('activeSession');
    if (!activeSession) return 0;

    const collectionsToMigrate = ['students', 'school_classes', 'transactions'];
    let updatedCount = 0;

    for (const colName of collectionsToMigrate) {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      
      const batchPromises = snapshot.docs.map(async (document) => {
        const data = document.data();
        if (!data.session) {
          const docRef = doc(db, colName, document.id);
          await updateDoc(docRef, { session: activeSession });
          updatedCount++;
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    return updatedCount;
  } catch (error) {
    console.error("Migration failed:", error);
    return 0;
  }
};
