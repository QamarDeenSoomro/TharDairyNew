# Windows APK Build Commands

## Quick Fix for Windows Users

On Windows, use `gradlew.bat` instead of `./gradlew`:

```cmd
# ❌ Wrong (Unix/Linux command)
./gradlew assembleDebug

# ✅ Correct (Windows command)
gradlew.bat assembleDebug
```

## Complete Windows Build Process

```cmd
# 1. Install Node.js dependencies
npm install

# 2. Build web application
npm run build

# 3. Sync with Android project
npx cap sync android

# 4. Navigate to Android directory
cd android

# 5. Build debug APK
gradlew.bat assembleDebug
```

## Common Windows Commands

```cmd
# Build debug APK
gradlew.bat assembleDebug

# Build release APK
gradlew.bat assembleRelease

# Clean build
gradlew.bat clean

# Check Gradle version
gradlew.bat --version

# Install APK on connected device
gradlew.bat installDebug
```

## APK Output Location

After successful build, find your APK at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## If gradlew.bat Doesn't Work

1. Make sure you're in the `android` directory
2. Check if `gradlew.bat` exists: `dir gradlew.bat`
3. Ensure Java is installed and JAVA_HOME is set
4. Try running: `java -version`

## Alternative: Use Android Studio

1. Run: `npx cap open android`
2. Wait for Android Studio to open and sync
3. Go to Build → Generate Signed Bundle/APK
4. Choose APK and follow the wizard