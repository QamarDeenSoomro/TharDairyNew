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

## Java Version Issues

If you get "invalid source release: 21" error:

1. **Check your Java version**: `java -version`
2. **Install Java 17 or higher** (recommended: Java 17)
3. **Set JAVA_HOME** to Java 17+ installation
4. **Restart command prompt** after setting JAVA_HOME

### Windows Java Installation
1. Download Java 17+ from: https://adoptium.net/temurin/releases/
2. Install and note the installation path (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`)
3. Set JAVA_HOME environment variable:
   - Windows Key + R → `sysdm.cpl` → Advanced → Environment Variables
   - Add: `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`
   - Add to PATH: `%JAVA_HOME%\bin`

## Alternative: Use Android Studio

1. Run: `npx cap open android`
2. Wait for Android Studio to open and sync
3. Go to Build → Generate Signed Bundle/APK
4. Choose APK and follow the wizard