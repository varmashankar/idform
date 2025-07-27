// Service Worker for IDForm - Offline Support and Caching
const CACHE_NAME = 'idform-v1.0.0';
const STATIC_CACHE = 'idform-static-v1.0.0';
const DYNAMIC_CACHE = 'idform-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    'index.html',
    'feedback.html',
    'learn-more.html',
    'main.js',
    'style.css',
    'feedback.js',
    'feedback.css',
    'admin/feedResponse.html',
    'admin/feedResponse.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle Firebase requests (always go to network)
    if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
        event.respondWith(
            fetch(request)
                .catch(error => {
                    console.error('Service Worker: Firebase request failed:', error);
                    return new Response(JSON.stringify({
                        error: 'Network error',
                        message: 'Unable to connect to database'
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // Handle static files
    if (STATIC_FILES.includes(request.url) || request.destination === 'document') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(response => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return response;
                        });
                })
                .catch(error => {
                    console.error('Service Worker: Error fetching static file:', error);
                    // Return offline page for HTML requests
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                })
        );
        return;
    }

    // Handle other requests (CSS, JS, images)
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(request)
                    .then(response => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            // Check if the request URL is cacheable (not chrome-extension, etc.)
                            if (request.url.startsWith('http') || request.url.startsWith('/')) {
                                caches.open(DYNAMIC_CACHE)
                                    .then(cache => cache.put(request, responseClone))
                                    .catch(cacheError => {
                                        console.warn('Service Worker: Cache put failed:', cacheError);
                                    });
                            }
                        }
                        return response;
                    });
            })
            .catch(error => {
                console.error('Service Worker: Error fetching resource:', error);
                if (request.destination === 'image') {
                    return new Response('', {
                        status: 404,
                        statusText: 'Image not available offline'
                    });
                }
                if (request.destination === 'document') {
                    return caches.match('/index.html');
                }
                // For everything else, return a generic error response
                return new Response('Service Unavailable', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Check for pending offline data
        const pendingData = await getPendingOfflineData();
        if (pendingData.length > 0) {
            console.log('Service Worker: Processing pending offline data');
            for (const data of pendingData) {
                await processOfflineData(data);
            }
        }
    } catch (error) {
        console.error('Service Worker: Background sync error:', error);
    }
}

// Helper function to get pending offline data
async function getPendingOfflineData() {
    // This would typically use IndexedDB to store offline data
    // For now, return empty array
    return [];
}

// Helper function to process offline data
async function processOfflineData(data) {
    // Process offline feedback submissions, etc.
    console.log('Service Worker: Processing offline data:', data);
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification from IDForm',
        icon: '/favicon_io/favicon-32x32.png',
        badge: '/favicon_io/favicon-16x16.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: '/favicon_io/favicon-16x16.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/favicon_io/favicon-16x16.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('IDForm', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/index.html')
        );
    }
});

console.log('Service Worker: Loaded successfully'); 