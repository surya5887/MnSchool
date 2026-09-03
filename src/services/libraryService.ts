import { collection, addDoc, getDocs, getDoc, query, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addTransaction } from './financeService';

export interface BookData {
  id?: string;
  bookId: string; // Accession No
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  price?: number;
  rackNumber?: string;
  status?: string; // Legacy support
  issuedTo?: string; // Legacy support
  session?: string;
}

export interface ExternalMemberData {
  id?: string;
  memberId: string;
  name: string;
  phone: string;
  address?: string;
  joinDate: string;
  validTill: string;
  isActive: boolean;
  session?: string;
}

export interface CirculationLogData {
  id?: string;
  bookId: string; // Document ID of the book
  bookAccessionNo: string;
  bookTitle: string;
  memberType: 'Internal' | 'External' | 'Staff';
  memberId: string; // Document ID of the member (student, staff, or external)
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount?: number;
  status: 'Issued' | 'Returned' | 'Overdue';
  session?: string;
}

export interface ReadingRoomLogData {
  id?: string;
  date: string; // YYYY-MM-DD
  memberType: 'Internal' | 'External' | 'Staff';
  memberId: string;
  memberName: string;
  seatNumber: string;
  inTime: string;
  outTime?: string;
  session?: string;
}

// ----------------- BOOKS -----------------

export const addBook = async (data: Omit<BookData, 'id'>) => {
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession && !data.session) data.session = activeSession;
  const docRef = await addDoc(collection(db, 'library_books'), data);
  return docRef.id;
};

export const getBooks = async (): Promise<BookData[]> => {
  let q = query(collection(db, 'library_books'));
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession) {
    q = query(collection(db, 'library_books'), where("session", "==", activeSession));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as BookData));
};

export const updateBook = async (id: string, data: Partial<BookData>) => {
  await updateDoc(doc(db, 'library_books', id), data);
};

export const deleteBook = async (id: string) => {
  await deleteDoc(doc(db, 'library_books', id));
};

// ----------------- EXTERNAL MEMBERS -----------------

export const addExternalMember = async (data: Omit<ExternalMemberData, 'id'>, registrationFee: number) => {
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession && !data.session) data.session = activeSession;
  const docRef = await addDoc(collection(db, 'library_external_members'), data);
  
  if (registrationFee > 0) {
    await addTransaction({
      type: 'Income',
      category: 'Library Membership',
      amount: registrationFee,
      date: new Date().toISOString(),
      description: `Membership fee for ${data.name} (${data.memberId})`,
      paymentMethod: 'Cash',
      referenceId: docRef.id
    });
  }
  return docRef.id;
};

export const getExternalMembers = async (): Promise<ExternalMemberData[]> => {
  let q = query(collection(db, 'library_external_members'));
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession) {
    q = query(collection(db, 'library_external_members'), where("session", "==", activeSession));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ExternalMemberData));
};

// ----------------- CIRCULATION -----------------

export const issueBook = async (data: Omit<CirculationLogData, 'id'>) => {
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession && !data.session) data.session = activeSession;
  
  // Decrease available copies
  const bookRef = doc(db, 'library_books', data.bookId);
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    const book = bookSnap.data() as BookData;
    if (book.availableCopies > 0) {
      await updateDoc(bookRef, { availableCopies: book.availableCopies - 1 });
    } else {
      throw new Error("No copies available");
    }
  }

  const docRef = await addDoc(collection(db, 'library_circulation'), data);
  return docRef.id;
};

export const returnBook = async (circulationId: string, bookId: string, fineAmount: number) => {
  // Increase available copies
  const bookRef = doc(db, 'library_books', bookId);
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    const book = bookSnap.data() as BookData;
    await updateDoc(bookRef, { availableCopies: book.availableCopies + 1 });
  }

  const circRef = doc(db, 'library_circulation', circulationId);
  await updateDoc(circRef, {
    status: 'Returned',
    returnDate: new Date().toISOString(),
    fineAmount: fineAmount
  });

  if (fineAmount > 0) {
    const circSnap = await getDoc(circRef);
    if(circSnap.exists()){
      const circData = circSnap.data() as CirculationLogData;
      await addTransaction({
        type: 'Income',
        category: 'Library Fine',
        amount: fineAmount,
        date: new Date().toISOString(),
        description: `Late return fine for book ${circData.bookTitle}`,
        paymentMethod: 'Cash',
        referenceId: circData.memberId
      });
    }
  }
};

export const getCirculationLogs = async (): Promise<CirculationLogData[]> => {
  let q = query(collection(db, 'library_circulation'));
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession) {
    q = query(collection(db, 'library_circulation'), where("session", "==", activeSession));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as CirculationLogData));
};

// ----------------- READING ROOM -----------------

export const checkInReadingRoom = async (data: Omit<ReadingRoomLogData, 'id'>) => {
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession && !data.session) data.session = activeSession;
  const docRef = await addDoc(collection(db, 'library_reading_room'), data);
  return docRef.id;
};

export const checkOutReadingRoom = async (logId: string) => {
  await updateDoc(doc(db, 'library_reading_room', logId), {
    outTime: new Date().toISOString()
  });
};

export const getReadingRoomLogs = async (): Promise<ReadingRoomLogData[]> => {
  let q = query(collection(db, 'library_reading_room'));
  const activeSession = localStorage.getItem('activeSession');
  if (activeSession) {
    q = query(collection(db, 'library_reading_room'), where("session", "==", activeSession));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as ReadingRoomLogData));
};

// Legacy support
export const updateBookStatus = async (id: string, status: string, issuedTo?: string) => {
  await updateDoc(doc(db, 'library_books', id), { status, issuedTo: issuedTo || null });
};
