import { API_URL as BASE_URL } from '../config';

function getVisitorId() {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('visitor_id', id);
  }
  return id;
}

function getSessionId() {
  let id = sessionStorage.getItem('session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('session_id', id);
  }
  return id;
}

export function trackEvent(eventType, { path, productId, referrer } = {}) {
  const token = localStorage.getItem('customer_token');
  fetch(BASE_URL + '/track/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      eventType,
      path: path ?? window.location.pathname,
      productId,
      platform: 'Web',
      referrer: referrer ?? document.referrer,
    }),
  }).catch(() => {});
}
