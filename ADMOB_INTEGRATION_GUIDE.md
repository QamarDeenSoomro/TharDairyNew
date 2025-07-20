# AdMob Integration Guide for Thar Dairy

## Overview

AdMob has been successfully integrated into your Thar Dairy app! This guide explains how the ads work, how to configure them, and important considerations.

## How It Works

### Platform Support
- **Android APK**: ✅ Full AdMob support with real ads
- **Web/PWA**: ⚠️ Shows placeholder ads only (AdMob requires native mobile SDKs)
- **Future iOS**: ✅ Will work when iOS platform is added

### Ad Types Implemented

1. **Banner Ads**: Show at bottom of pages
2. **Interstitial Ads**: Full-screen ads triggered by buttons
3. **Rewarded Ads**: Users watch ads to earn rewards

## Current Implementation

### Dashboard Integration
- Banner ad displays at bottom of Dashboard
- "Show Full Screen Ad" button for testing interstitial ads
- Web version shows placeholder indicators

### Available Components
- `AdMobBanner`: Responsive banner component
- `AdMobInterstitial`: Button-triggered full-screen ads
- `AdMobRewarded`: Reward-based video ads

## Configuration Files Modified

### Frontend
- `client/src/services/admobService.ts`: Core AdMob service
- `client/src/components/AdMob/`: Ad components
- `client/src/App.tsx`: AdMob initialization
- `client/src/pages/Dashboard.tsx`: Example implementation

### Android
- `android/app/src/main/AndroidManifest.xml`: AdMob metadata
- `android/app/src/main/res/values/strings.xml`: AdMob App ID

## Production Setup Required

### 1. Get Real AdMob Account
1. Visit [Google AdMob Console](https://admob.google.com/)
2. Create account and app
3. Generate real Ad Unit IDs

### 2. Replace Test IDs
Update `client/src/services/admobService.ts`:
```typescript
private readonly adUnits = {
  banner: 'YOUR_REAL_BANNER_AD_UNIT_ID',
  interstitial: 'YOUR_REAL_INTERSTITIAL_AD_UNIT_ID', 
  rewarded: 'YOUR_REAL_REWARDED_AD_UNIT_ID'
};
```

### 3. Update App ID
Replace in `android/app/src/main/res/values/strings.xml`:
```xml
<string name="admob_app_id">YOUR_REAL_ADMOB_APP_ID</string>
```

### 4. Remove Test Mode
In `admobService.ts`, change:
```typescript
isTesting: false // Change from true to false
initializeForTesting: false // Change from true to false
```

## Building with AdMob

### For Testing (Current Setup)
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

### For Production
1. Update all IDs to real ones
2. Remove testing flags
3. Build release APK:
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

## Adding Ads to Other Pages

### Simple Banner
```tsx
import AdMobBanner from "@/components/AdMob/AdMobBanner";

// In your component JSX:
<AdMobBanner />
```

### Interstitial for Page Transitions
```tsx
import AdMobInterstitial from "@/components/AdMob/AdMobInterstitial";

// Auto-trigger on page load:
<AdMobInterstitial trigger="auto" />

// Manual button:
<AdMobInterstitial buttonText="View Premium Content" />
```

### Rewarded Ads for Features
```tsx
import AdMobRewarded from "@/components/AdMob/AdMobRewarded";

<AdMobRewarded 
  buttonText="Get Free Premium Report"
  rewardDescription="Watch ad to unlock premium features"
  onRewardEarned={(reward) => {
    // Give user premium access, coins, etc.
    console.log('User earned reward:', reward);
  }}
/>
```

## Revenue Optimization Tips

### Strategic Ad Placement
1. **Banners**: Bottom of Dashboard, Reports, Ledger pages
2. **Interstitials**: Between major page transitions
3. **Rewarded**: For premium features, advanced reports

### User Experience Balance
- Don't overwhelm with too many ads
- Offer value through rewarded ads
- Test different placements for optimal revenue

## GDPR Compliance

The integration includes automatic GDPR consent handling for EU users. The consent form will appear automatically when required.

## Testing on Device

### Current Test Setup
- Uses Google test ad units (safe for testing)
- Includes test device configuration
- Console logs show ad loading status

### Verify Integration
1. Build and install APK on Android device
2. Check Dashboard for banner ad placeholder
3. Test "Show Full Screen Ad" button
4. Watch console logs for AdMob events

## Troubleshooting

### Ads Not Showing
1. Check device internet connection
2. Verify AdMob App ID in strings.xml
3. Check console logs for error messages
4. Ensure using real device (not emulator) for testing

### Web Version
- Ads are intentionally disabled on web
- Placeholders show "(Mobile App Only)" message
- This is expected behavior

## Next Steps

1. **Get AdMob Account**: Create real AdMob account and app
2. **Replace Test IDs**: Update with real ad unit IDs
3. **Test Revenue**: Monitor earnings in AdMob console
4. **Optimize Placement**: Experiment with ad positions
5. **Add More Ads**: Integrate ads into other app pages

Your app is now ready for monetization through AdMob! 🎉