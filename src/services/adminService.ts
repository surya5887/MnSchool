import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

export const getAllAdmins = async () => {
  const snap = await getDocs(collection(db, 'admins'));
  const admins = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  
  const uniqueEmails = new Set();
  const uniqueAdmins = [];
  
  for (const admin of admins) {
    if (uniqueEmails.has(admin.email)) {
      // Duplicate found in database! Let's delete it automatically to keep the DB clean.
      try {
        await deleteDoc(doc(db, 'admins', admin.id));
        console.log(`Deleted duplicate admin for ${admin.email}`);
      } catch(e) {
        console.error("Could not delete duplicate", e);
      }
    } else {
      uniqueEmails.add(admin.email);
      uniqueAdmins.push(admin);
    }
  }
  
  return uniqueAdmins;
};

export const updateAdminCredentials = async (id: string, email: string, password?: string) => {
  const adminRef = doc(db, 'admins', id);
  const updateData: any = { email };
  if (password) {
    updateData.password = bcrypt.hashSync(password, 10);
  }
  await updateDoc(adminRef, updateData);
};
