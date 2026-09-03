import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const authUserStr = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
    if (!authUserStr) return false;
    
    const authUser = JSON.parse(authUserStr);
    
    // Safety check: Only admins/principals should be deleting things
    if (authUser.role !== 'Principal' && authUser.role !== 'Admin') {
       return false;
    }

    const docRef = doc(db, 'staff', authUser.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const storedPass = docSnap.data().password;
      if (storedPass.startsWith('$2a$') || storedPass.startsWith('$2b$')) {
        return bcrypt.compareSync(password, storedPass);
      } else {
        // Legacy plaintext check just in case
        return password === storedPass;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error verifying admin password:", error);
    return false;
  }
};
