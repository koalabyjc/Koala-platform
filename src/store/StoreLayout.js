/* ============================================
   KOALA — Store Layout
   Public facing shell (Navbar, Footer)
   ============================================ */

import { icon } from '../utils/icons.js';
import { cartService } from './cartService.js';
import { readyService } from '../utils/readyService.js';

export function renderStoreNavbar() {
  const cartCount = cartService.getItemCount();
  
  return `
    <nav class="store-navbar">
      <div class="store-navbar__logo">
        <a href="#/">
          <h2 style="font-family: var(--font-display); font-size: 24px; color: var(--color-primary); margin: 0; letter-spacing: 2px;">KOALA</h2>
        </a>
      </div>
      
      <div class="store-navbar__nav">
        <a href="#/" class="store-nav-link" id="nav-store-catalog">Colección</a>
        <a href="#/ready" class="store-nav-link store-nav-link--ready" id="nav-store-ready">
          READY NOW
          <span class="ready-indicator" id="ready-indicator" style="display: none"></span>
        </a>
      </div>
      
      <div class="store-navbar__actions">
        <button class="store-cart-btn" onclick="window.location.hash = '/cart'" aria-label="Carrito">
          ${icon('shopping-bag', 24)}
          <span class="store-cart-badge" id="cart-badge" style="display: ${cartCount > 0 ? 'flex' : 'none'}">${cartCount}</span>
        </button>
        <button class="store-cart-btn" onclick="window.location.hash = '/login'" aria-label="Admin Login">
          ${icon('user', 24)}
        </button>
      </div>
    </nav>
  `;
}

export function renderStoreFooter() {
  return `
    <footer class="store-footer">
      <p style="font-family: var(--font-display); font-size: 20px; letter-spacing: 2px; margin-bottom: var(--space-4); color: white;">KOALA</p>
      <p style="font-size: var(--text-sm); margin-bottom: var(--space-2);">&copy; 2026 KOALA by JC. Todos los derechos reservados.</p>
      <p style="font-size: var(--text-xs); color: rgba(255,255,255,0.5);">Esta es una tienda de demostración.</p>
    </footer>
  `;
}

export function initStoreShell() {
  // Update cart badge when items change
  cartService.subscribe((items) => {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = cartService.getItemCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  });

  // Initialize KOALA READY badge and navigation active state
  try {
    const updateActiveTab = () => {
      const hash = window.location.hash || '#/';
      const catalogBtn = document.getElementById('nav-store-catalog');
      const readyBtn = document.getElementById('nav-store-ready');
      
      if (catalogBtn && readyBtn) {
        if (hash.startsWith('#/ready')) {
          catalogBtn.classList.remove('store-nav-link--active');
          readyBtn.classList.add('store-nav-link--active');
        } else {
          catalogBtn.classList.add('store-nav-link--active');
          readyBtn.classList.remove('store-nav-link--active');
        }
      }
    };

    window.addEventListener('hashchange', updateActiveTab);
    updateActiveTab();

    readyService.getReadyCount().then(count => {
      const indicator = document.getElementById('ready-indicator');
      if (indicator) indicator.style.display = count > 0 ? 'inline-block' : 'none';
    });

    readyService.subscribe(count => {
      const indicator = document.getElementById('ready-indicator');
      if (indicator) indicator.style.display = count > 0 ? 'inline-block' : 'none';
    });
  } catch (e) {
    console.warn('Error in initStoreShell ready:', e);
  }
}
