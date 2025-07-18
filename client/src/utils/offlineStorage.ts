// Offline storage utilities using IndexedDB for PWA functionality

interface OfflineData {
  id: string;
  type: 'transaction' | 'payment' | 'vendor' | 'customer';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineStorage {
  private dbName = 'MilkSupplyOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  async saveOfflineData(type: OfflineData['type'], data: any): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineData(type?: OfflineData['type']): Promise<OfflineData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      let request: IDBRequest;
      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Data not found, consider it synced
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteOfflineData(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const syncedData = await this.getSyncedData();
    const deletePromises = syncedData.map(item => this.deleteOfflineData(item.id));
    await Promise.all(deletePromises);
  }

  private async getSyncedData(): Promise<OfflineData[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      const request = index.getAll(true);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getDataCount(): Promise<{ total: number; unsynced: number }> {
    try {
      const allData = await this.getOfflineData();
      const unsyncedData = await this.getUnsyncedData();
      
      return {
        total: allData.length,
        unsynced: unsyncedData.length
      };
    } catch (error) {
      console.error('Error getting data count:', error);
      return { total: 0, unsynced: 0 };
    }
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();

// Initialize offline storage
export const initOfflineStorage = async (): Promise<void> => {
  try {
    await offlineStorage.init();
    console.log('Offline storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize offline storage:', error);
    throw error;
  }
};

// Utility functions for common operations
export const saveTransactionOffline = async (transactionData: any): Promise<string> => {
  return offlineStorage.saveOfflineData('transaction', transactionData);
};

export const savePaymentOffline = async (paymentData: any): Promise<string> => {
  return offlineStorage.saveOfflineData('payment', paymentData);
};

export const saveVendorOffline = async (vendorData: any): Promise<string> => {
  return offlineStorage.saveOfflineData('vendor', vendorData);
};

export const saveCustomerOffline = async (customerData: any): Promise<string> => {
  return offlineStorage.saveOfflineData('customer', customerData);
};

export const syncOfflineDataWithFirebase = async (): Promise<{ synced: number; failed: number }> => {
  // Import here to avoid circular dependencies
  const { syncAllOfflineData } = await import('./firebaseOfflineSync');
  return await syncAllOfflineData();
};