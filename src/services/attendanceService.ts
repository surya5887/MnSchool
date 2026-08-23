import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type AttendanceStatus = 'Present' | 'Absent' | 'Unmarked';

export interface AttendanceRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  classId: string;
  sectionId: string;
  session: string;
  records: {
    [studentId: string]: AttendanceStatus;
  };
}

const COLLECTION_NAME = 'attendance';

// Helper to generate a deterministic ID
const generateDocId = (session: string, classId: string, sectionId: string, date: string) => {
  return `${session}_${classId}_${sectionId}_${date}`.replace(/[/ ]/g, '_');
};

export const getAttendance = async (date: string, classId: string, sectionId: string, session: string): Promise<AttendanceRecord | null> => {
  try {
    const docId = generateDocId(session, classId, sectionId, date);
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<AttendanceRecord, 'id'>) };
    }
    return null;
  } catch (error) {
    console.error("Error fetching attendance: ", error);
    return null;
  }
};

export const saveAttendance = async (data: AttendanceRecord): Promise<void> => {
  try {
    const docId = generateDocId(data.session, data.classId, data.sectionId, data.date);
    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving attendance: ", error);
    throw error;
  }
};