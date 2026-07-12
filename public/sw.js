self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      image: data.imageUrl || undefined,
      data: { deepLink: data.deepLink, deepLinkTarget: data.deepLinkTarget },
      vibrate: [200, 100, 200],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (err) {
    event.waitUntil(
      self.registration.showNotification('New Notification', { body: event.data.text() })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { deepLink, deepLinkTarget } = event.notification.data || {};

  let url = '/';
  if (deepLink === 'specific_product' && deepLinkTarget) url = `/product/${deepLinkTarget}`;
  else if (deepLink === 'category' && deepLinkTarget)    url = `/category/${deepLinkTarget}`;
  else if (deepLink === 'flash_sale')                    url = '/flash-sale';
  else if (deepLink === 'custom' && deepLinkTarget)      url = deepLinkTarget;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find(c => c.url.includes(self.location.origin) && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
