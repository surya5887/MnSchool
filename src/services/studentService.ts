import { autoLog } from './auditService';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

const STUDENTS_COLLECTION = 'students';

export interface StudentData {
  id?: string;
  admissionNo?: string;
  rollNumber?: number;
  classId: string;
  sectionId: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dob?: string;
  category?: string;
  bloodGroup?: string;
  religion?: string;
  nationalIdNumber?: string;
  phone?: string;
  email?: string;
  password?: string;
  parentAccountId?: string;
  parentName?: string;
  parentPhone?: string;
  assignedFeeGroups?: string[];
  photoUrl?: string;
  documents?: { name: string; url: string }[];
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  aadharNumber?: string;
  feeGroup?: string;
  transportRoute?: string;
  admissionDate?: string;
  address?: string;
  motherName?: string;
  emergencyContact?: string;
  admissionType?: 'New' | 'Old';
  originalAdmissionDate?: string;
  previousDues?: number;
  previousPaidAmount?: number;
  previousSession?: string;
  billedMonths?: string[];
  lateFeesApplied?: string[];
  session?: string;
  caste?: string;
  fatherAadhar?: string;
  fatherQualification?: string;
  fatherOccupation?: string;
  motherAadhar?: string;
  motherQualification?: string;
  motherOccupation?: string;
  motherPhone?: string;
  discountPercent?: number;
}

export const addStudent = async (studentData: StudentData) => {
  try {
    studentData.createdAt = new Date().toISOString();
    studentData.status = studentData.status || 'Active';
    
    // Auto-generate password: NAMEYYYY (First Name + Birth Year)
    if (!studentData.password) {
      const firstName = studentData.firstName ? studentData.firstName.trim().toUpperCase() : 'STUDENT';
      let year = '0000';
      if (studentData.dob) {
        const d = new Date(studentData.dob);
        if (!isNaN(d.getFullYear())) {
          year = d.getFullYear().toString();
        }
      }
      studentData.password = `${firstName}${year}`;
    }
    
    // Hash the password securely
    studentData.password = bcrypt.hashSync(studentData.password, 10);
    
    const activeSession = localStorage.getItem('activeSession');
    if (activeSession && !studentData.session) {
      studentData.session = activeSession;
    }

    const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), studentData as any);
    await autoLog(`Admitted new student: ${studentData.firstName} ${studentData.lastName}`);
    return docRef.id;
  } catch (error) {
    console.error("Error adding student: ", error);
    throw error;
  }
};

export const getStudents = async (filters?: { classId?: string; sectionId?: string }) => {
  try {
    let q = collection(db, STUDENTS_COLLECTION);
    const conditions = [];
    
    const activeSession = localStorage.getItem('activeSession');
    if (activeSession) {
      conditions.push(where("session", "==", activeSession));
    }

    if (filters?.classId) conditions.push(where("classId", "==", filters.classId));
    if (filters?.sectionId) conditions.push(where("sectionId", "==", filters.sectionId));
    
    if (conditions.length > 0) {
      q = query(q, ...conditions) as any;
    }
    
    const querySnapshot = await getDocs(q as any);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as StudentData));
  } catch (error) {
    console.error("Error fetching students: ", error);
    throw error;
  }
};

export const getStudentById = async (id: string) => {
  try {
    const docRef = doc(db, STUDENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StudentData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching student: ", error);
    throw error;
  }
};

export const updateStudent = async (id: string, updateData: Partial<StudentData>) => {
  try {
    if (updateData.password && !updateData.password.startsWith('$2a$') && !updateData.password.startsWith('$2b$')) {
      updateData.password = bcrypt.hashSync(updateData.password, 10);
    }
    const docRef = doc(db, STUDENTS_COLLECTION, id);
    await updateDoc(docRef, updateData as any);
  } catch (error) {
    console.error("Error updating student: ", error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const docRef = doc(db, STUDENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting student: ", error);
    throw error;
  }
};

export const updateStudentPassword = async (id: string, password: string) => { const docRef = doc(db, STUDENTS_COLLECTION, id); await updateDoc(docRef, { password }); };
