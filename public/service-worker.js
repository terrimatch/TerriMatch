// Service Worker pentru notificări
self.addEventListener('push', function(event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/app-icon.png',
            badge: '/badge-icon.png',
            data: data.data || {},
            actions: data.actions || [],
            vibrate: [200, 100, 200]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error('Error handling push event:', error);
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const data = event.notification.data;
    let url = '/';

    if (data.type === 'video_call') {
        url = `/call/${data.callId}`;
    } else if (data.type === 'message') {
        url = `/chat/${data.chatId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            for (let client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});
