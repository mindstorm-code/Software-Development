/**
 * Auth — manages session state in localStorage.
 * Works for both parent (Supabase JWT) and child (PIN token).
 */
const Auth = {
  KEY_TOKEN:  'fos_token',
  KEY_USER:   'fos_user',
  KEY_FAMILY: 'fos_family',

  getToken()  { return localStorage.getItem(this.KEY_TOKEN); },
  getUser()   { const u = localStorage.getItem(this.KEY_USER);   return u ? JSON.parse(u) : null; },
  getFamily() { const f = localStorage.getItem(this.KEY_FAMILY); return f ? JSON.parse(f) : null; },

  isLoggedIn() { return !!this.getToken(); },

  save(token, user, family) {
    localStorage.setItem(this.KEY_TOKEN,  token);
    localStorage.setItem(this.KEY_USER,   JSON.stringify(user));
    localStorage.setItem(this.KEY_FAMILY, JSON.stringify(family));
  },

  updateUser(user) {
    localStorage.setItem(this.KEY_USER, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(this.KEY_TOKEN);
    localStorage.removeItem(this.KEY_USER);
    localStorage.removeItem(this.KEY_FAMILY);
    localStorage.removeItem('fos_demo');
    location.href = '/family-os/pages/login.html';
  },

  _go(path) {
    location.href = '/family-os' + path;
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      this._go('/pages/login.html');
      return false;
    }
    return true;
  },

  requireParent() {
    if (!this.requireAuth()) return false;
    if (this.getUser()?.role !== 'parent') {
      this._go('/pages/child/dashboard.html');
      return false;
    }
    return true;
  },

  requireChild() {
    if (!this.requireAuth()) return false;
    if (this.getUser()?.role !== 'child') {
      this._go('/pages/parent/dashboard.html');
      return false;
    }
    return true;
  },

  getRole()     { return this.getUser()?.role; },
  getFamilyId() { return this.getUser()?.family_id || this.getFamily()?.id; },
  getUserId()   { return this.getUser()?.id; },
};
