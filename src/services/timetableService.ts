import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const TIMETABLE_COLLECTION = 'timetables';
const STRUCTURE_COLLECTION = 'timetable_structures';

export interface TimetableEntry {
  id?: string;
  classId: string;
  day: string;
  periodIndex: number;
  subject: string;
  teacher: string;
}

export interface TimetableStructure {
  days: { name: string; isHoliday: boolean }[];
  periods: { name: string; isBreak: boolean }[];
}

export const assignPeriod = async (data: Omit<TimetableEntry, 'id'>) => {
  try {
    const q = query(
      collection(db, TIMETABLE_COLLECTION),
      where("classId", "==", data.classId),
      where("day", "==", data.day),
      where("periodIndex", "==", data.periodIndex)
    );
    const querySnapshot = await getDocs(q as any);
    
    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      const docRef = doc(db, TIMETABLE_COLLECTION, existingDoc.id);
      await updateDoc(docRef, {
        subject: data.subject,
        teacher: data.teacher
      });
    } else {
      await addDoc(collection(db, TIMETABLE_COLLECTION), data as any);
    }
  } catch (error) {
    console.error("Error assigning period: ", error);
    throw error;
  }
};

export const getTimetable = async (classId: string) => {
  try {
    const q = query(
      collection(db, TIMETABLE_COLLECTION),
      where("classId", "==", classId)
    );
    const querySnapshot = await getDocs(q as any);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as TimetableEntry));
  } catch (error) {
    console.error("Error fetching timetable: ", error);
    throw error;
  }
};

export const removePeriod = async (classId: string, day: string, periodIndex: number) => {
  try {
    const q = query(
      collection(db, TIMETABLE_COLLECTION),
      where("classId", "==", classId),
      where("day", "==", day),
      where("periodIndex", "==", periodIndex)
    );
    const querySnapshot = await getDocs(q as any);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, TIMETABLE_COLLECTION, querySnapshot.docs[0].id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error("Error removing period: ", error);
    throw error;
  }
};

export const getTimetableStructure = async (classId: string): Promise<TimetableStructure | null> => {
  try {
    const q = query(collection(db, STRUCTURE_COLLECTION), where("classId", "==", classId));
    const querySnapshot = await getDocs(q as any);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data() as any;
      return { days: data.days, periods: data.periods };
    }
    return null;
  } catch (error) {
    console.error("Error fetching timetable structure: ", error);
    throw error;
  }
};

export const saveTimetableStructure = async (classId: string, structure: TimetableStructure) => {
  try {
    const q = query(collection(db, STRUCTURE_COLLECTION), where("classId", "==", classId));
    const querySnapshot = await getDocs(q as any);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, STRUCTURE_COLLECTION, querySnapshot.docs[0].id);
      await updateDoc(docRef, structure as any);
    } else {
      await addDoc(collection(db, STRUCTURE_COLLECTION), { classId, ...structure });
    }
  } catch (error) {
    console.error("Error saving timetable structure: ", error);
    throw error;
  }
};
