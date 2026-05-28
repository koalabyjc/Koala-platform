/* ============================================
   KOALA — Ventas (Pedidos) Page
   Visual order pipeline management
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency, formatRelativeTime } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { emailService } from '../utils/emailService.js';
import { smsService } from '../utils/smsService.js';
import { webhookService } from '../utils/webhookService.js';
import { generateWhatsAppSummary, updateOrderFinancials } from '../utils/orderLogic.js';

let ventasModalInitialized = false;

export function renderVentasPage() {
  ventasModalInitialized = false;
  return `
    <div class="module-page">
      <!-- Header -->
      <div class="module-header">
        <div>
          <h1 class="module-header__title">Pedidos</h1>
          <p class="module-header__subtitle">Visualiza y gestiona las órdenes de tus clientes</p>
        </div>
        
        <div class="module-toolbar">
          <div class="search-input">
            ${icon('search', 18)}
            <input type="text" placeholder="Buscar por cliente o número de orden..." aria-label="Buscar pedidos" />
          </div>
          <button class="btn btn--outline" id="btn-filter-ventas">
            ${icon('filter', 16) || icon('menu', 16)} 
            Filtrar
          </button>
        </div>
      </div>

      <!-- Orders List -->
      <div class="orders-list stagger-children" id="orders-list-container" style="display: flex; flex-direction: column; gap: 12px;">
        ${Array(5).fill(0).map(() => `
          <div class="order-item skeleton-card animate-fade-in" style="height: 78px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--color-neutral-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); padding: var(--space-4); box-sizing: border-box;">
            <div class="skeleton" style="width: 80px; height: 16px; flex-shrink: 0;"></div>
            <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
              <div class="skeleton" style="width: 32px; height: 32px; border-radius: var(--radius-full); flex-shrink: 0;"></div>
              <div class="skeleton" style="width: 140px; height: 16px;"></div>
            </div>
            <div style="width: 100px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
              <div class="skeleton" style="width: 40px; height: 10px;"></div>
              <div class="skeleton" style="width: 60px; height: 12px;"></div>
            </div>
            <div class="skeleton" style="width: 130px; height: 26px; border-radius: var(--radius-sm); flex-shrink: 0;"></div>
            <div class="skeleton" style="width: 80px; height: 18px; flex-shrink: 0;"></div>
            <div class="skeleton" style="width: 32px; height: 32px; border-radius: var(--radius-full); margin-left: auto; flex-shrink: 0;"></div>
          </div>
        `).join('')}
      </div>

      <!-- Edit Order Modal -->
      <div class="modal-overlay" id="edit-order-modal">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">Editar Pedido</h2>
            <button class="modal__close" id="close-edit-order-modal">${icon('x', 24)}</button>
          </div>
          <form id="edit-order-form" style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden;">
            <input type="hidden" id="edit-order-id" />
            <div class="modal__body">
              <div class="modal-form-grid">
                <div class="form-group">
                  <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Cliente</label>
                  <input type="text" id="edit-order-customer" class="auth-input" style="width:100%" required />
                </div>
                <div class="form-group">
                  <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Estado del Pedido</label>
                  <select id="edit-order-status" class="auth-input" style="width:100%">
                    <option value="pending">Pendiente depósito</option>
                    <option value="partial">Pago parcial</option>
                    <option value="processing">Orden procesada</option>
                    <option value="transit">En tránsito</option>
                    <option value="ready">Lista para entrega</option>
                    <option value="balance">Balance pendiente</option>
                    <option value="delivered">Completada</option>
                    <option value="overdue">Vencida</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>
              <div class="modal-form-grid">
                <div class="form-group">
                  <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Método de Pago</label>
                  <select id="edit-order-payment" class="auth-input" style="width:100%">
                    <option value="ATH Móvil">ATH Móvil</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Cash">Efectivo</option>
                    <option value="Walmart">Walmart to Walmart</option>
                  </select>
                </div>
                <div class="form-group">
                  <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Total ($)</label>
                  <input type="number" id="edit-order-total" class="auth-input" style="width:100%" step="0.01" min="0" />
                </div>
              </div>
              <div class="modal-form-grid">
                <div class="form-group">
                  <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600;">Fecha Límite</label>
                  <input type="date" id="edit-order-duedate" class="auth-input" style="width:100%" />
                </div>
                <div class="form-group"></div>
              </div>
              <div style="margin-bottom: 16px; padding: 12px; background: var(--color-bg-surface); border-radius: 8px; display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <span style="font-size: 12px; font-weight: 600; color: var(--color-text-secondary);">Artículos del pedido</span>
                  <span id="edit-order-items-count" style="font-size: 12px; color: var(--color-text-muted); margin-left: 8px;"></span>
                </div>
                <button type="button" class="btn btn--outline" id="edit-order-items-btn" style="padding: 4px 12px; font-size: 12px;">
                  ${icon('edit-2', 14) || icon('edit', 14)} Editar Artículos
                </button>
              </div>
            </div>
            <div class="modal__footer">
              <button type="button" class="btn btn--ghost" id="cancel-edit-order-btn">Cancelar</button>
              <button type="submit" class="btn btn--primary">${icon('save', 16)} Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- View Order Details Modal -->
      <div class="modal-overlay" id="view-order-modal">
        <div class="modal modal--order-view">
          <div class="modal__header">
            <h2 class="modal__title">Detalles del Pedido</h2>
            <button class="modal__close" id="close-view-order-modal">${icon('x', 24)}</button>
          </div>
          <div class="modal__body" id="view-order-content">
            <!-- Order details injected here -->
          </div>
          <div class="modal__footer--invoice">
            <button type="button" class="btn btn--outline btn--whatsapp" id="copy-whatsapp-btn">
              ${icon('message-circle', 16)} Resumen WhatsApp
            </button>
            <div class="modal__footer-actions">
              <button type="button" class="btn btn--outline" id="adjust-order-btn">
                ${icon('edit-2', 16) || icon('edit', 16)} Ajustar
              </button>
              <button type="button" class="btn btn--primary" id="done-view-order-btn">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

export async function initVentasPage() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  try {
    const orders = await localDb.getAllOrders();
    const products = await localDb.getAllProducts();
    
    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-text-muted);">No hay pedidos registrados.</div>`;
      return;
    }
    
    // Sort orders by date descending
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = orders.map(renderOrderItem).join('');

    // Bind action menu toggles
    const actionBtns = container.querySelectorAll('.action-menu-toggle');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close all other dropdowns
        document.querySelectorAll('.action-menu__dropdown').forEach(m => {
          if (m !== btn.nextElementSibling) m.classList.remove('active');
        });
        
        const dropdown = btn.nextElementSibling;
        dropdown.classList.toggle('active');
      });
    });

    // Close menus when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.action-menu__dropdown').forEach(m => m.classList.remove('active'));
    });

    // Delete actions
    const deleteBtns = container.querySelectorAll('.action-delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Estás seguro de que deseas eliminar este pedido permanentemente?')) {
          await localDb.deleteOrder(id);
          initVentasPage(); // Refresh list
        }
      });
    });

    // Bind filter button
    const filterBtn = document.getElementById('btn-filter-ventas');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        alert('Por favor utiliza la barra de búsqueda para filtrar pedidos.');
      });
    }

    // Inline status change
    const statusSelects = container.querySelectorAll('.inline-status-select');
    statusSelects.forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        const order = orders.find(o => String(o.id) === String(id));
        
        if (order) {
          order.status = newStatus;
          await localDb.saveOrder(order);
          // Update colors immediately
          e.target.className = `status-badge status-badge--${newStatus} inline-status-select`;
          
          // Triggers para automatización (Email/SMS/Webhook)
          if (newStatus === 'shipped') {
             const clients = await localDb.getAllClients();
             const client = clients.find(c => c.name.toLowerCase() === order.customer.toLowerCase());
             if (client) {
               emailService.sendOrderShipped(order, client);
               if (client.phone) smsService.sendSMS(client.phone, `KOALA: Tu pedido ${order.id} ha sido enviado y está en camino.`);
             }
             webhookService.notifyFulfillmentSystem(order);
          }
        }
      });
    });

    // Save as Client actions
    const saveClientBtns = container.querySelectorAll('.action-save-client');
    saveClientBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const order = orders.find(o => String(o.id) === String(id));
        if (order) {
           await localDb.ensureClientExists(order.customer, order, {
             phone: order.customerPhone || '',
             email: order.customerEmail || '',
             city: order.customerCity || ''
           });
           
           // Visual feedback inside the button
           const originalHtml = e.currentTarget.innerHTML;
           e.currentTarget.innerHTML = `${icon('check', 14)} ¡Cliente Guardado!`;
           e.currentTarget.style.color = 'var(--color-success)';
           
           setTimeout(() => {
             document.querySelectorAll('.action-menu__dropdown').forEach(m => m.classList.remove('active'));
             e.currentTarget.innerHTML = originalHtml;
             e.currentTarget.style.color = '';
           }, 1500);
        }
      });
    });

    // Edit actions
    const modal = document.getElementById('edit-order-modal');
    const closeBtn = document.getElementById('close-edit-order-modal');
    const cancelBtn = document.getElementById('cancel-edit-order-btn');
    const editForm = document.getElementById('edit-order-form');
    
    const closeModal = () => modal.classList.remove('active');
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    const editBtns = container.querySelectorAll('.action-edit');
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const order = orders.find(o => String(o.id) === String(id));
        
        if (order) {
          document.getElementById('edit-order-id').value = order.id;
          document.getElementById('edit-order-customer').value = order.customer;
          document.getElementById('edit-order-status').value = order.status;
          document.getElementById('edit-order-total').value = order.total || 0;
          
          const paymentSelect = document.getElementById('edit-order-payment');
          if (paymentSelect && order.paymentMethod) {
            // Try to match existing option or keep default
            const exists = Array.from(paymentSelect.options).some(o => o.value === order.paymentMethod);
            if (exists) paymentSelect.value = order.paymentMethod;
          }

          const dueDateInput = document.getElementById('edit-order-duedate');
          if (dueDateInput) {
            if (order.dueDate) {
              try {
                const dateObj = new Date(order.dueDate);
                if (!isNaN(dateObj.getTime())) {
                  const yyyy = dateObj.getFullYear();
                  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const dd = String(dateObj.getDate()).padStart(2, '0');
                  dueDateInput.value = `${yyyy}-${mm}-${dd}`;
                } else {
                  dueDateInput.value = '';
                }
              } catch (e) {
                dueDateInput.value = '';
              }
            } else {
              dueDateInput.value = '';
            }
          }
          
          const itemsCount = document.getElementById('edit-order-items-count');
          if (itemsCount) {
            const count = order.itemsList ? order.itemsList.length : (order.items || 0);
            itemsCount.textContent = `(${count} artículo${count !== 1 ? 's' : ''})`;
          }
          
          // Link to full editor
          const editItemsBtn = document.getElementById('edit-order-items-btn');
          if (editItemsBtn) {
            editItemsBtn.onclick = () => {
              closeModal();
              window.location.hash = `/admin/ventas/editar/${order.id}`;
            };
          }
          
          modal.classList.add('active');
        }
      });
    });

    if (!ventasModalInitialized) {
      ventasModalInitialized = true;
      
      closeBtn.addEventListener('click', closeModal);
      cancelBtn.addEventListener('click', closeModal);

      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = editForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        
        try {
          btnSubmit.innerHTML = 'Guardando...';
          btnSubmit.disabled = true;

          const id = document.getElementById('edit-order-id').value;
          const newCustomer = document.getElementById('edit-order-customer').value;
          const newStatus = document.getElementById('edit-order-status').value;
          const newPayment = document.getElementById('edit-order-payment').value;
          const newTotal = parseFloat(document.getElementById('edit-order-total').value);
          const newDueDate = document.getElementById('edit-order-duedate').value;
          
          const order = orders.find(o => String(o.id) === String(id));
          if (order) {
            order.customer = newCustomer;
            order.status = newStatus;
            order.paymentMethod = newPayment;
            if (!isNaN(newTotal)) order.total = newTotal;
            
            if (newDueDate) {
              order.dueDate = new Date(newDueDate + 'T12:00:00').toISOString();
            } else {
              order.dueDate = null;
            }
            
            const updatedOrder = updateOrderFinancials(order);
            await localDb.saveOrder(updatedOrder);
            
            // Triggers para automatización (Email/SMS/Webhook)
            if (newStatus === 'shipped') {
               const clients = await localDb.getAllClients();
               const client = clients.find(c => c.name.toLowerCase() === order.customer.toLowerCase());
               if (client) {
                 emailService.sendOrderShipped(order, client);
                 if (client.phone) smsService.sendSMS(client.phone, `KOALA: Tu pedido ${order.id} ha sido enviado y está en camino.`);
               }
               webhookService.notifyFulfillmentSystem(order);
            }
            
            closeModal();
            initVentasPage(); // Refresh
          } else {
            alert('Error: Pedido no encontrado.');
          }
        } catch (err) {
          console.error('Error saving order', err);
          alert('Error al guardar pedido: ' + err.message);
        } finally {
          btnSubmit.innerHTML = originalText;
          btnSubmit.disabled = false;
        }
      });
    }

    // View Order Details
    const viewModal = document.getElementById('view-order-modal');
    const closeViewBtn = document.getElementById('close-view-order-modal');
    const doneViewBtn = document.getElementById('done-view-order-btn');
    const adjustBtn = document.getElementById('adjust-order-btn');
    
    let currentViewOrderId = null;

    const closeViewModal = () => viewModal.classList.remove('active');
    closeViewBtn.addEventListener('click', closeViewModal);
    doneViewBtn.addEventListener('click', closeViewModal);
    
    adjustBtn.addEventListener('click', () => {
      if (currentViewOrderId) {
        closeViewModal();
        window.location.hash = `/admin/ventas/editar/${currentViewOrderId}`;
      }
    });

    const customerLinks = container.querySelectorAll('.customer-link');
    customerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const order = orders.find(o => String(o.id) === String(id));
        
        if (order) {
          currentViewOrderId = order.id;
          // Generate fake items if not present
          if (!order.itemsList) {
            order.itemsList = [
              { name: 'Bolso Luna', qty: 1, price: 120.00 },
              { name: 'Cartera Mini', qty: 1, price: 45.00 }
            ].slice(0, order.items || 2);
          }
          
          let itemsHtml = order.itemsList.map(item => {
            // Find product image from DB if possible
            const productMatch = products.find(p => p.id === item.id || p.name === item.name);
            const rawImage = (item.image && item.image.length > 10)
              ? item.image
              : productMatch 
                ? productMatch.image 
                : '';

            let imageHtml = '';
            if (rawImage && rawImage.length > 10) {
              if (rawImage.trim().startsWith('<img')) {
                imageHtml = rawImage.replace(/style="[^"]*"/g, 'style="width:100%; height:100%; object-fit:cover;"');
              } else {
                imageHtml = `<img src="${rawImage}" style="width:100%; height:100%; object-fit:cover;" />`;
              }
            } else {
              imageHtml = `<div style="width:100%; height:100%; background:#eee; display:flex; align-items:center; justify-content:center; color:#999;">${icon('image', 16)}</div>`;
            }

            const brandLine = item.brand ? `<span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--color-text-muted);">${item.brand}</span>` : '';
            const sizeLine = item.selectedSize ? ` · Talla: <strong>${item.selectedSize}</strong>` : '';
            const categoryLine = item.category ? `<div style="font-size:11px; color:var(--color-text-muted);">${item.department || ''} ${item.category ? '• ' + item.category : ''}</div>` : '';

            return `
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--color-neutral-divider);">
                <div style="width: 48px; height: 48px; border-radius: 6px; overflow: hidden; background: var(--color-bg-main); display:flex; align-items:center; justify-content:center; font-size:24px; border: 1px solid var(--color-neutral-border); flex-shrink: 0;">
                  ${imageHtml}
                </div>
                <div style="flex:1;">
                  ${brandLine}
                  <div style="font-weight:600; font-size:14px;">${item.name}</div>
                  ${categoryLine}
                  <div style="font-size:12px; color:var(--color-text-secondary);">Cant: ${item.qty} &times; ${formatCurrency(item.price)}${sizeLine}</div>
                </div>
                <div style="font-weight:600; font-size:15px; text-align:right;">
                  ${formatCurrency(item.price * item.qty)}
                </div>
              </div>
            `;
          }).join('');

          const whatsappText = generateWhatsAppSummary(order);
          document.getElementById('view-order-content').innerHTML = `
            <div style="text-align: center; margin-bottom: 24px;">
               <h3 style="font-family: var(--font-display); font-size: 24px;">KOALA</h3>
               <div style="font-size: 12px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 2px;">Factura ${order.id}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px;">
              <div>
                <strong style="color:var(--color-text-secondary); font-size:11px; display:block;">CLIENTE</strong>
                <div style="font-weight:600;">${order.customer}</div>
                ${order.customerPhone ? `<div style="font-size:12px; color:var(--color-text-secondary);">${order.customerPhone}</div>` : ''}
              </div>
              <div style="text-align: right;">
                <strong style="color:var(--color-text-secondary); font-size:11px; display:block;">FECHA LÍMITE</strong>
                <div style="font-weight:600; color:var(--color-error);">${order.dueDate ? new Date(order.dueDate).toLocaleDateString('es-ES', {month:'short', day:'numeric', year:'numeric'}) : 'N/A'}</div>
              </div>
            </div>
            
            <div style="margin-bottom: 24px;">
              <strong style="color:var(--color-text-secondary); font-size:11px; display:block; margin-bottom: 8px;">ARTÍCULOS</strong>
              <div>${itemsHtml}</div>
            </div>
            
            <div style="background: var(--color-bg-surface); padding: 16px; border-radius: 8px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;">
                <span>Subtotal</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px;">
                <span>Envío</span>
                <span>${formatCurrency(order.shippingCost || 0)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-weight:700; font-size:16px; margin-bottom: 8px;">
                <span>Total Estimado</span>
                <span>${formatCurrency((order.total || 0) + (order.shippingCost || 0))}</span>
              </div>
              <div style="border-top: 1px dashed var(--color-neutral-divider); margin: 12px 0;"></div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; color: var(--color-success);">
                <span>Pagado</span>
                <span>- ${formatCurrency(order.totalPaid || 0)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-weight:700; font-size:18px; color: ${(order.pendingBalance !== undefined ? order.pendingBalance : order.total) > 0 ? 'var(--color-error)' : 'var(--color-text-main)'};">
                <span>Balance Pendiente</span>
                <span>${formatCurrency(order.pendingBalance !== undefined ? order.pendingBalance : order.total)}</span>
              </div>
            </div>
            <div style="text-align: center; margin-top: 24px; font-size: 11px; color: var(--color-text-muted);">
              Pedido trabajado por encargo.<br/>koalabyjc@gmail.com
            </div>
          `;
          
          const copyBtn = document.getElementById('copy-whatsapp-btn');
          copyBtn.onclick = () => {
             navigator.clipboard.writeText(whatsappText);
             const originalHtml = copyBtn.innerHTML;
             copyBtn.innerHTML = `${icon('check', 16)} Copiado`;
             setTimeout(() => { copyBtn.innerHTML = originalHtml; }, 2000);
          };
          
          viewModal.classList.add('active');
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding:40px; grid-column:1/-1; color:var(--color-error);">Error al cargar pedidos.</div>`;
    console.error(err);
  }
}

function renderOrderItem(order) {
  const statusLabels = {
    'pending': 'Pendiente',
    'processing': 'En Proceso',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  
  const initials = order.customer.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  return `
    <div class="order-item animate-fade-in-up">
      <!-- Order ID -->
      <div class="order-item__id">${order.id}</div>
      
      <!-- Customer -->
      <div class="order-item__customer customer-link" data-id="${order.id}" style="cursor:pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
        <div class="order-item__avatar">${initials}</div>
        <div class="order-item__name" style="text-decoration: underline; text-decoration-color: var(--color-neutral-divider); text-underline-offset: 4px;">${order.customer}</div>
      </div>
      
      <!-- Date -->
      <div class="order-item__meta">
        <span class="order-item__label">Fecha</span>
        <span class="order-item__value">${formatRelativeTime(order.date)}</span>
      </div>
      
      <!-- Status -->
      <div class="order-item__status">
        <select class="status-badge status-badge--${order.status} inline-status-select" data-id="${order.id}" style="border:none; cursor:pointer; font-weight:bold; font-size:11px; padding-right:24px; outline:none; appearance:none; background-image:url('data:image/svg+xml;utf8,<svg fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 viewBox=%220 0 24 24%22 xmlns=%22http://www.w3.org/2000/svg%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22></path></svg>'); background-repeat:no-repeat; background-position:right 6px center; background-size:12px;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente dep.</option>
          <option value="partial" ${order.status === 'partial' ? 'selected' : ''}>Pago parcial</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Procesada</option>
          <option value="transit" ${order.status === 'transit' ? 'selected' : ''}>En tránsito</option>
          <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Lista entrega</option>
          <option value="balance" ${order.status === 'balance' ? 'selected' : ''}>Balance pend.</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Completada</option>
          <option value="overdue" ${order.status === 'overdue' ? 'selected' : ''}>Vencida</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
        </select>
      </div>
      
      <!-- Total & Balance -->
      <div class="order-item__total">
        <div style="font-weight:600; font-size: 14px;">T: ${formatCurrency((order.total || 0) + (order.shippingCost || 0))}</div>
        <div style="font-size: 11px; color: ${(order.pendingBalance !== undefined ? order.pendingBalance : order.total) > 0 ? 'var(--color-error)' : 'var(--color-success)'}; font-weight: 600;">
          P: ${formatCurrency(order.pendingBalance !== undefined ? order.pendingBalance : order.total)}
        </div>
        ${order.dueDate ? `<div style="font-size: 10px; color: var(--color-text-muted);">Vence: ${new Date(order.dueDate).toLocaleDateString('es-ES', {month:'short', day:'numeric'})}</div>` : ''}
      </div>
 
      <!-- Action Menu -->
      <div class="action-menu">
        <button class="btn btn--icon action-menu-toggle" aria-label="Opciones de pedido ${order.id}">
          ${icon('settings', 16)}
        </button>
        <div class="action-menu__dropdown">
          <button class="action-menu__item action-edit" data-id="${order.id}">
            ${icon('edit', 14)} Editar Estado
          </button>
          <button class="action-menu__item action-save-client" data-id="${order.id}">
            ${icon('user-plus', 14) || icon('user', 14)} Guardar Cliente
          </button>
          <button class="action-menu__item action-menu__item--danger action-delete" data-id="${order.id}">
            ${icon('trash-2', 14)} Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}


