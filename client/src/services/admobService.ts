import { 
  AdMob, 
  BannerAdOptions, 
  BannerAdSize, 
  BannerAdPosition,
  BannerAdPluginEvents,
  AdOptions,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  AdmobConsentStatus,
  AdmobConsentDebugGeography
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

class AdMobService {
  private isNative = Capacitor.isNativePlatform();
  private isInitialized = false;

  // Test Ad Unit IDs - Replace with your real ones for production
  private readonly adUnits = {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  };

  constructor() {
    console.log('AdMob Service initialized - Native platform:', this.isNative);
  }

  async initialize(): Promise<void> {
    if (!this.isNative) {
      console.log('AdMob: Skipping initialization - not on native platform');
      return;
    }

    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['YOUR_TEST_DEVICE_ID'], // Add your test device ID
        initializeForTesting: true // Remove for production
      });

      this.isInitialized = true;
      console.log('AdMob initialized successfully');
      
      // Request consent for GDPR compliance
      await this.requestConsent();
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  async requestConsent(): Promise<void> {
    if (!this.isNative) return;

    try {
      const consentInfo = await AdMob.requestConsentInfo({
        debugGeography: AdmobConsentDebugGeography.EEA,
        testDeviceIdentifiers: ['YOUR_TEST_DEVICE_ID']
      });

      if (consentInfo.isConsentFormAvailable && 
          consentInfo.status === AdmobConsentStatus.REQUIRED) {
        const { status } = await AdMob.showConsentForm();
        console.log('GDPR Consent status:', status);
      }
    } catch (error) {
      console.error('Failed to request consent:', error);
    }
  }

  async showBanner(position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER): Promise<void> {
    if (!this.isNative || !this.isInitialized) {
      console.log('AdMob: Banner not shown - not available on web platform');
      return;
    }

    try {
      // Subscribe to banner events
      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log('Banner ad loaded successfully');
      });

      AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
        console.error('Banner ad failed to load:', error);
      });

      const options: BannerAdOptions = {
        adId: this.adUnits.banner,
        adSize: BannerAdSize.BANNER,
        position: position,
        margin: 0,
        isTesting: true // Remove for production
      };

      await AdMob.showBanner(options);
      console.log('Banner ad requested');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  }

  async hideBanner(): Promise<void> {
    if (!this.isNative) return;

    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  }

  async showInterstitial(): Promise<void> {
    if (!this.isNative || !this.isInitialized) {
      console.log('AdMob: Interstitial not shown - not available on web platform');
      return;
    }

    try {
      // Subscribe to interstitial events
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, async () => {
        console.log('Interstitial ad loaded, showing now');
        await AdMob.showInterstitial();
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
        console.error('Interstitial ad failed to load:', error);
      });

      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log('Interstitial ad dismissed');
      });

      const options: AdOptions = {
        adId: this.adUnits.interstitial,
        isTesting: true // Remove for production
      };

      // Prepare the interstitial ad
      await AdMob.prepareInterstitial(options);
      console.log('Interstitial ad prepared');
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
    }
  }

  async showRewardedAd(): Promise<void> {
    if (!this.isNative || !this.isInitialized) {
      console.log('AdMob: Rewarded ad not shown - not available on web platform');
      return;
    }

    try {
      // Subscribe to rewarded ad events
      AdMob.addListener(RewardAdPluginEvents.Loaded, async () => {
        console.log('Rewarded ad loaded, showing now');
        await AdMob.showRewardVideoAd();
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
        console.error('Rewarded ad failed to load:', error);
      });

      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
        console.log('User earned reward:', reward);
        // Handle reward logic here (e.g., give user coins, unlock features)
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('Rewarded ad dismissed');
      });

      const options: AdOptions = {
        adId: this.adUnits.rewarded,
        isTesting: true // Remove for production
      };

      // Prepare the rewarded ad
      await AdMob.prepareRewardVideoAd(options);
      console.log('Rewarded ad prepared');
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
    }
  }

  // Utility method to check if ads are available
  isAdsAvailable(): boolean {
    return this.isNative && this.isInitialized;
  }

  // Method to remove all listeners (call on component unmount)
  removeAllListeners(): void {
    AdMob.removeAllListeners();
  }
}

// Export singleton instance
export const adMobService = new AdMobService();