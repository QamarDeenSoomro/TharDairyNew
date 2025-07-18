import { useState, useEffect } from 'react';
import { registerServiceWorker, isPWA, isOnline, onNetworkChange } from '@/utils/pwa';
import { initOfflineStorage, offlineStorage, syncOfflineDataWithFirebase } from '@/utils/offlineStorage';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerReady: boolean;
  offlineDataCount: number;
  installing: boolean;
}

export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: isPWA(),
    isOnline: isOnline(),
    serviceWorkerReady: false,
    offlineDataCount: 0,
    installing: false
  });

  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Initialize PWA features
    const initPWA = async () => {
      try {
        // Initialize offline storage
        await initOfflineStorage();
        
        // Register service worker
        const swReady = await registerServiceWorker();
        
        setStatus(prev => ({
          ...prev,
          serviceWorkerReady: swReady
        }));

        // Get initial offline data count
        updateOfflineDataCount();
      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    };

    initPWA();

    // Listen for network changes
    const cleanup = onNetworkChange((online) => {
      setStatus(prev => ({ ...prev, isOnline: online }));
      
      // Auto-sync when coming back online
      if (online && !syncInProgress) {
        autoSync();
      }
    });

    // Update offline data count periodically
    const countInterval = setInterval(updateOfflineDataCount, 30000);

    return () => {
      cleanup();
      clearInterval(countInterval);
    };
  }, [syncInProgress]);

  const updateOfflineDataCount = async () => {
    try {
      const counts = await offlineStorage.getDataCount();
      setStatus(prev => ({
        ...prev,
        offlineDataCount: counts.unsynced
      }));
    } catch (error) {
      console.error('Failed to update offline data count:', error);
      // Set count to 0 on error to prevent UI issues
      setStatus(prev => ({
        ...prev,
        offlineDataCount: 0
      }));
    }
  };

  const autoSync = async () => {
    if (syncInProgress || !status.isOnline) return;

    try {
      setSyncInProgress(true);
      const result = await syncOfflineDataWithFirebase();
      await updateOfflineDataCount();
      
      if (result.synced > 0) {
        console.log(`Auto-sync completed: ${result.synced} items synced`);
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const manualSync = async (): Promise<boolean> => {
    if (!status.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      setSyncInProgress(true);
      const result = await syncOfflineDataWithFirebase();
      await updateOfflineDataCount();
      
      console.log(`Sync completed: ${result.synced} synced, ${result.failed} failed`);
      return result.failed === 0;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    } finally {
      setSyncInProgress(false);
    }
  };

  const saveDataOffline = async (type: 'transaction' | 'payment' | 'vendor' | 'customer', data: any): Promise<string> => {
    try {
      const id = await offlineStorage.saveOfflineData(type, data);
      await updateOfflineDataCount();
      return id;
    } catch (error) {
      console.error('Failed to save data offline:', error);
      throw error;
    }
  };

  return {
    status,
    syncInProgress,
    manualSync,
    saveDataOffline,
    updateOfflineDataCount
  };
};

export default usePWA;