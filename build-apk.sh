#!/bin/bash

# Thar Dairy APK Build Script
# This script automates the APK building process

echo "🏗️  Building Thar Dairy Android APK..."

# Step 1: Build web assets
echo "📦 Building web assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

# Step 2: Sync with Android project
echo "🔄 Syncing with Android project..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed!"
    exit 1
fi

# Step 3: Build APK (requires Java and Android SDK)
echo "🤖 Building Android APK..."
cd android

# Check if Gradle wrapper exists
if [ ! -f "./gradlew" ]; then
    echo "❌ Gradle wrapper not found!"
    exit 1
fi

# Build debug APK
echo "🔨 Building debug APK..."
./gradlew assembleDebug
if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📱 Location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Debug APK build failed!"
    echo "💡 Make sure Java and Android SDK are installed"
    echo "💡 Check APK_BUILD_GUIDE.md for setup instructions"
    exit 1
fi

# Optionally build release APK
read -p "🤔 Build release APK too? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔨 Building release APK..."
    ./gradlew assembleRelease
    if [ $? -eq 0 ]; then
        echo "✅ Release APK built successfully!"
        echo "📱 Location: android/app/build/outputs/apk/release/app-release.apk"
    else
        echo "❌ Release APK build failed!"
    fi
fi

echo "🎉 Build process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test the APK on an Android device"
echo "2. Sign the release APK for distribution"
echo "3. Upload to Google Play Store or distribute directly"
echo ""
echo "📖 See APK_BUILD_GUIDE.md for detailed instructions"