import { Button } from '@/components/ui/button';
import { adMobService } from '@/services/admobService';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';

interface AdMobRewardedProps {
  buttonText?: string;
  className?: string;
  onRewardEarned?: (reward: any) => void;
  rewardDescription?: string;
}

const AdMobRewarded = ({ 
  buttonText = "Watch Ad for Reward",
  className,
  onRewardEarned,
  rewardDescription = "Get reward by watching ad"
}: AdMobRewardedProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isAdsAvailable = adMobService.isAdsAvailable();

  const handleShowRewardedAd = async () => {
    if (!isAdsAvailable) {
      console.log('AdMob: Rewarded ads not available on web platform');
      return;
    }

    setIsLoading(true);
    try {
      await adMobService.showRewardedAd();
      // Reward handling is done in the service via event listeners
      onRewardEarned?.({ type: 'watch_ad', amount: 1 });
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {rewardDescription && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Gift className="h-4 w-4" />
          {rewardDescription}
        </p>
      )}
      <Button
        onClick={handleShowRewardedAd}
        disabled={isLoading || !isAdsAvailable}
        variant={isAdsAvailable ? "default" : "outline"}
        size="sm"
        className="w-full"
      >
        {isLoading ? "Loading..." : buttonText}
        {!isAdsAvailable && (
          <span className="ml-2 text-xs opacity-60">(Mobile Only)</span>
        )}
      </Button>
    </div>
  );
};

export default AdMobRewarded;