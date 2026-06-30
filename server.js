const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// ---------- helpers: tiny JSON "database" ----------
function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf-8').trim();
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Error reading', file, e);
    return fallback;
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, []);
if (!fs.existsSync(ORDERS_FILE)) writeJSON(ORDERS_FILE, []);

// ---------- middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'anime-threads-secret-key-change-in-prod',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please log in first.' });
  next();
}

// ============ PRODUCT ROUTES ============
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const { category, q } = req.query;
  let result = products;
  if (category && category !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    const term = q.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term));
  }
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// ============ AUTH ROUTES ============
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  const users = readJSON(USERS_FILE, []);
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashed,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);

  req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email };
  res.json({ message: 'Registered successfully!', user: req.session.user });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ message: 'Logged in successfully!', user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

app.get('/api/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

// ============ CART ROUTES (session-based) ============
function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

app.get('/api/cart', (req, res) => {
  const cart = getCart(req);
  const products = readJSON(PRODUCTS_FILE, []);
  const detailed = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);
  const total = detailed.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  res.json({ items: detailed, total });
});

app.post('/api/cart/add', (req, res) => {
  const { productId, size, qty } = req.body;
  const products = readJSON(PRODUCTS_FILE, []);
  const product = products.find(p => p.id === parseInt(productId));
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const cart = getCart(req);
  const quantity = parseInt(qty) || 1;
  const existing = cart.find(i => i.productId === product.id && i.size === size);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({ productId: product.id, size: size || product.sizes[0], qty: quantity });
  }
  res.json({ message: 'Added to cart!', cartCount: cart.reduce((s, i) => s + i.qty, 0) });
});

app.post('/api/cart/update', (req, res) => {
  const { productId, size, qty } = req.body;
  const cart = getCart(req);
  const item = cart.find(i => i.productId === parseInt(productId) && i.size === size);
  if (!item) return res.status(404).json({ error: 'Item not in cart.' });
  item.qty = Math.max(1, parseInt(qty) || 1);
  res.json({ message: 'Cart updated.' });
});

app.post('/api/cart/remove', (req, res) => {
  const { productId, size } = req.body;
  req.session.cart = getCart(req).filter(
    i => !(i.productId === parseInt(productId) && i.size === size)
  );
  res.json({ message: 'Item removed.' });
});

app.post('/api/cart/clear', (req, res) => {
  req.session.cart = [];
  res.json({ message: 'Cart cleared.' });
});

// ============ ORDER ROUTES ============
app.post('/api/orders', requireAuth, (req, res) => {
  const cart = getCart(req);
  if (!cart.length) return res.status(400).json({ error: 'Your cart is empty.' });

  const { address, paymentMethod } = req.body;
  if (!address) return res.status(400).json({ error: 'Shipping address is required.' });

  const products = readJSON(PRODUCTS_FILE, []);
  const items = cart.map(i => {
    const product = products.find(p => p.id === i.productId);
    return {
      productId: i.productId,
      name: product.name,
      size: i.size,
      qty: i.qty,
      price: product.price
    };
  });
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const orders = readJSON(ORDERS_FILE, []);
  const order = {
    id: Date.now(),
    userId: req.session.user.id,
    userEmail: req.session.user.email,
    items,
    total,
    address,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    status: 'Processing',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);

  req.session.cart = []; // clear cart after order
  res.json({ message: 'Order placed successfully!', order });
});

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = readJSON(ORDERS_FILE, []);
  const mine = orders.filter(o => o.userId === req.session.user.id);
  res.json(mine.reverse());
});

// ============ FALLBACK ROUTES (serve HTML pages) ============
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎌 Anime Threads store running at http://localhost:${PORT}\n`);
});
