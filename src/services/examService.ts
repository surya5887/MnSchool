import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EXAM_MARKS_COLLECTION = 'exam_marks';

export interface ExamMarkData {
  id?: string;
  studentId: string;
  examTerm: string;
  subject: string;
  theoryMarks: number;
  practicalMarks: number;
}

export const saveExamMark = async (data: ExamMarkData) => {
  try {
    // Check if it already exists to update
    const q = query(
      collection(db, EXAM_MARKS_COLLECTION),
      where("studentId", "==", data.studentId),
      where("examTerm", "==", data.examTerm),
      where("subject", "==", data.subject)
    );
    const querySnapshot = await getDocs(q as any);
    
    if (!querySnapshot.empty) {
      // Update existing
      const existingDoc = querySnapshot.docs[0];
      const docRef = doc(db, EXAM_MARKS_COLLECTION, existingDoc.id);
      await updateDoc(docRef, {
        theoryMarks: data.theoryMarks,
        practicalMarks: data.practicalMarks
      });
      return existingDoc.id;
    } else {
      // Add new
      const docRef = await addDoc(collection(db, EXAM_MARKS_COLLECTION), data as any);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving exam mark: ", error);
    throw error;
  }
};

export const getExamMarks = async (examTerm: string, subject: string) => {
  try {
    const q = query(
      collection(db, EXAM_MARKS_COLLECTION),
      where("examTerm", "==", examTerm),
      where("subject", "==", subject)
    );
    const querySnapshot = await getDocs(q as any);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExamMarkData));
  } catch (error) {
    console.error("Error fetching exam marks: ", error);
    throw error;
  }
};
