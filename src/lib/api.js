import { API_URL as BASE_URL, SERVER_URL } from '../config';
export { SERVER_URL };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('customer_token');
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    // fetch() itself rejected — no connection reached the server at all.
    throw new ApiError('Check your internet connection and try again.', 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (e.g. an HTML error page from a proxy/500) — no usable message.
    data = null;
  }

  if (!res.ok) throw new ApiError(data?.message || 'Request failed', res.status);
  return data;
}

export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)  => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)        => request(path, { method: 'DELETE' }),
};

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return SERVER_URL + path;
}
