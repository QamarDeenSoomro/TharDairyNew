import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PWAInstaller, isPWA } from '@/utils/pwa';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installer, setInstaller] = useState<PWAInstaller | null>(null);
  const [showDevPrompt, setShowDevPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isPWA()) {
      return;
    }

    // In development, show info about PWA after 5 seconds
    if (import.meta.env.DEV) {
      setTimeout(() => {
        setShowDevPrompt(true);
      }, 5000);
      return;
    }

    const pwaInstaller = new PWAInstaller();
    setInstaller(pwaInstaller);

    // Check if we can show install prompt
    const checkInstallability = () => {
      if (pwaInstaller.canInstall()) {
        setShowPrompt(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check after a delay to give time for event to fire
    setTimeout(checkInstallability, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installer) return;

    const success = await installer.install();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  // Show development info prompt
  if (showDevPrompt && !showPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  PWA Ready!
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDevPrompt(false)}
                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs text-blue-700 dark:text-blue-200 mb-2">
              Install option will appear after deployment to production with HTTPS.
            </CardDescription>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Deploy to Firebase to enable "Add to Home Screen"
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showPrompt || isPWA()) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Install App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Install this app on your device for a better experience and offline access.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}