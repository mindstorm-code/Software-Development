/**
 * UI helpers — toast, loading states, modals, avatars, game UI, etc.
 */

// ── Toast ──────────────────────────────────────────────
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    this.init();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    this.container.appendChild(t);
    setTimeout(() => t.remove(), duration);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error', 4000),
  info:    (msg) => Toast.show(msg, 'info'),
  warning: (msg) => Toast.show(msg, 'warning'),
};

// ── Loading ────────────────────────────────────────────
function setLoading(btn, loading, text = null) {
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn._originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner" style="width:18px;height:18px;border-width:2px"></span>`;
  } else {
    btn.innerHTML = text || btn._originalText || btn.innerHTML;
  }
}

// ── Modal ──────────────────────────────────────────────
function openModal(html, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal"><div class="modal-handle"></div>${html}</div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay, onClose);
  });

  return overlay;
}

function closeModal(overlay, onClose) {
  if (overlay && overlay.parentNode) overlay.remove();
  if (onClose) onClose();
}

// Close top-most modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  const overlays = document.querySelectorAll('.modal-overlay');
  if (overlays.length) closeModal(overlays[overlays.length - 1]);
});

// ── Confirm dialog ─────────────────────────────────────
function confirm(message, confirmText = 'Confirm', danger = false) {
  return new Promise((resolve) => {
    const overlay = openModal(`
      <h2 style="margin-bottom:.75rem">Confirm</h2>
      <p style="margin-bottom:1.5rem">${message}</p>
      <div class="flex gap-sm">
        <button class="btn btn-secondary btn-full" id="modal-cancel">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} btn-full" id="modal-confirm">${confirmText}</button>
      </div>
    `);

    overlay.querySelector('#modal-cancel').onclick  = () => { closeModal(overlay); resolve(false); };
    overlay.querySelector('#modal-confirm').onclick = () => { closeModal(overlay); resolve(true); };
  });
}

// ── Type-to-confirm dialog (requires typing DELETE or EDIT) ────
function typeConfirm(message, word = 'DELETE') {
  return new Promise((resolve) => {
    const danger = word === 'DELETE';
    const overlay = openModal(`
      <h2 style="margin-bottom:.5rem">${danger ? '🗑️ Confirm Delete' : '✏️ Confirm Edit'}</h2>
      <p style="margin-bottom:1rem;color:var(--text-2)">${message}</p>
      <p style="font-size:.85rem;font-weight:600;margin-bottom:.4rem">Type <strong style="color:${danger?'var(--danger)':'var(--primary)'}">${word}</strong> to continue:</p>
      <input class="form-control" id="tc-input" placeholder="${word}" autocomplete="off"
        style="font-size:1rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin-bottom:1rem">
      <div class="flex gap-sm">
        <button class="btn btn-secondary btn-full" id="tc-cancel">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} btn-full" id="tc-confirm" disabled>${word === 'DELETE' ? '🗑️ Delete' : '✏️ Confirm'}</button>
      </div>
    `);

    const input = overlay.querySelector('#tc-input');
    const btn   = overlay.querySelector('#tc-confirm');
    input.addEventListener('input', () => {
      const match = input.value.trim().toUpperCase() === word.toUpperCase();
      btn.disabled = !match;
      btn.style.opacity = match ? '1' : '0.4';
    });
    input.focus();
    overlay.querySelector('#tc-cancel').onclick  = () => { closeModal(overlay); resolve(false); };
    btn.onclick = () => { closeModal(overlay); resolve(true); };
  });
}

