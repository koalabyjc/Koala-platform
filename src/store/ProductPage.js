/* ============================================
   KOALA — Product Page
   Public product details view
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { cartService } from './cartService.js';
import { localDb } from '../utils/localDb.js';
import { openLightbox } from '../utils/lightbox.js';
import { renderStoreSizePicker } from '../utils/sizeChart.js';

let currentProduct = null;
let selectedSize = null;

export function renderProductPage(params) {
  // We return a skeleton or a container, and let init fill it, 
  // because router rendering is synchronous and DB is async.
  return `
    <div class="product-detail animate-fade-in-up" id="product-detail-container" style="min-height: 60vh; display:flex; align-items:center; justify-content:center;">
       <div style="color:var(--color-text-muted);">Cargando producto...</div>
    </div>
  `;
}

export async function initProductPage(params) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  try {
    const products = await localDb.getAllProducts();
    currentProduct = products.find(p => p.id === params.id && p.status !== 'draft' && p.status !== 'hidden');

    if (!currentProduct) {
      container.innerHTML = `
        <div style="text-align: center;">
          <h2 style="font-family: var(--font-display);">Producto no encontrado</h2>
          <a href="#/" class="btn btn--primary" style="margin-top: 24px;">Volver a la tienda</a>
        </div>
      `;
      return;
    }

    const hasSizes = currentProduct.sizes && currentProduct.sizes.length > 0;
    const brandHtml = currentProduct.brand ? `<div style="font-weight:700; text-transform:uppercase; font-size:13px; color:var(--color-primary); margin-bottom:4px;">${currentProduct.brand}</div>` : '';
    selectedSize = null;

    container.style.display = 'grid';
    container.innerHTML = `
      <div class="product-detail__gallery" id="store-product-image" style="cursor: zoom-in; position:relative;">
        ${currentProduct.image.length < 10 ? `<div style="font-size:120px; display:flex; align-items:center; justify-content:center; width:100%; height:100%; background:var(--color-bg-surface); border-radius:var(--radius-lg);">${currentProduct.image}</div>` : currentProduct.image}
        <div style="position:absolute; bottom:16px; right:16px; background:rgba(0,0,0,0.5); color:white; padding:8px; border-radius:50%; pointer-events:none;">
           ${icon('zoom-in', 20)}
        </div>
      </div>
      <div class="product-detail__info">
        ${brandHtml}
        <div style="text-transform: uppercase; letter-spacing: 2px; font-size: 12px; color: var(--color-text-muted); margin-bottom: 8px;">
          ${currentProduct.department ? currentProduct.department + ' • ' : ''}${currentProduct.category || ''}
        </div>
        <h1 class="product-detail__title">${currentProduct.name}</h1>
        <div class="product-detail__price">${formatCurrency(currentProduct.price)}</div>
        
        <p class="product-detail__desc">
          Esta es una pieza exclusiva de nuestra colección. Selecciona tu talla, cantidad y procesa la orden.
        </p>

        <!-- Size Picker -->
        <div id="store-size-picker" style="margin-bottom: 20px;"></div>
        
        <div class="product-detail__add">
          <div class="qty-selector">
            <button id="btn-qty-minus">-</button>
            <span id="qty">1</span>
            <button id="btn-qty-plus">+</button>
          </div>
          <button class="btn-add-cart" id="btn-add">
            Añadir al carrito
          </button>
        </div>
        
        <div style="font-size: 14px; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 8px; align-items: center;">${icon('truck', 16)} Coordinamos la entrega contigo</div>
          <div style="display: flex; gap: 8px; align-items: center;">${icon('shield', 16)} Compra local y segura</div>
        </div>
      </div>
    `;

    // Render size picker for client
    if (hasSizes) {
      renderStoreSizePicker('store-size-picker', currentProduct.sizes, (size) => {
        selectedSize = size;
      });
    }

    // Bind Image Zoom
    const imgWrapper = document.getElementById('store-product-image');
    if (imgWrapper) {
      imgWrapper.addEventListener('click', () => {
         openLightbox(currentProduct.image);
      });
    }

    // Bind Qty buttons
    const btnMinus = document.getElementById('btn-qty-minus');
    const btnPlus = document.getElementById('btn-qty-plus');
    const qtySpan = document.getElementById('qty');

    if (btnMinus && btnPlus && qtySpan) {
      btnMinus.addEventListener('click', () => {
        const val = parseInt(qtySpan.textContent);
        qtySpan.textContent = Math.max(1, val - 1);
      });
      btnPlus.addEventListener('click', () => {
        const val = parseInt(qtySpan.textContent);
        qtySpan.textContent = val + 1;
      });
    }

    // Bind Add to Cart
    const btnAdd = document.getElementById('btn-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const hasSizes = currentProduct.sizes && currentProduct.sizes.length > 0;
        if (hasSizes && !selectedSize) {
          alert('Por favor selecciona una talla antes de añadir al carrito.');
          return;
        }

        const qty = parseInt(qtySpan.textContent);
        const cartItem = { ...currentProduct, selectedSize };
        cartService.addItem(cartItem, qty);
        
        // Visual feedback
        const originalText = btnAdd.textContent;
        btnAdd.innerHTML = `${icon('check', 16)} ¡Añadido!`;
        btnAdd.style.background = 'var(--color-success)';
        
        setTimeout(() => {
          btnAdd.textContent = originalText;
          btnAdd.style.background = 'var(--color-primary)';
        }, 1500);
      });
    }

  } catch (err) {
    console.error(err);
  }
}
