import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const AUDIT_COLLECTION = 'audit_logs';

export interface AuditLogData {
  id?: string;
  user: string;
  role: string;
  action: string;
  time: string;
  ip: string;
  status: 'Success' | 'Failed';
}


let cachedIpInfo = '';
export const getClientInfo = async () => {
  if (cachedIpInfo) return cachedIpInfo;
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    cachedIpInfo = `${data.ip} (${data.city || 'Unknown'}, ${data.country_name || 'Location'})`;
    return cachedIpInfo;
  } catch (e) {
    return 'Unknown IP';
  }
};

export const logAction = async (user: string, role: string, action: string, status: 'Success' | 'Failed' = 'Success') => {
  try {
    const data: AuditLogData = {
      user,
      role,
      action,
      time: new Date().toISOString(),
      ip: await getClientInfo(),
      status
    };
    await addDoc(collection(db, AUDIT_COLLECTION), data as any);
  } catch (error) {
    console.error("Error logging action: ", error);
  }
};

import { deleteDoc, doc } from 'firebase/firestore';

export const clearSpamLogs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, AUDIT_COLLECTION));
    for (const d of querySnapshot.docs) {
      if (d.data().action === 'Updated Core Settings' || d.data().action.includes('Fee Collected') || d.data().action.includes('Expense Logged')) {
        await deleteDoc(doc(db, AUDIT_COLLECTION, d.id));
      }
    }
    console.log('Spam cleared');
  } catch (e) { console.error(e); }
};

export const getAuditLogs = async () => {
  try {
    // Note: requires an index on 'time' if we use orderBy, but since it's a small app without indexes yet, we'll fetch and sort.
    const querySnapshot = await getDocs(collection(db, AUDIT_COLLECTION));
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as AuditLogData));
    
    // Sort descending by time
    results.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    return results;
  } catch (error) {
    console.error("Error fetching audit logs: ", error);
    throw error;
  }
};

export const autoLog = async (action: string, status: 'Success' | 'Failed' = 'Success') => {
  try {
    const authUser = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}');
    const user = authUser.name || 'Unknown User';
    const role = authUser.role || 'Unknown Role';
    await logAction(user, role, action, status);
  } catch (e) {
    console.error("Auto log failed", e);
  }
};

export const removeAuditTrailActivatedLog = async () => {
  try {
    const snap = await getDocs(collection(db, AUDIT_COLLECTION));
    for (const d of snap.docs) {
      if (d.data().action && d.data().action.includes('Audit Trail Activated')) {
        await deleteDoc(doc(db, AUDIT_COLLECTION, d.id));
      }
    }
  } catch (e) {}
};