// ── Game Avatars ───────────────────────────────────────
const AVATARS = {
  cat:     { emoji:'🐱', name:'Cat Explorer',   color:'#9C91FF', bg:'#F0EDFF', minLevel:1 },
  frog:    { emoji:'🐸', name:'Frog Hero',      color:'#43D39E', bg:'#E8FAF3', minLevel:1 },
  fox:     { emoji:'🦊', name:'Fox Ranger',     color:'#FF8C42', bg:'#FFF0E5', minLevel:1 },
  penguin: { emoji:'🐧', name:'Penguin Pro',    color:'#4FC3F7', bg:'#E1F5FE', minLevel:1 },
  lion:    { emoji:'🦁', name:'Lion Champ',     color:'#FFB822', bg:'#FFF8E1', minLevel:2 },
  tiger:   { emoji:'🐯', name:'Tiger Streak',   color:'#FF7043', bg:'#FBE9E7', minLevel:2 },
  unicorn: { emoji:'🦄', name:'Unicorn Star',   color:'#EC407A', bg:'#FCE4EC', minLevel:3 },
  dragon:  { emoji:'🐉', name:'Dragon Master',  color:'#EF5350', bg:'#FFEBEE', minLevel:3 },
  robot:   { emoji:'🤖', name:'Robot Ranger',   color:'#26C6DA', bg:'#E0F7FA', minLevel:4 },
  wizard:  { emoji:'🧙', name:'Wizard Pro',     color:'#7E57C2', bg:'#EDE7F6', minLevel:4 },
  hero:    { emoji:'🦸', name:'Super Hero',     color:'#1E88E5', bg:'#E3F2FD', minLevel:5 },
  crown:   { emoji:'👑', name:'Champion',       color:'#F9A825', bg:'#FFFDE7', minLevel:6 },
};

function getAvatarKey(user) {
  if (user?.id) {
    const saved = localStorage.getItem('fos_avatar_' + user.id);
    if (saved && AVATARS[saved]) return saved;
  }
  if (user?.avatar_key && AVATARS[user.avatar_key]) return user.avatar_key;
  return null;
}

function avatarHtml(user, size = 'md') {
  const key = getAvatarKey(user);
  const sizeMap   = { sm:'34px',  md:'44px',  lg:'64px',  xl:'92px' };
  const emojiMap  = { sm:'1.1rem',md:'1.5rem',lg:'2.1rem',xl:'3rem' };
  const px = sizeMap[size]  || '44px';
  const em = emojiMap[size] || '1.5rem';

  if (key) {
    const av = AVATARS[key];
    return `<div class="avatar avatar-${size}" style="background:${av.bg};border:2.5px solid ${av.color};font-size:${em};display:flex;align-items:center;justify-content:center;width:${px};height:${px};border-radius:50%;flex-shrink:0">${av.emoji}</div>`;
  }

  if (user?.avatar_url) {
    return `<img src="${user.avatar_url}" class="avatar avatar-${size}" alt="${user.display_name || ''}">`;
  }

  const initials = (user?.display_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#6C63FF','#FF6584','#43D39E','#FFBE3B','#4FC3F7','#FF8A65','#AB47BC','#26A69A'];
  const idx    = (user?.display_name?.charCodeAt(0) || 0) % colors.length;
  return `<div class="avatar avatar-${size}" style="background:${colors[idx]}20;color:${colors[idx]}">${initials}</div>`;
}

function openAvatarPicker(user, onSelect) {
  const level      = user?.level || 1;
  const currentKey = getAvatarKey(user) || 'cat';

  const cards = Object.entries(AVATARS).map(([key, av]) => {
    const locked = level < av.minLevel;
    return `<div class="avatar-card ${key === currentKey ? 'av-selected' : ''} ${locked ? 'av-locked' : ''}"
         data-key="${key}" data-locked="${locked}"
         style="--av-color:${av.color};--av-bg:${av.bg}">
      <div class="avatar-card-emoji">${av.emoji}</div>
      <div class="avatar-card-name">${av.name}</div>
      ${locked ? `<div class="avatar-card-lock">🔒 Lv.${av.minLevel}</div>` : ''}
    </div>`;
  }).join('');

  const overlay = openModal(`
    <h2 style="margin-bottom:.375rem">Choose Your Avatar</h2>
    <p class="text-sm text-muted mb-2">You are Level ${level}. Reach higher levels to unlock more!</p>
    <div class="avatar-picker-grid">${cards}</div>
  `);

  overlay.querySelectorAll('.avatar-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.locked === 'true') {
        Toast.warning('Reach the required level to unlock this avatar!');
        return;
      }
      const key = card.dataset.key;
      if (user?.id) localStorage.setItem('fos_avatar_' + user.id, key);
      overlay.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('av-selected'));
      card.classList.add('av-selected');
      if (onSelect) onSelect(key, AVATARS[key]);
      setTimeout(() => closeModal(overlay), 300);
    });
  });
}

