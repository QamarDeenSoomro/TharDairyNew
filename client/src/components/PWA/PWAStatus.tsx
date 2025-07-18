import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Database, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import usePWA from '@/hooks/usePWA';
import { useToast } from "@/hooks/use-toast";

export default function PWAStatus() {
  const { status, syncInProgress, manualSync } = usePWA();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      const success = await manualSync();
      if (success) {
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          PWA Status
        </CardTitle>
        <CardDescription>
          Progressive Web App features and offline capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection</span>
          <Badge variant={status.isOnline ? "default" : "destructive"}>
            {status.isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">App Installation</span>
          <Badge variant={status.isInstalled ? "default" : "secondary"}>
            {status.isInstalled ? "Installed" : "Web Version"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Service Worker</span>
          <Badge variant={status.serviceWorkerReady ? "default" : "secondary"}>
            {status.serviceWorkerReady ? "Active" : "Disabled"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Offline Data</span>
          <div className="flex items-center gap-2">
            <Badge variant={status.offlineDataCount > 0 ? "destructive" : "default"}>
              <Database className="h-3 w-3 mr-1" />
              {status.offlineDataCount} pending
            </Badge>
            {status.offlineDataCount > 0 && status.isOnline && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncInProgress}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${syncInProgress ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            )}
          </div>
        </div>

        {import.meta.env.DEV && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              Development Mode: Service workers are disabled. Full PWA features will be available in production.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}