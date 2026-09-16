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
export const getClientInfo = async (): Promise<string> => {
  // Device detection
  const ua = navigator.userAgent;
  let device = "Desktop";
  if (/android/i.test(ua)) device = "Android";
  else if (/iPad|iPhone|iPod/.test(ua)) device = "iOS";
  else if (/Windows/.test(ua)) device = "Windows";
  else if (/Mac/.test(ua)) device = "Mac";

  if ((window as any).latestLocation) {
    return `${device} | ${(window as any).latestLocation}`;
  }

  // Fallback if watchPosition hasn't fired yet
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    });
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    return `${device} | GPS: ${lat.toFixed(5)},${lon.toFixed(5)}`;
  } catch (err) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return `${device} | ${data.ip} (${data.city || 'Unknown'})`;
    } catch (e) {
      return `${device} | Unknown Location`;
    }
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
    const querySnapshot = await getDocs(collection(db, AUDIT_COLLECTION));
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as AuditLogData));
    
    // Auto-cleanup: if any log is older than 30 days, delete it
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    const toDelete = results.filter(log => {
      const logTime = new Date(log.time).getTime();
      if (isNaN(logTime)) return false;
      return (now - logTime) > THIRTY_DAYS_MS;
    });
    
    if (toDelete.length > 0) {
      // Background delete so it doesn't block the UI
      Promise.all(toDelete.map(log => deleteDoc(doc(db, AUDIT_COLLECTION, log.id!)))).catch(e => console.error("Error cleaning up old logs", e));
    }

    // Only return valid/recent logs
    const validResults = results.filter(log => {
      const logTime = new Date(log.time).getTime();
      if (isNaN(logTime)) return true; // keep invalid dates so they aren't hidden forever
      return (now - logTime) <= THIRTY_DAYS_MS;
    });
    
    // Sort descending by time
    validResults.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
    
    return validResults;
  } catch (error) {
    console.error("Error fetching audit logs: ", error);
    throw error;
  }
};

export const autoLog = async (action: string, status: 'Success' | 'Failed' = 'Success', systemOverride: boolean = false) => {
  try {
    const authUser = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}');
    let user = authUser.name || 'Unknown User';
    let role = authUser.role || 'Unknown Role';
    if (systemOverride) {
      user = 'Automatic System';
      role = 'System';
    }
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
