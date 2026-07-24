import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const TRANSACTIONS_COLLECTION = 'transactions';

export interface TransactionData {
  id?: string;
  type: 'Income' | 'Expense';
  category: string; // 'Fee Collection', 'Salary', 'Maintenance', etc.
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI';
  referenceId?: string; // Student ID or Staff ID if applicable
  studentId?: string; // Explicitly link to a student
  createdAt?: string;
}

export const addTransaction = async (data: TransactionData) => {
  try {
    data.createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), data as any);
    return docRef.id;
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

export const getTransactions = async (filters?: { type?: 'Income' | 'Expense', studentId?: string }) => {
  try {
    let q = collection(db, TRANSACTIONS_COLLECTION);
    const conditions = [];
    
    if (filters?.type) {
      conditions.push(where("type", "==", filters.type));
    }
    if (filters?.studentId) {
      conditions.push(where("studentId", "==", filters.studentId));
    }
    
    if (conditions.length > 0) {
      q = query(q, ...conditions) as any;
    }
    
    const querySnapshot = await getDocs(q as any);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as TransactionData));
    
    // Sort descending by date (temporary until we add firestore index)
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return results;
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    throw error;
  }
};
