// Lemonade's helper: lets phones install the app and shows its notifications.
var API_URL = 'https://script.google.com/macros/s/AKfycbwHvESMSHHoJRQLAgK6d-gW7ZT4xuQN3kZEYN7cE8ip_-iAGZsKQIVCTJyBsHjWxCpd/exec';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});

self.addEventListener('push', function (event) {
  event.waitUntil(
    self.registration.pushManager.getSubscription().then(function (sub) {
      return fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ fn: 'api_pushInbox', args: [sub ? sub.endpoint : ''] })
      }).then(function (r) { return r.json(); }).then(function (j) { return (j && j.result) || {}; }).catch(function () { return {}; });
    }).then(function (m) {
      return self.registration.showNotification(m.title || "McBride's Couples Companion", {
        body: m.body || 'Something sweet is waiting for you 🍋',
        icon: 'icon-192.png', badge: 'icon-192.png', tag: 'lemonade', renotify: true,
        data: { url: m.url || './' }
      });
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) { if (list[i].url.indexOf(self.registration.scope) === 0 && 'focus' in list[i]) { list[i].navigate(url); return list[i].focus(); } }
    return self.clients.openWindow(url);
  }));
});
