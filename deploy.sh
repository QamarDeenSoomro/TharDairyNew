#!/bin/bash

echo "🔥 Thar Dairy Firebase Deployment Script"
echo "========================================="

# Don't exit on error - we want to see what fails
# set -e

# Print commands for debugging
set -x

# Move to the script's directory (project root)
cd "$(dirname "$0")"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build
BUILD_STATUS=$?
if [ $BUILD_STATUS -ne 0 ]; then
    echo "❌ Build failed with exit code: $BUILD_STATUS"
    echo "Please check the build errors above."
else
    echo "✅ Build successful!"
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting 2>&1 | tee deploy-output.log
DEPLOY_STATUS=${PIPESTATUS[0]} # Get the exit status of firebase command, not tee

if [ $DEPLOY_STATUS -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed with exit code: $DEPLOY_STATUS"
    echo ""
    echo "Common issues and solutions:"
    echo "1. Authentication: Run 'firebase login' on your local machine"
    echo "2. Project: Ensure 'thar-dairy' project exists in Firebase Console"
    echo "3. Permissions: Check if you have access to the Firebase project"
    echo ""
    echo "Full error output saved to: deploy-output.log"
    echo ""
    echo "To deploy from Replit, use the Deploy button instead!"
else
    echo "🎉 Deployment successful!"
    echo "Your Thar Dairy app is live at:"
    echo "https://thar-dairy.web.app"
    echo "https://thar-dairy.firebaseapp.com"
fi

echo ""
echo ""
echo "ℹ️  Note: Firebase deployment requires authentication that cannot be done in Replit."
echo "   To deploy, either:"
echo "   1. Use Replit's Deploy button (recommended)"
echo "   2. Download project and run 'firebase login' on your local machine"
echo ""
echo "Script completed. Press any key to exit..."
read -n 1 -s
