import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const FEES_COLLECTION = 'feeGroups';
const FEE_TYPES_COLLECTION = 'feeTypes';

export interface FeeType {
  id?: string;
  name: string;
  code: string;
  description: string;
}

export interface FeeGroup {
  id?: string;
  name: string;
  description: string;
  feeTypes: { feeTypeId: string; amount: number; dueDate: string; fineType: string; fineAmount: number }[];
  totalAmount: number;
}

// Fee Types
export const getFeeTypes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, FEE_TYPES_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeType));
  } catch (error) {
    console.error("Error fetching fee types:", error);
    throw error;
  }
};

export const addFeeType = async (data: FeeType) => {
  try {
    const docRef = await addDoc(collection(db, FEE_TYPES_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding fee type:", error);
    throw error;
  }
};

// Fee Groups
export const getFeeGroups = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, FEES_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeGroup));
  } catch (error) {
    console.error("Error fetching fee groups:", error);
    throw error;
  }
};

export const addFeeGroup = async (data: FeeGroup) => {
  try {
    const docRef = await addDoc(collection(db, FEES_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding fee group:", error);
    throw error;
  }
};
