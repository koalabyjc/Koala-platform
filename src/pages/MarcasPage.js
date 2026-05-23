/* ============================================
   KOALA — Marcas (Brands) Page
   Admin view for managing brands and their products
   Fully integrated with Products module
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { openLightbox } from '../utils/lightbox.js';

let allBrands = [];
let allProducts = [];
let selectedBrand = null;

export function renderMarcasPage() {
  selectedBrand = null;

  return `
    <div class="module-page">
      <!-- Header -->
      <div class="module-header">
        <div>
          <h1 class="module-header__title">Marcas</h1>
          <p class="module-header__subtitle">Gestiona las marcas y explora su inventario</p>
        </div>
        
        <div class="module-toolbar">
          <div class="search-input">
            ${icon('search', 18)}
            <input type="text" id="brand-search" placeholder="Buscar marca..." />
          </div>
          <button class="btn btn--primary" id="btn-add-brand">
            ${icon('plus', 16)}
            Nueva Marca
          </button>
        </div>
      </div>

      <!-- Brands Grid -->
      <div id="brands-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        <div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-text-muted);">
           Cargando marcas...
        </div>
      </div>

      <!-- Brand Detail (products) — shown when a brand is clicked -->
      <div id="brand-detail-section" style="display:none; margin-top:32px;">
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
          <button class="btn btn--ghost" id="btn-back-brands" style="padding:8px 14px;">
            ${icon('arrow-left', 16)} Volver
          </button>
          <h2 id="brand-detail-title" style="margin:0; font-size:20px;"></h2>
          <span id="brand-detail-count" class="status-badge status-badge--pending"></span>
        </div>
        <div class="products-grid stagger-children" id="brand-products-grid"></div>
      </div>

      <!-- Add/Edit Brand Modal -->
      <div class="modal-overlay" id="brand-modal">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title" id="brand-modal-title">Nueva Marca</h2>
            <button class="modal__close" id="close-brand-modal">${icon('x', 24)}</button>
          </div>
          <form id="brand-form">
            <input type="hidden" id="brand-id" />
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Nombre de la Marca</label>
              <input type="text" id="brand-name" class="auth-input" placeholder="Ej. Nike, New Balance, Alo..." style="width:100%" required />
            </div>
            <div class="form-group" style="margin-bottom: 24px;">
              <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Logo o Siglas</label>
              <input type="text" id="brand-logo" class="auth-input" placeholder="Ej. NK o un link de imagen" style="width:100%" />
            </div>
            <div class="modal__footer">
              <button type="button" class="btn btn--ghost" id="cancel-brand-btn">Cancelar</button>
              <button type="submit" class="btn btn--primary">${icon('save', 16)} Guardar Marca</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `;
}

export async function initMarcasPage() {
  const container = document.getElementById('brands-grid-container');
  if (!container) return;

  try {
    allBrands = await localDb.getAllBrands();
    allProducts = await localDb.getAllProducts();

    renderBrandsList();
    setupModal();
    setupSearch();

  } catch (e) {
    console.error('Error loading brands page:', e);
    container.innerHTML = `<div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-error);">Error al cargar marcas: ${e.message || 'Error desconocido'}</div>`;
  }
}

function renderBrandsList() {
  const container = document.getElementById('brands-grid-container');
  if (!container) return;

  // Hide detail section, show grid
  document.getElementById('brand-detail-section').style.display = 'none';
  container.style.display = 'grid';

  if (allBrands.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px; grid-column:1/-1; background:var(--color-bg-surface); border-radius:var(--radius-lg); border:1px dashed var(--color-neutral-divider);">
        <div style="margin-bottom:16px; color:var(--color-text-muted);">${icon('tag', 48)}</div>
        <h3 style="margin-bottom:8px;">Aún no tienes marcas</h3>
        <p style="color:var(--color-text-secondary); margin-bottom:24px;">Organiza tus productos agrupándolos por marca.</p>
        <button class="btn btn--primary" id="btn-add-brand-empty">${icon('plus', 16)} Crear mi primera marca</button>
      </div>
    `;
    const emptyBtn = document.getElementById('btn-add-brand-empty');
    if (emptyBtn) emptyBtn.addEventListener('click', openBrandModal);
    return;
  }

  container.innerHTML = allBrands.map(brand => {
    const brandProducts = allProducts.filter(p => p.brand && p.brand.toLowerCase() === brand.name.toLowerCase());
    return renderBrandCard(brand, brandProducts);
  }).join('');

  // Bind card clicks (open detail)
  container.querySelectorAll('.brand-card-clickable').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.action-delete-brand')) return; // Don't navigate if deleting
      const brandName = card.getAttribute('data-brand');
      showBrandDetail(brandName);
    });
  });

  // Bind delete
  container.querySelectorAll('.action-delete-brand').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
        await localDb.deleteBrand(id);
        allBrands = await localDb.getAllBrands();
        renderBrandsList();
      }
    });
  });
}

function showBrandDetail(brandName) {
  selectedBrand = brandName;

  const container = document.getElementById('brands-grid-container');
  const detailSection = document.getElementById('brand-detail-section');
  const detailTitle = document.getElementById('brand-detail-title');
  const detailCount = document.getElementById('brand-detail-count');
  const productsGrid = document.getElementById('brand-products-grid');

  // Hide grid, show detail
  container.style.display = 'none';
  detailSection.style.display = 'block';

  const brandProducts = allProducts.filter(p => p.brand && p.brand.toLowerCase() === brandName.toLowerCase());
  detailTitle.textContent = brandName;
  detailCount.textContent = `${brandProducts.length} producto${brandProducts.length !== 1 ? 's' : ''}`;

  if (brandProducts.length === 0) {
    productsGrid.innerHTML = `
      <div style="text-align:center; padding:60px; grid-column:1/-1; color:var(--color-text-muted);">
        <div style="margin-bottom:12px;">${icon('package', 32)}</div>
        <p>No hay productos registrados para <strong>${brandName}</strong></p>
        <a href="#/admin/productos/nuevo" class="btn btn--primary" style="margin-top:16px;">${icon('plus', 16)} Crear Producto</a>
      </div>
    `;
  } else {
    productsGrid.innerHTML = brandProducts.map(renderBrandProductCard).join('');

    // Image zoom
    productsGrid.querySelectorAll('.product-image-zoom').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(decodeURIComponent(el.getAttribute('data-image')));
      });
    });

    // Navigate to product edit
    productsGrid.querySelectorAll('.brand-product-link').forEach(link => {
      link.addEventListener('click', () => {
        window.location.hash = '/admin/productos';
      });
    });
  }

  // Back button
  const backBtn = document.getElementById('btn-back-brands');
  backBtn.onclick = () => {
    renderBrandsList();
    selectedBrand = null;
  };
}

function setupModal() {
  const modal = document.getElementById('brand-modal');
  const btnAdd = document.getElementById('btn-add-brand');
  const closeBtn = document.getElementById('close-brand-modal');
  const cancelBtn = document.getElementById('cancel-brand-btn');
  const form = document.getElementById('brand-form');

  if (btnAdd) btnAdd.addEventListener('click', openBrandModal);

  const closeModal = () => modal.classList.remove('active');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('brand-id').value || 'B' + Date.now();
    const name = document.getElementById('brand-name').value;
    const logo = document.getElementById('brand-logo').value || name.substring(0, 2).toUpperCase();

    await localDb.saveBrand({ id, name, logo });
    closeModal();
    allBrands = await localDb.getAllBrands();
    renderBrandsList();
  });
}

function openBrandModal() {
  document.getElementById('brand-id').value = '';
  document.getElementById('brand-name').value = '';
  document.getElementById('brand-logo').value = '';
  document.getElementById('brand-modal-title').textContent = 'Nueva Marca';
  document.getElementById('brand-modal').classList.add('active');
}

function setupSearch() {
  const searchInput = document.getElementById('brand-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    const container = document.getElementById('brands-grid-container');
    container.querySelectorAll('.brand-card-clickable').forEach(card => {
      const name = card.getAttribute('data-brand').toLowerCase();
      card.style.display = name.includes(filter) ? '' : 'none';
    });
  });
}

function renderBrandCard(brand, products) {
  const previewProducts = products.slice(0, 5);
  const remaining = products.length - previewProducts.length;

  // Group by category for quick summary
  const categories = {};
  products.forEach(p => {
    const cat = p.category || 'Sin Categoría';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  const categoryTags = Object.entries(categories).map(([cat, count]) => 
    `<span style="font-size:11px; padding:2px 8px; background:var(--color-bg-main); border-radius:4px; color:var(--color-text-secondary);">${cat} (${count})</span>`
  ).join('');

  let previewsHtml = '';
  if (products.length > 0) {
    previewsHtml = `
      <div style="display:flex; gap:6px; margin-top:12px; flex-wrap:wrap;">
        ${previewProducts.map(p => {
          const safeImage = p.image || '';
          const isEmoji = safeImage.length < 10;
          const imageContent = isEmoji
            ? (safeImage || '📦')
            : safeImage.replace(/style="[^"]*"/g, 'style="width:100%;height:100%;object-fit:cover;"');
          return `
          <div style="width:42px; height:42px; border-radius:6px; overflow:hidden; background:var(--color-bg-main); display:flex; align-items:center; justify-content:center; border:1px solid var(--color-neutral-divider); font-size:16px;">
            ${imageContent}
          </div>
        `;
        }).join('')}
        ${remaining > 0 ? `<div style="width:42px; height:42px; border-radius:6px; background:var(--color-bg-main); display:flex; align-items:center; justify-content:center; color:var(--color-text-muted); font-size:11px; font-weight:bold; border:1px solid var(--color-neutral-divider);">+${remaining}</div>` : ''}
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:10px;">
        ${categoryTags}
      </div>
    `;
  } else {
    previewsHtml = `<div style="margin-top:12px; font-size:12px; color:var(--color-text-muted);">Sin productos registrados</div>`;
  }

  return `
    <div class="card brand-card-clickable animate-fade-in-up" data-brand="${brand.name}" data-name="${brand.name}" style="position:relative; cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
      
      <div style="position:absolute; top:12px; right:12px; z-index:2;">
        <button class="btn btn--icon action-delete-brand" data-id="${brand.id}" style="color:var(--color-text-muted); background:var(--color-bg-surface); border-radius:50%; width:32px; height:32px;" title="Eliminar marca">
          ${icon('trash-2', 14)}
        </button>
      </div>

      <div style="display:flex; align-items:center; gap:14px;">
        <div style="width:56px; height:56px; border-radius:12px; background:var(--color-primary); display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px; color:#fff; flex-shrink:0;">
          ${(brand.logo || '').length < 5 ? (brand.logo || brand.name.substring(0,2).toUpperCase()) : `<img src="${brand.logo}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" onerror="this.style.display='none'" />`}
        </div>
        <div>
          <h3 style="font-size:17px; margin-bottom:2px;">${brand.name}</h3>
          <span style="font-size:13px; color:var(--color-text-secondary);">${products.length} producto${products.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      ${previewsHtml}

      <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--color-neutral-divider); display:flex; align-items:center; justify-content:space-between;">
        <span style="color:var(--color-primary); font-weight:600; font-size:13px; display:flex; align-items:center; gap:6px;">
          Ver productos ${icon('arrow-right', 14)}
        </span>
      </div>
    </div>
  `;
}

function renderBrandProductCard(product) {
  const sizesText = product.sizes && product.sizes.length > 0
    ? product.sizes.slice(0, 4).join(', ') + (product.sizes.length > 4 ? ` +${product.sizes.length - 4}` : '')
    : 'Sin tallas';

  const safeImage = product.image || '';
  const isEmoji = safeImage.length < 10;
  const imageContent = isEmoji
    ? `<div style="font-size:40px; display:flex; align-items:center; justify-content:center; height:100%;">${safeImage || '📦'}</div>`
    : safeImage;

  return `
    <div class="product-card animate-fade-in-up">
      <div class="product-card__image-wrap product-image-zoom" data-image="${encodeURIComponent(safeImage)}" style="cursor: zoom-in;">
        ${imageContent}
      </div>
      
      <div class="product-card__content">
        <div class="product-card__header">
          <div>
             <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:2px;">${product.brand || ''}</div>
             <h3 class="product-card__title">${product.name}</h3>
          </div>
          <span class="product-card__price">${formatCurrency(product.price)}</span>
        </div>
        
        <div class="product-card__category">${product.department ? product.department + ' • ' : ''}${product.category || ''}</div>
        
        <div class="product-card__footer">
          <span style="font-size:11px; color:var(--color-text-muted);">Tallas: <strong>${sizesText}</strong></span>
          <button class="btn btn--icon brand-product-link" title="Ir a Productos" style="color:var(--color-primary);">
            ${icon('external-link', 14) || icon('arrow-right', 14)}
          </button>
        </div>
      </div>
    </div>
  `;
}
