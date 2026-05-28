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
    <style>
      .ready-zoom-layout {
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        min-height: 480px;
      }
      .ready-zoom-gallery img {
        transition: transform 0.1s ease;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      @media (max-width: 600px) {
        .ready-zoom-layout {
          grid-template-columns: 1fr;
          min-height: auto;
        }
        .ready-zoom-gallery {
          aspect-ratio: 1;
        }
      }
    </style>

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

      <!-- Zoom/Detail Modal for Ready Store -->
      <div class="modal-overlay" id="ready-zoom-modal" style="z-index: 9999;">
        <div class="modal" style="max-width: 650px; width: 95%; padding: 0; overflow: hidden; border-radius: 20px; background: var(--color-bg-main); border: 1px solid var(--color-neutral-divider); position: relative;">
          <div style="position: absolute; top: 16px; right: 16px; z-index: 10;">
            <button class="btn btn--icon" id="close-ready-zoom" style="background: rgba(255,255,255,0.85); backdrop-filter: blur(4px); box-shadow: var(--shadow-sm); width: 36px; height: 36px; border-radius: 50%; color: var(--color-text-primary); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              ${icon('x', 18)}
            </button>
          </div>
          
          <div class="ready-zoom-layout">
            <!-- Left Side: Interactive Zoom Image Gallery -->
            <div class="ready-zoom-gallery" style="position: relative; background: var(--color-bg-subtle); display: flex; align-items: center; justify-content: center; overflow: hidden; height: 100%; min-height: 320px;">
              <div id="ready-zoom-img-container" style="position: relative; width: 100%; height: 100%; aspect-ratio: 1; overflow: hidden; cursor: zoom-in; display: flex; align-items: center; justify-content: center;">
                <!-- Product image injected here -->
              </div>
              <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: flex; align-items: center; gap: 4px; pointer-events: none; backdrop-filter: blur(4px);">
                ${icon('search', 10)} Mueve el cursor o desliza para Zoom
              </div>
            </div>
            
            <!-- Right Side: Details & Actions -->
            <div style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; background: var(--color-bg-main);">
              <div>
                <span style="font-size: 10px; font-weight: 700; color: var(--color-accent); text-transform: uppercase; letter-spacing: 1.5px;" id="ready-zoom-brand">MARCA</span>
                <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-top: 4px; margin-bottom: 8px; color: var(--color-text-primary); line-height: 1.3;" id="ready-zoom-name">Nombre del Producto</h2>
                
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                  <span id="ready-zoom-badge" style="font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: var(--color-ready-badge-bg); color: var(--color-ready-badge-text); letter-spacing: 0.5px;">READY NOW</span>
                  <span style="font-size: 10px; color: var(--color-ready-success); font-weight: 700; display: flex; align-items: center; gap: 4px;">
                    ${icon('truck', 12)} Envío inmediato
                  </span>
                </div>
                
                <div style="background: var(--color-bg-surface); padding: 12px; border-radius: 12px; border: 1px solid var(--color-neutral-border); margin-bottom: 20px;">
                  <div style="font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px;">Talla única disponible:</div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--color-primary);" id="ready-zoom-size">9.5 US</div>
                </div>
                
                <p style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 24px;">
                  Esta es una pieza exclusiva de disponibilidad inmediata de la colección KOALA READY. Embalado en su empaque original y listo para envío exprés de 24 a 48 horas.
                </p>
              </div>
              
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                  <span style="font-size: 13px; color: var(--color-text-secondary); font-weight: 500;">Precio:</span>
                  <span style="font-size: 22px; font-weight: 800; color: var(--color-primary);" id="ready-zoom-price">$0.00</span>
                </div>
                <button class="btn btn--primary" id="ready-zoom-add-btn" style="width: 100%; height: 48px; border-radius: 12px; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  ${icon('shopping-bag', 16)} Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
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

    // Attach click events to quick add
    container.querySelectorAll('.quick-add-ready-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation(); // Avoid card click details modal
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

        setTimeout(() => {
          btn.style.background = 'var(--color-primary)';
          btn.innerHTML = icon('plus', 16);
          btn.disabled = false;
        }, 1500);
      };
    });

    // Zoom/Details Modal Logic
    const zoomModal = document.getElementById('ready-zoom-modal');
    const closeZoom = document.getElementById('close-ready-zoom');
    const zoomImgContainer = document.getElementById('ready-zoom-img-container');
    const zoomBrand = document.getElementById('ready-zoom-brand');
    const zoomName = document.getElementById('ready-zoom-name');
    const zoomBadge = document.getElementById('ready-zoom-badge');
    const zoomSize = document.getElementById('ready-zoom-size');
    const zoomPrice = document.getElementById('ready-zoom-price');
    const zoomAddBtn = document.getElementById('ready-zoom-add-btn');

    if (closeZoom && zoomModal) {
      closeZoom.onclick = () => zoomModal.classList.remove('active');
      zoomModal.onclick = (e) => {
        if (e.target === zoomModal) zoomModal.classList.remove('active');
      };
    }

    // Click card to open Zoom Details modal
    container.querySelectorAll('.ready-card').forEach(card => {
      card.onclick = () => {
        const id = card.getAttribute('data-id');
        const p = readyProducts.find(x => x.id === id);
        if (!p) return;

        // Populate Modal Fields
        zoomBrand.textContent = p.brand || 'KOALA';
        zoomName.textContent = p.name;
        zoomBadge.textContent = p.readyBadge || 'READY NOW';
        zoomSize.textContent = p.sizes && p.sizes.length > 0 ? p.sizes[0] : 'U';
        zoomPrice.textContent = formatCurrency(p.price);

        // Image Handling with High-Res Zoom
        let zoomImgSrc = '';
        if (p.image && p.image.length > 10) {
          if (p.image.trim().startsWith('<img')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(p.image, 'text/html');
            zoomImgSrc = doc.querySelector('img')?.getAttribute('src') || '';
          } else {
            zoomImgSrc = p.image;
          }
        }

        if (zoomImgSrc) {
          zoomImgContainer.innerHTML = `<img src="${zoomImgSrc}" style="width:100%; height:100%; object-fit:contain; transition:transform 0.15s ease-out; transform-origin: center center;" id="ready-zoomable-img" />`;
        } else {
          zoomImgContainer.innerHTML = `<div style="font-size:72px; display:flex; align-items:center; justify-content:center; background:rgba(198,162,122,0.1); width:100%; height:100%;">${p.image || '🛍️'}</div>`;
        }

        // Setup Zoom Interactive Handlers
        const img = document.getElementById('ready-zoomable-img');
        if (img) {
          // Desktop Hover Zoom
          zoomImgContainer.onmousemove = (e) => {
            const rect = zoomImgContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            img.style.transform = 'scale(2.2)';
          };

          zoomImgContainer.onmouseleave = () => {
            img.style.transformOrigin = 'center center';
            img.style.transform = 'scale(1)';
          };

          // Mobile Touch Zoom
          zoomImgContainer.ontouchmove = (e) => {
            const touch = e.touches[0];
            const rect = zoomImgContainer.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

            img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            img.style.transform = 'scale(2.4)';
          };

          zoomImgContainer.ontouchend = () => {
            img.style.transformOrigin = 'center center';
            img.style.transform = 'scale(1)';
          };
        }

        // Add to Cart from Modal
        zoomAddBtn.onclick = () => {
          const cartProduct = {
            ...p,
            selectedSize: p.sizes ? p.sizes[0] : 'U',
            inventoryType: 'ready_now'
          };

          cartService.addItem(cartProduct, 1);

          zoomAddBtn.style.background = 'var(--color-ready-success)';
          zoomAddBtn.innerHTML = `${icon('check', 16)} ¡Agregado!`;
          zoomAddBtn.disabled = true;

          setTimeout(() => {
            zoomAddBtn.style.background = 'var(--color-primary)';
            zoomAddBtn.innerHTML = `${icon('shopping-bag', 16)} Agregar al Carrito`;
            zoomAddBtn.disabled = false;
            zoomModal.classList.remove('active');
          }, 1000);
        };

        zoomModal.classList.add('active');
      };
    });
  }
}
