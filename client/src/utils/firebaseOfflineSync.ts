// Firebase integration for offline sync functionality
import { vendorService, customerService, transactionService, paymentService } from '@/services/firebase-realtime';
import { offlineStorage } from './offlineStorage';
import { InsertVendor, InsertCustomer, InsertMilkTransaction, InsertPayment } from '@shared/schema';

export interface OfflineDataItem {
  id: string;
  type: 'transaction' | 'payment' | 'vendor' | 'customer';
  data: any;
  timestamp: number;
  synced: boolean;
}

// Sync individual item with Firebase based on type
export const syncItemWithFirebase = async (item: OfflineDataItem): Promise<void> => {
  try {
    switch (item.type) {
      case 'vendor':
        await vendorService.create(item.data as InsertVendor);
        break;
        
      case 'customer':
        await customerService.create(item.data as InsertCustomer);
        break;
        
      case 'transaction':
        await transactionService.create(item.data as InsertMilkTransaction);
        break;
        
      case 'payment':
        await paymentService.create(item.data as InsertPayment);
        break;
        
      default:
        throw new Error(`Unknown data type: ${item.type}`);
    }
    
    console.log(`Successfully synced ${item.type}:`, item.id);
  } catch (error) {
    console.error(`Failed to sync ${item.type} ${item.id}:`, error);
    throw error;
  }
};

// Sync all offline data with Firebase
export const syncAllOfflineData = async (): Promise<{ synced: number; failed: number }> => {
  const unsyncedData = await offlineStorage.getUnsyncedData();
  let synced = 0;
  let failed = 0;
  
  for (const item of unsyncedData) {
    try {
      await syncItemWithFirebase(item);
      await offlineStorage.markAsSynced(item.id);
      synced++;
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      failed++;
    }
  }
  
  // Clean up successfully synced data
  if (synced > 0) {
    await offlineStorage.clearSyncedData();
  }
  
  return { synced, failed };
};

// Save data offline when online sync fails
export const saveForOfflineSync = async (
  type: 'transaction' | 'payment' | 'vendor' | 'customer',
  data: any
): Promise<string> => {
  console.log(`Saving ${type} for offline sync:`, data);
  return await offlineStorage.saveOfflineData(type, data);
};

// Check if we should attempt offline storage
export const shouldUseOfflineStorage = (): boolean => {
  return !navigator.onLine || !window.navigator.onLine;
};

// Enhanced service functions that handle offline scenarios
export const createVendorWithOfflineSupport = async (vendorData: InsertVendor): Promise<string> => {
  try {
    // Try online first
    return await vendorService.create(vendorData);
  } catch (error) {
    // If online fails, save offline
    if (shouldUseOfflineStorage()) {
      console.log('Saving vendor offline due to network issue');
      return await saveForOfflineSync('vendor', vendorData);
    }
    throw error;
  }
};

export const createCustomerWithOfflineSupport = async (customerData: InsertCustomer): Promise<string> => {
  try {
    return await customerService.create(customerData);
  } catch (error) {
    if (shouldUseOfflineStorage()) {
      console.log('Saving customer offline due to network issue');
      return await saveForOfflineSync('customer', customerData);
    }
    throw error;
  }
};

export const createTransactionWithOfflineSupport = async (transactionData: InsertMilkTransaction): Promise<string> => {
  try {
    return await transactionService.create(transactionData);
  } catch (error) {
    if (shouldUseOfflineStorage()) {
      console.log('Saving transaction offline due to network issue');
      return await saveForOfflineSync('transaction', transactionData);
    }
    throw error;
  }
};

export const createPaymentWithOfflineSupport = async (paymentData: InsertPayment): Promise<string> => {
  try {
    return await paymentService.create(paymentData);
  } catch (error) {
    if (shouldUseOfflineStorage()) {
      console.log('Saving payment offline due to network issue');
      return await saveForOfflineSync('payment', paymentData);
    }
    throw error;
  }
};