import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import usePWA from '@/hooks/usePWA';

export default function SyncButton() {
  const { status, syncInProgress, manualSync } = usePWA();
  const { toast } = useToast();
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    try {
      const success = await manualSync();
      if (success) {
        setLastSync(new Date());
        toast({
          title: "Sync Complete",
          description: "All offline data has been synchronized.",
        });
      } else {
        toast({
          title: "Sync Issues",
          description: "Some data couldn't be synchronized. Check your connection and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync data",
        variant: "destructive"
      });
    }
  };

  // Don't show if there's no offline data or if we're offline
  if (status.offlineDataCount === 0 || !status.isOnline) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSync}
        disabled={syncInProgress}
        size="sm"
        variant="outline"
        className="flex items-center gap-1"
      >
        <RefreshCw className={`h-3 w-3 ${syncInProgress ? 'animate-spin' : ''}`} />
        {syncInProgress ? 'Syncing...' : `Sync ${status.offlineDataCount}`}
      </Button>
      
      {lastSync && (
        <span className="text-xs text-muted-foreground">
          Last: {lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}