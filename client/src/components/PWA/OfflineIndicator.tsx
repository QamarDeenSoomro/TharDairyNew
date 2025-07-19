import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi, CloudOff, Cloud } from 'lucide-react';
import { isOnline, onNetworkChange } from '@/utils/pwa';
import { offlineStorage } from '@/utils/offlineStorage';
import { useLanguage } from "@/contexts/LanguageContext";

export default function OfflineIndicator() {
  const { t } = useLanguage();
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Listen for network changes
    const cleanup = onNetworkChange(setOnline);

    // Check pending offline data count
    const updatePendingCount = async () => {
      try {
        const counts = await offlineStorage.getDataCount();
        setPendingCount(counts.unsynced);
      } catch (error) {
        console.error('Failed to get offline data count:', error);
      }
    };

    updatePendingCount();
    
    // Update count every 30 seconds
    const interval = setInterval(updatePendingCount, 30000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  if (online && pendingCount === 0) {
    return null; // Don't show indicator when everything is normal
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge 
        variant={online ? (pendingCount > 0 ? "default" : "secondary") : "destructive"}
        className="flex items-center gap-1 px-2 py-1"
      >
        {online ? (
          pendingCount > 0 ? (
            <>
              <CloudOff className="h-3 w-3" />
              {pendingCount} {t.pending}
            </>
          ) : (
            <>
              <Cloud className="h-3 w-3" />
              {t.online}
            </>
          )
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            {t.offline}
          </>
        )}
      </Badge>
    </div>
  );
}