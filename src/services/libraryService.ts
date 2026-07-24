import { collection, addDoc, getDocs, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const LIBRARY_COLLECTION = 'library_books';

export interface BookData {
  id?: string;
  bookId: string;
  title: string;
  author: string;
  category: string;
  status: 'Available' | 'Issued';
  issuedTo?: string;
}

export const addBook = async (data: Omit<BookData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, LIBRARY_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding book: ", error);
    throw error;
  }
};

export const getBooks = async () => {
  try {
    const q = query(collection(db, LIBRARY_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as BookData));
  } catch (error) {
    console.error("Error fetching books: ", error);
    throw error;
  }
};

export const updateBookStatus = async (docId: string, status: 'Available' | 'Issued', issuedTo?: string) => {
  try {
    const docRef = doc(db, LIBRARY_COLLECTION, docId);
    await updateDoc(docRef, { status, issuedTo: issuedTo || null });
  } catch (error) {
    console.error("Error updating book status: ", error);
    throw error;
  }
};
