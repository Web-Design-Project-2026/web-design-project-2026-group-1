/* ============================================================
   TechParts Hub — main.js
   Handles: Cart, Navigation, Quantity controls, Filters,
            Gallery, Form validation, Toasts
   ============================================================ */

'use strict';

/* ============================================================
   CART MODULE
   ============================================================ */
const Cart = (() => {
  const STORAGE_KEY = 'techparts_cart';

  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addItem({ id, name, brand, category, price, qty = 1, image = '' }) {
    const items = getItems();
    const existing = items.find(i => i.id === id);
    if (existing) {
      existing.qty += qty;
      if (image && !existing.image) existing.image = image;
    } else {
      items.push({ id, name, brand, category, price: Number(price), qty, image });
    }
    saveItems(items);
    updateCartCount();
  }

  function removeItem(id) {
    const items = getItems().filter(i => i.id !== id);
    saveItems(items);
    updateCartCount();
  }

  function updateQty(id, qty) {
    const items = getItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, Number(qty));
      saveItems(items);
    }
    updateCartCount();
  }

  function getCount() {
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }

  function getSubtotal() {
    return getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function updateCartCount() {
    const count = getCount();
    document.querySelectorAll('#cart-count').forEach(el => {
      el.textContent = count;
    });
  }

  return { getItems, addItem, removeItem, updateQty, getCount, getSubtotal, updateCartCount };
})();

/* ============================================================
   TOAST MODULE
   ============================================================ */
const Toast = (() => {
  let timer = null;

  function show(message, duration = 2800) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  return { show };
})();

/* ============================================================
   NAVIGATION — mobile hamburger
   ============================================================ */
function initNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on link click (mobile)
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ============================================================
   ADD TO CART BUTTONS
   ============================================================ */
function initAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const { id, name, brand, category, price, image } = btn.dataset;
      Cart.addItem({ id, name, brand, category, price, image });
      Toast.show(`"${name}" added to cart`);

      // Brief button feedback
      const original = btn.textContent;
      btn.textContent = 'Added!';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1200);
    });
  });
}

/* ============================================================
   PRODUCT DETAIL PAGE — quantity + add to cart
   ============================================================ */
function initProductDetailPage() {
  const decreaseBtn = document.getElementById('qty-decrease');
  const increaseBtn = document.getElementById('qty-increase');
  const qtyInput    = document.getElementById('quantity');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  if (!decreaseBtn || !qtyInput) return;

  function getQty() { return Math.max(1, parseInt(qtyInput.value, 10) || 1); }

  decreaseBtn.addEventListener('click', () => {
    qtyInput.value = Math.max(1, getQty() - 1);
  });

  increaseBtn.addEventListener('click', () => {
    qtyInput.value = getQty() + 1;
  });

  qtyInput.addEventListener('change', () => {
    qtyInput.value = Math.max(1, getQty());
  });

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const { id, name, brand, category, price, image } = addToCartBtn.dataset;
      const qty = getQty();
      Cart.addItem({ id, name, brand, category, price, qty, image });
      Toast.show(`${qty}x "${name}" added to cart`);

      const original = addToCartBtn.innerHTML;
      addToCartBtn.textContent = 'Added!';
      addToCartBtn.disabled = true;
      setTimeout(() => {
        addToCartBtn.innerHTML = original;
        addToCartBtn.disabled = false;
      }, 1400);
    });
  }
}

/* ============================================================
   GALLERY THUMBNAILS — product detail
   ============================================================ */
function initGallery() {
  const thumbs = document.querySelectorAll('.gallery__thumb');
  if (!thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => {
        t.classList.remove('gallery__thumb--active');
        t.setAttribute('aria-pressed', 'false');
      });
      thumb.classList.add('gallery__thumb--active');
      thumb.setAttribute('aria-pressed', 'true');
    });
  });
}

/* ============================================================
   CART PAGE
   ============================================================ */
