import { autoLog } from './auditService';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

const STAFF_COLLECTION = 'staff';

export interface StaffData {
  id?: string;
  customId?: string;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  salary: number;
  salaryStatus?: 'Paid' | 'Pending';
  status: 'Active' | 'Inactive' | 'On Leave' | 'Resigned';
  
  
  email?: string;
  phone?: string;
  photoUrl?: string;
  address?: string;
  aadharNumber?: string;
  cast?: string;
  religion?: string;
  qualification?: string;
  password?: string;
  assignedClass?: string;
  assignedSection?: string;
  
  documents?: {name: string, url: string}[];
  
  
  
  createdAt?: string;
  experience?: string;
  subject?: string;
}

export const addStaff = async (staffData: StaffData) => {
  try {
    staffData.createdAt = new Date().toISOString();
    staffData.salaryStatus = staffData.salaryStatus || 'Pending';
    
    // Auto-generate password: FirstName + Last 4 of Contact
    if (!staffData.password) {
      const firstName = staffData.name ? staffData.name.split(' ')[0].trim() : 'Staff';
      const phoneStr = (staffData.phone || '').replace(/\D/g, ''); // strip non-digits just in case
      const last4 = phoneStr.length >= 4 ? phoneStr.slice(-4) : '0000';
      staffData.password = `${firstName}${last4}`;
    }

    // Hash the password securely
    staffData.password = bcrypt.hashSync(staffData.password, 10);
    
    const docRef = await addDoc(collection(db, STAFF_COLLECTION), staffData as any);
    await autoLog(`Added new staff member: ${staffData.name}`);
    await autoLog('Added new staff member: ${staffData.name}');
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

export const updateStaff = async (id: string, staffData: Partial<StaffData>) => {
  try {
    if (staffData.password && !staffData.password.startsWith('$2a$') && !staffData.password.startsWith('$2b$')) {
      staffData.password = bcrypt.hashSync(staffData.password, 10);
    }
    const docRef = doc(db, STAFF_COLLECTION, id);
    await updateDoc(docRef, staffData);
  } catch (error) {
    console.error("Error updating staff: ", error);
    throw error;
  }
};

export const getStaffById = async (id: string): Promise<StaffData | null> => {
  try {
    const docRef = doc(db, STAFF_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as object) } as unknown as StaffData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching staff by id: ", error);
    throw error;
  }
};

export const deleteStaff = async (id: string) => {
  try {
    const docRef = doc(db, STAFF_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting staff: ", error);
    throw error;
  }
};

export const updateStaffPassword = async (id: string, password: string) => { const docRef = doc(db, STAFF_COLLECTION, id); await updateDoc(docRef, { password }); };

