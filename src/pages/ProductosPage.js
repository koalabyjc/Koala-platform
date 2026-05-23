/* ============================================
   KOALA — Productos Page
   Visual catalog for product management
   With AI auto-classification & category filters
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { openLightbox } from '../utils/lightbox.js';
import { classifyAllProducts, classifyProduct } from '../utils/autoClassifier.js';
import { renderSizePicker } from '../utils/sizeChart.js';

let allBrands = [];
let allProducts = [];
let adminFilter = { type: 'all', value: '' };
let modalInitialized = false;
let editSelectedSizes = [];
let productViewMode = localStorage.getItem('koala_product_view') || 'large'; // 'large' or 'compact'

const MAIN_CATEGORIES = [
  'Tenis y Zapatos', 'Ropa', 'Gorras', 'Gafas', 'Prendas',
  'Carteras', 'Relojes', 'Splash', 'Medias', 'Accesorios'
];

function getProductSkeletons(viewMode) {
  const skeletons = [];
  for (let i = 0; i < 6; i++) {
    if (viewMode === 'compact') {
      skeletons.push(`
        <div class="product-card product-card--compact skeleton-card animate-fade-in" style="height: 64px; display: flex; align-items: center; padding: 8px; gap: 12px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-sizing: border-box;">
          <div class="skeleton" style="width: 48px; height: 48px; border-radius: var(--radius-md); flex-shrink: 0;"></div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
            <div class="skeleton" style="width: 60px; height: 10px;"></div>
            <div class="skeleton" style="width: 100px; height: 14px;"></div>
            <div class="skeleton" style="width: 45px; height: 12px;"></div>
          </div>
          <div class="skeleton" style="width: 28px; height: 28px; border-radius: var(--radius-full); flex-shrink: 0;"></div>
        </div>
      `);
    } else {
      skeletons.push(`
        <div class="product-card skeleton-card animate-fade-in" style="height: 362px; display: flex; flex-direction: column; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-xl); background: var(--color-bg-surface); overflow: hidden; box-sizing: border-box;">
          <div class="skeleton" style="width: 100%; height: 200px; border-radius: 0;"></div>
          <div style="padding: var(--space-4); flex: 1; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="display: flex; flex-direction: column; gap: 6px; flex: 1; margin-right: 12px;">
                <div class="skeleton" style="width: 50px; height: 10px;"></div>
                <div class="skeleton" style="width: 80%; height: 16px;"></div>
              </div>
              <div class="skeleton" style="width: 60px; height: 20px;"></div>
            </div>
            <div class="skeleton" style="width: 120px; height: 12px;"></div>
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-neutral-divider); padding-top: var(--space-3);">
              <div class="skeleton" style="width: 100px; height: 12px;"></div>
              <div class="skeleton" style="width: 28px; height: 28px; border-radius: var(--radius-full);"></div>
            </div>
          </div>
        </div>
      `);
    }
  }
  return skeletons.join('');
}

export function renderProductosPage() {
  modalInitialized = false;

  return `
    <div class="module-page">
      <!-- Header -->
      <div class="module-header">
        <div>
          <h1 class="module-header__title">Productos</h1>
          <p class="module-header__subtitle">Gestiona tu catálogo y controla el inventario</p>
        </div>
        
        <div class="module-toolbar">
          <div class="search-input">
            ${icon('search', 18)}
            <input type="text" id="admin-product-search" placeholder="Buscar productos por nombre..." aria-label="Buscar productos" />
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <div style="display:flex; border:1px solid var(--color-neutral-border); border-radius:8px; overflow:hidden;">
              <button class="view-toggle-btn ${productViewMode === 'large' ? 'active' : ''}" id="view-large-btn" title="Vista Grande" style="padding:6px 10px; background:${productViewMode === 'large' ? 'var(--color-primary)' : 'var(--color-bg-surface)'}; color:${productViewMode === 'large' ? '#fff' : 'var(--color-text-secondary)'}; border:none; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;">
                ${icon('grid', 16)}
              </button>
              <button class="view-toggle-btn ${productViewMode === 'compact' ? 'active' : ''}" id="view-compact-btn" title="Vista Compacta (3 columnas)" style="padding:6px 10px; background:${productViewMode === 'compact' ? 'var(--color-primary)' : 'var(--color-bg-surface)'}; color:${productViewMode === 'compact' ? '#fff' : 'var(--color-text-secondary)'}; border:none; cursor:pointer; display:flex; align-items:center; border-left:1px solid var(--color-neutral-border); transition:all 0.2s;">
                ${icon('list', 16)}
              </button>
            </div>
            <button class="btn btn--secondary" onclick="window.location.hash='/admin/productos/nuevo'" style="gap: var(--space-1); flex-shrink: 0; padding: 8px 14px;">
              ${icon('plus', 14)}
              Entrada Manual
            </button>
            <button class="btn btn--primary" onclick="window.location.hash='/admin/media'" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); border: none; box-shadow: var(--shadow-glow); gap: var(--space-1); flex-shrink: 0; padding: 8px 16px;">
              ${icon('zap', 14)}
              Entrada Inteligente
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Filters -->
      <div class="no-scrollbar" style="display:flex; flex-wrap:nowrap; gap:10px; margin-bottom:24px; align-items:center; overflow-x:auto; height:38px; min-height:38px; max-height:38px;" id="admin-filters-bar">
        <button class="admin-filter-btn active" data-type="all" data-value="" style="flex-shrink:0;">Todos</button>
        <span style="width:1px; height:20px; background:var(--color-neutral-divider); flex-shrink:0;" id="cat-separator"></span>
        <span style="width:1px; height:20px; background:var(--color-neutral-divider); flex-shrink:0;" id="brand-separator"></span>
      </div>

      <!-- Products Grid -->
      <div class="products-grid ${productViewMode === 'compact' ? 'products-grid--compact' : ''} stagger-children" id="products-grid-container">
        ${getProductSkeletons(productViewMode)}
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" id="edit-product-modal">
        <div class="modal" style="max-width: 600px;">
          <div class="modal__header">
            <h2 class="modal__title">Editar Producto</h2>
            <button class="modal__close" id="close-edit-modal">${icon('x', 24)}</button>
          </div>
          <form id="edit-product-form">
            <input type="hidden" id="edit-product-id" />
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Nombre del Producto</label>
                <input type="text" id="edit-product-name" class="auth-input" style="width:100%" required />
              </div>
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Marca</label>
                <input type="text" id="edit-product-brand" list="edit-brand-list" class="auth-input" style="width:100%" placeholder="Escribe o selecciona..." required />
                <datalist id="edit-brand-list"></datalist>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Departamento</label>
                <select id="edit-product-dept" class="auth-input" style="width:100%" required>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Niños">Niños</option>
                </select>
              </div>
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Categoría</label>
                <select id="edit-product-category" class="auth-input" style="width:100%" required>
                  <option value="Tenis y Zapatos">Tenis y Zapatos</option>
                  <optgroup label="Ropa">
                    <option value="Ropa - T-Shirts">T-Shirts</option>
                    <option value="Ropa - Polos">Polos</option>
                    <option value="Ropa - Hoodies">Hoodies</option>
                    <option value="Ropa - Pantalones Largos">Pantalones Largos</option>
                    <option value="Ropa - Pantalones Cortos">Pantalones Cortos</option>
                    <option value="Ropa - Camisas Manga Larga">Camisas Manga Larga</option>
                    <option value="Ropa - Ropa Deportiva">Ropa Deportiva</option>
                    <option value="Ropa - Sets">Sets</option>
                    <option value="Ropa - Vestidos">Vestidos</option>
                    <option value="Ropa - Trajes de Baños">Trajes de Baños</option>
                    <option value="Ropa - Camisas sin manga">Camisas sin manga</option>
                    <option value="Ropa - Crop Top">Crop Top</option>
                  </optgroup>
                  <option value="Gorras">Gorras</option>
                  <option value="Gafas">Gafas</option>
                  <optgroup label="Prendas">
                    <option value="Prendas - Collares">Collares</option>
                    <option value="Prendas - Pantallas">Pantallas</option>
                    <option value="Prendas - Pulseras">Pulseras</option>
                    <option value="Prendas - Sortijas">Sortijas</option>
                    <option value="Prendas - Cadenas">Cadenas</option>
                  </optgroup>
                  <option value="Carteras">Carteras</option>
                  <option value="Relojes">Relojes</option>
                  <option value="Splash">Splash</option>
                  <option value="Medias">Medias</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Precio ($)</label>
                <input type="number" id="edit-product-price" class="auth-input" style="width:100%; max-width:250px;" step="0.01" min="0" required />
              </div>
            </div>

            <!-- Size Picker -->
            <div style="margin-bottom: 24px;">
              <div id="edit-size-picker-container" style="min-height: 96px; display: flex; flex-direction: column; justify-content: center;"></div>
            </div>

            <div class="modal__footer">
              <button type="button" class="btn btn--ghost" id="cancel-edit-btn">Cancelar</button>
              <button type="submit" class="btn btn--primary">${icon('save', 16)} Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>

    </div>

    <style>
      .admin-filter-btn {
        background: var(--color-bg-surface);
        border: 1px solid var(--color-neutral-border);
        padding: 5px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .admin-filter-btn:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
      .admin-filter-btn.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }
      .admin-filter-btn .count-badge {
        display: inline-block;
        background: rgba(0,0,0,0.1);
        border-radius: 10px;
        padding: 1px 6px;
        font-size: 10px;
        margin-left: 4px;
      }
      .admin-filter-btn.active .count-badge {
        background: rgba(255,255,255,0.3);
      }
    </style>
  `;
}

export async function initProductosPage() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  try {
    allProducts = await localDb.getAllProducts();
    allBrands = await localDb.getAllBrands();

    // --- AI Auto-Classification Pass ---
    const modifiedProducts = classifyAllProducts(allProducts);
    if (modifiedProducts.length > 0) {
      for (const product of modifiedProducts) {
        await localDb.saveProduct(product);

        if (product.brand) {
          const brandExists = allBrands.find(b => b.name.toLowerCase() === product.brand.toLowerCase());
          if (!brandExists) {
            const newBrand = { id: 'B' + Date.now() + Math.random().toString(36).slice(2,5), name: product.brand, logo: product.brand.substring(0, 2).toUpperCase() };
            await localDb.saveBrand(newBrand);
            allBrands.push(newBrand);
          }
        }
      }
      console.log(`AI Classifier: ${modifiedProducts.length} productos clasificados automáticamente.`);
    }

    // Populate Brand Datalist
    const datalist = document.getElementById('edit-brand-list');
    if (datalist) {
      datalist.innerHTML = allBrands.map(b => `<option value="${b.name}">`).join('');
    }

    // Build filter buttons
    buildAdminFilters();

    // Setup modal (only once)
    setupEditModal();

    // Setup search
    const searchInput = document.getElementById('admin-product-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => renderAdminProducts());
    }

    // Close menus on outside click (only once)
    document.addEventListener('click', () => {
      document.querySelectorAll('.action-menu__dropdown').forEach(m => m.classList.remove('active'));
    });

    // Setup view toggle
    const viewLargeBtn = document.getElementById('view-large-btn');
    const viewCompactBtn = document.getElementById('view-compact-btn');
    if (viewLargeBtn && viewCompactBtn) {
      viewLargeBtn.addEventListener('click', () => {
        productViewMode = 'large';
        localStorage.setItem('koala_product_view', 'large');
        viewLargeBtn.style.background = 'var(--color-primary)';
        viewLargeBtn.style.color = '#fff';
        viewCompactBtn.style.background = 'var(--color-bg-surface)';
        viewCompactBtn.style.color = 'var(--color-text-secondary)';
        renderAdminProducts();
      });
      viewCompactBtn.addEventListener('click', () => {
        productViewMode = 'compact';
        localStorage.setItem('koala_product_view', 'compact');
        viewCompactBtn.style.background = 'var(--color-primary)';
        viewCompactBtn.style.color = '#fff';
        viewLargeBtn.style.background = 'var(--color-bg-surface)';
        viewLargeBtn.style.color = 'var(--color-text-secondary)';
        renderAdminProducts();
      });
    }

    // Render products
    renderAdminProducts();

  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-error);">Error al cargar productos.</div>`;
    console.error(err);
  }
}

function buildAdminFilters() {
  const filtersBar = document.getElementById('admin-filters-bar');
  if (!filtersBar) return;

  // Clear previously added dynamic buttons
  filtersBar.querySelectorAll('.admin-filter-btn[data-type="category"], .admin-filter-btn[data-type="brand"]').forEach(b => b.remove());

  // Count products per MAIN category
  const categoryCounts = {};
  MAIN_CATEGORIES.forEach(cat => { categoryCounts[cat] = 0; });
  allProducts.forEach(p => {
    if (p.category) {
      MAIN_CATEGORIES.forEach(mainCat => {
        if (p.category.startsWith(mainCat)) {
          categoryCounts[mainCat]++;
        }
      });
    }
  });

  // Count per brand
  const brandCounts = {};
  allBrands.forEach(b => { brandCounts[b.name] = 0; });
  allProducts.forEach(p => {
    if (p.brand && brandCounts[p.brand] !== undefined) {
      brandCounts[p.brand]++;
    }
  });

  // Insert category buttons before brand separator
  const brandSep = document.getElementById('brand-separator');
  MAIN_CATEGORIES.forEach(cat => {
    const count = categoryCounts[cat] || 0;
    const btn = document.createElement('button');
    btn.className = 'admin-filter-btn';
    btn.style.flexShrink = '0';
    btn.setAttribute('data-type', 'category');
    btn.setAttribute('data-value', cat);
    btn.innerHTML = `${cat} <span class="count-badge">${count}</span>`;
    filtersBar.insertBefore(btn, brandSep);
  });

  // Insert brand buttons after brand separator
  allBrands.forEach(b => {
    const count = brandCounts[b.name] || 0;
    const btn = document.createElement('button');
    btn.className = 'admin-filter-btn';
    btn.style.flexShrink = '0';
    btn.setAttribute('data-type', 'brand');
    btn.setAttribute('data-value', b.name);
    btn.innerHTML = `${b.name} <span class="count-badge">${count}</span>`;
    filtersBar.appendChild(btn);
  });

  // Bind all filter clicks
  filtersBar.querySelectorAll('.admin-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filtersBar.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      adminFilter.type = e.currentTarget.getAttribute('data-type');
      adminFilter.value = e.currentTarget.getAttribute('data-value');
      renderAdminProducts();
    });
  });
}

function setupEditModal() {
  if (modalInitialized) return;
  modalInitialized = true;

  const modal = document.getElementById('edit-product-modal');
  const closeBtn = document.getElementById('close-edit-modal');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const editForm = document.getElementById('edit-product-form');

  if (!modal || !editForm) return;

  const closeModal = () => modal.classList.remove('active');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = editForm.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;

    try {
      btnSubmit.innerHTML = 'Guardando...';
      btnSubmit.disabled = true;

      const id = document.getElementById('edit-product-id').value;
      const newName = document.getElementById('edit-product-name').value;
      const newPrice = parseFloat(document.getElementById('edit-product-price').value);
      const newBrand = document.getElementById('edit-product-brand').value;
      const newDept = document.getElementById('edit-product-dept').value;
      const newCat = document.getElementById('edit-product-category').value;

      const product = allProducts.find(p => String(p.id) === String(id));
      if (!product) {
        alert('Error: Producto no encontrado en memoria.');
        return;
      }

      product.name = newName;
      product.price = newPrice;
      product.brand = newBrand;
      product.department = newDept;
      product.category = newCat;
      product.sizes = [...editSelectedSizes];
      product.status = 'active';

      // Auto-create brand if new
      if (newBrand.trim() !== '') {
        const existingBrand = allBrands.find(b => b.name && b.name.toLowerCase() === newBrand.toLowerCase());
        if (!existingBrand) {
          await localDb.saveBrand({
            id: 'B' + Date.now(),
            name: newBrand,
            logo: newBrand.substring(0, 2).toUpperCase()
          });
        }
      }

      await localDb.saveProduct(product);
      closeModal();
      initProductosPage();
    } catch (err) {
      console.error('Save product error:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      btnSubmit.innerHTML = originalText;
      btnSubmit.disabled = false;
    }
  });
}

function renderAdminProducts() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  let filtered = [...allProducts];

  if (adminFilter.type === 'category') {
    filtered = filtered.filter(p => p.category && p.category.startsWith(adminFilter.value));
  } else if (adminFilter.type === 'brand') {
    filtered = filtered.filter(p => p.brand === adminFilter.value);
  }

  const searchInput = document.getElementById('admin-product-search');
  if (searchInput && searchInput.value.trim()) {
    const query = searchInput.value.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || (p.brand || '').toLowerCase().includes(query));
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-text-muted);">No hay productos en esta categoría.</div>`;
    return;
  }

  // Apply view mode
  if (productViewMode === 'compact') {
    container.className = 'products-grid products-grid--compact stagger-children';
    container.innerHTML = filtered.map(renderProductCardCompact).join('');
  } else {
    container.className = 'products-grid stagger-children';
    container.innerHTML = filtered.map(renderProductCard).join('');
  }
  bindCardActions();
}

function bindCardActions() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  // Image Zoom
  container.querySelectorAll('.product-image-zoom').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(decodeURIComponent(el.getAttribute('data-image')));
    });
  });

  // Action menu toggles
  container.querySelectorAll('.action-menu-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.action-menu__dropdown').forEach(m => {
        if (m !== btn.nextElementSibling) m.classList.remove('active');
      });
      btn.nextElementSibling.classList.toggle('active');
    });
  });

  // Delete
  container.querySelectorAll('.action-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        await localDb.deleteProduct(id);
        initProductosPage();
      }
    });
  });

  // Edit — open modal
  container.querySelectorAll('.action-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const product = allProducts.find(p => p.id === id);
      const modal = document.getElementById('edit-product-modal');

      if (product && modal) {
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-brand').value = product.brand || '';

        if (product.department) {
          document.getElementById('edit-product-dept').value = product.department;
        }
        if (product.category) {
          const catSelect = document.getElementById('edit-product-category');
          const exists = Array.from(catSelect.options).some(opt => opt.value === product.category);
          if (exists) catSelect.value = product.category;
        }

        // Reset and populate size picker with existing sizes
        editSelectedSizes = [...(product.sizes || [])];
        const editCat = document.getElementById('edit-product-category').value;
        const editDept = document.getElementById('edit-product-dept').value;
        renderSizePicker('edit-size-picker-container', editSelectedSizes, editCat, editDept);

        // Listen for dept/cat changes to refresh size picker
        const editDeptSelect = document.getElementById('edit-product-dept');
        const editCatSelect = document.getElementById('edit-product-category');
        editDeptSelect.onchange = () => {
          editSelectedSizes.length = 0;
          renderSizePicker('edit-size-picker-container', editSelectedSizes, editCatSelect.value, editDeptSelect.value);
        };
        editCatSelect.onchange = () => {
          editSelectedSizes.length = 0;
          renderSizePicker('edit-size-picker-container', editSelectedSizes, editCatSelect.value, editDeptSelect.value);
        };

        modal.classList.add('active');
      }
    });
  });
}

function renderProductCard(product) {
  const statusLabels = {
    'in-stock': 'En stock',
    'low-stock': 'Stock bajo',
    'out-of-stock': 'Agotado',
    'draft': 'Borrador'
  };

  const statusLabel = statusLabels[product.status] || product.status;

  return `
    <div class="product-card animate-fade-in-up">
      <div class="product-card__image-wrap product-image-zoom" data-image="${encodeURIComponent(product.image)}" style="cursor: zoom-in;">
        ${product.image.length < 10 ? `<div style="font-size:40px; display:flex; align-items:center; justify-content:center; height:100%;">${product.image}</div>` : product.image}
        <div class="product-card__badge-pos">
          <span class="status-badge status-badge--${product.status}">${statusLabel}</span>
        </div>
      </div>
      
      <div class="product-card__content">
        <div class="product-card__header">
          <div>
             <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:2px;">${product.brand || 'Sin Marca'}</div>
             <h3 class="product-card__title">${product.name}</h3>
          </div>
          <span class="product-card__price">${formatCurrency(product.price)}</span>
        </div>
        
        <div class="product-card__category">${product.department ? product.department + ' • ' : ''}${product.category || 'Sin Categoría'}</div>
        
        <div class="product-card__footer">
          <span class="product-card__stock" style="font-size:11px; color:var(--color-text-muted);">
            ${product.sizes && product.sizes.length > 0
              ? `Tallas: <strong>${product.sizes.slice(0, 5).join(', ')}${product.sizes.length > 5 ? ' +' + (product.sizes.length - 5) : ''}</strong>`
              : '<em>Sin tallas</em>'}
          </span>
          <div class="action-menu">
            <button class="btn btn--icon action-menu-toggle" aria-label="Opciones de ${product.name}">
              ${icon('settings', 16)}
            </button>
            <div class="action-menu__dropdown">
              <button class="action-menu__item action-edit" data-id="${product.id}">
                ${icon('edit', 14)} Editar y Clasificar
              </button>
              <button class="action-menu__item action-menu__item--danger action-delete" data-id="${product.id}">
                ${icon('trash-2', 14)} Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProductCardCompact(product) {
  const imageHtml = (product.image && product.image.length > 10)
    ? product.image.replace(/style="[^"]*"/g, 'style="width:100%;height:100%;object-fit:cover;"')
    : `<div style="font-size:24px; display:flex; align-items:center; justify-content:center; width:100%; height:100%;">${product.image || '📦'}</div>`;

  return `
    <div class="product-card product-card--compact animate-fade-in-up">
      <div class="product-card-compact__image product-image-zoom" data-image="${encodeURIComponent(product.image || '')}" style="cursor: zoom-in;">
        ${imageHtml}
      </div>
      <div class="product-card-compact__info">
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted); letter-spacing:0.03em;">${product.brand || 'Sin Marca'}</div>
        <div style="font-weight:600; font-size:13px; color:var(--color-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px;">${product.name}</div>
        <div style="font-size:14px; font-weight:700; color:var(--color-accent);">${formatCurrency(product.price)}</div>
      </div>
      <div class="action-menu" style="margin-left:auto; flex-shrink:0;">
        <button class="btn btn--icon action-menu-toggle" aria-label="Opciones de ${product.name}">
          ${icon('settings', 14)}
        </button>
        <div class="action-menu__dropdown">
          <button class="action-menu__item action-edit" data-id="${product.id}">
            ${icon('edit', 14)} Editar
          </button>
          <button class="action-menu__item action-menu__item--danger action-delete" data-id="${product.id}">
            ${icon('trash-2', 14)} Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}
