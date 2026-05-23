/* ============================================
   KOALA — Clientes Page
   Modern client directory with avatars and metrics
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency, formatRelativeTime } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';

let clientModalInitialized = false;

export function renderClientesPage() {
  clientModalInitialized = false;
  return `
    <div class="module-page">
      <!-- Header -->
      <div class="module-header">
        <div>
          <h1 class="module-header__title">Clientes</h1>
          <p class="module-header__subtitle">Directorio de clientes y métricas de comportamiento</p>
        </div>
        
        <div class="module-toolbar">
          <div class="search-input">
            ${icon('search', 18)}
            <input type="text" placeholder="Buscar por nombre, email o teléfono..." aria-label="Buscar clientes" />
          </div>
          <button class="btn btn--primary" id="btn-new-client">
            ${icon('plus', 16)}
            Nuevo Cliente
          </button>
        </div>
      </div>

      <!-- Clients Grid -->
      <div class="clients-grid stagger-children" id="clients-grid-container">
        ${Array(6).fill(0).map(() => `
          <div class="client-card skeleton-card animate-fade-in" style="height: 168px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-xl); background: var(--color-bg-surface); padding: var(--space-4); box-sizing: border-box;">
            <!-- Header skeleton -->
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div class="skeleton" style="width: 44px; height: 44px; border-radius: var(--radius-full); flex-shrink: 0;"></div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                <div class="skeleton" style="width: 120px; height: 14px;"></div>
                <div class="skeleton" style="width: 80px; height: 10px;"></div>
              </div>
              <div class="skeleton" style="width: 50px; height: 20px; border-radius: var(--radius-sm);"></div>
            </div>
            <!-- Stats skeleton -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); border-top: 1px solid var(--color-neutral-divider); padding-top: var(--space-3); margin-top: auto;">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div class="skeleton" style="width: 60px; height: 10px;"></div>
                <div class="skeleton" style="width: 40px; height: 14px;"></div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div class="skeleton" style="width: 45px; height: 10px;"></div>
                <div class="skeleton" style="width: 25px; height: 14px;"></div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div class="skeleton" style="width: 65px; height: 10px;"></div>
                <div class="skeleton" style="width: 50px; height: 14px;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Edit/New Client Modal -->
      <div class="modal-overlay" id="client-modal">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title" id="client-modal-title">Nuevo Cliente</h2>
            <button class="modal__close" id="close-client-modal">${icon('x', 24)}</button>
          </div>
          <form id="client-form">
            <input type="hidden" id="client-id" />
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Nombre</label>
                <input type="text" id="client-name" class="auth-input" style="width:100%" required />
              </div>
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Teléfono</label>
                <input type="tel" id="client-phone" class="auth-input" style="width:100%" placeholder="787-555-0000" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Email</label>
                <input type="email" id="client-email" class="auth-input" style="width:100%" placeholder="correo@ejemplo.com" />
              </div>
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Ciudad / Pueblo</label>
                <input type="text" id="client-city" class="auth-input" style="width:100%" placeholder="Ej. San Juan" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Estado</label>
                <select id="client-status" class="auth-input" style="width:100%">
                  <option value="new">Nuevo</option>
                  <option value="active">Activo</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div class="form-group">
                <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Nivel de Confianza</label>
                <select id="client-type" class="auth-input" style="width:100%">
                  <option value="standard">Estándar (Req. Depósito)</option>
                  <option value="trusted">Trusted (Flexible)</option>
                </select>
              </div>
            </div>
            <div class="modal__footer">
              <button type="button" class="btn btn--ghost" id="cancel-client-btn">Cancelar</button>
              <button type="submit" class="btn btn--primary">${icon('save', 16)} Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export async function initClientesPage() {
  const container = document.getElementById('clients-grid-container');
  if (!container) return;

  try {
    const clients = await localDb.getAllClients();
    
    if (clients.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-text-muted);">No hay clientes registrados aún.</div>`;
      return;
    }

    // Sort clients by last order
    clients.sort((a, b) => {
      const dateA = new Date(a.lastOrder).getTime();
      const dateB = new Date(b.lastOrder).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
      return 0; // fallback if it's mock dates
    });

    container.innerHTML = clients.map(renderClientCard).join('');

    // --- Action Menus ---
    const actionBtns = container.querySelectorAll('.action-menu-toggle');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.action-menu__dropdown').forEach(m => {
          if (m !== btn.nextElementSibling) m.classList.remove('active');
        });
        const dropdown = btn.nextElementSibling;
        dropdown.classList.toggle('active');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.action-menu__dropdown').forEach(m => m.classList.remove('active'));
    });

    // --- Modal Logic ---
    const modal = document.getElementById('client-modal');
    const closeBtn = document.getElementById('close-client-modal');
    const cancelBtn = document.getElementById('cancel-client-btn');
    const clientForm = document.getElementById('client-form');
    const btnNewClient = document.getElementById('btn-new-client');
    
    const closeModal = () => modal.classList.remove('active');

    // Only bind modal events once per page render
    if (!clientModalInitialized) {
      clientModalInitialized = true;
      closeBtn.addEventListener('click', closeModal);
      cancelBtn.addEventListener('click', closeModal);

      if (btnNewClient) {
        btnNewClient.addEventListener('click', () => {
          document.getElementById('client-modal-title').textContent = 'Nuevo Cliente';
          document.getElementById('client-id').value = '';
          document.getElementById('client-name').value = '';
          document.getElementById('client-email').value = '';
          document.getElementById('client-phone').value = '';
          document.getElementById('client-city').value = '';
          document.getElementById('client-status').value = 'new';
          document.getElementById('client-type').value = 'standard';
          modal.classList.add('active');
        });
      }

      // Save Client (New / Edit)
      clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = clientForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;

        try {
          btnSubmit.innerHTML = 'Guardando...';
          btnSubmit.disabled = true;

          const id = document.getElementById('client-id').value;
          const name = document.getElementById('client-name').value;
          const email = document.getElementById('client-email').value;
          const phone = document.getElementById('client-phone').value;
          const city = document.getElementById('client-city').value;
          const status = document.getElementById('client-status').value;
          const clientType = document.getElementById('client-type').value;

          let client;
          if (id) {
            client = clients.find(c => String(c.id) === String(id));
            if (!client) {
              alert('Error: Cliente no encontrado.');
              return;
            }
            client.name = name;
            client.email = email;
            client.phone = phone;
            client.city = city;
            client.status = status;
            client.clientType = clientType;
          } else {
            // New Client
            client = {
              id: 'C' + Math.floor(1000 + Math.random() * 9000).toString(),
              name,
              email,
              phone,
              city,
              status: 'new',
              clientType: 'standard',
              spent: 0,
              ordersCount: 0,
              lastOrder: new Date().toISOString()
            };
          }

          await localDb.saveClient(client);
          closeModal();
          initClientesPage();
        } catch (err) {
          console.error('Save client error:', err);
          alert('Error al guardar cliente: ' + err.message);
        } finally {
          btnSubmit.innerHTML = originalText;
          btnSubmit.disabled = false;
        }
      });
    }

    // Edit Actions
    const editBtns = container.querySelectorAll('.action-edit');
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const client = clients.find(c => String(c.id) === String(id));
        if (client) {
          document.getElementById('client-modal-title').textContent = 'Editar Cliente';
          document.getElementById('client-id').value = client.id;
          document.getElementById('client-name').value = client.name;
          document.getElementById('client-email').value = client.email || '';
          document.getElementById('client-phone').value = client.phone || '';
          document.getElementById('client-city').value = client.city || '';
          document.getElementById('client-status').value = client.status || 'active';
          document.getElementById('client-type').value = client.clientType || 'standard';
          modal.classList.add('active');
        }
      });
    });

    // Delete Actions
    const deleteBtns = container.querySelectorAll('.action-delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
          await localDb.deleteClient(id);
          initClientesPage(); // Refresh
        }
      });
    });

  } catch(e) {
    console.error('Error cargando clientes:', e);
    container.innerHTML = `<div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-error);">Error al cargar los clientes.</div>`;
  }
}

function renderClientCard(client) {
  const initials = client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const avatarClass = client.status === 'vip' ? 'client-card__avatar--vip' : '';
  
  const statusLabels = {
    'active': 'Activo',
    'vip': 'VIP',
    'new': 'Nuevo'
  };
  const statusLabel = statusLabels[client.status] || client.status;

  // Build contact info line
  const contactParts = [];
  if (client.phone) contactParts.push(`${icon('phone', 12)} ${client.phone}`);
  if (client.city) contactParts.push(`${icon('map-pin', 12)} ${client.city}`);
  const contactLine = contactParts.length > 0
    ? contactParts.join(' <span style="margin:0 6px; color:var(--color-neutral-divider);">|</span> ')
    : '';
    
  const typeBadge = client.clientType === 'trusted' 
    ? `<span style="font-size:10px; background:rgba(37,211,102,0.1); color:#25D366; padding:2px 6px; border-radius:12px; margin-left:8px; font-weight:700;">TRUSTED</span>`
    : '';

  return `
    <div class="client-card animate-fade-in-up">
      <!-- Header -->
      <div class="client-card__header">
        <div class="client-card__avatar ${avatarClass}">${initials}</div>
        <div class="client-card__info" style="flex:1;">
          <h3 class="client-card__name" style="display:flex; align-items:center;">${client.name} ${typeBadge}</h3>
          <div class="client-card__email">
            ${client.email ? `${icon('mail', 12)} ${client.email}` : `${icon('users', 12)} Sin email`}
          </div>
          ${contactLine ? `<div style="font-size:12px; color:var(--color-text-muted); margin-top:4px; display:flex; align-items:center; gap:4px;">${contactLine}</div>` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="status-badge status-badge--${client.status}">${statusLabel}</span>
          <div class="action-menu" style="position:relative;">
            <button class="btn-icon action-menu-toggle" aria-label="Opciones">${icon('settings', 16)}</button>
            <div class="action-menu__dropdown">
              <button class="action-menu__item action-edit" data-id="${client.id}">${icon('edit', 14)} Editar</button>
              <button class="action-menu__item action-delete" data-id="${client.id}" style="color:var(--color-error);">${icon('trash-2', 14)} Eliminar</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="client-card__stats">
        <div class="client-stat">
          <span class="client-stat__label">Total Gastado</span>
          <span class="client-stat__value">${formatCurrency(client.spent)}</span>
        </div>
        <div class="client-stat">
          <span class="client-stat__label">Órdenes</span>
          <span class="client-stat__value" style="font-size:16px; font-weight:600;">${client.ordersCount || 0}</span>
        </div>
        <div class="client-stat">
          <span class="client-stat__label">Última Compra</span>
          <span class="client-stat__value">${formatRelativeTime(client.lastOrder)}</span>
        </div>
      </div>
    </div>
  `;
}
