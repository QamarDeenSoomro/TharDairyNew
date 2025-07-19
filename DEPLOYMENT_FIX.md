# 🔧 Service Worker MIME Type Fix

## Problem
Firebase Hosting was serving `sw.js` as HTML instead of JavaScript because of the catch-all rewrite rule redirecting everything to `index.html`.

## Solution Applied
Modified `firebase.json` to exclude static files from SPA rewrites:

```json
"rewrites": [
  {
    "source": "!/sw.js",
    "destination": "/index.html"
  },
  {
    "source": "!/manifest.json", 
    "destination": "/index.html"
  },
  {
    "source": "!/icon-*.svg",
    "destination": "/index.html"
  },
  {
    "source": "!/offline.html",
    "destination": "/index.html"
  },
  {
    "source": "!/assets/**",
    "destination": "/index.html"
  },
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

This ensures:
- Static files (sw.js, manifest.json, icons) are served directly
- Only unmatched routes go to index.html for SPA routing
- Service worker gets correct Content-Type: application/javascript

## Ready for Deployment
Run: `firebase deploy --only hosting`

The service worker will now register successfully and PWA features will work!