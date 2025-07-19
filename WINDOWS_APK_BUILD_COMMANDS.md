# Windows CMD Commands for Building Thar Dairy Android APK

## Complete Build Commands for Windows Command Prompt

### Prerequisites Check
First, verify you have the required tools installed:

```cmd
# Check Java version (must be 17 or higher)
java -version

# Check Android SDK (if installed via Android Studio)
echo %ANDROID_HOME%

# Check if gradlew exists
dir android\gradlew.bat
```

### Step 1: Build Web Assets
```cmd
# Navigate to project root (where package.json is located)
cd /d "C:\path\to\your\thar-dairy-project"

# Install dependencies (if not already installed)
npm install

# Build the web application
npm run build
```

### Step 2: Sync with Android Project
```cmd
# Sync web assets with Capacitor Android project
npx cap sync android
```

### Step 3: Build Android APK
```cmd
# Navigate to Android project directory
cd android

# Build debug APK using Gradle wrapper
gradlew.bat assembleDebug

# Alternative: Build release APK (requires signing)
gradlew.bat assembleRelease
```

### Step 4: Locate Built APK
```cmd
# Debug APK location
dir app\build\outputs\apk\debug\app-debug.apk

# Release APK location (if built)
dir app\build\outputs\apk\release\app-release.apk

# Copy APK to desktop for easy access
copy app\build\outputs\apk\debug\app-debug.apk %USERPROFILE%\Desktop\TharDairy.apk
```

## Complete Single Command Sequence

Copy and paste this entire sequence into CMD:

```cmd
@echo off
echo Building Thar Dairy Android APK...
echo.

echo Step 1: Building web assets...
npm run build
if errorlevel 1 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Syncing with Android project...
npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Building Android APK...
cd android
gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: Android build failed!
    pause
    exit /b 1
)

echo.
echo Step 4: Copying APK to desktop...
copy app\build\outputs\apk\debug\app-debug.apk %USERPROFILE%\Desktop\TharDairy.apk
if errorlevel 1 (
    echo WARNING: Could not copy APK to desktop
)

echo.
echo BUILD SUCCESSFUL!
echo APK Location: android\app\build\outputs\apk\debug\app-debug.apk
echo Desktop Copy: %USERPROFILE%\Desktop\TharDairy.apk
echo.
pause
```

## Troubleshooting Commands

### If Java is not found:
```cmd
# Download and install Java 17+ from:
# https://adoptium.net/temurin/releases/

# After installation, verify:
java -version
```

### If Gradle build fails:
```cmd
# Clean and rebuild
cd android
gradlew.bat clean
gradlew.bat assembleDebug
```

### If out of memory:
```cmd
# Set Gradle options for large projects
set GRADLE_OPTS=-Xmx4g -XX:MaxMetaspaceSize=512m
cd android
gradlew.bat assembleDebug
```

### Check APK details:
```cmd
# Get APK information using aapt (if Android SDK is installed)
aapt dump badging app\build\outputs\apk\debug\app-debug.apk

# Check APK size
dir app\build\outputs\apk\debug\app-debug.apk
```

## Build Script File

Save this as `build-apk.bat` in your project root:

```batch
@echo off
setlocal

echo ========================================
echo    Thar Dairy Android APK Builder
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Step 1: Build web assets
echo [1/4] Building web assets...
call npm run build
if errorlevel 1 goto :error

:: Step 2: Sync with Capacitor
echo.
echo [2/4] Syncing with Android project...
call npx cap sync android
if errorlevel 1 goto :error

:: Step 3: Build APK
echo.
echo [3/4] Building Android APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 goto :error

:: Step 4: Copy APK
echo.
echo [4/4] Copying APK...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy "app\build\outputs\apk\debug\app-debug.apk" "..\TharDairy.apk" >nul
    echo APK copied to project root as TharDairy.apk
) else (
    echo WARNING: APK not found at expected location
)

cd ..

echo.
echo ========================================
echo           BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Locations:
echo   - android\app\build\outputs\apk\debug\app-debug.apk
echo   - TharDairy.apk (project root)
echo.
echo App Details:
echo   - Name: Thar Dairy
echo   - Package: com.thardairy.app
echo   - Features: Offline-first, SMS, Real-time sync
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo            BUILD FAILED!
echo ========================================
echo.
echo Please check the error messages above.
echo Common solutions:
echo   1. Ensure Java 17+ is installed
echo   2. Run 'npm install' first
echo   3. Check internet connection
echo   4. Try running 'gradlew.bat clean' in android folder
echo.
pause
exit /b 1
```

## Usage Instructions

1. **Save the script**: Copy the batch script above and save it as `build-apk.bat` in your project root
2. **Make executable**: Right-click and "Run as administrator" if needed
3. **Run**: Double-click `build-apk.bat` or run `build-apk.bat` in CMD
4. **Wait**: The build process takes 2-5 minutes depending on your system
5. **Install**: Transfer the generated `TharDairy.apk` to your Android device and install

## Final APK Details

- **File**: `TharDairy.apk` (debug version)
- **Size**: ~15-20 MB
- **Features**: All offline-first functionality enabled
- **Compatibility**: Android 7.0+ (API level 24+)
- **Installation**: Enable "Unknown sources" in Android settings

The APK will have all the latest features including offline-first operation, dashboard improvements with comma-separated amounts, SMS integration, and complete dairy management functionality.