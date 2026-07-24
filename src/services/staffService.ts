import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const STAFF_COLLECTION = 'staff';

export interface StaffData {
  id?: string;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  salary: number;
  salaryStatus?: 'Paid' | 'Pending';
  status: 'Active' | 'On Leave' | 'Resigned';
  email?: string;
  phone?: string;
  photoUrl?: string;
  createdAt?: string;
  experience?: string;
  subject?: string;
}

export const addStaff = async (staffData: StaffData) => {
  try {
    staffData.createdAt = new Date().toISOString();
    staffData.salaryStatus = staffData.salaryStatus || 'Pending';
    const docRef = await addDoc(collection(db, STAFF_COLLECTION), staffData as any);
    return docRef.id;
  } catch (error) {
    console.error("Error adding staff: ", error);
    throw error;
  }
};

export const getStaff = async () => {
  try {
    const q = collection(db, STAFF_COLLECTION);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as StaffData));
  } catch (error) {
    console.error("Error fetching staff: ", error);
    throw error;
  }
};

export const updateStaffStatus = async (id: string, status: StaffData['status']) => {
  try {
    const docRef = doc(db, STAFF_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating staff status: ", error);
    throw error;
  }
};

export const updateStaffSalaryStatus = async (id: string, salaryStatus: 'Paid' | 'Pending') => {
  try {
    const docRef = doc(db, STAFF_COLLECTION, id);
    await updateDoc(docRef, { salaryStatus });
  } catch (error) {
    console.error("Error updating staff salary status: ", error);
    throw error;
  }
};
