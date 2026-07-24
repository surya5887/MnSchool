import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

const TRANSPORT_COLLECTION = 'transport_vehicles';

export interface VehicleData {
  id?: string;
  vehicleNo: string;
  route: string;
  driver: string;
  occupancy: string;
  monthlyFee: string;
  status: 'Running' | 'Maintenance';
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

export const getVehicles = async () => {
  try {
    const q = query(collection(db, TRANSPORT_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as unknown as VehicleData));
  } catch (error) {
    console.error("Error fetching vehicles: ", error);
    throw error;
  }
};
