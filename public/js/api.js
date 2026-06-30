// Shared API helper + navbar renderer used across all pages
const api = {
  async get(url) {
    const res = await fetch(url);
    return res.json();
  },
  async post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }
};

async function renderNavbar(activePage) {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const { user } = await api.get('/api/me');
  let cartCount = 0;
  try {
    const cart = await api.get('/api/cart');
    cartCount = cart.items.reduce((s, i) => s + i.qty, 0);
  } catch (e) {}

  nav.innerHTML = `
    <a href="/index.html" class="logo">⛩️ Anime Threads</a>
    <div class="nav-links">
      <a href="/index.html">Shop</a>
      <a href="/cart.html">Cart ${cartCount ? `<span class="cart-badge">${cartCount}</span>` : ''}</a>
      ${user ? `<a href="/orders.html">My Orders</a>` : ''}
      ${user
        ? `<span title="${user.email}">Hi, ${user.name.split(' ')[0]}</span><span id="logoutBtn">Logout</span>`
        : `<a href="/login.html">Login</a><a href="/register.html">Sign Up</a>`}
    </div>
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api.post('/api/logout');
      window.location.href = '/index.html';
    });
  }
}

function toast(msg, isError = false) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${isError ? '#ff3d6e' : '#3ddc97'}; color: #0f0f14; font-weight: 700;
      padding: 12px 22px; border-radius: 10px; z-index: 999; box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      transition: opacity 0.3s;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = isError ? '#ff3d6e' : '#3ddc97';
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}
