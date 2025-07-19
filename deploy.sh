#!/bin/bash

echo "🔥 Thar Dairy Firebase Deployment Script"
echo "========================================="

# Exit if any command fails
set -e

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

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "🎉 Deployment successful!"
echo "Your Thar Dairy app is live at:"
echo "https://thar-dairy.web.app"
echo "https://thar-dairy.firebaseapp.com"
