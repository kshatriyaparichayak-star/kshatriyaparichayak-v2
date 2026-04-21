/**
 * Rajput App - Service Worker (PWA Engine)
 * File: sw.js
 */

const CACHE_NAME = 'rajput-app-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/js/firebase-config.js',
    '/js/main.js',
    '/js/ui.js',
    '/js/auth.js',
    '/js/members.js',
    '/js/admin.js',
    '/js/auto-cleanup.js',
    '/js/chat.js',
    '/assets/logo.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap'
];

// 1. इंस्टॉल इवेंट: सभी जरूरी फाइलों को कैश में डालना
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: योद्धा! सभी फाइलें सुरक्षित (Cached) कर ली गई हैं।');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. एक्टिवेट इवेंट: पुराने कैश को साफ़ करना (Version Control)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('SW: पुराना डेटा हटा दिया गया है।');
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// 3. फेच इवेंट: इंटरनेट न होने पर कैश से फाइलें देना (Offline Support)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // अगर कैश में फाइल है तो वही दें, नहीं तो नेटवर्क से लें
            return response || fetch(event.request);
        })
    );
});
