/**
 * API client — checks demo mode first, falls back to real PHP endpoints.
 */

const API_BASE = (() => {
  const { hostname, port } = location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/family-os/api';
  }
  return '/api';
})();

async function apiFetch(path, options = {}) {
  // ── Demo mode: intercept and return local data ──
  if (window.DEMO_MODE && window.DEMO_ROUTE) {
    const body = options.body ? JSON.parse(options.body) : null;
    return window.DEMO_ROUTE(path, options.method || 'GET', body);
  }

  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

const api = {
  get:    (path)       => apiFetch(path),
  post:   (path, body) => apiFetch(path, { method:'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => apiFetch(path, { method:'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body) => apiFetch(path, { method:'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => apiFetch(path, { method:'DELETE' }),
  upload(path, formData) {
    if (window.DEMO_MODE) return Promise.resolve({ success:true, data:{ url:'https://placehold.co/400x300?text=Photo', path:'demo/photo.jpg' } });
    const token = Auth.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE}${path}`, { method:'POST', headers, body: formData }).then(r => r.json());
  },
};

const AuthAPI = {
  signup:   (d) => api.post('/auth/signup.php', d),
  login:    (d) => api.post('/auth/login.php', d),
  pinLogin: (d) => api.post('/auth/pin-login.php', d),
  me:       ()  => api.get('/auth/me.php'),
};

const ChoresAPI = {
  list:          ()      => api.get('/chores/index.php'),
  get:           (id)    => api.get(`/chores/detail.php?id=${id}`),
  create:        (d)     => api.post('/chores/index.php', d),
  update:        (id, d) => api.put(`/chores/detail.php?id=${id}`, d),
  delete:        (id)    => api.delete(`/chores/detail.php?id=${id}`),
  instances:     (date)  => api.get(`/chores/instances.php?date=${date || today()}`),
  generateToday: ()      => api.post('/chores/instances.php', { date: today() }),
  templates:     (cat)   => api.get(`/chores/templates.php${cat ? `?category=${cat}` : ''}`),
};

const SubmissionsAPI = {
  list:   (status) => api.get(`/submissions/index.php${status ? `?status=${status}` : ''}`),
  submit: (d)      => api.post('/submissions/index.php', d),
  review: (d)      => api.post('/submissions/review.php', d),
};

const PointsAPI = {
  ledger:      (childId) => api.get(`/points/ledger.php${childId ? `?child_id=${childId}` : ''}`),
  leaderboard: (period)  => api.get(`/points/leaderboard.php?period=${period || 'week'}`),
  grant:       (d)       => api.post('/points/grant.php', d),
  deduct:      (d)       => api.post('/points/deduct.php', d),
};

const LayawayAPI = {
  list:       ()        => api.get('/layaway/index.php'),
  create:     (d)       => api.post('/layaway/index.php', d),
  update:     (id, d)   => api.patch(`/layaway/index.php?id=${id}`, d),
  delete:     (id)      => api.delete(`/layaway/index.php?id=${id}`),
  contribute: (d)       => api.post('/layaway/contribute.php', d),
};

const RewardsAPI = {
  list:   ()  => api.get('/rewards/index.php'),
  create: (d) => api.post('/rewards/index.php', d),
  redeem: (d) => api.post('/rewards/redeem.php', d),
  review: (d) => api.post('/rewards/redeem.php', d),
};

const CouponsAPI = {
  list:   ()  => api.get('/coupons/index.php'),
  create: (d) => api.post('/coupons/index.php', d),
  redeem: (d) => api.post('/coupons/redeem.php', d),
  review: (d) => api.post('/coupons/redeem.php', d),
};

const ChildrenAPI = {
  list:   ()      => api.get('/users/children.php'),
  get:    (id)    => api.get(`/users/child.php?id=${id}`),
  create: (d)     => api.post('/users/children.php', d),
  update: (id, d) => api.patch(`/users/child.php?id=${id}`, d),
  delete: (id)    => api.delete(`/users/child.php?id=${id}`),
};

const ParentsAPI = {
  list: () => api.get('/users/parents.php'),
};

const FamilyAPI = {
  settings: ()  => api.get('/families/settings.php'),
  update:   (d) => api.patch('/families/settings.php', d),
};

const BucketsAPI = {
  balances:  (childId)   => api.get(`/buckets/balances.php${childId ? '?child_id=' + childId : ''}`),
  transfer:  (d)         => api.post('/buckets/transfer.php', d),
  donate:    (d)         => api.post('/buckets/donate.php', d),
  config:    ()          => api.get('/buckets/config.php'),
  saveConfig:(d)         => api.patch('/buckets/config.php', d),
};

const AIAPI = {
  verify:   (d) => api.post('/ai/verify.php', d),
  organize: (d) => api.post('/ai/organize.php', d),
};

const UploadAPI = {
  image: (file, folder='uploads') => {
    if (window.DEMO_MODE) return Promise.resolve({ success:true, data:{ url:'https://placehold.co/400x300?text=Photo' } });
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return api.upload('/upload/image.php', fd);
  },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
