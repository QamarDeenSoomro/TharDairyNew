# Release APK Build Instructions

## Building Release APK

The release APK is optimized for production distribution with smaller size and better performance.

### Build Command
```cmd
cd android
gradlew.bat assembleRelease
```

### Release APK Location
After successful build:
```
android\app\build\outputs\apk\release\app-release.apk
```

## Release vs Debug APK

| Feature | Debug APK | Release APK |
|---------|-----------|-------------|
| **Size** | Larger | Smaller (optimized) |
| **Performance** | Slower | Faster |
| **Debugging** | Enabled | Disabled |
| **Signing** | Debug signature | Unsigned (needs signing) |
| **Distribution** | Testing only | Production ready |
| **Offline/Online** | Both modes work | Both modes work |

## Signing the Release APK (Optional)

For Google Play Store or production distribution, you'll need to sign the APK:

1. **Create keystore** (one-time setup):
```cmd
keytool -genkey -v -keystore thar-dairy-key.keystore -alias thar-dairy -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure signing in `android/app/build.gradle`**:
```gradle
android {
    signingConfigs {
        release {
            keyAlias 'thar-dairy'
            keyPassword 'your-key-password'
            storeFile file('thar-dairy-key.keystore')
            storePassword 'your-store-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build signed release**:
```cmd
gradlew.bat assembleRelease
```

## Distribution Options

1. **Direct Installation**: Share APK file directly
2. **Google Play Store**: Upload signed APK/AAB
3. **Firebase App Distribution**: Beta testing platform
4. **Internal Distribution**: Company/organization sharing

The unsigned release APK works fine for direct installation and testing!