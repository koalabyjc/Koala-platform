/* ============================================
   KOALA — Dashboard Page
   Main dashboard composition with all widgets
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let dashboardChart = null;

export function renderDashboardPage() {
  return `
    <div class="dashboard-grid stagger-children">
      
      <!-- KPI Cards Row -->
      <div class="kpi-row" id="dashboard-kpis">
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--primary">${icon('dollar-sign', 24)}</div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Ingresos del Mes</div>
            <div class="kpi-card__value" id="kpi-revenue">$0.00</div>
          </div>
        </div>
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--success">${icon('shopping-bag', 24)}</div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Pedidos del Mes</div>
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

      <!-- Main Content Row -->
      <div class="middle-row">
        <!-- Sales Chart -->
        <div class="card animate-fade-in-up" style="flex: 2;">
          <div class="card__header">
            <h2 class="card__title" id="dashboard-chart-title">
              <span class="card__title-icon">${icon('bar-chart-2', 20)}</span>
              Rendimiento de Ventas
            </h2>
            <select id="dashboard-period-select" class="auth-input" style="min-width: 150px; padding: 4px 8px; font-size: 12px; height: 32px;">
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual" selected>Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div class="chart-container" style="height: 300px; padding: 20px;">
            <canvas id="dashboardChart"></canvas>
          </div>
        </div>

        <!-- Right Column: Top Products & Clients -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Top 5 Products -->
          <div class="card animate-fade-in-up">
            <div class="card__header">
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
            
            <button class="btn btn--primary" style="width: 100%; height:44px; font-size:14px;" id="btn-edit-from-dash">
              ${icon('edit', 16)} Ir a Editar Producto
            </button>
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
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

    // Update KPIs
    document.getElementById('kpi-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('kpi-orders').textContent = validOrders.length;
    document.getElementById('kpi-clients').textContent = clients.length;

    // Setup Modal Logic
    const dashModal = document.getElementById('dashboard-product-modal');
    const closeDashModal = document.getElementById('close-dash-modal');
    const editBtn = document.getElementById('btn-edit-from-dash');
    
    closeDashModal.addEventListener('click', () => dashModal.classList.remove('active'));
    dashModal.addEventListener('click', (e) => {
      if (e.target === dashModal) dashModal.classList.remove('active');
    });

    // Make products available in scope for click handlers
    const products = await localDb.getAllProducts();
    const topProductsList = await localDb.getTop5Products();
    
    // Calculate Top Products
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

    // Init Chart
    const chartData = {
      diario: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [50, 120, 80, 200, 250, 400, 150],
        title: 'Ventas Diarias (Esta Semana)'
      },
      semanal: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        data: [350, 450, 300, 600],
        title: 'Ventas Semanales (Este Mes)'
      },
      mensual: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [150, 200, 100, 350, 450, 300],
        title: 'Ventas Mensuales (Últimos 6 meses)'
      },
      anual: {
        labels: ['2023', '2024', '2025', '2026'],
        data: [250, 400, 600, 850],
        title: 'Ventas Anuales (Histórico)'
      }
    };

    const ctx = document.getElementById('dashboardChart');
    const titleEl = document.getElementById('dashboard-chart-title');
    const selectEl = document.getElementById('dashboard-period-select');

    function renderChart(period) {
      if (dashboardChart) dashboardChart.destroy();
      
      const { labels, data, title } = chartData[period];
      titleEl.innerHTML = `<span class="card__title-icon">${icon('bar-chart-2', 20)}</span> ${title}`;

      // Gradient for bars
      const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, '#2B221C');
      gradient.addColorStop(1, '#8B7355');

      dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventas Totales',
            data: data,
            backgroundColor: gradient,
            borderRadius: 6,
            barThickness: 'flex',
            maxBarThickness: 50
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#2A211B',
              titleFont: { family: 'Inter', size: 13, weight: '600' },
              bodyFont: { family: 'Inter', size: 14, weight: '700' },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return formatCurrency(context.parsed.y);
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Inter' } },
              border: { display: false }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              border: { display: false },
              ticks: {
                font: { family: 'Inter' },
                stepSize: 50,
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          }
        }
      });
    }

    // Initial render
    renderChart('mensual');

    // Handle select changes
    selectEl.addEventListener('change', (e) => {
      renderChart(e.target.value);
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}
