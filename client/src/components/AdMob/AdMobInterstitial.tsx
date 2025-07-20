import { Button } from '@/components/ui/button';
import { adMobService } from '@/services/admobService';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdMobInterstitialProps {
  trigger?: "button" | "auto";
  buttonText?: string;
  className?: string;
  onAdClosed?: () => void;
}

const AdMobInterstitial = ({ 
  trigger = "button",
  buttonText = "Show Ad",
  className,
  onAdClosed
}: AdMobInterstitialProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isAdsAvailable = adMobService.isAdsAvailable();

  const handleShowAd = async () => {
    if (!isAdsAvailable) {
      console.log('AdMob: Interstitial ads not available on web platform');
      return;
    }

    setIsLoading(true);
    try {
      await adMobService.showInterstitial();
      onAdClosed?.();
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (trigger === "auto") {
    // Auto-trigger (useful for page transitions)
    handleShowAd();
    return null;
  }

  return (
    <Button
      onClick={handleShowAd}
      disabled={isLoading || !isAdsAvailable}
      className={cn(className)}
      variant={isAdsAvailable ? "default" : "outline"}
      size="sm"
    >
      {isLoading ? "Loading..." : buttonText}
      {!isAdsAvailable && (
        <span className="ml-2 text-xs opacity-60">(Mobile Only)</span>
      )}
    </Button>
  );
};

export default AdMobInterstitial;