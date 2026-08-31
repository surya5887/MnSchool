import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addTransaction, type TransactionData } from './financeService';

const TRANSPORT_COLLECTION = 'transport_vehicles';

export interface VehicleData {
  id?: string;
  vehicleNo: string;
  route: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  monthlyFee: number;
  status: 'Running' | 'Maintenance' | 'Off-Duty';
  lastMaintenanceDate?: string;
  // Legacy support for older docs during transition
  driver?: string;
  occupancy?: string;
}

export const addVehicle = async (data: Omit<VehicleData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, TRANSPORT_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding vehicle: ", error);
    throw error;
  }
};

export const updateVehicle = async (id: string, data: Partial<VehicleData>) => {
  try {
    const docRef = doc(db, TRANSPORT_COLLECTION, id);
    await updateDoc(docRef, data as any);
  } catch (error) {
    console.error("Error updating vehicle: ", error);
    throw error;
  }
};

export const deleteVehicle = async (id: string) => {
  try {
    const docRef = doc(db, TRANSPORT_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting vehicle: ", error);
    throw error;
  }
};

export const getVehicles = async () => {
  try {
    const q = query(collection(db, TRANSPORT_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const d = docSnap.data();
      return { 
        id: docSnap.id,
        vehicleNo: d.vehicleNo || '',
        route: d.route || '',
        driverName: d.driverName || d.driver || '',
        driverPhone: d.driverPhone || '',
        capacity: Number(d.capacity) || Number(d.occupancy) || 0,
        monthlyFee: Number(d.monthlyFee) || 0,
        status: d.status || 'Running',
        lastMaintenanceDate: d.lastMaintenanceDate || ''
      } as VehicleData;
    });
  } catch (error) {
    console.error("Error fetching vehicles: ", error);
    throw error;
  }
};

export const logTransportExpense = async (
  vehicleId: string,
  vehicleNo: string,
  amount: number,
  category: 'Transport Fuel' | 'Transport Maintenance' | 'Driver Salary',
  description: string,
  date: string
) => {
  try {
    const transaction: TransactionData = {
      type: 'Expense',
      category: category,
      amount: amount,
      date: date,
      description: `[${vehicleNo}] ${description}`,
      // Optionally link using referenceId if we need to filter by vehicle later
      referenceId: vehicleId
    };
    return await addTransaction(transaction);
  } catch (error) {
    console.error("Error logging transport expense: ", error);
    throw error;
  }
};
