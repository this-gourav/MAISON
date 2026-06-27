'use strict';

/* ============================================================
   CONFIG
   ✅ FIX: was 3000 in original — backend runs on PORT 4000
   ============================================================ */
const API = 'https://maison-backend-ewap.onrender.com';

/* ============================================================
   USER SESSION  (sessionStorage so it survives refresh)
   ============================================================ */
let currentUser = JSON.parse(sessionStorage.getItem('maisonUser') || 'null');

function saveSession(user, token) {
  currentUser = { ...user, token };
  sessionStorage.setItem('maisonUser', JSON.stringify(currentUser));
  refreshLoginBtn();
}

function clearSession() {
  currentUser = null;
  sessionStorage.removeItem('maisonUser');
  cart = [];
  updateCartUI();
  refreshLoginBtn();
  showToast('Logged out');
}

function refreshLoginBtn() {
  const btn = document.getElementById('loginBtn');
  if (!btn) return;
  if (currentUser) {
    const first = (currentUser.FullName || 'Account').split(' ')[0];
    btn.textContent = first.length > 10 ? first.slice(0, 10) + '…' : first;
    btn.title = 'Click to log out';
    btn.onclick = () => showLogoutToast();
  } else {
    btn.textContent = 'Login';
    btn.title = '';
    btn.onclick = () => openAuthModal('login');
  }
}

/* ============================================================
   PRODUCT DATA
   ============================================================ */
