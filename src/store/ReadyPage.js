/* ============================================
   KOALA READY — Store Catalog Page
   Visual instant-ship collection for customers
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { cartService } from './cartService.js';
import { readyService } from '../utils/readyService.js';

let readyProducts = [];

export function renderReadyPage() {
  return `
    <div class="ready-store animate-fade-in-up" style="margin-top: 80px; min-height: 80vh;">
      
      <!-- Hero -->
      <section class="ready-hero">
        <span class="ready-hero__icon">⚡</span>
        <h1 class="ready-hero__title">KOALA READY</h1>
        <p class="ready-hero__subtitle">
          Disponibilidad inmediata · Envío exprés 24/48h · Sin esperas. Ediciones limitadas.
        </p>
        <div class="ready-hero__tags">
          <span class="ready-hero__tag">${icon('truck', 12)} Envío Inmediato</span>
          <span class="ready-hero__tag">${icon('flame', 12)} Stock Limitado</span>
        </div>
      </section>

      <!-- Grid Container -->
      <div id="store-ready-grid-container">
        <div style="text-align:center; padding:60px; color:var(--color-text-muted);">
          Buscando piezas exclusivas...
        </div>
      </div>

    </div>
  `;
}

export async function initReadyPage() {
  await loadStoreReadyProducts();

  async function loadStoreReadyProducts() {
    readyProducts = await localDb.getAllReadyProducts();
    const container = document.getElementById('store-ready-grid-container');
    if (!container) return;

    if (readyProducts.length === 0) {
      container.innerHTML = `
        <div class="ready-empty animate-fade-in-up">
          <div class="ready-empty__icon">⚡</div>
          <h2 class="ready-empty__title">DROP AGOTADO</h2>
          <p class="ready-empty__text">
            Nuestras piezas de disponibilidad inmediata vuelan en minutos. Los drops de <strong>KOALA READY</strong> ocurren de forma aleatoria y exclusiva.
          </p>
          <button class="btn btn--primary" onclick="window.location.hash = '/'" style="padding:10px 24px; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">
            Ver Catálogo General (Por Encargo)
          </button>
        </div>
      `;
      return;
    }

    const gridHTML = `
      <div class="ready-grid stagger-children">
        ${readyProducts.map(p => {
          const sizeLabel = p.sizes && p.sizes.length > 0 ? p.sizes[0] : 'U';
          const isLastUnit = p.readyBadge === 'LAST UNIT' || p.readyQuantity === 1;
          const badgeClass = isLastUnit ? 'ready-card__badge--last' : '';

          const hasCustomImg = p.image && p.image.length > 10;
          let imgHtml = '';
          
          if (hasCustomImg) {
            if (p.image.trim().startsWith('<img')) {
              imgHtml = p.image;
            } else {
              imgHtml = `<img src="${p.image}" alt="${p.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover;" />`;
            }
          } else {
            imgHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:64px; background:rgba(198,162,122,0.1);">${p.image || '🛍️'}</div>`;
          }

          return `
            <div class="ready-card" data-id="${p.id}">
              <div class="ready-card__image-wrap">
                <span class="ready-card__badge ${badgeClass}">
                  ${icon('zap', 10)} ${p.readyBadge || 'READY NOW'}
                </span>
                <span class="ready-card__shipping">
                  ${icon('truck', 10)} Envío hoy
                </span>
                ${imgHtml}
              </div>
              <div class="ready-card__info">
                <div class="ready-card__brand">${p.brand || 'KOALA'}</div>
                <h3 class="ready-card__name">${p.name}</h3>
                <div class="ready-card__size">Talla única disponible: <strong>${sizeLabel}</strong></div>
                <div class="ready-card__bottom">
                  <span class="ready-card__price">${formatCurrency(p.price)}</span>
                  <button class="ready-card__add-btn quick-add-ready-btn" data-id="${p.id}" title="Agregar al Carrito" aria-label="Agregar al carrito">
                    ${icon('plus', 16)}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = gridHTML;

    // Attach click events
    container.querySelectorAll('.quick-add-ready-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation(); // Avoid card click if any
        const id = btn.getAttribute('data-id');
        const p = readyProducts.find(x => x.id === id);
        if (!p) return;

        // Add to cart
        const cartProduct = {
          ...p,
          selectedSize: p.sizes ? p.sizes[0] : 'U',
          inventoryType: 'ready_now'
        };

        cartService.addItem(cartProduct, 1);

        // Visual feedback micro-animation
        btn.style.background = 'var(--color-ready-success)';
        btn.innerHTML = icon('check', 16);
        btn.disabled = true;

        // Trigger float toast or top alert if any
        setTimeout(() => {
          btn.style.background = 'var(--color-primary)';
          btn.innerHTML = icon('plus', 16);
          btn.disabled = false;
        }, 1500);
      };
    });

    // Option to click card for product details (but standard is to view details of encargo. For ready, just let them click or quick-add)
    container.querySelectorAll('.ready-card').forEach(card => {
      card.onclick = () => {
        // Ready items don't have secondary sizes, let them add to cart instantly
        const btn = card.querySelector('.quick-add-ready-btn');
        if (btn) btn.click();
      };
    });
  }
}
