// Firebase Cloud Messaging Service Worker for TMD Dominicana Push Notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Default Firebase config for service worker context
self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      const notificationTitle = payload.notification?.title || payload.data?.title || 'TMD Dominicana';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Nueva actualización en su portal de maquinaria y repuestos.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.type || 'tmd-notification',
        data: payload.data || {}
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (e) {
      console.warn('Push payload parsing error:', e);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.actionUrl || '/#/portal';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
