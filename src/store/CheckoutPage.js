/* ============================================
   KOALA — Checkout Page
   Public cart and custom order request flow
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { cartService } from './cartService.js';
import { localDb } from '../utils/localDb.js';
import { calculateDueDate } from '../utils/orderLogic.js';

export function renderCheckoutPage() {
  const items = cartService.getItems();
  
  if (items.length === 0) {
    return `
      <div class="store-section" style="text-align: center; margin-top: 100px;">
        <div class="empty-cart animate-fade-in-up">
          ${icon('shopping-bag', 64)}
          <h2 style="margin-bottom: 16px; font-family: var(--font-display);">Tu carrito está vacío</h2>
          <a href="#/" class="btn btn--primary">Continuar comprando</a>
        </div>
      </div>
    `;
  }

  const total = cartService.getTotal();

  return `
    <div class="checkout-page animate-fade-in-up">
      <!-- Checkout Form -->
      <div class="checkout-form">
        <!-- Back Button -->
        <a href="#/" style="display: inline-flex; align-items: center; gap: 8px; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 24px; padding: 8px 0; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--color-text-secondary)'">
          ${icon('arrow-left', 18)} Seguir Comprando
        </a>

        <h2 class="checkout-section-title">Información de Envío</h2>
        <div class="form-group">
          <label>Nombre completo</label>
          <input type="text" id="cust-name" placeholder="Ej. María Rodríguez" required />
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input type="tel" id="cust-phone" placeholder="787-555-0000" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="cust-email" placeholder="correo@ejemplo.com" required />
        </div>
        <div class="form-group">
          <label>Pueblo / Ciudad</label>
          <input type="text" id="cust-city" placeholder="Ej. San Juan" required />
        </div>
        
        <h2 class="checkout-section-title" style="margin-top: 32px;">Método de Pago</h2>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 16px;">
          Selecciona cómo prefieres pagar. Te contactaremos para procesar el pago y confirmar la orden.
        </p>
        <div class="form-group">
          <select id="cust-payment">
            <option value="ATH Móvil">ATH Móvil</option>
            <option value="PayPal">PayPal</option>
            <option value="Cash">Efectivo (Contra entrega)</option>
            <option value="Walmart">Walmart to Walmart</option>
          </select>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="checkout-summary">
        <h2 class="checkout-section-title">Resumen de Orden</h2>
        <div class="cart-items">
          ${items.map(item => {
            const sizeLabel = item.selectedSize || '';
            const isCustomImg = item.image && item.image.length > 10;
            let imgHtml = '';
            
            if (isCustomImg) {
              if (item.image.trim().startsWith('<img')) {
                // If it's already an HTML image tag, render it directly
                imgHtml = item.image;
              } else {
                // If it's a raw URL or base64 string, wrap it in an img tag
                imgHtml = `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" />`;
              }
            } else {
              // Fallback to emoji or placeholder
              imgHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(198,162,122,0.1); font-size:24px;">${item.image || '🛍️'}</div>`;
            }

            return `
              <div class="cart-item" style="position:relative; display:flex; align-items:center; gap:12px; padding:16px; background:var(--color-bg-elevated); border:1px solid var(--color-neutral-border); border-radius:12px; margin-bottom:12px; box-sizing:border-box;">
                <!-- Thumbnail -->
                <div class="cart-item__img" style="width:50px; height:50px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden;">
                  ${imgHtml}
                </div>
                
                <!-- Info -->
                <div class="cart-item__info" style="flex:1; display:flex; flex-direction:column; gap:2px; min-width:0;">
                  <div class="cart-item__title" style="font-weight:600; font-size:13px; color:var(--color-text-primary); line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</div>
                  ${item.brand ? `<div style="font-size:10px; color:var(--color-accent); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">${item.brand}</div>` : ''}
                  
                  <!-- Quantity adjuster + Size -->
                  <div style="display:flex; align-items:center; gap:12px; margin-top:4px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; background:var(--color-bg-surface); border:1px solid var(--color-neutral-border); border-radius:6px; padding:2px;">
                      <button class="cart-qty-btn--minus" data-id="${item.id}" data-size="${sizeLabel}" data-qty="${item.quantity}" style="background:none; border:none; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:var(--color-text-secondary); cursor:pointer; padding:0;">-</button>
                      <span style="font-size:12px; font-weight:700; width:24px; text-align:center; color:var(--color-primary);">${item.quantity}</span>
                      <button class="cart-qty-btn--plus" data-id="${item.id}" data-size="${sizeLabel}" data-qty="${item.quantity}" style="background:none; border:none; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:var(--color-text-secondary); cursor:pointer; padding:0;">+</button>
                    </div>
                    ${sizeLabel ? `<span style="font-size:11px; color:var(--color-text-secondary);">Talla: <strong style="color:var(--color-primary);">${sizeLabel}</strong></span>` : ''}
                  </div>
                </div>

                <!-- Price + Remove Button -->
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px; justify-content:space-between; min-height:48px;">
                  <button class="cart-item-remove-btn" data-id="${item.id}" data-size="${sizeLabel}" style="background:none; border:none; color:var(--color-ready-accent); cursor:pointer; padding:4px; border-radius:4px; display:flex; align-items:center; justify-content:center; transition:background var(--duration-fast);" onmouseover="this.style.background='rgba(229,62,62,0.08)'" onmouseout="this.style.background='none'">
                    ${icon('trash', 16) || '✕'}
                  </button>
                  <div class="cart-item__price" style="font-weight:700; color:var(--color-primary); font-size:14px;">${formatCurrency(item.price * item.quantity)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="margin-top: 24px;">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatCurrency(total)}</span>
          </div>
          <div class="summary-row">
            <span>Envío</span>
            <span>Calculado luego</span>
          </div>
          <div class="summary-row summary-row--total">
            <span>Total Estimado</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>

        <!-- Alerta de encargo -->
        <div style="margin: 16px 0; padding: 12px; background: rgba(198, 162, 122, 0.1); border-left: 3px solid var(--color-primary); border-radius: 4px; font-size: 12px; color: var(--color-text-secondary); line-height: 1.4;">
          <strong>Nota importante:</strong> Todos los pedidos son trabajados por encargo y pueden tardar 1–2 semanas en llegar.
        </div>
        
        <button class="btn-checkout" id="btn-submit-order" onclick="window.processKoalaOrder()">
          Procesar Orden
        </button>
        <p style="font-size: 11px; text-align: center; margin-top: 12px; color: var(--color-text-muted);">
          Al procesar la orden, nos pondremos en contacto contigo para el pago y envío.
        </p>
      </div>
    </div>
  `;
}

// Globally expose the checkout process to ensure it never gets detached
window.processKoalaOrder = async () => {
  const btnSubmit = document.getElementById('btn-submit-order');
  if (!btnSubmit) return;
  
  try {
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const emailInput = document.getElementById('cust-email');
    const cityInput = document.getElementById('cust-city');
    const paymentInput = document.getElementById('cust-payment');

    const name = (nameInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const city = (cityInput?.value || '').trim();
    const payment = paymentInput?.value || 'ATH Móvil';
    
    // Validation
    if (!name) {
      nameInput?.focus();
      alert('Por favor completa tu nombre completo.');
      return;
    }
    if (!phone) {
      phoneInput?.focus();
      alert('Por favor completa tu teléfono.');
      return;
    }
    
    // Disable button immediately to prevent double-click
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Procesando...';
    btnSubmit.style.opacity = '0.7';

    // Generate real order for LocalDB
    const items = cartService.getItems();
    if (!items || items.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    
    const orderDate = new Date().toISOString();
    const total = cartService.getTotal();
    
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customer: name,
      customerPhone: phone,
      customerEmail: email,
      customerCity: city,
      total: total,
      status: 'pending', // o 'Pendiente depósito'
      date: orderDate,
      paymentMethod: payment,
      items: cartService.getItemCount(),
      dueDate: calculateDueDate(orderDate),
      pendingBalance: total,
      totalPaid: 0,
      payments: [],
      itemsList: items.map(item => ({
         id: item.id,
         name: item.name,
         brand: item.brand || '',
         category: item.category || '',
         department: item.department || '',
         selectedSize: item.selectedSize || '',
         price: item.price,
         qty: item.quantity,
         image: item.image
      }))
    };
    
    // Save order into DB (this also creates a notification)
    await localDb.saveOrder(newOrder);

    // Auto-register or update client with checkout data
    await localDb.ensureClientExists(name, newOrder, {
      phone,
      email,
      city
    });

    // Show success state
    btnSubmit.textContent = '¡Orden Enviada!';
    btnSubmit.style.background = 'var(--color-success)';
    btnSubmit.style.opacity = '1';
    
    // Show success confirmation page
    setTimeout(() => {
      cartService.clear();
      
      const contentArea = document.querySelector('.store-main') || document.getElementById('content-area');
      if (contentArea) {
        contentArea.innerHTML = `
          <div style="text-align: center; padding: 80px 24px; max-width: 500px; margin: 80px auto 0; animation: fadeInUp 0.5s ease;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-success-bg, #e8f5e9); color: var(--color-success, #2e7d32); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 40px;">
              ${icon('check', 40)}
            </div>
            <h2 style="font-family: var(--font-display); font-size: 28px; margin-bottom: 12px; color: var(--color-text-primary);">¡Gracias por tu orden!</h2>
            <p style="color: var(--color-text-secondary); font-size: 16px; margin-bottom: 8px;">
              Tu pedido <strong>${newOrder.id}</strong> ha sido recibido.
            </p>
            <p style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 32px;">
              Te contactaremos pronto al <strong>${phone}</strong> para confirmar el pago y coordinar el envío.
            </p>
            <a href="#/" class="btn btn--primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 32px; font-size: 16px;">
              ${icon('arrow-left', 16)} Volver a la Tienda
            </a>
          </div>
        `;
      }
    }, 1200);

  } catch (err) {
    console.error('Error processing order:', err);
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Procesar Orden';
    btnSubmit.style.opacity = '1';
    alert('Error al procesar la orden: ' + (err.message || JSON.stringify(err)));
  }
};

export function initCheckoutPage() {
  // Subscribe to cart updates to dynamically re-render the page when quantity or items change
  const unsubscribe = cartService.subscribe(() => {
    const contentArea = document.getElementById('content-area');
    const hash = window.location.hash || '#/';
    if (contentArea && hash.startsWith('#/cart')) {
      contentArea.innerHTML = renderCheckoutPage();
      bindCartActions();
    }
  });

  // Store unsubscribe on global window to clean up on route change
  window.__currentCheckoutUnsubscribe = unsubscribe;

  bindCartActions();
}

function bindCartActions() {
  // Decrement qty
  document.querySelectorAll('.cart-qty-btn--minus').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const size = btn.getAttribute('data-size') || '';
      const qty = parseInt(btn.getAttribute('data-qty'), 10);
      if (qty > 1) {
        cartService.updateQuantity(id, size, qty - 1);
      } else {
        if (confirm('¿Quieres eliminar este artículo de tu carrito?')) {
          cartService.removeItem(id, size);
        }
      }
    };
  });

  // Increment qty
  document.querySelectorAll('.cart-qty-btn--plus').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const size = btn.getAttribute('data-size') || '';
      const qty = parseInt(btn.getAttribute('data-qty'), 10);
      cartService.updateQuantity(id, size, qty + 1);
    };
  });

  // Remove item entirely
  document.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
    btn.onclick = () => {
      if (confirm('¿Quieres quitar este artículo del carrito?')) {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size') || '';
        cartService.removeItem(id, size);
      }
    };
  });
}