const PRODUCTS = [
  { id:1, name:'Linen Resort Shirt',    category:'Shirts',      price:3499,  original:null,  badge:'new',  img:'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=500&q=80',  img2:'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80',  rating:4.8, reviews:124, desc:'Hand-woven European linen with a relaxed drape. Perfect for warm-weather ease.' },
  { id:2, name:'Supima Cotton Tee',     category:'T-Shirts',    price:1299,  original:1799,  badge:'sale', img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',  img2:'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&q=80',  rating:4.9, reviews:312, desc:'Crafted from long-staple Supima cotton. Noticeably softer with every wash.' },
  { id:3, name:'Selvedge Slim Jeans',   category:'Jeans',       price:5999,  original:null,  badge:null,   img:'https://m.media-amazon.com/images/I/81M6E5ykdmL._AC_UY1100_.jpg',         img2:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80',  rating:4.7, reviews:89,  desc:'Japanese selvedge denim in a contemporary slim silhouette. Fades beautifully.' },
  { id:4, name:'Merino Wool Blazer',    category:'Formal Wear', price:12999, original:null,  badge:'new',  img:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80',  img2:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Z3H3Ao9x1Pa_PGQ16p0L4aV0u2VYCFPtp9q3yGqzSA&s=10', rating:5.0, reviews:47, desc:'Single-breasted merino wool blazer with horn buttons and half-canvas construction.' },
  { id:5, name:'Pleated Linen Trousers',category:'Trousers',    price:4299,  original:null,  badge:null,   img:'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=500&q=80',  img2:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqqANkjPVqy--B5VEpFpcgAER39tvtTszwQYjEZApqECABuL8LAu91xWA&s=10', rating:4.6, reviews:73, desc:'Double-pleated linen trousers with a high rise and wide, graceful leg.' },
  { id:6, name:'Cashmere Overshirt',    category:'Jackets',     price:9499,  original:12999, badge:'sale', img:'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&q=80',  img2:'https://www.corneliani.com/media/catalog/product/cache/e085197378419a1a99e6d736d19af07f/c/o/corneliani27xl53-2714200-036-3.jpg', rating:4.9, reviews:58, desc:'Grade-A Mongolian cashmere in a relaxed overshirt silhouette. Year-round layering.' },
  { id:7, name:'Silk Co-Ord Set',       category:'Co-Ord Sets', price:8799,  original:null,  badge:'new',  img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', img2:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80',  rating:4.8, reviews:102, desc:'Fluid crepe de chine co-ord — shirt and wide-leg trouser in tonal sandstone.' },
  { id:8, name:'Khadi Kurta Set',       category:'Ethnic Wear', price:6499,  original:null,  badge:null,   img:'https://jaipurkurta.com/cdn/shop/files/WhatsAppImage2025-08-07at8.48.33PM.jpg?v=1754757212', img2:'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=80', rating:4.7, reviews:166, desc:'Hand-spun Khadi kurta with block-printed detailing. Slow fashion at its finest.' },
];

const NEW_ARRIVALS = [
  { id:9,  name:'Chambray Workshirt', price:2799, tag:'Just Arrived', img:'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=400&q=80' },
  { id:10, name:'Seersucker Shorts',  price:1999, tag:'Trending',     img:'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQH0AGWE0XfKjrAw8xJLakaNO_AUm6goNUaCH5h6WZFWWWRnxYsG-tSSiba3TPCoRKBcaTPGCAdAXnP7W_WqYOer_Yi17yKxrndmx4B0XdnHomVNT17nSGo' },
  { id:11, name:'Modal Lounge Set',   price:4499, tag:'Just Arrived', img:'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80' },
  { id:12, name:'Voile Kaftan',       price:5299, tag:'Summer Pick',  img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id:13, name:'Washed Denim Jacket',price:6999, tag:'Just Arrived', img:'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80' },
  { id:14, name:'Ribbed Knit Polo',   price:2499, tag:'Bestseller',   img:'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80' },
];

const REVIEWS = [
  { quote:'The linen shirt drapes unlike anything I\'ve owned before. MAISON has quietly become the best-dressed decision I\'ve made this year.', name:'Priya Menon',   location:'Mumbai',    avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', stars:5 },
  { quote:'I ordered three items and every single one fit perfectly out of the box. The Merino blazer feels like it was made for me.',             name:'Arjun Kapoor',  location:'Delhi',     avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', stars:5 },
  { quote:'Finally a brand that treats fabric as the hero. The Khadi Kurta set is a masterpiece of slow fashion.',                                name:'Sana Iqbal',    location:'Hyderabad', avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', stars:5 },
  { quote:'The quality-to-price ratio is extraordinary. Each piece tells you it was made with intention and I can feel the difference.',           name:'Rahul Sharma',  location:'Bangalore', avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', stars:5 },
];

/* ============================================================
   CART STATE
   ============================================================ */
let cart = [];

/* Persist cart to DB — debounced so rapid qty taps don't spam the server */
let _cartSyncTimer = null;
function persistCart() {
  if (!currentUser) return;
  clearTimeout(_cartSyncTimer);
  _cartSyncTimer = setTimeout(() => {
    fetch(`${API}/cart/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        cart: cart.map(({ id, name, price, img, category, qty }) =>
          ({ productId: id, name, price, img, category, qty }))
      })
    }).catch(e => console.warn('Cart sync failed:', e));
  }, 600); // wait 600 ms after last change before writing
}

/* Load cart from DB after login */
async function loadCart(userId) {
  try {
    const res = await fetch(`${API}/cart/${userId}`);
    const data = await res.json();
    if (data.success && data.cart.length) {
      cart = data.cart.map(i => ({ id: i.productId, name: i.name, price: i.price, img: i.img, category: i.category, qty: i.qty }));
      updateCartUI();
      showToast('Your saved cart has been restored');
    }
  } catch (e) { console.warn('Cart load failed:', e); }
}

function addToCart(product, qty = 1) {
  const ex = cart.find(i => i.id === product.id);
  if (ex) ex.qty += qty;
  else cart.push({ ...product, qty });
  updateCartUI();
  showToast(`${product.name} added to cart`);
  persistCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
  persistCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { updateCartUI(); persistCart(); }
}

const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);

function updateCartUI() {
  const n = cartCount();
  const el = document.getElementById('cartCount');
  el.textContent = n;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 300);
  const hdr = document.getElementById('cartHeaderCount');
  if (hdr) hdr.textContent = n ? `(${n})` : '';
  renderCartBody();
}

function renderCartBody() {
  const body   = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (!body || !footer) return;

  if (!cart.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>Your cart is empty</p>
        <a href="#categories">Start shopping →</a>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item__img" src="${item.img}" alt="${item.name}"/>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__meta">${item.category}</p>
        <div class="cart-item__controls">
          <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
        </div>
        <button class="cart-item__remove" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
      <div class="cart-item__price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
    </div>`).join('');

  footer.innerHTML = `
    <div class="cart-subtotal">
      <span>Subtotal</span>
      <span>₹${cartTotal().toLocaleString('en-IN')}</span>
    </div>
    <button class="btn btn--dark cart-checkout" onclick="openCheckout()">Proceed to Checkout</button>`;
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

function showAuthToast(msg, type = 'success') {
  const t    = document.getElementById('authToast');
  const icon = document.getElementById('authToastIcon');
  document.getElementById('authToastText').textContent = msg;
  icon.textContent = type === 'success' ? '✓' : '✕';
  icon.style.background = type === 'success' ? 'var(--success)' : 'var(--error)';
  t.classList.add('show');
  let timer = setTimeout(() => t.classList.remove('show'), 3500);
  t._timer = timer;
}

/* Animated logout confirmation toast */
function showLogoutToast() {
  const existing = document.getElementById("logoutToast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "logoutToast";
  toast.innerHTML = `<div class="logout-toast-content"><p class="logout-toast-msg">Log out of MAISON?</p><div class="logout-toast-actions"><button class="logout-toast-cancel">Cancel</button><button class="logout-toast-confirm">Log Out</button></div></div>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  const close = () => { toast.classList.remove("show"); toast.addEventListener("transitionend", () => toast.remove(), { once: true }); };
  toast.querySelector(".logout-toast-cancel").addEventListener("click", close);
  toast.querySelector(".logout-toast-confirm").addEventListener("click", () => { close(); clearSession(); showAuthToast("You have been logged out"); });
  setTimeout(close, 5000);
}

/* ============================================================
   HERO SLIDER
   ============================================================ */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero__slide');
  const dotsWrap = document.getElementById('heroDots');
  let cur = 0, autoPlay;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'hero__dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsWrap.appendChild(d);
  });

  function goTo(n) {
    slides[cur].classList.remove('active');
    dotsWrap.children[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dotsWrap.children[cur].classList.add('active');
  }

  function startAuto() { autoPlay = setInterval(() => goTo(cur + 1), 4500); }
  function resetAuto()  { clearInterval(autoPlay); startAuto(); }

  document.getElementById('heroNext').addEventListener('click', () => { goTo(cur + 1); resetAuto(); });
  document.getElementById('heroPrev').addEventListener('click', () => { goTo(cur - 1); resetAuto(); });
  startAuto();
}

/* ============================================================
   NAVBAR SCROLL
   ============================================================ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const open  = () => { menu.classList.add('open');  document.body.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('hamburger').addEventListener('click', open);
  document.getElementById('menuClose').addEventListener('click', close);
  document.getElementById('menuOverlay').addEventListener('click', close);
  menu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', close));
}

/* ============================================================
   CART DRAWER
   ============================================================ */
function initCart() {
  const overlay = document.getElementById('cartOverlay');
  const drawer  = document.getElementById('cartDrawer');
  const openCart  = () => { overlay.classList.add('open'); drawer.classList.add('open'); document.body.style.overflow = 'hidden'; renderCartBody(); };
  const closeCart = () => { overlay.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
}

/* ============================================================
   RENDER PRODUCTS
   ============================================================ */
function stars(r) {
  return Array.from({length:5}, (_,i) =>
    `<svg class="star${i < Math.round(r) ? '' : ' empty'}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  ).join('');
}
const fmt = p => `₹${p.toLocaleString('en-IN')}`;

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <div class="product-card reveal-up" data-delay="${i % 4}" data-id="${p.id}">
      <div class="product-card__img-wrap">
        ${p.badge ? `<span class="product-card__badge ${p.badge}">${p.badge === 'new' ? 'New' : 'Sale'}</span>` : ''}
        <img class="product-card__img-main" src="${p.img}"  alt="${p.name}" loading="lazy"/>
        <img class="product-card__img-alt"  src="${p.img2}" alt="${p.name}" loading="lazy"/>
        <div class="product-card__quick">
          <button class="btn btn--outline" onclick="openQuickView(${p.id})">Quick View</button>
          <button class="btn btn--dark"    onclick="addToCart(PRODUCTS.find(x=>x.id===${p.id}))">Add to Cart</button>
        </div>
      </div>
      <div class="product-card__body">
        <p class="product-card__name">${p.name}</p>
        <div class="product-card__meta">
          <p class="product-card__price">${p.original ? `<del>${fmt(p.original)}</del> ` : ''}${fmt(p.price)}</p>
          <div class="product-card__stars">${stars(p.rating)}</div>
        </div>
      </div>
    </div>`).join('');
}

function renderArrivals() {
  const t = document.getElementById('arrivalsTrack');
  if (!t) return;
  t.innerHTML = NEW_ARRIVALS.map(item => `
    <div class="arrival-card">
      <div class="arrival-card__img-wrap">
        <span class="arrival-card__tag">${item.tag}</span>
        <img src="${item.img}" alt="${item.name}" loading="lazy"/>
      </div>
      <div class="arrival-card__body">
        <p class="arrival-card__name">${item.name}</p>
        <p class="arrival-card__price">${fmt(item.price)}</p>
      </div>
    </div>`).join('');
}

/* ============================================================
   REVIEWS CAROUSEL
   ============================================================ */
function initReviews() {
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('reviewDots');
  if (!track) return;

  track.innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="review-card__inner">
        <div class="review-card__stars">${stars(r.stars)}</div>
        <p class="review-card__quote">"${r.quote}"</p>
        <div class="review-card__author">
          <img class="review-card__avatar" src="${r.avatar}" alt="${r.name}" loading="lazy"/>
          <div>
            <p class="review-card__name">${r.name}</p>
            <p class="review-card__location">${r.location}</p>
          </div>
        </div>
      </div>
    </div>`).join('');

  let cur = 0;
  REVIEWS.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'reviews__dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Review ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function goTo(n) {
    dotsWrap.children[cur].classList.remove('active');
    cur = (n + REVIEWS.length) % REVIEWS.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dotsWrap.children[cur].classList.add('active');
  }
  document.getElementById('reviewPrev').addEventListener('click', () => goTo(cur - 1));
  document.getElementById('reviewNext').addEventListener('click', () => goTo(cur + 1));
}

/* ============================================================
   QUICK VIEW
   ============================================================ */
function openQuickView(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const modal   = document.getElementById('quickViewModal');
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('quickViewContent').innerHTML = `
    <img class="qv-img" src="${p.img}" alt="${p.name}"/>
    <div class="qv-details">
      <p class="qv-eyebrow">${p.category}</p>
      <h2 class="qv-name">${p.name}</h2>
      <p class="qv-price">${p.original ? `<del>${fmt(p.original)}</del> ` : ''}${fmt(p.price)}</p>
      <p class="qv-desc">${p.desc}</p>
      <div class="qv-sizes">${['XS','S','M','L','XL'].map((s,i) => `<button class="qv-size${i===1?' selected':''}" onclick="selectSize(this)">${s}</button>`).join('')}</div>
      <button class="btn btn--dark qv-btn" onclick="addToCart(PRODUCTS.find(x=>x.id===${id}));closeQuickView()">Add to Cart</button>
    </div>`;
  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectSize(btn) {
  btn.closest('.qv-sizes').querySelectorAll('.qv-size').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function closeQuickView() {
  document.getElementById('quickViewModal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function initQuickView() {
  document.getElementById('modalClose').addEventListener('click', closeQuickView);
  document.getElementById('modalOverlay').addEventListener('click', closeQuickView);
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal-fade,.reveal-up').forEach(el => obs.observe(el));
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.value || !input.value.includes('@')) { showToast('Please enter a valid email'); return; }
    showToast('Welcome to the Fashion Circle!');
    input.value = '';
  });
}

function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const t = document.querySelector(this.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initMobileMenu();
  initCart();
  renderProducts();
  renderArrivals();
  initReviews();
  initScrollReveal();
  initNewsletter();
  initQuickView();
  initSmoothLinks();
  refreshLoginBtn();

  // Restore login state
  setTimeout(() => {
    document.querySelectorAll('.reveal-fade:not(.visible),.reveal-up:not(.visible)').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  }, 100);
});

/* Expose globals for inline onclick */
window.PRODUCTS       = PRODUCTS;
window.addToCart      = addToCart;
window.removeFromCart = removeFromCart;
window.changeQty      = changeQty;
window.openQuickView  = openQuickView;
window.closeQuickView = closeQuickView;
window.selectSize     = selectSize;
window.openCheckout   = openCheckout;
window.placeOrder     = placeOrder;
window.showLogin      = showLogin;
window.showSignup     = showSignup;

/* ============================================================
   AUTH MODAL
   ✅ FIX: removed broken onclick loginUser() / signupUser()
      Real submit listeners hit the actual API on port 4000
   ============================================================ */
const authModal = document.getElementById('authModal');

function openAuthModal(tab = 'login') {
  authModal.style.display = 'flex';
  if (tab === 'signup') showSignup(); else showLogin();
}

document.getElementById('closeAuth').addEventListener('click', () => {
  authModal.style.display = 'none';
});

// Close modal when clicking backdrop
authModal.addEventListener('click', e => {
  if (e.target === authModal) authModal.style.display = 'none';
});

function showLogin() {
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('signupForm').classList.remove('active');
  document.getElementById('tabLogin').classList.add('active');
  document.getElementById('tabSignup').classList.remove('active');
}

function showSignup() {
  document.getElementById('signupForm').classList.add('active');
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('tabSignup').classList.add('active');
  document.getElementById('tabLogin').classList.remove('active');
}

/* --- Login --- */
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Front-end validation
  let valid = true;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('loginEmail', 'loginEmailErr'); valid = false;
  } else clearFieldError('loginEmail', 'loginEmailErr');
  if (!password) {
    showFieldError('loginPassword', 'loginPassErr'); valid = false;
  } else clearFieldError('loginPassword', 'loginPassErr');
  if (!valid) return;

  const btn = e.target.querySelector('.auth-submit');
  setLoading(btn, true);
  try {
    const res  = await fetch(`${API}/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, Password: password }) });
    const data = await res.json();
    if (data.success) {
      saveSession(data.user, data.token);
      authModal.style.display = 'none';
      showAuthToast(`Welcome back, ${data.user.FullName || 'there'}!`);
      await loadCart(data.user.id);
      e.target.reset();
    } else {
      showAuthToast(data.message || 'Login failed', 'error');
    }
  } catch {
    showAuthToast('Cannot reach server. Make sure the backend is running on port 4000.', 'error');
  } finally {
    setLoading(btn, false);
  }
});

/* --- Signup --- */
document.getElementById('signupForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  // Front-end validation
  let valid = true;
  if (!name) {
    showFieldError('signupName', 'signupNameErr'); valid = false;
  } else clearFieldError('signupName', 'signupNameErr');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('signupEmail', 'signupEmailErr'); valid = false;
  } else clearFieldError('signupEmail', 'signupEmailErr');
  if (!password || password.length < 6) {
    showFieldError('signupPassword', 'signupPassErr'); valid = false;
  } else clearFieldError('signupPassword', 'signupPassErr');
  if (!valid) return;

  const btn = e.target.querySelector('.auth-submit');
  setLoading(btn, true);
  try {
    const res  = await fetch(`${API}/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ FullName: name, email, Password: password }) });
    const data = await res.json();
    if (data.success) {
      showAuthToast('Account created! Please log in.');
      showLogin();
      e.target.reset();
    } else {
      showAuthToast(data.message || 'Signup failed', 'error');
    }
  } catch {
    showAuthToast('Cannot reach server. Make sure the backend is running on port 4000.', 'error');
  } finally {
    setLoading(btn, false);
  }
});

/* ============================================================
   FIELD VALIDATION HELPERS
   ============================================================ */
function showFieldError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.add('error');
  if (err)   err.classList.add('show');
}
function clearFieldError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.remove('error');
  if (err)   err.classList.remove('show');
}
function setLoading(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.classList.toggle('loading', on);
}

