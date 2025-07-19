#!/bin/bash

echo "🔥 Thar Dairy Firebase Deployment Script"
echo "========================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Firebase
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "Your Thar Dairy app is live at:"
        echo "https://thar-dairy.web.app"
        echo "https://thar-dairy.firebaseapp.com"
    else
        echo "❌ Deployment failed. Please check the error above."
    fi
else
    echo "❌ Build failed. Please fix the errors and try again."
fi