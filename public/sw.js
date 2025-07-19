const CACHE_NAME = 'milk-supply-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
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

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    // Handle navigation requests
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match(OFFLINE_URL);
            });
        })
    );
  } else {
    // Handle other requests
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
        .catch(() => {
          // If both cache and network fail, return offline page for HTML requests
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
        })
    );
  }
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