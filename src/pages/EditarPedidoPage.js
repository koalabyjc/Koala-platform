/* ============================================
   KOALA — Editar Pedido Page
   Admin view for modifying an existing order
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';

let currentOrder = null;
let inventory = [];

export function renderEditarPedidoPage(params) {
  return `
    <div class="page-header animate-fade-in-up">
      <div>
        <h2 class="page-title">Ajustar Pedido</h2>
        <p class="page-subtitle" id="edit-order-subtitle">Cargando detalles...</p>
      </div>
      <div class="page-actions">
        <a href="#/admin/ventas" class="btn btn--secondary">Cancelar</a>
        <button id="btn-save-order" class="btn btn--primary">
          ${icon('save', 16)} Guardar Cambios
        </button>
      </div>
    </div>

    <div class="card animate-fade-in-up" style="animation-delay: 0.1s; max-width: 900px; margin: 0 auto;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        
        <!-- COL 1: Current Order Items -->
        <div>
          <h3 style="font-size: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--color-neutral-divider); padding-bottom: 8px;">
            Artículos en la Orden
          </h3>
          <div id="order-items-list" style="min-height: 200px;">
            <p style="color:var(--color-text-muted);">Cargando...</p>
          </div>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-neutral-divider); display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
            <span>Total:</span>
            <span id="order-total-display">$0.00</span>
          </div>
        </div>

        <!-- COL 2: Add Inventory -->
        <div style="background: var(--color-bg-surface); padding: 16px; border-radius: var(--radius-md);">
          <h3 style="font-size: 16px; margin-bottom: 16px;">
            Añadir del Inventario
          </h3>
          <div class="search-input" style="margin-bottom: 16px; width: 100%;">
            ${icon('search', 16)}
            <input type="text" id="inventory-search" placeholder="Buscar producto..." style="width: 100%; border: none; background: transparent; padding: 8px; outline: none;" />
          </div>
          <div id="inventory-list" style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            <p style="color:var(--color-text-muted); text-align: center;">Cargando inventario...</p>
          </div>
        </div>

      </div>
    </div>
  `;
}

export async function initEditarPedidoPage(params) {
  const { id } = params;
  
  try {
    const orders = await localDb.getAllOrders();
    currentOrder = orders.find(o => o.id === id);
    inventory = await localDb.getAllProducts();

    if (!currentOrder) {
      document.getElementById('edit-order-subtitle').innerHTML = `<span style="color:var(--color-error)">Orden no encontrada</span>`;
      return;
    }

    // Ensure item structure exists
    if (!currentOrder.itemsList) {
      currentOrder.itemsList = [
        { id: 'mock1', name: 'Bolso Luna', qty: 1, price: 120.00 },
        { id: 'mock2', name: 'Cartera Mini', qty: 1, price: 45.00 }
      ].slice(0, currentOrder.items || 2);
    }

    document.getElementById('edit-order-subtitle').textContent = `Orden: ${currentOrder.id} • Cliente: ${currentOrder.customer}`;

    renderCurrentItems();
    renderInventory();

    // Search filter
    document.getElementById('inventory-search').addEventListener('input', (e) => {
      renderInventory(e.target.value.toLowerCase());
    });

    // Save
    document.getElementById('btn-save-order').addEventListener('click', async () => {
      // Recalculate summary fields
      currentOrder.total = currentOrder.itemsList.reduce((sum, item) => sum + (item.price * item.qty), 0);
      currentOrder.items = currentOrder.itemsList.reduce((sum, item) => sum + item.qty, 0);

      const btn = document.getElementById('btn-save-order');
      btn.innerHTML = `${icon('check', 16)} Guardado`;
      btn.style.background = 'var(--color-success)';

      await localDb.saveOrder(currentOrder);

      setTimeout(() => {
        window.location.hash = '/admin/ventas';
      }, 800);
    });

  } catch (err) {
    console.error(err);
  }
}

function renderCurrentItems() {
  const list = document.getElementById('order-items-list');
  const totalDisplay = document.getElementById('order-total-display');
  
  if (!currentOrder.itemsList || currentOrder.itemsList.length === 0) {
    list.innerHTML = `<p style="color:var(--color-text-muted); font-style: italic;">La orden está vacía.</p>`;
    totalDisplay.textContent = '$0.00';
    return;
  }

  let total = 0;
  list.innerHTML = currentOrder.itemsList.map((item, index) => {
    total += item.price * item.qty;
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--color-neutral-divider);">
        <div style="flex: 1;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">${formatCurrency(item.price)} cada uno</div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="number" value="${item.qty}" min="1" class="auth-input qty-input" data-index="${index}" style="width: 60px; padding: 4px; text-align: center;" />
          <div style="font-weight: 600; min-width: 70px; text-align: right;">${formatCurrency(item.price * item.qty)}</div>
          
          <!-- Ruedita Action Menu -->
          <div class="action-menu">
            <button class="btn btn--icon action-menu-toggle" aria-label="Opciones de artículo">
              ${icon('settings', 16)}
            </button>
            <div class="action-menu__dropdown">
              <button class="action-menu__item action-menu__item--danger remove-item-btn" data-index="${index}">
                ${icon('trash-2', 14)} Eliminar
              </button>
            </div>
          </div>
          
        </div>
      </div>
    `;
  }).join('');

  totalDisplay.textContent = formatCurrency(total);

  // Bind change events
  list.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const newQty = parseInt(e.target.value);
      if (newQty > 0) {
        currentOrder.itemsList[idx].qty = newQty;
        renderCurrentItems();
      }
    });
  });

  // Bind action menu toggles for order items
  list.querySelectorAll('.action-menu-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.action-menu__dropdown').forEach(m => {
        if (m !== btn.nextElementSibling) m.classList.remove('active');
      });
      btn.nextElementSibling.classList.toggle('active');
    });
  });

  list.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      currentOrder.itemsList.splice(idx, 1);
      renderCurrentItems(); // Updates total automatically
    });
  });
}

function renderInventory(filter = '') {
  const list = document.getElementById('inventory-list');
  
  const filtered = inventory.filter(p => p.name.toLowerCase().includes(filter));

  if (filtered.length === 0) {
    list.innerHTML = `<p style="color:var(--color-text-muted); text-align: center; padding: 16px;">No hay productos</p>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--color-bg-main); border-radius: var(--radius-md); border: 1px solid var(--color-neutral-border);">
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="width: 32px; height: 32px; border-radius: 4px; overflow: hidden; background: #eee; display:flex; align-items:center; justify-content:center; font-size:16px;">
          ${p.image}
        </div>
        <div>
          <div style="font-weight: 600; font-size: 14px;">${p.name}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">${formatCurrency(p.price)}</div>
        </div>
      </div>
      <button class="btn btn--outline add-to-order-btn" data-id="${p.id}" style="padding: 4px 8px;">
        ${icon('plus', 14)} Añadir
      </button>
    </div>
  `).join('');

  list.querySelectorAll('.add-to-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const product = inventory.find(p => String(p.id) === String(id));
      if (product) {
        // Check if already in order
        const existing = currentOrder.itemsList.find(i => i.id === product.id || i.name === product.name);
        if (existing) {
          existing.qty += 1;
        } else {
          currentOrder.itemsList.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1
          });
        }
        renderCurrentItems();
      }
    });
  });
}
