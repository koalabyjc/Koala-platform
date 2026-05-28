/* ============================================
   KOALA — Store Home Page
   Public homepage with hero and featured products
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';

let allProducts = [];
let allBrands = [];
let topProductsMap = {};
let currentFilter = { type: 'all', value: '' };

export function renderHomePage() {
  return `
    <div class="store-page animate-fade-in-up">
      <!-- Hero Section -->
      <section class="store-hero">
        <img src="/assets/store_hero.png" alt="KOALA Summer Collection" class="store-hero__bg" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNkOWM4YjgiLz48L3N2Zz4='"/>
        <div class="store-hero__overlay"></div>
        <div class="store-hero__content">
          <h1 class="store-hero__title">Descubre tu estilo.</h1>
          <p class="store-hero__subtitle">Explora las mejores marcas y colecciones. Desde Tenis hasta Ropa de Hombre, encuéntralo todo aquí.</p>
          <button class="btn btn--primary" style="padding: var(--space-4) var(--space-8); font-size: var(--text-lg);" onclick="document.getElementById('shop-section').scrollIntoView({behavior: 'smooth'})">
            Explorar Colección
          </button>
        </div>
      </section>

      <!-- Cómo Funciona KOALA -->
      <section class="store-section" style="padding-top: 60px; padding-bottom: 20px;">
        <h2 style="font-family: var(--font-display); font-size: 24px; text-align: center; margin-bottom: 40px;">Cómo funciona KOALA</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
          
          <div style="background: var(--color-bg-surface); padding: 24px 16px; border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-neutral-border);">
            <div style="color: var(--color-primary); margin-bottom: 16px;">${icon('package', 32)}</div>
            <h3 style="font-size: 16px; margin-bottom: 8px;">1. Pedido por encargo</h3>
            <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">Todos los productos se trabajan por pedido personalizado.</p>
          </div>

          <div style="background: var(--color-bg-surface); padding: 24px 16px; border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-neutral-border);">
            <div style="color: var(--color-primary); margin-bottom: 16px;">${icon('clock', 32)}</div>
            <h3 style="font-size: 16px; margin-bottom: 8px;">2. Tiempo de entrega</h3>
            <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">Las órdenes pueden tardar aprox. 1–2 semanas dependiendo disponibilidad.</p>
          </div>

          <div style="background: var(--color-bg-surface); padding: 24px 16px; border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-neutral-border);">
            <div style="color: var(--color-primary); margin-bottom: 16px;">${icon('credit-card', 32)}</div>
            <h3 style="font-size: 16px; margin-bottom: 8px;">3. Pagos flexibles</h3>
            <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">Puedes realizar pagos parciales dentro de la fecha límite asignada a tu orden.</p>
          </div>

          <div style="background: var(--color-bg-surface); padding: 24px 16px; border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-neutral-border);">
            <div style="color: var(--color-primary); margin-bottom: 16px;">${icon('calendar', 32)}</div>
            <h3 style="font-size: 16px; margin-bottom: 8px;">4. Balance pendiente</h3>
            <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">Las órdenes deben completarse antes de la fecha límite para evitar recargos.</p>
          </div>

          <div style="background: var(--color-bg-surface); padding: 24px 16px; border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-neutral-border);">
            <div style="color: var(--color-primary); margin-bottom: 16px;">${icon('message-circle', 32)}</div>
            <h3 style="font-size: 16px; margin-bottom: 8px;">5. Actualizaciones</h3>
            <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5;">Recibirás actualizaciones y resumen de tu orden directamente de KOALA.</p>
          </div>

        </div>
      </section>

      <!-- Shop Navigation / Filters -->
      <section class="store-section" id="shop-section" style="padding-top: 40px; padding-bottom: 0;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--color-neutral-border); padding-bottom: 16px;">
            <h2 style="font-family: var(--font-display); font-size: 20px; margin: 0;">Catálogo</h2>
            <div class="view-toggle" style="display: flex; background: var(--color-surface); border: 1px solid var(--color-neutral-border); border-radius: 8px; padding: 4px;">
              <button class="view-btn active" id="btn-public-view-large" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-secondary); display: flex; align-items: center; justify-content: center;" title="Vista Grande">
                ${icon('grid', 18)}
              </button>
              <button class="view-btn" id="btn-public-view-compact" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-secondary); display: flex; align-items: center; justify-content: center;" title="Vista Compacta">
                ${icon('list', 18)}
              </button>
            </div>
          </div>
          
          <!-- Departments & Categories -->
          <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
            <strong style="font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-right:16px;">Departamentos:</strong>
            <button class="filter-btn active" data-type="all" data-value="">Todo</button>
            <button class="filter-btn" data-type="department" data-value="Hombre">Hombre</button>
            <button class="filter-btn" data-type="department" data-value="Mujer">Mujer</button>
            <button class="filter-btn" data-type="department" data-value="Niños">Niños</button>
            <button class="filter-btn" data-type="department" data-value="Unisex">Unisex</button>
            <button class="filter-btn" data-type="category" data-value="Tenis y Zapatos">Tenis y Zapatos</button>
            <button class="filter-btn" data-type="category" data-value="Ropa">Ropa</button>
            <button class="filter-btn" data-type="category" data-value="Gorras">Gorras</button>
            <button class="filter-btn" data-type="category" data-value="Gafas">Gafas</button>
            <button class="filter-btn" data-type="category" data-value="Prendas">Prendas</button>
            <button class="filter-btn" data-type="category" data-value="Carteras">Carteras</button>
            <button class="filter-btn" data-type="category" data-value="Relojes">Relojes</button>
            <button class="filter-btn" data-type="category" data-value="Splash">Splash</button>
            <button class="filter-btn" data-type="category" data-value="Medias">Medias</button>
            <button class="filter-btn" data-type="category" data-value="Accesorios">Accesorios</button>
          </div>

          <!-- Brands -->
          <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;" id="store-brands-filter">
            <strong style="font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-right:16px;">Marcas:</strong>
            <!-- Injected dynamically -->
          </div>
        </div>
      </section>

      <!-- Products Grid -->
      <section class="store-section">
        <div class="public-grid stagger-children" id="store-products-grid">
          <div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-text-muted);">
            Cargando catálogo...
          </div>
        </div>
      </section>
    </div>

    <style>
      .filter-btn {
        background: transparent;
        border: 1px solid var(--color-neutral-border);
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .filter-btn:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
      .filter-btn.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }
      .view-btn.active {
        background: var(--color-background);
        color: var(--color-primary) !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
    </style>
  `;
}

export async function initHomePage() {
  try {
    allProducts = await localDb.getAllProducts();
    allBrands = await localDb.getAllBrands();
    const top5 = await localDb.getTop5Products();
    
    topProductsMap = {};
    top5.forEach((p, index) => {
      topProductsMap[p.id] = index + 1;
    });

    // Render Brand Filters
    const brandsContainer = document.getElementById('store-brands-filter');
    if (brandsContainer) {
      if (allBrands.length === 0) {
         brandsContainer.innerHTML += `<span style="font-size:13px; color:var(--color-text-muted);">No hay marcas registradas</span>`;
      } else {
         allBrands.forEach(b => {
           brandsContainer.innerHTML += `<button class="filter-btn" data-type="brand" data-value="${b.name}">${b.name}</button>`;
         });
      }
    }

    // Attach click events to filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update active class
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update current filter
        currentFilter.type = e.target.getAttribute('data-type');
        currentFilter.value = e.target.getAttribute('data-value');

        renderFilteredProducts();
      });
    });
    
    // View Toggle functionality
    const btnLarge = document.getElementById('btn-public-view-large');
    const btnCompact = document.getElementById('btn-public-view-compact');
    const grid = document.getElementById('store-products-grid');
    
    if (btnLarge && btnCompact && grid) {
      btnLarge.addEventListener('click', () => {
        grid.classList.remove('public-grid--compact');
        btnLarge.classList.add('active');
        btnCompact.classList.remove('active');
        localStorage.setItem('koala_store_view', 'large');
      });
      btnCompact.addEventListener('click', () => {
        grid.classList.add('public-grid--compact');
        btnCompact.classList.add('active');
        btnLarge.classList.remove('active');
        localStorage.setItem('koala_store_view', 'compact');
      });
      
      // Restore previous preference
      if (localStorage.getItem('koala_store_view') === 'compact') {
        btnCompact.click();
      }
    }

    // Initial Render
    renderFilteredProducts();

  } catch (e) {
    console.error('Error loading store', e);
  }
}

function renderFilteredProducts() {
  const container = document.getElementById('store-products-grid');
  if (!container) return;

  let filtered = allProducts;

  if (currentFilter.type !== 'all') {
    if (currentFilter.type === 'brand') {
      filtered = allProducts.filter(p => p.brand === currentFilter.value);
    } else if (currentFilter.type === 'department') {
      filtered = allProducts.filter(p => p.department === currentFilter.value);
    } else if (currentFilter.type === 'category') {
      filtered = allProducts.filter(p => p.category && p.category.startsWith(currentFilter.value));
    }
  }

  // Show all products except draft and hidden
  filtered = filtered.filter(p => p.status !== 'draft' && p.status !== 'hidden');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px; grid-column:1/-1;">
        <h3 style="color:var(--color-text-main); margin-bottom:8px;">No hay productos encontrados</h3>
        <p style="color:var(--color-text-secondary);">Intenta seleccionar otra categoría o marca.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(renderPublicProductCard).join('');
}

function renderPublicProductCard(product) {
  const brandHtml = product.brand ? `<div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:4px;">${product.brand}</div>` : '';
  
  // Show available sizes summary
  let sizesHtml = '';
  if (product.sizes && product.sizes.length > 0) {
    const displaySizes = product.sizes.slice(0, 5).join(' · ');
    const extra = product.sizes.length > 5 ? ` +${product.sizes.length - 5}` : '';
    sizesHtml = `<div style="font-size:11px; color:var(--color-text-muted); margin-top:6px;">Tallas: ${displaySizes}${extra}</div>`;
  }

  // Top 5 Badge
  let topBadgeHtml = '';
  if (topProductsMap[product.id]) {
    topBadgeHtml = `
      <div style="position:absolute; top:12px; left:12px; background:var(--color-primary); color:white; font-size:11px; font-weight:700; padding:4px 8px; border-radius:12px; box-shadow:0 2px 4px rgba(0,0,0,0.3); z-index:2; text-transform:uppercase;">
        🔥 TOP ${topProductsMap[product.id]}
      </div>
    `;
  }

  return `
    <a href="#/p/${product.id}" class="public-card animate-fade-in-up">
      <div class="public-card__image-wrap">
        ${topBadgeHtml}
        ${product.image.length < 10 ? `<div style="font-size:64px;">${product.image}</div>` : product.image}
        <div class="public-card__overlay">
          <div class="public-card__btn">Ver detalles</div>
        </div>
      </div>
      <div style="padding-top: 12px;">
        ${brandHtml}
        <h3 class="public-card__title">${product.name}</h3>
        <div class="public-card__category">${product.department || ''} ${product.category ? '• ' + product.category : ''}</div>
        <div class="public-card__price">${formatCurrency(product.price)}</div>
        ${sizesHtml}
      </div>
    </a>
  `;
}
