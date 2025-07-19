# Quick Fix for Android APK Build Error

## The Problem
You're getting "could not determine executable to run" error because you're using:
```
npm exec cap sync android  ❌ WRONG
```

## The Solution
Use `npx` instead of `npm exec`:
```
npx cap sync android  ✅ CORRECT
```

## Complete Build Commands

**For Windows:**
```cmd
# 1. Install dependencies (if not done)
npm install

# 2. Build web assets
npm run build

# 3. Sync with Android project
npx cap sync android

# 4. Open Android Studio (optional)
npx cap open android

# 5. Build APK using Gradle (from android directory)
cd android
gradlew.bat assembleDebug
```

**For macOS/Linux:**
```bash
# 1. Install dependencies (if not done)
npm install

# 2. Build web assets
npm run build

# 3. Sync with Android project
npx cap sync android

# 4. Open Android Studio (optional)
npx cap open android

# 5. Build APK using Gradle (from android directory)
cd android
./gradlew assembleDebug
```

## Why This Happens
- `npm exec` looks for a package named "cap" 
- `npx` correctly runs the Capacitor CLI from @capacitor/cli package

## Java Version Fix
If you get "invalid source release: 21" error after fixing the npm issue:

1. **Install Java 17+**: Download from https://adoptium.net/
2. **Set JAVA_HOME**: Point to Java 17+ installation directory
3. **Restart terminal**: Close and reopen command prompt
4. **Verify**: Run `java -version` to confirm Java 17+

## Alternative: Use the build script
You can also use our automation script:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

This script handles all the correct commands for you.