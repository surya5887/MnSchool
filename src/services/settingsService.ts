import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SETTINGS_COLLECTION = 'schoolSettings';
const SETTINGS_DOC_ID = 'general';

export interface SchoolSettingsData {
  schoolName: string;
  shortName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  faviconUrl?: string;
  signatureUrl?: string;
  twoFactorAuth?: boolean;
}

export const getSchoolSettings = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SchoolSettingsData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching school settings: ", error);
    throw error;
  }
};

export const saveSchoolSettings = async (settings: SchoolSettingsData) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, settings as any);
    } else {
      await setDoc(docRef, settings);
    }
  } catch (error) {
    console.error("Error saving school settings: ", error);
    throw error;
  }
};
