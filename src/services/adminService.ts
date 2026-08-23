import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

export const getAdminByEmail = async (email: string) => {
  const q = query(collection(db, 'admins'), where('email', '==', email));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
  }
  return null;
};

export const createDefaultAdminIfNeeded = async () => {
  try {
    const admin = await getAdminByEmail('mnpsharsoli@gmail.com');
    if (!admin) {
      const hashedPassword = bcrypt.hashSync('admin@8393', 10);
      await addDoc(collection(db, 'admins'), {
        email: 'mnpsharsoli@gmail.com',
        password: hashedPassword,
        role: 'Principal',
        name: 'Principal / Admin'
      });
      console.log('Default admin created securely.');
    }
  } catch (error) {
    console.error('Error creating default admin', error);
  }
};
