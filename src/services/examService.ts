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

export const getAllExamMarksForTerm = async (examTerm: string) => {
  try {
    const q = query(
      collection(db, EXAM_MARKS_COLLECTION),
      where("examTerm", "==", examTerm)
    );
    const querySnapshot = await getDocs(q as any);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExamMarkData));
  } catch (error) {
    console.error("Error fetching all exam marks for term: ", error);
    throw error;
  }
};


const EXAM_SCHEDULE_COLLECTION = 'exam_schedules';
const QUESTION_PAPER_COLLECTION = 'question_papers';

export interface ExamScheduleData {
  id?: string;
  classId: string;
  examTerm: string;
  schedule: {
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface QuestionPaperData {
  id?: string;
  classId: string;
  subject: string;
  examTerm: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string[];
  sections: {
    sectionTitle: string;
    questions: {
      text: string;
      marks: number;
    }[];
  }[];
  createdAt: string;
}

export const saveExamSchedule = async (data: ExamScheduleData) => {
  try {
    const q = query(
      collection(db, EXAM_SCHEDULE_COLLECTION),
      where("classId", "==", data.classId),
      where("examTerm", "==", data.examTerm)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, EXAM_SCHEDULE_COLLECTION, querySnapshot.docs[0].id);
      await updateDoc(docRef, { schedule: data.schedule });
      return querySnapshot.docs[0].id;
    } else {
      const docRef = await addDoc(collection(db, EXAM_SCHEDULE_COLLECTION), data as any);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving exam schedule: ", error);
    throw error;
  }
};

export const getExamSchedulesByClass = async (classId: string) => {
  try {
    const q = query(collection(db, EXAM_SCHEDULE_COLLECTION), where("classId", "==", classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExamScheduleData));
  } catch (error) {
    console.error("Error fetching exam schedules: ", error);
    throw error;
  }
};

export const saveQuestionPaper = async (data: QuestionPaperData) => {
  try {
    const q = query(
      collection(db, QUESTION_PAPER_COLLECTION),
      where("classId", "==", data.classId),
      where("subject", "==", data.subject),
      where("examTerm", "==", data.examTerm)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, QUESTION_PAPER_COLLECTION, querySnapshot.docs[0].id);
      // Update existing paper
      const updateData = { ...data };
      delete updateData.id;
      await updateDoc(docRef, updateData as any);
      return querySnapshot.docs[0].id;
    } else {
      const docRef = await addDoc(collection(db, QUESTION_PAPER_COLLECTION), data as any);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving question paper: ", error);
    throw error;
  }
};

export const getQuestionPapersByClass = async (classId: string) => {
  try {
    const q = query(collection(db, QUESTION_PAPER_COLLECTION), where("classId", "==", classId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as QuestionPaperData));
  } catch (error) {
    console.error("Error fetching question papers: ", error);
    throw error;
  }
};