function initCartPage() {
  const cartList      = document.getElementById('cart-list');
  const cartEmpty     = document.getElementById('cart-empty');
  const cartItemCount = document.getElementById('cart-item-count');
  if (!cartList) return;

  function formatPrice(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function buildItemHtml(item) {
    const name = escapeHtml(item.name || '');
    const meta = [item.brand, item.category].filter(Boolean).map(escapeHtml).join(' &middot; ');
    const imgHtml = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${name}" loading="lazy" />`
      : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
          </svg>`;
    return `
      <li class="cart-item" data-id="${escapeHtml(item.id)}">
        <div class="cart-item__img" aria-hidden="true">
          ${imgHtml}
        </div>
        <div class="cart-item__info cart-col--product">
          <p class="cart-item__name">${name}</p>
          <p class="cart-item__meta">${meta}</p>
          <button class="cart-item__remove" aria-label="Remove ${name} from cart">Remove</button>
        </div>
        <span class="cart-item__price cart-col--price">${formatPrice(item.price)}</span>
        <div class="cart-col--qty">
          <div class="qty-control" role="group" aria-label="Quantity for ${name}">
            <button class="qty-control__btn qty-decrease" aria-label="Decrease">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <input type="number" class="qty-control__input" value="${item.qty}" min="1" max="99" aria-label="Quantity" />
            <button class="qty-control__btn qty-increase" aria-label="Increase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
        <span class="cart-item__total cart-col--total">${formatPrice(item.price * item.qty)}</span>
      </li>
    `;
  }

  // Render cart list from the Cart module state.
  function renderCart() {
    const items = Cart.getItems();
    cartList.innerHTML = items
      .map(buildItemHtml)
      .join('<hr class="cart-divider" />');
  }

  function recalcSummary() {
    const items = Cart.getItems();
    const count = Cart.getCount();
    const subtotal = Cart.getSubtotal();
    const tax = Math.round(subtotal * 0.04);
    const total = subtotal + tax;

    const el = id => document.getElementById(id);
    if (el('summary-count'))    el('summary-count').textContent = count;
    if (el('summary-subtotal')) el('summary-subtotal').textContent = formatPrice(subtotal);
    if (el('summary-tax'))      el('summary-tax').textContent = formatPrice(tax);
    if (el('summary-total'))    el('summary-total').textContent = formatPrice(total);
    if (cartItemCount)          cartItemCount.textContent = count + (count === 1 ? ' item' : ' items');
  }

  // Qty controls inside cart items
  cartList.addEventListener('click', e => {
    const item = e.target.closest('.cart-item');
    if (!item) return;
    const id = item.dataset.id;
    const input = item.querySelector('.qty-control__input');

    if (e.target.closest('.qty-decrease')) {
      const newQty = Math.max(1, parseInt(input.value, 10) - 1);
      input.value = newQty;
      Cart.updateQty(id, newQty);
      updateItemTotal(item);
      recalcSummary();
    }

    if (e.target.closest('.qty-increase')) {
      const newQty = parseInt(input.value, 10) + 1;
      input.value = newQty;
      Cart.updateQty(id, newQty);
      updateItemTotal(item);
      recalcSummary();
    }

    if (e.target.classList.contains('cart-item__remove')) {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-8px)';
      item.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => {
        Cart.removeItem(id);
        // Remove item + adjacent divider from DOM
        const prev = item.previousElementSibling;
        if (prev && prev.classList.contains('cart-divider')) prev.remove();
        else {
          const next = item.nextElementSibling;
          if (next && next.classList.contains('cart-divider')) next.remove();
        }
        item.remove();
        checkEmpty();
        recalcSummary();
      }, 300);
    }
  });

  cartList.addEventListener('change', e => {
    if (!e.target.classList.contains('qty-control__input')) return;
    const item = e.target.closest('.cart-item');
    if (!item) return;
    const id = item.dataset.id;
    const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
    e.target.value = qty;
    Cart.updateQty(id, qty);
    updateItemTotal(item);
    recalcSummary();
  });

  function updateItemTotal(item) {
    const id = item.dataset.id;
    const storedItem = Cart.getItems().find(i => i.id === id);
    const totalEl = item.querySelector('.cart-item__total');
    if (storedItem && totalEl) {
      totalEl.textContent = formatPrice(storedItem.price * storedItem.qty);
    }
  }

  function checkEmpty() {
    const items = cartList.querySelectorAll('.cart-item');
    if (cartEmpty) cartEmpty.style.display = items.length === 0 ? 'flex' : 'none';
  }

  // Promo code
  const applyPromo = document.getElementById('apply-promo');
  const promoInput = document.getElementById('promo-code');
  if (applyPromo && promoInput) {
    applyPromo.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'SAVE10') {
        Toast.show('Promo code applied: 10% off!');
        promoInput.value = '';
      } else if (code === '') {
        Toast.show('Please enter a promo code.');
      } else {
        Toast.show('Invalid promo code.');
      }
    });
  }

  renderCart();
  checkEmpty();
  recalcSummary();
}

/* ============================================================
   PRODUCTS PAGE — filter + sort
   ============================================================ */
function initProductsPage() {
  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarBody   = document.getElementById('sidebar-body');
  if (sidebarToggle && sidebarBody) {
    sidebarToggle.addEventListener('click', () => {
      const isOpen = sidebarBody.classList.toggle('is-open');
      sidebarToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Search / filter
  const searchInput  = document.getElementById('search-input');
  const productsGrid = document.getElementById('products-grid');
  const productCount = document.getElementById('product-count');
  if (!productsGrid) return;

  const allCards = Array.from(productsGrid.querySelectorAll('.product-card'));

  function applyFilters() {
    const searchVal  = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const checkedBrands = Array.from(
      document.querySelectorAll('input[name="brand"]:checked')
    ).map(i => i.value);
    const sortVal = document.querySelector('input[name="sort"]:checked')?.value || 'relevance';

    let visible = allCards.filter(card => {
      const name   = card.querySelector('.product-card__name')?.textContent.toLowerCase() || '';
      const brand  = card.dataset.brand || '';
      const matchSearch = !searchVal || name.includes(searchVal);
      const matchBrand  = !checkedBrands.length || checkedBrands.includes(brand);
      return matchSearch && matchBrand;
    });

    // Sort
    if (sortVal === 'price-asc') {
      visible.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    } else if (sortVal === 'price-desc') {
      visible.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    }

    // Hide all, show matching in sorted order
    allCards.forEach(c => c.classList.add('hidden'));
    visible.forEach((c, i) => {
      c.classList.remove('hidden');
      productsGrid.appendChild(c);
    });

    if (productCount) {
      productCount.textContent = visible.length + ' product' + (visible.length !== 1 ? 's' : '');
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  document.querySelectorAll('input[name="brand"], input[name="sort"]').forEach(input => {
    input.addEventListener('change', applyFilters);
  });

  // Price range labels
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  const minLabel = document.getElementById('price-min-label');
  const maxLabel = document.getElementById('price-max-label');

  function updatePriceLabels() {
    if (minLabel && priceMin) minLabel.textContent = '$' + priceMin.value;
    if (maxLabel && priceMax) maxLabel.textContent = priceMax.value >= 2000 ? '$2000+' : '$' + priceMax.value;
  }

  if (priceMin) priceMin.addEventListener('input', updatePriceLabels);
  if (priceMax) priceMax.addEventListener('input', updatePriceLabels);
}

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function showError(id, msg) {
    const el = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el) el.textContent = msg;
    if (input) input.classList.toggle('is-error', !!msg);
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const firstName = document.getElementById('first-name')?.value.trim();
    const lastName  = document.getElementById('last-name')?.value.trim();
    const email     = document.getElementById('email')?.value.trim();
    const message   = document.getElementById('message')?.value.trim();

    showError('first-name', !firstName ? 'First name is required.' : '');
    if (!firstName) valid = false;

    showError('last-name', !lastName ? 'Last name is required.' : '');
    if (!lastName) valid = false;

    if (!email) {
      showError('email', 'Email address is required.');
      valid = false;
    } else if (!validateEmail(email)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    } else {
      showError('email', '');
    }

    showError('message', !message ? 'Please enter a message.' : '');
    if (!message) valid = false;

    if (valid) {
      const successMsg = document.getElementById('form-success');
      if (successMsg) {
        successMsg.style.display = 'block';
        form.reset();
        // Scroll to success
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
      }
    }
  });
}

/* ============================================================
   WISHLIST BUTTON
   ============================================================ */
function initWishlistBtn() {
  const wishlistBtn = document.querySelector('.btn--wishlist');
  if (!wishlistBtn) return;
  wishlistBtn.addEventListener('click', () => {
    Toast.show('Added to wishlist');
  });
}

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCartCount();
  initNav();
  initAddToCartButtons();
  initProductDetailPage();
  initGallery();
  initCartPage();
  initProductsPage();
  initContactForm();
  initWishlistBtn();
  initSmoothScroll();
});
