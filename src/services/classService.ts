import { collection, addDoc, getDocs, getDoc, query, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CLASSES_COLLECTION = 'school_classes';

export interface ClassData {
  id?: string;
  className: string;       // e.g. "Class 1", "Class 10"
  order: number;
  sections: string[];
  subjects: string[];       // e.g. ["English", "Hindi", "Maths"]
  classTeacher: string;     // e.g. "Aditi Sharma"
  monthlyBaseFee?: number;
  fees?: { feeName: string; amount: number }[]; // Dynamic fee structure
  session?: string;
}

export const addClass = async (data: Omit<ClassData, 'id'>) => {
  try {
    const activeSession = localStorage.getItem('activeSession');
    if (activeSession && !data.session) {
      data.session = activeSession;
    }
    const docRef = await addDoc(collection(db, CLASSES_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding class: ", error);
    throw error;
  }
};

export const getClasses = async (): Promise<ClassData[]> => {
  try {
    let q = query(collection(db, CLASSES_COLLECTION));
    const activeSession = localStorage.getItem('activeSession');
    if (activeSession) {
      q = query(collection(db, CLASSES_COLLECTION), where("session", "==", activeSession));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ClassData));
  } catch (error) {
    console.error("Error fetching classes: ", error);
    throw error;
  }
};

export const deleteClass = async (docId: string) => {
  try {
    await deleteDoc(doc(db, CLASSES_COLLECTION, docId));
  } catch (error) {
    console.error("Error deleting class: ", error);
    throw error;
  }
};

export const updateClass = async (id: string, data: Partial<ClassData>) => {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating class: ", error);
    throw error;
  }
};

export const getClassById = async (id: string): Promise<ClassData | null> => {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as object) } as unknown as ClassData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching class: ", error);
    throw error;
  }
};