// ── Child Color Themes ────────────────────────────────
const CHILD_THEMES = {
  blue: {
    primary:'#3B82F6', dark:'#2563EB', soft:'#EFF6FF',
    grad:'linear-gradient(135deg,#3B82F6 0%,#6366F1 100%)',
    headerBg:'#EFF6FF', radius:'12px',
    cardStyle:'border-top:3px solid #3B82F6',
    label:'⚡ Blue',
  },
  pink: {
    primary:'#EC4899', dark:'#DB2777', soft:'#FDF2F8',
    grad:'linear-gradient(135deg,#EC4899 0%,#F472B6 100%)',
    headerBg:'#FDF2F8', radius:'20px',
    cardStyle:'border-top:3px solid #EC4899',
    label:'🌸 Pink',
  },
  green: {
    primary:'#22C55E', dark:'#16A34A', soft:'#F0FDF4',
    grad:'linear-gradient(135deg,#22C55E 0%,#86EFAC 100%)',
    headerBg:'#F0FDF4', radius:'14px',
    cardStyle:'border-top:3px solid #22C55E',
    label:'🌿 Green',
  },
  red: {
    primary:'#EF4444', dark:'#DC2626', soft:'#FEF2F2',
    grad:'linear-gradient(135deg,#EF4444 0%,#F97316 100%)',
    headerBg:'#FEF2F2', radius:'16px',
    cardStyle:'border-top:3px solid #EF4444',
    label:'🔥 Red',
  },
  orange: {
    primary:'#F97316', dark:'#EA580C', soft:'#FFF7ED',
    grad:'linear-gradient(135deg,#F97316 0%,#FBBF24 100%)',
    headerBg:'#FFF7ED', radius:'12px',
    cardStyle:'border-top:3px solid #F97316',
    label:'🍊 Orange',
  },
  purple: {
    primary:'#8B5CF6', dark:'#7C3AED', soft:'#F5F3FF',
    grad:'linear-gradient(135deg,#8B5CF6 0%,#C084FC 100%)',
    headerBg:'#F5F3FF', radius:'12px',
    cardStyle:'border-top:3px solid #8B5CF6',
    label:'💜 Purple',
  },
};

function applyChildTheme(user) {
  const key = user?.theme || 'blue';
  const t   = CHILD_THEMES[key] || CHILD_THEMES.blue;
  const r   = document.documentElement;
  r.style.setProperty('--primary',       t.primary);
  r.style.setProperty('--primary-dark',  t.dark);
  r.style.setProperty('--primary-soft',  t.soft);
  r.style.setProperty('--child-grad',    t.grad);
  r.style.setProperty('--child-header-bg', t.headerBg);
  r.style.setProperty('--radius',        t.radius);
  r.setAttribute('data-theme', key);
  window._childTheme = t;
}

// ── Family Coin helpers ────────────────────────────────
function getCoinConfig() {
  try {
    const f = JSON.parse(localStorage.getItem('fos_family') || '{}');
    const rate = parseFloat(f.point_rate) || 0.01; // dollars per 1 FC
    return {
      name:       f.coin_name   || 'FamCoins',
      symbol:     f.coin_symbol || 'FC',
      icon:       f.coin_icon   || '🪙',
      point_rate: rate,
      usdToFC:    (usd) => Math.round(parseFloat(usd) / rate),
      fcToUsd:    (fc)  => (fc * rate).toFixed(2),
    };
  } catch { return { name:'FamCoins', symbol:'FC', icon:'🪙', point_rate:0.01, usdToFC:(u)=>Math.round(u/0.01), fcToUsd:(fc)=>(fc*0.01).toFixed(2) }; }
}

function formatCoins(n) {
  const c = getCoinConfig();
  return `${c.icon} ${Number(n).toLocaleString()} <span style="font-size:.6em;opacity:.75;font-weight:600;letter-spacing:.05em">${c.symbol}</span>`;
}

function coinBadge(n) {
  const c = getCoinConfig();
  return `<span class="coin-badge">${c.icon} ${Number(n).toLocaleString()} <span class="coin-sym">${c.symbol}</span></span>`;
}

// ── XP helpers ─────────────────────────────────────────
function xpForLevel(level) { return level * 100; }

