import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thardairy.app',
  appName: 'Thar Dairy',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // Enable offline-first functionality
    cleartext: true,
    hostname: 'localhost'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Enable offline storage and caching
    allowNavigationWithinFileScheme: true,
    loggingBehavior: 'none'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#16a34a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    // Configure storage for offline functionality
    Storage: {
      group: 'TharDairyStorage',
      scheme: 'TharDairyScheme'
    },
    // Enable local network access for offline sync
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF"
    }
  }
};

export default config;