/* ============================================================
   CHECKOUT / DELIVERY
   ✅ FIX: validates all fields before submitting
   ✅ FIX: actually calls the API — no longer just clears cart
   ✅ FIX: requires login before proceeding
   ============================================================ */
function openCheckout() {
  if (!currentUser) {
    showAuthToast('Please log in to place an order', 'error');
    openAuthModal('login');
    return;
  }
  if (!cart.length) {
    showToast('Your cart is empty');
    return;
  }
  // Pre-fill email from session
  const emailInput = document.getElementById('deliemail');
  if (emailInput && currentUser.email) emailInput.value = currentUser.email;

  // Update order total display
  document.getElementById('checkoutTotal').textContent = `₹${cartTotal().toLocaleString('en-IN')}`;

  document.getElementById('checkoutModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Close checkout with X button
document.getElementById('closeCheckout').addEventListener('click', () => {
  document.getElementById('checkoutModal').style.display = 'none';
  document.body.style.overflow = '';
});

// Close on backdrop click
document.getElementById('checkoutModal').addEventListener('click', e => {
  if (e.target === document.getElementById('checkoutModal')) {
    document.getElementById('checkoutModal').style.display = 'none';
    document.body.style.overflow = '';
  }
});

async function placeOrder() {
  /* ── collect values ── */
  const name    = document.getElementById('deliName').value.trim();
  const phone   = document.getElementById('deliphone').value.trim();
  const email   = document.getElementById('deliemail').value.trim();
  const address = document.getElementById('deliaddress').value.trim();
  const city    = document.getElementById('delicity').value.trim();
  const state   = document.getElementById('delistate').value.trim();
  const pin     = document.getElementById('delipin').value.trim();

  /* ── validate every field ── */
  let valid = true;

  if (!name) {
    showFieldError('deliName', 'deliNameErr'); valid = false;
  } else clearFieldError('deliName', 'deliNameErr');

  if (!phone || !/^\d{10}$/.test(phone)) {
    showFieldError('deliphone', 'deliPhoneErr'); valid = false;
  } else clearFieldError('deliphone', 'deliPhoneErr');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('deliemail', 'deliEmailErr'); valid = false;
  } else clearFieldError('deliemail', 'deliEmailErr');

  if (!address) {
    showFieldError('deliaddress', 'deliAddrErr'); valid = false;
  } else clearFieldError('deliaddress', 'deliAddrErr');

  if (!city) {
    showFieldError('delicity', 'deliCityErr'); valid = false;
  } else clearFieldError('delicity', 'deliCityErr');

  if (!state) {
    showFieldError('delistate', 'deliStateErr'); valid = false;
  } else clearFieldError('delistate', 'deliStateErr');

  if (!pin || !/^\d{6}$/.test(pin)) {
    showFieldError('delipin', 'deliPinErr'); valid = false;
  } else clearFieldError('delipin', 'deliPinErr');

  if (!valid) {
    showAuthToast('Please fill all required fields correctly', 'error');
    return;
  }

  /* ── submit ── */
  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Placing order…';

  try {
    const res  = await fetch(`${API}/delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ FullName: name, PhoneNumber: phone, email, Address: address, city, State: state, Pincode: pin })
    });
    const data = await res.json();

    if (data.success) {
      // Clear cart locally and in DB
      cart = [];
      updateCartUI();
      if (currentUser) {
        await fetch(`${API}/cart/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, cart: [] })
        });
      }

      document.getElementById('checkoutModal').style.display = 'none';
      document.body.style.overflow = '';

      const popup = document.getElementById('successPopup');
      popup.classList.add('show');
      setTimeout(() => popup.classList.remove('show'), 5000);

      // Reset form
      ['deliName','deliphone','deliemail','deliaddress','delicity','delistate','delipin'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    } else {
      showAuthToast(data.message || 'Could not place order', 'error');
    }
  } catch {
    showAuthToast('Cannot reach server. Make sure backend is running on port 4000.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}
