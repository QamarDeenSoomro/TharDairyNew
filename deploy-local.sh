#!/bin/bash

echo "🔥 Thar Dairy Local Deployment Script"
echo "====================================="
echo ""
echo "⚠️  This script must be run on your LOCAL machine, not in Replit!"
echo ""
echo "Steps to deploy from your local machine:"
echo "1. Download this project from Replit"
echo "2. Open terminal in the project folder"
echo "3. Run: npm install"
echo "4. Run: npm install -g firebase-tools"
echo "5. Run: firebase login"
echo "6. Run: ./deploy-local.sh"
echo ""
read -p "Are you running this on your local machine? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Please run this script on your local machine after downloading the project."
    exit 1
fi

# Exit if any command fails
set -e

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