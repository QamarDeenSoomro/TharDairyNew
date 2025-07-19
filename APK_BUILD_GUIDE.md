# Thar Dairy Android APK Build Guide

## Overview
This guide will help you build the Thar Dairy Android APK from the prepared Capacitor project. The project has been configured and is ready for compilation.

## Prerequisites

### Required Software
1. **Java Development Kit (JDK) 17 or later**
   - Download from: https://adoptium.net/
   - Set JAVA_HOME environment variable

2. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API level 33 or later)
   - Accept Android licenses: `sdkmanager --licenses`

3. **Node.js & npm** (if not already installed)
   - Download from: https://nodejs.org/

## Project Structure
```
├── android/                 # Native Android project
├── capacitor.config.ts     # Capacitor configuration
├── dist/public/           # Built web assets
├── resources/             # App icons and splash screens
└── APK_BUILD_GUIDE.md    # This guide
```

## Build Steps

### Step 1: Environment Setup
```bash
# Verify Java installation
java -version

# Verify Android SDK
echo $ANDROID_SDK_ROOT
# Should point to your Android SDK directory

# Install dependencies (if not done)
npm install
```

### Step 2: Build Web Assets
```bash
# Build the web application
npm run build

# Sync assets with native project
npx cap sync android
```

### Step 3: Build APK

#### Method 1: Command Line (Recommended for CI/CD)
```bash
# Navigate to android directory
cd android

# Build debug APK
./gradlew assembleDebug

# Build release APK (unsigned)
./gradlew assembleRelease
```

#### Method 2: Android Studio (Recommended for development)
```bash
# Open Android project in Android Studio
npx cap open android

# In Android Studio:
# 1. Wait for project to sync
# 2. Go to Build → Generate Signed Bundle/APK
# 3. Choose APK
# 4. Follow signing wizard
```

### Step 4: Signing APK for Release

#### Create Keystore (First time only)
```bash
keytool -genkey -v -keystore thar-dairy-release.keystore \
  -alias thar-dairy -keyalg RSA -keysize 2048 -validity 10000
```

#### Sign APK
```bash
# Using jarsigner
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore thar-dairy-release.keystore \
  app-release-unsigned.apk thar-dairy

# Or configure signing in android/app/build.gradle
```

## APK Output Locations

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## App Configuration

### Current Settings
- **App ID**: com.thardairy.app
- **App Name**: Thar Dairy
- **Version**: 1.0.0 (update in android/app/build.gradle)
- **Min SDK**: 22 (Android 5.1)
- **Target SDK**: 34 (Android 14)

### Features Enabled
- ✅ Internet permission
- ✅ Clear text traffic (for development)
- ✅ RTL support (for Sindhi language)
- ✅ File provider (for file access)
- ✅ PWA features (offline support, service workers)

## Testing the APK

### Install on Device
```bash
# Enable Developer Options and USB Debugging on your device
# Connect device via USB

# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or install release APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Test Features
1. **Offline functionality**: Test app without internet connection
2. **Language switching**: Switch between English and Sindhi
3. **SMS functionality**: Test SMS sending with Pakistani numbers
4. **Data persistence**: Add vendors, customers, transactions
5. **PWA features**: Test background sync and offline storage

## Distribution

### Google Play Store
1. Build signed release APK or AAB
2. Create Google Play Developer account ($25 fee)
3. Upload APK/AAB to Play Console
4. Complete store listing
5. Submit for review

### Direct Distribution
- Share APK file directly with users
- Users need to enable "Install from Unknown Sources"
- Consider using Firebase App Distribution for beta testing

## Troubleshooting

### Common Issues

1. **Gradle build fails**
   - Check JAVA_HOME is set correctly
   - Ensure Android SDK is installed
   - Run `./gradlew --version` to verify setup

2. **APK won't install**
   - Check if device allows unknown sources
   - Verify APK is properly signed
   - Check for version conflicts

3. **App crashes on startup**
   - Check Android logs: `adb logcat`
   - Verify all web assets were synced
   - Check for missing permissions

### Build Commands Reference
```bash
# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build AAB (App Bundle)
./gradlew bundleRelease

# Install and run on connected device
./gradlew installDebug
```

## Next Steps
1. Build and test the debug APK locally
2. Configure app signing for release
3. Test on multiple Android devices
4. Set up automated builds (GitHub Actions/CI)
5. Prepare for Play Store submission

---
**Note**: This project is ready for APK generation. The Capacitor configuration, Android project structure, and build scripts are all prepared. You just need a local environment with Java and Android SDK to complete the build process.