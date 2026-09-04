import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const REPORT_CARD_META_COLLECTION = 'report_card_meta';

export interface ReportCardMetaData {
  id?: string;
  studentId: string;
  session: string;
  workEducation: string;
  artEducation: string;
  healthEducation: string;
  teacherRemarks: string;
  issueDate: string;
  attendance: string;
}

export const saveReportCardMeta = async (data: ReportCardMetaData) => {
  try {
    const q = query(
      collection(db, REPORT_CARD_META_COLLECTION),
      where("studentId", "==", data.studentId),
      where("session", "==", data.session)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      const docRef = doc(db, REPORT_CARD_META_COLLECTION, existingDoc.id);
      await updateDoc(docRef, data as any);
      return existingDoc.id;
    } else {
      const docRef = await addDoc(collection(db, REPORT_CARD_META_COLLECTION), data as any);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving report card meta: ", error);
    throw error;
  }
};

export const getAllReportCardMeta = async (session: string) => {
  try {
    const q = query(
      collection(db, REPORT_CARD_META_COLLECTION),
      where("session", "==", session)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ReportCardMetaData));
  } catch (error) {
    console.error("Error fetching report card meta: ", error);
    throw error;
  }
};
