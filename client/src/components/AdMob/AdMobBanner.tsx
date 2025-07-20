import { useEffect, useState } from 'react';
import { adMobService } from '@/services/admobService';
import { BannerAdPosition } from '@capacitor-community/admob';
import { cn } from '@/lib/utils';

interface AdMobBannerProps {
  position?: BannerAdPosition;
  className?: string;
  showOnMobile?: boolean;
}

const AdMobBanner = ({ 
  position = BannerAdPosition.BOTTOM_CENTER, 
  className,
  showOnMobile = true 
}: AdMobBannerProps) => {
  const [isAdsAvailable, setIsAdsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if ads are available
    const checkAdsAvailability = () => {
      const available = adMobService.isAdsAvailable();
      setIsAdsAvailable(available);
      setIsLoading(false);
      
      if (available && showOnMobile) {
        // Show banner ad
        adMobService.showBanner(position);
      }
    };

    // Delay check to allow AdMob to initialize
    const timer = setTimeout(checkAdsAvailability, 1000);

    return () => {
      clearTimeout(timer);
      // Hide banner when component unmounts
      if (isAdsAvailable) {
        adMobService.hideBanner();
      }
    };
  }, [position, showOnMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      adMobService.removeAllListeners();
    };
  }, []);

  if (isLoading) {
    return null;
  }

  // Show placeholder for web version
  if (!isAdsAvailable) {
    return (
      <div className={cn(
        "w-full h-12 bg-muted/20 border border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center text-xs text-muted-foreground",
        className
      )}>
        <span>AdMob Banner (Mobile App Only)</span>
      </div>
    );
  }

  // For native platforms, return invisible container as banner is shown natively
  return (
    <div className={cn("w-full h-12", className)} />
  );
};

export default AdMobBanner;