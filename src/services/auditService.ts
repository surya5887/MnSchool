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

export const logAction = async (user: string, role: string, action: string, status: 'Success' | 'Failed' = 'Success') => {
  try {
    const data: AuditLogData = {
      user,
      role,
      action,
      time: new Date().toISOString(),
      ip: '192.168.1.1', // Mock IP for now
      status
    };
    await addDoc(collection(db, AUDIT_COLLECTION), data as any);
  } catch (error) {
    console.error("Error logging action: ", error);
  }
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
