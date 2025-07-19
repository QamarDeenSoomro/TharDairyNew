const CACHE_NAME = 'milk-supply-v2';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/assets/index-BuLSAozQ.css',
  '/assets/index-1K3kNzSa.js',
  '/assets/firebaseOfflineSync-DdMkwEMV.js',
  OFFLINE_URL
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Handle navigation requests (page loads) - serve the main app
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .catch(() => caches.match('/'));
        })
    );
    return;
  }

  // Handle other requests (assets, API calls)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(() => {
            // For API requests, return empty array to prevent errors
            if (event.request.url.includes('/api/')) {
              return new Response('[]', {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            return undefined;
          });
      })
  );
});
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Handle offline data synchronization
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB and sync with Firebase
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      // Send offline data to server
      await syncWithFirebase(offlineData);
      
      // Clear offline data after successful sync
      await clearOfflineData();
      
      // Notify user of successful sync
      self.registration.showNotification('Data Synced', {
        body: 'Your offline data has been synchronized successfully.',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg'
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for offline data management
async function getOfflineData() {
  // Implementation will be added in the React app
  return [];
}

async function syncWithFirebase(data) {
  // Implementation will be added in the React app
  console.log('Syncing data:', data);
}

async function clearOfflineData() {
  // Implementation will be added in the React app
  console.log('Clearing offline data');
}