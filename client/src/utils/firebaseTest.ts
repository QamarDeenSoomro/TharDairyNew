// Firebase connection test utility
import { vendorService } from '@/services/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    const vendors = await vendorService.getAll();
    console.log('Firebase connection successful:', vendors.length, 'vendors found');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};