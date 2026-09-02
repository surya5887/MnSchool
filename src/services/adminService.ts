import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

export const getAdminByEmail = async (email: string) => {
  const q = query(collection(db, 'staff'), where('email', '==', email));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
  }
  return null;
};


export const createDefaultAdminIfNeeded = async () => {
  try {
    // ONE-TIME MIGRATION: Copy existing admins from 'admins' collection to 'staff' collection
    const oldAdminsSnap = await getDocs(collection(db, 'admins'));
    if (!oldAdminsSnap.empty) {
      for (const oldDoc of oldAdminsSnap.docs) {
        const adminData = oldDoc.data();
        // Check if already in staff
        if (!adminData.email) continue;
        const staffQ = query(collection(db, 'staff'), where('email', '==', adminData.email));
        const staffSnap = await getDocs(staffQ);
        if (staffSnap.empty) {
          // Add to staff with all their existing data (including their current changed password!)
          await addDoc(collection(db, 'staff'), {
            ...adminData,
            status: 'Active',
            createdAt: new Date().toISOString()
          });
          console.log(`Migrated ${adminData.email} from admins to staff.`);
        }
      }
    }

    // Now proceed with normal default creation (in staff) if they STILL don't exist
    const admin = await getAdminByEmail('mnpsharsoli@gmail.com');
    if (!admin) {
      const hashedPassword = bcrypt.hashSync('admin@8393', 10);
      await addDoc(collection(db, 'staff'), {
        email: 'mnpsharsoli@gmail.com',
        password: hashedPassword,
        role: 'Principal',
        name: 'Principal / Admin',
        status: 'Active'
      });
      console.log('Default Principal created securely.');
    }

    const manager = await getAdminByEmail('manager@mnps.in');
    if (!manager) {
      const hashedPassword = bcrypt.hashSync('manager@2026', 10);
      await addDoc(collection(db, 'staff'), {
        email: 'manager@mnps.in',
        password: hashedPassword,
        role: 'Manager',
        name: 'Manager',
        status: 'Active'
      });
      console.log('Default Manager created securely.');
    }

    const superAdmin = await getAdminByEmail('superadmin@mnps.in');
    if (!superAdmin) {
      const hashedPassword = bcrypt.hashSync('super@2026', 10);
      await addDoc(collection(db, 'staff'), {
        email: 'superadmin@mnps.in',
        password: hashedPassword,
        role: 'Super Admin',
        name: 'Super Admin',
        status: 'Active'
      });
      console.log('Default Super Admin created securely.');
    }
  } catch (error) {
    console.error('Error creating default admins', error);
  }
};


export const getAllAdmins = async () => {
  const q = query(collection(db, 'staff'), where('role', 'in', ['Admin', 'Principal', 'Manager', 'Super Admin']));
  const snap = await getDocs(q);
  const admins = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
  
  const uniqueEmails = new Set();
  const uniqueAdmins = [];
  
  for (const admin of admins) {
    if (uniqueEmails.has(admin.email)) {
      // Duplicate found in database! Let's delete it automatically to keep the DB clean.
      try {
        await deleteDoc(doc(db, 'staff', admin.id));
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

export const updateAdminCredentials = async (id: string, email: string, name: string, password?: string) => {
  const adminRef = doc(db, 'staff', id);
  const updateData: any = { email, name };
  if (password) {
    updateData.password = bcrypt.hashSync(password, 10);
  }
  await updateDoc(adminRef, updateData);
};

export const setupInitialProfiles = async () => {
  if (localStorage.getItem('profiles_setup')) return;
  const snap = await getDocs(collection(db, 'staff'));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.role === 'Principal' && data.name === 'Principal / Admin') {
      await updateDoc(doc(db, 'staff', d.id), { name: 'Mohd Arif' });
    } else if (data.role === 'Manager' && data.name === 'Manager') {
      await updateDoc(doc(db, 'staff', d.id), { name: 'Mufti Shariq' });
    }
  }
  localStorage.setItem('profiles_setup', 'true');
};
