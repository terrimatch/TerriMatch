const CACHE_NAME = 'terrimatch-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/logo192.png',
    '/logo512.png'
];

// Instalare Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activare Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Gestionare notificări push
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        let options = {
            body: data.body,
            icon: '/logo192.png',
            badge: '/logo192.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: [],
            tag: data.tag || 'default'
        };

        // Adaugă acțiuni specifice pentru diferite tipuri de notificări
        switch (data.type) {
            case 'video_call':
                options.actions = [
                    {
                        action: 'accept',
                        title: 'Accept',
                        icon: '/icons/accept.png'
                    },
                    {
                        action: 'decline',
                        title: 'Decline',
                        icon: '/icons/decline.png'
                    }
                ];
                options.requireInteraction = true;
                break;

            case 'message':
                options.actions = [
                    {
                        action: 'reply',
                        title: 'Reply',
                        icon: '/icons/reply.png'
                    },
                    {
                        action: 'view',
                        title: 'View',
                        icon: '/icons/view.png'
                    }
                ];
                break;

            case 'terricoin':
                options.actions = [
                    {
                        action: 'buy',
                        title: 'Buy TerriCoin',
                        icon: '/icons/coin.png'
                    }
                ];
                break;
        }

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error('Error showing notification:', error);
    }
});

// Gestionare click pe notificări
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data;
    let url = '/';

    // Determină URL-ul în funcție de tipul notificării și acțiunea
    switch (event.notification.data.type) {
        case 'video_call':
            if (event.action === 'accept') {
                url = `/call/${data.callId}`;
            }
            break;

        case 'message':
            if (event.action === 'reply' || event.action === 'view') {
                url = `/chat/${data.chatId}`;
            }
            break;

        case 'terricoin':
            if (event.action === 'buy') {
                url = '/wallet';
            }
            break;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Încearcă să găsească o fereastră deschisă și să o focuseze
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Dacă nu există nicio fereastră, deschide una nouă
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Gestionare închidere notificări
self.addEventListener('notificationclose', (event) => {
    const notification = event.notification;
    const data = notification.data;

    // Log pentru analiză
    console.log('Notification closed:', {
        type: data.type,
        id: data.id,
        timestamp: new Date().toISOString()
    });
});

// Gestionare sincronizare în background
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

// Funcție pentru sincronizarea mesajelor
async function syncMessages() {
    try {
        const response = await fetch('/api/messages/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to sync messages');
        }
        
        const result = await response.json();
        console.log('Messages synced successfully:', result);
    } catch (error) {
        console.error('Error syncing messages:', error);
        throw error;
    }
}
