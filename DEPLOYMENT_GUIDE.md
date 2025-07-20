# Thar Dairy Deployment Guide

## 🚨 Current Issue
The `deploy.sh` script fails with error: **"Failed to authenticate, have you run firebase login?"**

Firebase CLI requires browser-based authentication which cannot be done in Replit environment.

## ✅ Solution Options

### Option 1: Deploy from Replit (Recommended)
1. **Build the project first:**
   ```bash
   npm run build
   ```

2. **Use Replit's built-in deployment:**
   - Click the "Deploy" button in Replit
   - Select "Static Site"
   - Set build command: `npm run build`
   - Set publish directory: `dist/public`
   - Deploy!

### Option 2: Deploy from Your Local Machine
1. **Download the project:**
   - Download your Replit project as ZIP
   - Extract on your local machine

2. **Install Firebase CLI locally:**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase:**
   ```bash
   firebase login
   ```

4. **Deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Option 3: Deploy to Vercel (Alternative)
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy:**
   ```bash
   vercel --prod dist/public
   ```

### Option 4: Manual Firebase Deployment
1. **Build the project in Replit:**
   ```bash
   npm run build
   ```

2. **Download the `dist/public` folder**

3. **Go to Firebase Console:**
   - Visit https://console.firebase.google.com
   - Select your "thar-dairy" project
   - Go to Hosting section
   - Use the web interface to upload files

## 📝 Important Notes
- The app is configured for Firebase project: `thar-dairy`
- The build output is in `dist/public` folder
- All environment variables (VITE_FIREBASE_*) must be set in your deployment platform

## 🔧 Environment Variables Required
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## 🌐 Live URLs (after deployment)
- Primary: https://thar-dairy.web.app
- Alternative: https://thar-dairy.firebaseapp.com