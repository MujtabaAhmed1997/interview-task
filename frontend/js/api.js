const API = '/api/v1';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const json = await res.json();

  if (json.errors) {
    const msg = json.errors.map((e) => e.message).join(', ');
    throw new Error(msg);
  }

  return json.result;
}

export async function fetchContests() {
  const result = await api('/contests?page=1&perPage=50');
  return result.data || result;
}
