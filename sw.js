/**
 * Rajput App - Service Worker (PWA Engine)
 * File: sw.js
 * Version: 2.1 (Performance Optimized)
 */

const CACHE_NAME = 'rajput-app-v2.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/js/firebase-config.js',
    '/js/main.js',
    '/js/ui.js',
    '/js/auth.js',
    '/js/admin.js',
    '/assets/logo.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap'
];

// 1. इंस्टॉल इवेंट: फाइलों को सुरक्षित करना
self.addEventListener('install', (event) => {
    self.skipWaiting(); // नया SW तुरंत एक्टिवेट हो जाए
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: राजपूत मंच की फाइलें सुरक्षित की गईं।');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. एक्टिवेट इवेंट: पुराने कचरे (Cache) को साफ़ करना
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// 3. फेच इवेंट: नेटवर्क-फर्स्ट रणनीति (ताकि लाइव अपडेट्स तुरंत मिलें)
self.addEventListener('fetch', (event) => {
    // केवल GET रिक्वेस्ट्स को हैंडल करें
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // अगर नेटवर्क सही है, तो इसे कैश में भी अपडेट करें
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // अगर इंटरनेट नहीं है, तब कैश से उठाएं
                return caches.match(event.request);
            })
    );
});
