/* ============================================
   KOALA — Dashboard Page
   Main dashboard composition with all widgets
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { readyService } from '../utils/readyService.js';


export function renderDashboardPage() {
  return `
    <div class="dashboard-grid stagger-children">
      
      <!-- KPI Cards Row -->
      <div class="kpi-row" id="dashboard-kpis">
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--primary">${icon('dollar-sign', 24)}</div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Total Ingresos (Mes)</div>
            <div class="kpi-card__value" id="kpi-revenue">$0.00</div>
          </div>
        </div>
        <div class="kpi-card hover-lift" id="btn-receivables" style="border-left: 3px solid var(--color-error); cursor: pointer;" title="Haz clic para ver detalles">
          <div class="kpi-card__icon kpi-card__icon--primary" style="color: var(--color-error); background: rgba(239,68,68,0.1);">${icon('alert-circle', 24) || icon('clock', 24)}</div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Por Cobrar <span style="font-size:10px; opacity:0.6;">(Click para ver)</span></div>
            <div class="kpi-card__value" id="kpi-receivables">$0.00</div>
          </div>
        </div>
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--success">${icon('shopping-bag', 24)}</div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Pedidos Activos</div>
            <div class="kpi-card__value" id="kpi-orders">0</div>
          </div>
        </div>
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--accent">${icon('users', 24)}</div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Total Clientes</div>
            <div class="kpi-card__value" id="kpi-clients">0</div>
          </div>
        </div>
      </div>

      <!-- KOALA READY Overview -->
      <div class="ready-overview animate-fade-in-up" id="ready-overview-card" style="margin-bottom: 24px;">
        <div class="ready-overview__header">
          <div class="ready-overview__title">
            <span class="ready-overview__title-icon">⚡</span>
            KOALA READY
          </div>
          <span class="ready-overview__status ready-overview__status--inactive" id="ready-overview-status">Sin inventario</span>
        </div>
        <div class="ready-overview__stats">
          <div class="ready-overview__stat">
            <div class="ready-overview__stat-value" id="ready-stat-active">0</div>
            <div class="ready-overview__stat-label">Activos</div>
          </div>
          <div class="ready-overview__stat">
            <div class="ready-overview__stat-value" id="ready-stat-featured">OFF</div>
            <div class="ready-overview__stat-label">Anuncio</div>
          </div>
          <div class="ready-overview__stat">
            <div class="ready-overview__stat-value" id="ready-stat-sales">$0.00</div>
            <div class="ready-overview__stat-label">Ventas Sem.</div>
          </div>
          <div class="ready-overview__stat">
            <div class="ready-overview__stat-value" id="ready-stat-latest">—</div>
            <div class="ready-overview__stat-label">Último</div>
          </div>
        </div>
        <div class="ready-overview__actions">
          <button class="ready-overview__action-btn" onclick="window.location.hash='/admin/ready'">⚡ Gestionar READY</button>
          <button class="ready-overview__action-btn" onclick="window.location.hash='/ready'">👁 Ver Tienda</button>
        </div>
      </div>

      <!-- Main Content Row -->
      <div class="middle-row">
        <!-- Recent Orders -->
        <div class="card animate-fade-in-up" style="flex: 2; display: flex; flex-direction: column;">
          <div class="card__header" style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="card__title">
              <span class="card__title-icon">${icon('shopping-bag', 20)}</span>
              Pedidos Recientes
            </h2>
            <button class="btn btn--ghost" onclick="window.location.hash='/admin/ventas'" style="font-size: 12px; font-weight: 600; padding: 4px 8px;">Ver Todos</button>
          </div>
          <div style="flex: 1; overflow-x: auto; padding: 12px;">
            <table class="ready-table" style="width: 100%; border-collapse: collapse; min-width: 500px;">
              <thead>
                <tr>
                  <th style="font-size: 11px; padding: 8px 12px; background:var(--color-bg-main);">ID</th>
                  <th style="font-size: 11px; padding: 8px 12px; background:var(--color-bg-main);">Cliente</th>
                  <th style="font-size: 11px; padding: 8px 12px; background:var(--color-bg-main);">Total</th>
                  <th style="font-size: 11px; padding: 8px 12px; background:var(--color-bg-main);">Estado</th>
                  <th style="font-size: 11px; padding: 8px 12px; background:var(--color-bg-main); text-align: right;">Acciones</th>
                </tr>
              </thead>
              <tbody id="dashboard-recent-orders">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column: Top Products & Clients -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Top 5 Products -->
          <div class="card animate-fade-in-up">
            <div class="card__header" style="display:flex; justify-content:space-between; align-items:center;">
              <h2 class="card__title">Top 5 Productos</h2>
            </div>
            <div class="products-list" id="dashboard-top-products">
              ${Array(5).fill(0).map((_, index) => `
                <div class="product-rank skeleton-card animate-fade-in" style="height: 48px; display: flex; align-items: center; padding: 8px 12px; gap: 12px; border-bottom: 1px solid var(--color-neutral-divider); box-sizing: border-box;">
                  <span class="product-rank__num" style="width: 24px; color: var(--color-text-muted); font-weight: bold;">${index + 1}</span>
                  <div class="skeleton" style="width: 32px; height: 32px; border-radius: var(--radius-sm); flex-shrink: 0;"></div>
                  <div class="skeleton" style="width: 120px; height: 12px; flex: 1;"></div>
                  <div class="skeleton" style="width: 60px; height: 12px; flex-shrink: 0;"></div>
                </div>
              `).join('')}
            </div>
            <div style="padding: 12px; border-top: 1px solid var(--color-neutral-divider); text-align: center;">
              <button class="btn btn--ghost" id="btn-edit-top-products" style="width: 100%; font-size: 13px; font-weight: 600; gap: 8px;">
                ${icon('edit-2', 16) || icon('edit', 16)} Administrar Top 5 Manualmente
              </button>
            </div>
          </div>

          <!-- Top Clients -->
          <div class="card animate-fade-in-up">
            <div class="card__header">
              <h2 class="card__title">Clientes Destacados</h2>
            </div>
            <div class="products-list" id="dashboard-top-clients">
              ${Array(5).fill(0).map((_, index) => `
                <div class="product-rank skeleton-card animate-fade-in" style="height: 48px; display: flex; align-items: center; padding: 8px 12px; gap: 12px; border-bottom: 1px solid var(--color-neutral-divider); box-sizing: border-box;">
                  <span class="product-rank__num" style="width: 24px; color: var(--color-text-muted); font-weight: bold;">${index + 1}</span>
                  <div class="skeleton" style="width: 32px; height: 32px; border-radius: var(--radius-full); flex-shrink: 0;"></div>
                  <div class="skeleton" style="width: 120px; height: 12px; flex: 1;"></div>
                  <div class="skeleton" style="width: 60px; height: 12px; flex-shrink: 0;"></div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
      
      <!-- Quick View Modal for Dashboard -->
      <div class="modal-overlay" id="dashboard-product-modal">
        <div class="modal" style="max-width: 520px; padding: 0; overflow: hidden; border-radius: 16px;">
          
          <!-- Back button header -->
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 16px 20px; border-bottom: 1px solid var(--color-neutral-divider);">
            <button class="btn btn--ghost" style="gap:6px; font-size:13px;" id="close-dash-modal">
              ${icon('arrow-left', 16)} Volver al Dashboard
            </button>
            <span style="font-size:11px; font-weight:700; color:var(--color-primary); text-transform:uppercase;" id="dash-modal-rank-badge">🔥 TOP 1</span>
          </div>

          <!-- Product Image -->
          <div style="height: 280px; background: var(--color-bg-subtle); display:flex; align-items:center; justify-content:center; overflow:hidden;" id="dash-modal-img-container">
            <div id="dash-modal-img" style="font-size: 80px; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">🛍️</div>
          </div>

          <!-- Product Info -->
          <div style="padding: 24px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); letter-spacing:1px; margin-bottom: 6px;" id="dash-modal-brand">KOALA</div>
            <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px;" id="dash-modal-name">Producto</h2>
            <div style="font-size: 22px; font-weight: 700; color: var(--color-primary); margin-bottom: 20px;" id="dash-modal-price">$0.00</div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
              <div style="background:var(--color-bg-subtle); border-radius:10px; padding:12px;">
                <div style="font-size:10px; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:4px;">Departamento</div>
                <div style="font-size:14px; font-weight:600;" id="dash-modal-dept">-</div>
              </div>
              <div style="background:var(--color-bg-subtle); border-radius:10px; padding:12px;">
                <div style="font-size:10px; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:4px;">Categoría</div>
                <div style="font-size:14px; font-weight:600;" id="dash-modal-cat">-</div>
              </div>
            </div>

            <div style="margin-bottom: 20px;" id="dash-modal-sizes-section">
              <div style="font-size:10px; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:8px;">Tallas Disponibles</div>
              <div id="dash-modal-sizes" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
            </div>
            
            <div style="display:flex; gap: 8px;">
              <button class="btn btn--secondary" style="flex:1; height:44px; font-size:13px; font-weight:600;" id="btn-pin-top-dash">
                ${icon('star', 16)} Fijar en Top 5
              </button>
              <button class="btn btn--primary" style="flex:1; height:44px; font-size:13px; font-weight:600;" id="btn-edit-from-dash">
                ${icon('edit', 16)} Ir a Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Receivables Modal -->
      <div class="modal-overlay" id="receivables-modal">
        <div class="modal" style="max-width: 600px; padding: 0; border-radius: 16px; overflow: hidden; max-height: 85vh; display: flex; flex-direction: column;">
          <div style="display:flex; align-items:center; justify-content:space-between; padding: 20px; border-bottom: 1px solid var(--color-neutral-divider); background: var(--color-bg-surface);">
            <div>
              <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">Cuentas Por Cobrar</h2>
              <p style="font-size: 12px; color: var(--color-text-muted);">Clientes con balance pendiente</p>
            </div>
            <button class="btn btn--icon" id="close-receivables-modal">${icon('x', 24)}</button>
          </div>
          <div style="padding: 0; overflow-y: auto; flex: 1; background: var(--color-bg-main);" id="receivables-list">
             <!-- Dynamic list goes here -->
          </div>
          <div style="padding: 16px 20px; background: var(--color-bg-surface); border-top: 1px solid var(--color-neutral-divider); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 14px;">Total Por Cobrar:</span>
            <span style="font-weight: 700; font-size: 18px; color: var(--color-error);" id="receivables-modal-total">$0.00</span>
          </div>
        </div>
      </div>

      <!-- Edit Top Products Modal -->
      <div class="modal-overlay" id="edit-top-modal">
        <div class="modal" style="max-width: 450px; padding: 24px; border-radius: 16px;">
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Editar Top 5</h2>
          <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 16px;">Selecciona hasta 5 productos para destacar en tu dashboard. Si dejas la lista vacía, se calcularán automáticamente.</p>
          
          <div style="margin-bottom: 16px;">
            <select id="top-product-select" class="auth-input" style="width: 100%; margin-bottom: 12px; font-size:13px; height: 44px;">
              <option value="">-- Buscar producto para agregar --</option>
            </select>
            <button class="btn btn--secondary" id="btn-add-top-product" style="width:100%; height: 40px; font-size:13px;">${icon('plus', 16)} Añadir a la lista</button>
          </div>
          
          <div id="selected-top-products" style="display:flex; flex-direction:column; gap:8px; margin-bottom: 24px; min-height: 120px; background: var(--color-bg-subtle); padding: 12px; border-radius: 8px;">
             <!-- Selected products go here -->
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button class="btn btn--ghost" id="close-edit-top-modal" style="flex:1;">Cancelar</button>
            <button class="btn btn--primary" id="save-edit-top-modal" style="flex:1;">Guardar Cambios</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export async function initDashboard() {
  try {
    const orders = await localDb.getAllOrders();
    const clients = await localDb.getAllClients();
    
    // Valid orders
    const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.totalPaid || 0), 0);
    const totalReceivables = validOrders.reduce((sum, o) => sum + (o.pendingBalance !== undefined ? o.pendingBalance : (o.total || 0)), 0);

    // Update KPIs
    document.getElementById('kpi-revenue').textContent = formatCurrency(totalRevenue);
    if(document.getElementById('kpi-receivables')) {
      document.getElementById('kpi-receivables').textContent = formatCurrency(totalReceivables);
    }
    document.getElementById('kpi-orders').textContent = validOrders.length;
    document.getElementById('kpi-clients').textContent = clients.length;

    // Setup Dash Modal Logic
    const dashModal = document.getElementById('dashboard-product-modal');
    const closeDashModal = document.getElementById('close-dash-modal');
    const editBtn = document.getElementById('btn-edit-from-dash');
    
    if(closeDashModal) closeDashModal.addEventListener('click', () => dashModal.classList.remove('active'));
    if(dashModal) {
      dashModal.addEventListener('click', (e) => {
        if (e.target === dashModal) dashModal.classList.remove('active');
      });
    }

    // Setup Receivables Modal Logic
    const receivablesModal = document.getElementById('receivables-modal');
    const closeRecModal = document.getElementById('close-receivables-modal');
    const btnReceivables = document.getElementById('btn-receivables');

    if (btnReceivables && receivablesModal) {
      btnReceivables.addEventListener('click', () => {
        const pendingOrders = validOrders.filter(o => (o.pendingBalance !== undefined ? o.pendingBalance : (o.total || 0)) > 0);
        const customersPending = {};
        
        pendingOrders.forEach(o => {
           const cName = o.customer || 'Cliente Desconocido';
           if (!customersPending[cName]) {
             customersPending[cName] = { name: cName, phone: o.customerPhone, email: o.customerEmail, balance: 0, orders: [] };
           }
           const bal = o.pendingBalance !== undefined ? o.pendingBalance : (o.total || 0);
           customersPending[cName].balance += bal;
           customersPending[cName].orders.push({ id: o.id, date: o.date, balance: bal });
        });

        const listHtml = Object.values(customersPending).sort((a,b) => b.balance - a.balance).map(c => {
           return `
             <div style="padding: 16px 20px; border-bottom: 1px solid var(--color-neutral-divider); background: var(--color-bg-surface); margin-bottom: 4px;">
               <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                 <div>
                   <div style="font-weight: 700; font-size: 15px;">${c.name}</div>
                   <div style="font-size: 12px; color: var(--color-text-muted); display:flex; gap: 8px; margin-top: 4px;">
                     ${c.phone ? `<span>${icon('phone', 12)} ${c.phone}</span>` : ''}
                   </div>
                 </div>
                 <div style="font-weight: 700; color: var(--color-error); font-size: 16px;">
                   ${formatCurrency(c.balance)}
                 </div>
               </div>
               <div style="background: var(--color-bg-main); border-radius: 8px; padding: 12px;">
                 <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 8px;">Facturas Pendientes:</div>
                 ${c.orders.map(o => `
                   <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 13px;">
                     <div>
                        <a href="#/admin/ventas?id=${o.id}" style="color: var(--color-primary); font-weight: 600; text-decoration: none;">#${o.id}</a>
                        <span style="color: var(--color-text-muted); font-size: 11px; margin-left: 8px;">${new Date(o.date).toLocaleDateString()}</span>
                     </div>
                     <span style="font-weight: 600;">${formatCurrency(o.balance)}</span>
                   </div>
                 `).join('')}
               </div>
             </div>
           `;
        }).join('');

        document.getElementById('receivables-list').innerHTML = listHtml || `<div style="padding: 40px; text-align: center; color: var(--color-text-muted);">No hay cuentas por cobrar. ¡Todo está al día! 🎉</div>`;
        document.getElementById('receivables-modal-total').textContent = formatCurrency(totalReceivables);
        
        receivablesModal.classList.add('active');
      });

      if(closeRecModal) closeRecModal.addEventListener('click', () => receivablesModal.classList.remove('active'));
      receivablesModal.addEventListener('click', (e) => {
        if (e.target === receivablesModal) receivablesModal.classList.remove('active');
      });
    }

    // Make products available in scope for click handlers
    const products = await localDb.getAllProducts();
    const topProductsList = await localDb.getTop5Products();

    // Setup Edit Top 5 Logic
    const editTopModal = document.getElementById('edit-top-modal');
    const btnEditTop = document.getElementById('btn-edit-top-products');
    const closeEditTop = document.getElementById('close-edit-top-modal');
    const saveEditTop = document.getElementById('save-edit-top-modal');
    const selectTopProduct = document.getElementById('top-product-select');
    const btnAddTop = document.getElementById('btn-add-top-product');
    const selectedTopContainer = document.getElementById('selected-top-products');

    if (btnEditTop && editTopModal) {
      let currentManualTopIds = [];
      try {
        const stored = JSON.parse(localStorage.getItem('koala_top_products'));
        if (Array.isArray(stored)) currentManualTopIds = stored;
      } catch(e) {}

      // Populate select options
      const activeProducts = products.filter(p => p.status !== 'draft');
      selectTopProduct.innerHTML = '<option value="">-- Buscar producto para agregar --</option>' + 
        activeProducts.map(p => `<option value="${p.id}">${p.name} (${p.brand || 'KOALA'}) - ${formatCurrency(p.price || 0)}</option>`).join('');

      const renderSelectedTop = () => {
        if (currentManualTopIds.length === 0) {
          selectedTopContainer.innerHTML = '<div style="text-align:center; color:var(--color-text-muted); font-size:12px; padding:20px;">No hay productos seleccionados. Usa el selector para añadir.</div>';
        } else {
          selectedTopContainer.innerHTML = currentManualTopIds.map((id, idx) => {
            const p = products.find(prod => prod.id === id);
            if(!p) return '';
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-surface); padding:8px 12px; border-radius:6px; font-size:13px; border:1px solid var(--color-neutral-border);">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 12px;"><strong style="color:var(--color-primary);">${idx+1}.</strong> ${p.name}</span>
                <button class="btn btn--icon remove-top-btn" data-id="${id}" style="width:24px;height:24px;color:var(--color-error);flex-shrink:0;">${icon('trash-2', 14)}</button>
              </div>
            `;
          }).join('');
          
          selectedTopContainer.querySelectorAll('.remove-top-btn').forEach(btn => {
            btn.onclick = () => {
              const idToRemove = btn.getAttribute('data-id');
              currentManualTopIds = currentManualTopIds.filter(id => id !== idToRemove);
              renderSelectedTop();
            };
          });
        }
      };

      btnEditTop.addEventListener('click', () => {
        renderSelectedTop();
        editTopModal.classList.add('active');
      });

      closeEditTop.addEventListener('click', () => editTopModal.classList.remove('active'));
      
      btnAddTop.addEventListener('click', () => {
        const selectedId = selectTopProduct.value;
        if (!selectedId) return;
        if (currentManualTopIds.includes(selectedId)) {
          alert('Este producto ya está en la lista de destacados.');
          return;
        }
        if (currentManualTopIds.length >= 5) {
          alert('Solo puedes destacar un máximo de 5 productos.');
          return;
        }
        currentManualTopIds.push(selectedId);
        selectTopProduct.value = '';
        renderSelectedTop();
      });

      saveEditTop.addEventListener('click', async () => {
        await localDb.saveTop5Products(currentManualTopIds);
        editTopModal.classList.remove('active');
        // Reload to reflect changes instantly on dashboard
        window.location.reload();
      });
    }
    
    // Calculate Top Products Html
    const topProductsHtml = topProductsList.map((p, index) => {
      // Determine if image is base64/url or just an emoji
      let imgHtml = '';
      if (p.image && p.image.length > 10) {
        if (p.image.startsWith('data:') || p.image.startsWith('http')) {
          imgHtml = `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;" />`;
        } else {
          imgHtml = p.image;
        }
      } else {
        imgHtml = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;">${p.image || '🛍️'}</div>`;
      }

      return `
        <div class="product-rank dash-top-product" data-id="${p.id}" data-rank="${index + 1}" style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--color-surface-hover)'" onmouseout="this.style.background='transparent'">
          <span class="product-rank__num">${index + 1} 🔥</span>
          <div class="product-rank__img" style="background: rgba(198,162,122,0.1)">
            ${imgHtml}
          </div>
          <span class="product-rank__name" style="flex:1;">${p.name}</span>
          <span class="product-rank__revenue" style="font-size:12px; font-weight:600;">${p.brand || 'KOALA'}</span>
        </div>
      `;
    });

    const topProductsContainer = document.getElementById('dashboard-top-products');
    topProductsContainer.innerHTML = topProductsHtml.length ? topProductsHtml.join('') : '<div style="padding:20px; text-align:center; color:var(--color-text-muted);">No hay productos</div>';

    // Bind click events properly without inline onclick
    topProductsContainer.querySelectorAll('.dash-top-product').forEach(el => {
      el.addEventListener('click', () => {
        const productId = el.getAttribute('data-id');
        const productIndex = parseInt(el.getAttribute('data-rank'));
        const p = products.find(prod => prod.id === productId);
        if (!p) return;
        
        // Rank Badge
        document.getElementById('dash-modal-rank-badge').textContent = `🔥 TOP ${productIndex}`;

        // Image — handle all types consistently
        const imgContainer = document.getElementById('dash-modal-img');
        if (p.image && (p.image.startsWith('data:') || p.image.startsWith('http'))) {
          imgContainer.innerHTML = `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;" />`;
        } else if (p.image && p.image.length > 10) {
          // SVG or other long string
          imgContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:80px;">${p.image}</div>`;
        } else {
          imgContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:80px;">${p.image || '🛍️'}</div>`;
        }
        
        // Text fields
        document.getElementById('dash-modal-name').textContent = p.name || 'Sin nombre';
        document.getElementById('dash-modal-brand').textContent = p.brand || 'KOALA';
        document.getElementById('dash-modal-price').textContent = formatCurrency(p.price || 0);
        document.getElementById('dash-modal-dept').textContent = p.department || 'General';
        document.getElementById('dash-modal-cat').textContent = p.category || 'General';
        
        // Sizes
        const sizesContainer = document.getElementById('dash-modal-sizes');
        const sizesSection = document.getElementById('dash-modal-sizes-section');
        if (p.sizes && p.sizes.length > 0) {
          sizesSection.style.display = 'block';
          sizesContainer.innerHTML = p.sizes.map(s => 
            `<span style="display:inline-block; padding:4px 12px; border:1px solid var(--color-neutral-border); border-radius:6px; font-size:12px; font-weight:600;">${s}</span>`
          ).join('');
        } else {
          sizesSection.style.display = 'none';
        }
        
        // Edit button
        editBtn.onclick = () => {
          dashModal.classList.remove('active');
          window.location.hash = '/admin/productos';
        };

        // Pin to Top 5 logic
        const btnPinTop = document.getElementById('btn-pin-top-dash');
        if(btnPinTop) {
          btnPinTop.onclick = async () => {
            let manualIds = [];
            try {
              const stored = JSON.parse(localStorage.getItem('koala_top_products'));
              if(Array.isArray(stored)) manualIds = stored;
            } catch(e) {}
            
            if(manualIds.includes(productId)) {
              alert('Este producto ya está fijado en el Top 5.');
            } else {
              manualIds.unshift(productId); // Add to beginning
              if(manualIds.length > 5) manualIds = manualIds.slice(0, 5); // Keep only 5
              await localDb.saveTop5Products(manualIds);
              alert('¡Producto fijado al Top 5 exitosamente!');
              dashModal.classList.remove('active');
              window.location.reload();
            }
          };
        }

        dashModal.classList.add('active');
      });
    });

    // Calculate Top Clients (Sorted by spent)
    const topClients = [...clients].sort((a, b) => b.spent - a.spent).slice(0, 5).map((c, index) => {
      const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `
        <div class="product-rank" style="align-items:center;">
          <span class="product-rank__num">${index + 1}</span>
          <div style="width:32px;height:32px;border-radius:50%;background:var(--color-surface-hover);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:12px;">
            ${initials}
          </div>
          <span class="product-rank__name" style="flex:1;">${c.name}</span>
          <span class="product-rank__revenue" style="color:var(--color-primary); font-weight:600;">${formatCurrency(c.spent)}</span>
        </div>
      `;
    });

    document.getElementById('dashboard-top-clients').innerHTML = topClients.length ? topClients.join('') : '<div style="padding:20px; text-align:center; color:var(--color-text-muted);">No hay clientes</div>';

    // Populate Recent Orders
    const recentOrders = orders.slice(0, 5);
    const recentOrdersContainer = document.getElementById('dashboard-recent-orders');
    if (recentOrdersContainer) {
      if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 32px; color: var(--color-text-muted);">
              No hay pedidos registrados
            </td>
          </tr>
        `;
      } else {
        recentOrdersContainer.innerHTML = recentOrders.map(order => {
          let statusClass = 'status-badge--pending';
          let statusText = 'Pendiente';
          
          if (order.status === 'delivered') { statusClass = 'status-badge--delivered'; statusText = 'Entregado'; }
          else if (order.status === 'processing') { statusClass = 'status-badge--processing'; statusText = 'En proceso'; }
          else if (order.status === 'shipped') { statusClass = 'status-badge--shipped'; statusText = 'Enviado'; }
          else if (order.status === 'cancelled') { statusClass = 'status-badge--cancelled'; statusText = 'Cancelado'; }

          return `
            <tr>
              <td style="padding: 10px 12px; font-weight: 700;">
                <a href="#/admin/ventas?id=${order.id}" style="color: var(--color-primary); text-decoration: none;">#${order.id}</a>
              </td>
              <td style="padding: 10px 12px; font-weight: 600;">${order.customer || 'Cliente'}</td>
              <td style="padding: 10px 12px; font-weight: 700; color: var(--color-primary);">${formatCurrency(order.total)}</td>
              <td style="padding: 10px 12px;">
                <span class="status-badge ${statusClass}" style="padding: 2px 8px; font-size: 11px;">${statusText}</span>
              </td>
              <td style="padding: 10px 12px; text-align: right;">
                <button class="ready-action-btn" onclick="window.location.hash='/admin/ventas/editar/${order.id}'" style="padding: 2px 8px; font-size: 11px;">Gestionar</button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // ── KOALA READY Overview Init ──
    try {
      const readyProducts = await localDb.getAllReadyProductsAdmin();
      const activeReady = readyProducts.filter(p => p.readyStatus === 'active');
      const readyCount = activeReady.length;
      const readySales = await localDb.getReadySalesThisWeek();
      const announcement = localDb.getActiveAnnouncement();
      
      document.getElementById('ready-stat-active').textContent = readyCount;
      document.getElementById('ready-stat-sales').textContent = formatCurrency(readySales);
      
      const statusEl = document.getElementById('ready-overview-status');
      if (readyCount > 0) {
        statusEl.textContent = 'Activo';
        statusEl.className = 'ready-overview__status ready-overview__status--active';
      } else {
        statusEl.textContent = 'Sin inventario';
        statusEl.className = 'ready-overview__status ready-overview__status--inactive';
      }
      
      if (announcement && announcement.active) {
        document.getElementById('ready-stat-featured').textContent = 'ON';
      } else {
        document.getElementById('ready-stat-featured').textContent = 'OFF';
      }
      
      if (readyProducts.length > 0) {
        const latest = readyProducts[0]; // ordered by id descending
        document.getElementById('ready-stat-latest').textContent = (latest.brand || latest.name || '—').substring(0, 12);
      } else {
        document.getElementById('ready-stat-latest').textContent = '—';
      }
    } catch(e) { console.warn('Ready overview load error:', e); }

  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}