function renderXpBar(balance, level, wrapId, labelId, rightId, fillId) {
  const xpBase    = (level - 1) * 100;
  const xpInLevel = Math.max(0, balance - xpBase);
  const xpNeeded  = xpForLevel(level);
  const pct       = Math.min(100, Math.round(xpInLevel / xpNeeded * 100));

  if (labelId) document.getElementById(labelId).textContent = `⭐ Level ${level}`;
  if (rightId) document.getElementById(rightId).textContent = `${xpInLevel} / ${xpNeeded} XP`;
  if (fillId)  setTimeout(() => { const el = document.getElementById(fillId); if (el) el.style.width = pct + '%'; }, 100);
}

// ── Points pop ─────────────────────────────────────────
function showPointsPop(amount, x, y) {
  const el = document.createElement('div');
  el.className = 'pts-pop';
  el.textContent = `+${amount} ⭐`;
  el.style.left = (x || window.innerWidth / 2) + 'px';
  el.style.top  = (y || window.innerHeight / 2) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ── Relative time ──────────────────────────────────────
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  const hr   = Math.floor(min / 60);
  const day  = Math.floor(hr / 24);
  if (min < 1)   return 'just now';
  if (min < 60)  return `${min}m ago`;
  if (hr  < 24)  return `${hr}h ago`;
  if (day < 7)   return `${day}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── Badges ─────────────────────────────────────────────
function ptsBadge(n) {
  const c = getCoinConfig();
  return `<span class="badge badge-primary">${c.icon} ${n} ${c.symbol}</span>`;
}

function statusBadge(status) {
  const map = {
    pending:   ['warning', '⏳ Pending'],
    submitted: ['info',    '📤 Submitted'],
    approved:  ['success', '✅ Approved'],
    rejected:  ['danger',  '❌ Rejected'],
    fulfilled: ['success', '🎁 Fulfilled'],
  };
  const [type, label] = map[status] || ['neutral', status];
  return `<span class="badge badge-${type}">${label}</span>`;
}

function diffBadge(d) {
  const map = { easy: ['success','⚡ Easy'], medium: ['warning','🔥 Medium'], hard: ['danger','💀 Hard'] };
  const [t, l] = map[d] || ['neutral', d];
  return `<span class="badge badge-${t}">${l}</span>`;
}

function diffDots(d) {
  const filled = { easy:1, medium:2, hard:3 }[d] || 2;
  const color  = { easy:'var(--success)', medium:'var(--warning)', hard:'var(--danger)' }[d] || 'var(--text-3)';
  return `<span class="mission-diff-bar" style="color:${color}">
    ${[1,2,3].map(i=>`<span class="mission-diff-dot ${i<=filled?'on':''}"></span>`).join('')}
  </span>`;
}

// ── SVG icons ──────────────────────────────────────────
const iconHome  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const iconList  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const iconUsers = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const iconCheck = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const iconGift  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
const iconUser  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const iconStar  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const iconAI    = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const iconBack  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const iconPlus  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const iconEdit  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const iconTrash = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
const iconCamera= () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;

// ── Switch User Overlay ───────────────────────────────
// Shows a full-screen overlay: pick a person → enter PIN → switch session.
// Call openSwitchUser() from any Sign Out button instead of Auth.logout().
(function() {

  const AVATAR_EMOJIS = { cat:'🐱', frog:'🐸', fox:'🦊', penguin:'🐧', lion:'🦁', tiger:'🐯',
                          unicorn:'🦄', dragon:'🐉', robot:'🤖', wizard:'🧙', hero:'🦸', crown:'👑' };

  function _personEmoji(p) {
    return AVATAR_EMOJIS[p.avatar_key] || p.emoji || (p.role === 'parent' ? '👤' : '👧');
  }

  function _getFamily() {
    let children = JSON.parse(localStorage.getItem('fos_real_children') || '[]');
    let parents  = JSON.parse(localStorage.getItem('fos_real_parents')  || '[]');
    if (!children.length && typeof DEMO_CHILDREN !== 'undefined') children = [...DEMO_CHILDREN];
    if (!parents.length  && typeof DEMO_PARENTS  !== 'undefined') parents  = [...DEMO_PARENTS];
    return { children, parents };
  }

  let _suOverlay = null;
  let _suPeople  = [];
  let _suPin     = '';
  let _suSelected = null;

  window.openSwitchUser = function() {
    const { children, parents } = _getFamily();
    _suPeople = [...children, ...parents];
    const current = (typeof Auth !== 'undefined') ? Auth.getUser() : null;

    _suOverlay = document.createElement('div');
    _suOverlay.id = 'su-overlay';
    _suOverlay.style.cssText = [
      'position:fixed;inset:0;z-index:2000;background:rgba(15,15,30,.88);',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;',
      'padding:1.5rem;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)'
    ].join('');

    _suOverlay.innerHTML = `
      <div id="su-card" style="width:100%;max-width:400px;background:var(--surface,#fff);border-radius:20px;padding:1.5rem;box-shadow:0 16px 48px rgba(0,0,0,.35)">
        <!-- Step 1: pick person -->
        <div id="su-step-pick">
          <div style="text-align:center;margin-bottom:1.25rem">
            <div style="font-size:1.8rem;margin-bottom:.25rem">👋</div>
            <div style="font-weight:800;font-size:1.15rem">Switch Profile</div>
            <div style="font-size:.85rem;color:var(--text-3)">Who's using the app?</div>
          </div>
          <div id="su-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin-bottom:1.25rem"></div>
          <button onclick="window._suSignOutFully()" style="width:100%;background:none;border:none;color:var(--text-3);font-size:.82rem;cursor:pointer;padding:.5rem;text-decoration:underline">
            Sign out completely
          </button>
        </div>

        <!-- Step 2: PIN entry -->
        <div id="su-step-pin" style="display:none">
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem">
            <button onclick="window._suBackToPick()" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--text-2);padding:.25rem">←</button>
            <div style="flex:1;text-align:center">
              <div id="su-pin-avatar" style="font-size:2rem;margin-bottom:.15rem"></div>
              <div style="font-weight:700;font-size:1rem" id="su-pin-name"></div>
              <div style="font-size:.8rem;color:var(--text-3)">Enter PIN</div>
            </div>
            <div style="width:28px"></div>
          </div>

          <!-- Dots -->
          <div style="display:flex;justify-content:center;gap:.75rem;margin-bottom:.75rem" id="su-dots">
            ${[0,1,2,3].map(i=>`<div id="su-dot-${i}" style="width:14px;height:14px;border-radius:50%;border:2px solid var(--primary);background:transparent;transition:background .15s"></div>`).join('')}
          </div>
          <div id="su-pin-error" style="text-align:center;color:var(--danger);font-size:.82rem;min-height:1.2em;margin-bottom:.4rem"></div>

          <!-- Numpad -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;max-width:240px;margin:0 auto">
            ${[1,2,3,4,5,6,7,8,9].map(n=>`<button onclick="window._suPinPress('${n}')" style="height:60px;border-radius:50%;border:none;background:var(--bg-2,#F0F1F8);font-size:1.3rem;font-weight:700;cursor:pointer">${n}</button>`).join('')}
            <div></div>
            <button onclick="window._suPinPress('0')" style="height:60px;border-radius:50%;border:none;background:var(--bg-2,#F0F1F8);font-size:1.3rem;font-weight:700;cursor:pointer">0</button>
            <button onclick="window._suPinPress('⌫')" style="height:60px;border-radius:50%;border:none;background:transparent;font-size:1.2rem;color:var(--text-2);cursor:pointer">⌫</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(_suOverlay);
    _suPin = '';
    _suSelected = null;
    _suRenderGrid(current?.id);

    // Tap outside card to close
    _suOverlay.addEventListener('click', function(e) {
      if (e.target === _suOverlay) _suClose();
    });

    // Keyboard support
    _suOverlay._keyHandler = function(e) {
      const pinVisible = document.getElementById('su-step-pin').style.display !== 'none';
      if (!pinVisible) return;
      if (e.key >= '0' && e.key <= '9') window._suPinPress(e.key);
      else if (e.key === 'Backspace') window._suPinPress('⌫');
      else if (e.key === 'Escape') _suClose();
    };
    document.addEventListener('keydown', _suOverlay._keyHandler);
  };

  function _suRenderGrid(currentId) {
    const grid = document.getElementById('su-grid');
    if (!grid) return;
    grid.innerHTML = _suPeople.map(p => {
      const isCurrent = p.id === currentId;
      return `
        <div onclick="window._suSelectPerson('${p.id}')" style="
          display:flex;flex-direction:column;align-items:center;padding:.75rem .5rem;
          border:2px solid ${isCurrent ? 'var(--primary)' : 'var(--border,#E4E6F0)'};
          border-radius:14px;cursor:pointer;text-align:center;
          background:${isCurrent ? 'var(--primary-soft,#EEEEFF)' : 'var(--bg-2,#F0F1F8)'};
          transition:border-color .15s">
          <div style="font-size:1.8rem;margin-bottom:.2rem">${_personEmoji(p)}</div>
          <div style="font-weight:700;font-size:.8rem;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.display_name || 'User'}</div>
          ${isCurrent ? '<div style="font-size:.65rem;color:var(--primary);font-weight:600">Active</div>' : (p.role === 'parent' ? '<div style="font-size:.65rem;color:var(--text-3)">Parent</div>' : `<div style="font-size:.65rem;color:var(--text-3)">Lv.${p.level||1}</div>`)}
        </div>`;
    }).join('');
  }

  window._suSelectPerson = function(id) {
    _suSelected = _suPeople.find(p => p.id === id);
    if (!_suSelected) return;
    _suPin = '';
    document.getElementById('su-step-pick').style.display = 'none';
    document.getElementById('su-step-pin').style.display  = '';
    document.getElementById('su-pin-avatar').textContent  = _personEmoji(_suSelected);
    document.getElementById('su-pin-name').textContent    = _suSelected.display_name || 'User';
    document.getElementById('su-pin-error').textContent   = '';
    _suUpdateDots();
  };

  window._suBackToPick = function() {
    document.getElementById('su-step-pin').style.display  = 'none';
    document.getElementById('su-step-pick').style.display = '';
    _suPin = '';
    _suSelected = null;
  };

  window._suPinPress = function(key) {
    const errEl = document.getElementById('su-pin-error');
    if (key === '⌫') { _suPin = _suPin.slice(0, -1); errEl.textContent = ''; _suUpdateDots(); return; }
    if (_suPin.length >= 4) return;
    _suPin += key;
    _suUpdateDots();
    if (_suPin.length === 4) setTimeout(_suSubmitPin, 120);
  };

  function _suUpdateDots() {
    for (let i = 0; i < 4; i++) {
      const d = document.getElementById('su-dot-' + i);
      if (d) d.style.background = i < _suPin.length ? 'var(--primary)' : 'transparent';
    }
  }

  function _suSubmitPin() {
    const expected = _suSelected?.pin || _suSelected?.pin_hash || '';
    if (!expected || expected !== _suPin) {
      document.getElementById('su-pin-error').textContent = 'Wrong PIN, try again';
      _suPin = ''; _suUpdateDots(); return;
    }
    // PIN correct — switch session
    const family = JSON.parse(localStorage.getItem('fos_real_family') || 'null')
                || (typeof DEMO_FAMILY !== 'undefined' ? DEMO_FAMILY : { id:'demo-family-001' });
    const token  = 'local-' + _suSelected.id + '-' + Date.now();
    if (typeof Auth !== 'undefined') Auth.save(token, _suSelected, family);
    _suClose();
    Toast.success('Switched to ' + (_suSelected.display_name || 'User') + ' 👋');
    setTimeout(() => {
      const role = _suSelected.role || 'child';
      location.href = role === 'parent'
        ? '/family-os/pages/parent/dashboard.html'
        : '/family-os/pages/child/dashboard.html';
    }, 600);
  }

  window._suSignOutFully = function() {
    _suClose();
    if (typeof Auth !== 'undefined') Auth.logout();
  };

  function _suClose() {
    if (_suOverlay) {
      if (_suOverlay._keyHandler) document.removeEventListener('keydown', _suOverlay._keyHandler);
      _suOverlay.remove();
      _suOverlay = null;
    }
  }

})();

// ── Parent pending-reviews nav badge ──────────────────
// Call once per parent page to show red count on Reviews nav item
function loadReviewsBadge() {
  const badge = document.getElementById('nav-reviews-badge');
  if (!badge) return;
  SubmissionsAPI.list().then(res => {
    const all = Array.isArray(res) ? res : (res?.data || []);
    const n = all.filter(s => s.status === 'pending' || s.status === 'submitted').length;
    badge.textContent = n;
    badge.style.display = n > 0 ? '' : 'none';
  }).catch(() => {});
}

