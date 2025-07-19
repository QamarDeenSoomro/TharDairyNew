# Firebase Hosting Setup Guide for Thar Dairy

## Prerequisites
- Firebase project already created (you have this)
- Firebase configuration in environment variables (you have this)

## Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase
```bash
firebase login
```
This will open a browser window for authentication.

## Step 3: Initialize Firebase Hosting
```bash
firebase init hosting
```
When prompted:
- Select your existing Firebase project
- Use `dist/public` as public directory
- Configure as single-page app: Yes
- Set up automatic builds: No (we'll build manually)
- Don't overwrite index.html

## Step 4: Update Project ID
Edit `.firebaserc` file and replace `your-firebase-project-id` with your actual Firebase project ID.

## Step 5: Build the Application
```bash
npm run build
```
This creates optimized files in `dist/public/`

## Step 6: Deploy to Firebase
```bash
firebase deploy --only hosting
```

## Step 7: Access Your Live App
Your app will be available at:
`https://your-project-id.web.app`
or
`https://your-project-id.firebaseapp.com`

## Environment Variables for Production
Make sure these are set in your Firebase project:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## PWA Features
Your app will be installable and work offline thanks to:
- Service workers
- Web manifest
- IndexedDB storage
- Background sync

## Custom Domain (Optional)
You can add a custom domain in Firebase Console > Hosting section.

## Continuous Deployment
For automatic deployments, you can set up GitHub Actions or use Firebase's CI/CD features.