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
      console.log('Default Principal created securely.');
    }

    const manager = await getAdminByEmail('manager@mnps.in');
    if (!manager) {
      const hashedPassword = bcrypt.hashSync('manager@2026', 10);
      await addDoc(collection(db, 'admins'), {
        email: 'manager@mnps.in',
        password: hashedPassword,
        role: 'Manager',
        name: 'Manager'
      });
      console.log('Default Manager created securely.');
    }

    const superAdmin = await getAdminByEmail('superadmin@mnps.in');
    if (!superAdmin) {
      const hashedPassword = bcrypt.hashSync('super@2026', 10);
      await addDoc(collection(db, 'admins'), {
        email: 'superadmin@mnps.in',
        password: hashedPassword,
        role: 'Super Admin',
        name: 'Super Admin'
      });
      console.log('Default Super Admin created securely.');
    }
  } catch (error) {
    console.error('Error creating default admins', error);
  }
};
