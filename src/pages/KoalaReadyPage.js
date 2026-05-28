/* ============================================
   KOALA READY — Admin Management Page
   Inventory management, announcements, READY products
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { readyService } from '../utils/readyService.js';
import { compressImage } from '../utils/imageCompressor.js';

let readyProducts = [];
let editingProduct = null;

const READY_BADGES = ['READY NOW', 'FAST SHIP', 'LAST UNIT', 'AVAILABLE TODAY'];

export function renderKoalaReadyPage() {
  return `
    <div class="ready-admin module-page animate-fade-in-up">
      <!-- Header -->
      <div class="ready-admin__header">
        <div class="ready-admin__header-left">
          <h1>⚡ KOALA READY</h1>
          <p>Gestiona inventario de disponibilidad inmediata</p>
        </div>
        <button class="btn btn--primary" id="btn-add-ready">
          ${icon('plus', 18)} Agregar Producto READY
        </button>
      </div>

      <!-- Announcement Control Panel -->
      <div class="ready-announce-panel" id="announce-panel">
        <div class="ready-announce-panel__header">
          <div class="ready-announce-panel__title">
            ${icon('speakerphone', 18)} Anuncio Destacado de Dropping
          </div>
          <label class="ready-toggle">
            <input type="checkbox" id="announce-toggle">
            <span class="ready-toggle__slider"></span>
          </label>
        </div>
        <div class="ready-announce-panel__form" id="announce-form" style="display:none">
          <div class="form-group">
            <label>Producto a destacar</label>
            <select id="announce-product" class="auth-input" style="width:100%; height:40px;">
              <option value="">Seleccionar producto...</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de anuncio</label>
            <select id="announce-type" class="auth-input" style="width:100%; height:40px;">
              <option value="toast">Toast Flotante (Abajo-Derecha)</option>
              <option value="banner">Banner Superior (Debajo de Navbar)</option>
            </select>
          </div>
          <div class="form-group ready-form__full">
            <label>Texto del Anuncio</label>
            <input type="text" id="announce-text" class="auth-input" placeholder="¡Drop Exclusivo! Consigue tus Nike Air Max ahora..." style="width:100%;" />
          </div>
          <div class="ready-form__full" style="display:flex; justify-content:flex-end; margin-top:12px;">
            <button class="btn btn--primary" id="btn-save-announce" style="padding:6px 16px; font-size:12px;">Guardar Anuncio</button>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="ready-table-wrap">
        <div class="ready-table-wrap__header">
          <div class="ready-table-wrap__title">Inventario READY NOW</div>
          <div class="ready-table-wrap__count" id="ready-products-count">0 items</div>
        </div>
        
        <div id="ready-table-container">
          <div class="ready-admin-empty">
            <div class="ready-admin-empty__icon">📦</div>
            <h3 class="ready-admin-empty__title">Sin productos READY</h3>
            <p class="ready-admin-empty__text">Crea productos con stock inmediato para incentivar ventas flash y liquidar inventarios.</p>
            <button class="btn btn--secondary" id="btn-empty-add-ready">Agregar Primer Item</button>
          </div>
        </div>
      </div>

      <!-- Add/Edit READY Modal -->
      <div class="modal-overlay" id="ready-modal">
        <div class="modal" style="max-width: 600px; padding: 24px; max-height:90vh; overflow-y:auto; border-radius:16px;">
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;" id="ready-modal-title">Agregar Producto READY</h2>
          <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:20px;">Especifica una talla y un distintivo flash para venta rápida.</p>
          
          <form id="ready-product-form" class="ready-form" onsubmit="event.preventDefault();">
            <!-- Image Upload -->
            <div class="ready-form__image-upload" id="ready-image-uploader">
              <div id="ready-upload-placeholder">
                <span style="font-size:32px;">📸</span>
                <p style="font-size:12px; margin-top:8px; font-weight:500;">Arrastra o selecciona una foto de producto</p>
                <p style="font-size:10px; color:var(--color-text-muted); margin-top:2px;">Recomendado: 1:1 JPG o PNG</p>
              </div>
              <input type="file" id="ready-file-input" style="display:none;" accept="image/*" />
            </div>

            <!-- Fields -->
            <div class="form-group ready-form__full">
              <label>Nombre del Producto *</label>
              <input type="text" id="ready-name" class="auth-input" placeholder="Ej. Nike Air Jordan 1 Retro" required style="width:100%;" />
            </div>

            <div class="form-group">
              <label>Marca *</label>
              <input type="text" id="ready-brand" class="auth-input" placeholder="Ej. Nike" required list="ready-brands-list" style="width:100%;" />
              <datalist id="ready-brands-list"></datalist>
            </div>

            <div class="form-group">
              <label>Precio ($ USD) *</label>
              <input type="number" id="ready-price" class="auth-input" placeholder="0.00" min="0" step="0.01" required style="width:100%;" />
            </div>

            <div class="form-group">
              <label>Departamento *</label>
              <select id="ready-dept" class="auth-input" style="width:100%; height:44px;" required>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Niños">Niños</option>
                <option value="Unisex" selected>Unisex</option>
              </select>
            </div>

            <div class="form-group">
              <label>Categoría *</label>
              <select id="ready-category" class="auth-input" style="width:100%; height:44px;" required>
                <option value="Tenis y Zapatos" selected>Tenis y Zapatos</option>
                <option value="Ropa">Ropa</option>
                <option value="Gorras">Gorras</option>
                <option value="Gafas">Gafas</option>
                <option value="Prendas">Prendas</option>
                <option value="Carteras">Carteras</option>
                <option value="Relojes">Relojes</option>
                <option value="Splash">Splash</option>
                <option value="Medias">Medias</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>

            <div class="form-group">
              <label>Talla Exacta Disponible *</label>
              <input type="text" id="ready-size" class="auth-input" placeholder="Ej. 10, M, L" required style="width:100%;" />
            </div>

            <div class="form-group">
              <label>Cantidad Disponible *</label>
              <input type="number" id="ready-quantity" class="auth-input" value="1" min="1" required style="width:100%;" />
            </div>

            <!-- Ready Badges -->
            <div class="form-group ready-form__full">
              <label style="margin-bottom:8px; display:block;">Distintivo de Disponibilidad</label>
              <div class="ready-form__badges" id="ready-badge-options">
                ${READY_BADGES.map((badge, idx) => `
                  <div class="ready-badge-option ${idx === 0 ? 'ready-badge-option--selected' : ''}" data-badge="${badge}">
                    ${badge}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Status Checkboxes -->
            <div class="form-group ready-form__full" style="display:flex; gap:20px; margin-top:12px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; cursor:pointer;">
                <input type="checkbox" id="ready-publish" checked style="width:16px; height:16px;" /> Publicar en tienda inmediatamente
              </label>
            </div>

            <!-- Actions -->
            <div class="ready-form__full" style="display: flex; gap: 12px; margin-top: 24px;">
              <button type="button" class="btn btn--ghost" id="ready-modal-cancel" style="flex:1;">Cancelar</button>
              <button type="button" class="btn btn--primary" id="ready-modal-save" style="flex:1;">Guardar Producto</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export async function initKoalaReadyPage() {
  const btnAdd = document.getElementById('btn-add-ready');
  const btnEmptyAdd = document.getElementById('btn-empty-add-ready');
  const modal = document.getElementById('ready-modal');
  const btnCancel = document.getElementById('ready-modal-cancel');
  const btnSave = document.getElementById('ready-modal-save');
  const form = document.getElementById('ready-product-form');
  const brandsList = document.getElementById('ready-brands-list');
  const announceToggle = document.getElementById('announce-toggle');
  const announceForm = document.getElementById('announce-form');
  const announceProduct = document.getElementById('announce-product');
  const btnSaveAnnounce = document.getElementById('btn-save-announce');

  let selectedImageBase64 = '';
  let selectedBadge = READY_BADGES[0];

  // ── Load Initial Data ──
  await loadReadyProducts();
  await populateBrands();
  await loadAnnouncementSettings();

  // ── Attach Events ──
  const openFormModal = (prod = null) => {
    editingProduct = prod;
    selectedImageBase64 = prod ? prod.image : '';
    selectedBadge = prod ? prod.readyBadge : READY_BADGES[0];

    document.getElementById('ready-modal-title').textContent = prod ? 'Editar Producto READY' : 'Agregar Producto READY';

    // Populate fields
    document.getElementById('ready-name').value = prod ? prod.name : '';
    document.getElementById('ready-brand').value = prod ? prod.brand : '';
    document.getElementById('ready-price').value = prod ? prod.price : '';
    document.getElementById('ready-dept').value = prod ? prod.department : 'Unisex';
    document.getElementById('ready-category').value = prod ? prod.category : 'Tenis y Zapatos';
    document.getElementById('ready-size').value = prod ? (prod.sizes ? prod.sizes[0] : '') : '';
    document.getElementById('ready-quantity').value = prod ? (prod.readyQuantity || 1) : '1';
    document.getElementById('ready-publish').checked = prod ? prod.readyStatus === 'active' : true;

    // Update Badge UI
    document.querySelectorAll('.ready-badge-option').forEach(el => {
      const b = el.getAttribute('data-badge');
      if (b === selectedBadge) {
        el.classList.add('ready-badge-option--selected');
      } else {
        el.classList.remove('ready-badge-option--selected');
      }
    });

    // Update Image Preview UI
    const uploader = document.getElementById('ready-image-uploader');
    const placeholder = document.getElementById('ready-upload-placeholder');
    // Clear any previous preview images
    const prevImg = uploader.querySelector('.ready-form__image-preview');
    if (prevImg) prevImg.remove();

    if (selectedImageBase64) {
      placeholder.style.display = 'none';
      const div = document.createElement('div');
      div.className = 'ready-form__image-preview';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.maxHeight = '200px';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.justifyContent = 'center';
      div.style.overflow = 'hidden';
      div.style.borderRadius = '12px';

      if (selectedImageBase64.trim().startsWith('<img')) {
        div.innerHTML = selectedImageBase64.replace(/style="[^"]*"/g, 'style="width:100%; height:100%; object-fit:contain; border-radius:12px;"');
      } else {
        div.innerHTML = `<img src="${selectedImageBase64}" style="width:100%; height:100%; object-fit:contain; border-radius:12px;" />`;
      }
      uploader.appendChild(div);
    } else {
      placeholder.style.display = 'block';
    }

    modal.classList.add('active');
  };

  if (btnAdd) btnAdd.onclick = () => openFormModal();
  if (btnEmptyAdd) btnEmptyAdd.onclick = () => openFormModal();
  if (btnCancel) btnCancel.onclick = () => modal.classList.remove('active');

  // Close modal when clicking overlay
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };

  // Badge Selection handler
  document.querySelectorAll('.ready-badge-option').forEach(el => {
    el.onclick = () => {
      document.querySelectorAll('.ready-badge-option').forEach(x => x.classList.remove('ready-badge-option--selected'));
      el.classList.add('ready-badge-option--selected');
      selectedBadge = el.getAttribute('data-badge');
    };
  });

  // Image Upload handler
  const uploader = document.getElementById('ready-image-uploader');
  const fileInput = document.getElementById('ready-file-input');
  
  if (uploader && fileInput) {
    uploader.onclick = (e) => {
      if (e.target.tagName !== 'IMG') {
        fileInput.click();
      }
    };

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        selectedImageBase64 = await compressImage(file);
        
        // Show preview
        const placeholder = document.getElementById('ready-upload-placeholder');
        placeholder.style.display = 'none';
        
        const prevImg = uploader.querySelector('.ready-form__image-preview');
        if (prevImg) prevImg.remove();

        const img = document.createElement('img');
        img.className = 'ready-form__image-preview';
        img.src = selectedImageBase64;
        uploader.appendChild(img);
      } catch (err) {
        console.error(err);
        alert('Error procesando la imagen');
      }
    };

    // Drag & Drop
    uploader.ondragover = (e) => { e.preventDefault(); uploader.style.borderColor = 'var(--color-primary)'; };
    uploader.ondragleave = () => { uploader.style.borderColor = 'var(--color-neutral-border)'; };
    uploader.ondrop = async (e) => {
      e.preventDefault();
      uploader.style.borderColor = 'var(--color-neutral-border)';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        try {
          selectedImageBase64 = await compressImage(file);
          
          const placeholder = document.getElementById('ready-upload-placeholder');
          placeholder.style.display = 'none';
          
          const prevImg = uploader.querySelector('.ready-form__image-preview');
          if (prevImg) prevImg.remove();

          const img = document.createElement('img');
          img.className = 'ready-form__image-preview';
          img.src = selectedImageBase64;
          uploader.appendChild(img);
        } catch (err) {
          console.error(err);
        }
      }
    };
  }

  // Save Product handler
  if (btnSave) {
    btnSave.onclick = async () => {
      const name = document.getElementById('ready-name').value.trim();
      const brand = document.getElementById('ready-brand').value.trim();
      const price = parseFloat(document.getElementById('ready-price').value);
      const dept = document.getElementById('ready-dept').value;
      const cat = document.getElementById('ready-category').value;
      const size = document.getElementById('ready-size').value.trim();
      const qty = parseInt(document.getElementById('ready-quantity').value, 10);
      const publish = document.getElementById('ready-publish').checked;

      if (!name || !brand || isNaN(price) || !size || isNaN(qty)) {
        alert('Por favor, completa todos los campos requeridos (*)');
        return;
      }

      btnSave.disabled = true;
      btnSave.textContent = 'Guardando...';

      try {
        const readyProduct = {
          id: editingProduct ? editingProduct.id : null,
          name,
          brand,
          price,
          department: dept,
          category: cat,
          sizes: [size],
          image: selectedImageBase64 || '🛍️',
          readyStatus: publish ? 'active' : 'hidden',
          readyBadge: selectedBadge,
          readyQuantity: qty,
          isFeatured: editingProduct ? editingProduct.isFeatured : false
        };

        await localDb.saveReadyProduct(readyProduct);
        await readyService.notifyChange();

        modal.classList.remove('active');
        await loadReadyProducts();
        await populateBrands();
        await loadAnnouncementSettings(); // refresh dropdowns
      } catch (err) {
        console.error('Error saving READY product:', err);
        alert('Hubo un error al guardar el producto.');
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = 'Guardar Producto';
      }
    };
  }

  // Announcement toggle & form handlers
  if (announceToggle) {
    announceToggle.onchange = (e) => {
      if (e.target.checked) {
        announceForm.style.display = 'grid';
      } else {
        announceForm.style.display = 'none';
        localDb.clearAnnouncement();
        readyService.notifyChange();
      }
    };
  }

  if (btnSaveAnnounce) {
    btnSaveAnnounce.onclick = () => {
      const prodId = announceProduct.value;
      const type = document.getElementById('announce-type').value;
      const text = document.getElementById('announce-text').value.trim();

      if (!prodId || !text) {
        alert('Selecciona un producto y escribe el texto del anuncio.');
        return;
      }

      const p = readyProducts.find(x => x.id === prodId);

      const announcement = {
        active: true,
        productId: prodId,
        productName: p ? p.name : '',
        productBrand: p ? p.brand : '',
        productImage: p ? p.image : '',
        productPrice: p ? p.price : 0,
        type,
        text
      };

      localDb.saveAnnouncement(announcement);
      readyService.notifyChange();
      alert('¡Anuncio guardado y publicado en la tienda!');
    };
  }

  // ── Inner functions ──
  async function loadReadyProducts() {
    readyProducts = await localDb.getAllReadyProductsAdmin();
    const countEl = document.getElementById('ready-products-count');
    if (countEl) countEl.textContent = `${readyProducts.length} items`;

    const container = document.getElementById('ready-table-container');
    if (!container) return;

    if (readyProducts.length === 0) {
      container.innerHTML = `
        <div class="ready-admin-empty">
          <div class="ready-admin-empty__icon">📦</div>
          <h3 class="ready-admin-empty__title">Sin productos READY</h3>
          <p class="ready-admin-empty__text">Crea productos con stock inmediato para incentivar ventas flash y liquidar inventarios.</p>
          <button class="btn btn--secondary" id="btn-empty-add-ready-fresh">Agregar Primer Item</button>
        </div>
      `;
      const btnEmptyFresh = document.getElementById('btn-empty-add-ready-fresh');
      if (btnEmptyFresh) btnEmptyFresh.onclick = () => openFormModal();
      return;
    }

    const tableHTML = `
      <table class="ready-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Talla</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Distintivo</th>
            <th>Estado</th>
            <th>Destacado</th>
            <th style="text-align:right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${readyProducts.map(p => {
            const hasCustomImg = p.image && p.image.length > 10;
            let thumbHtml = '';
            
            if (hasCustomImg) {
              if (p.image.trim().startsWith('<img')) {
                // Si es un tag img completo, lo envolvemos en un contenedor compacto
                // que tenga las dimensiones y bordes de la miniatura.
                thumbHtml = `<div class="ready-table__thumb" style="display:flex; align-items:center; justify-content:center; overflow:hidden; padding:0; flex-shrink:0;">
                  ${p.image.replace(/style="[^"]*"/g, 'style="width:100%; height:100%; object-fit:cover;"')}
                </div>`;
              } else {
                thumbHtml = `<img src="${p.image}" class="ready-table__thumb" style="width:100%; height:100%; object-fit:cover;" />`;
              }
            } else {
              thumbHtml = `<div class="ready-table__thumb" style="display:flex; align-items:center; justify-content:center; font-size:18px; background:rgba(198,162,122,0.1);">${p.image || '🛍️'}</div>`;
            }
            
            let statusClass = 'ready-status--hidden';
            let statusText = 'Oculto';
            if (p.readyStatus === 'active') { statusClass = 'ready-status--active'; statusText = 'Activo'; }
            else if (p.readyStatus === 'sold') { statusClass = 'ready-status--sold'; statusText = 'Vendido'; }

            const isFeatured = p.isFeatured;
            const starIcon = isFeatured ? '★' : '☆';
            const starStyle = isFeatured ? 'color: var(--color-warning); font-size:20px;' : 'color: var(--color-text-muted); opacity:0.5;';

            return `
              <tr>
                <td>
                  <div class="ready-table__product">
                    ${thumbHtml}
                    <div class="ready-table__product-info">
                      <span class="ready-table__product-name">${p.name}</span>
                      <span class="ready-table__product-brand">${p.brand || 'KOALA'}</span>
                    </div>
                  </div>
                </td>
                <td style="font-weight: 600;">${p.sizes ? p.sizes[0] : '—'}</td>
                <td style="font-weight: 700; color:var(--color-primary);">${formatCurrency(p.price)}</td>
                <td>${p.readyQuantity || 0}</td>
                <td>
                  <span style="font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; background:var(--color-ready-badge-bg); color:var(--color-ready-badge-text); letter-spacing:0.5px;">
                    ${p.readyBadge || 'READY NOW'}
                  </span>
                </td>
                <td>
                  <span class="ready-status ${statusClass}">${statusText}</span>
                </td>
                <td>
                  <button class="ready-featured-star" data-id="${p.id}" style="${starStyle}">${starIcon}</button>
                </td>
                <td style="text-align:right;">
                  <div class="ready-actions" style="justify-content:flex-end;">
                    <button class="ready-action-btn edit-ready-btn" data-id="${p.id}">${icon('edit', 12)} Editar</button>
                    ${p.readyStatus === 'active' 
                      ? `<button class="ready-action-btn sold-ready-btn" data-id="${p.id}" style="color:var(--color-ready-success); border-color:rgba(56, 161, 105, 0.3);">${icon('check', 12)} Vendido</button>` 
                      : ''
                    }
                    ${p.readyStatus === 'hidden' 
                      ? `<button class="ready-action-btn activate-ready-btn" data-id="${p.id}" style="color:var(--color-success);">${icon('eye', 12)} Activar</button>` 
                      : ''
                    }
                    ${p.readyStatus === 'active' 
                      ? `<button class="ready-action-btn hide-ready-btn" data-id="${p.id}" style="color:var(--color-warning);">${icon('eye-off', 12)} Ocultar</button>` 
                      : ''
                    }
                    <button class="ready-action-btn ready-action-btn--danger delete-ready-btn" data-id="${p.id}">${icon('trash', 12)}</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;

    // Table buttons event binding
    container.querySelectorAll('.edit-ready-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const p = readyProducts.find(x => x.id === id);
        if (p) openFormModal(p);
      };
    });

    container.querySelectorAll('.ready-featured-star').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        await localDb.toggleReadyFeatured(id);
        await readyService.notifyChange();
        await loadReadyProducts();
      };
    });

    container.querySelectorAll('.sold-ready-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        await readyService.markSold(id);
        await loadReadyProducts();
        await loadAnnouncementSettings(); // refresh dropdowns
      };
    });

    container.querySelectorAll('.activate-ready-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        await localDb.updateReadyStatus(id, 'active');
        await readyService.notifyChange();
        await loadReadyProducts();
      };
    });

    container.querySelectorAll('.hide-ready-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        await localDb.updateReadyStatus(id, 'hidden');
        await readyService.notifyChange();
        await loadReadyProducts();
      };
    });

    container.querySelectorAll('.delete-ready-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar este producto READY?')) {
          const id = btn.getAttribute('data-id');
          await localDb.deleteReadyProduct(id);
          await readyService.notifyChange();
          await loadReadyProducts();
          await loadAnnouncementSettings();
        }
      };
    });
  }

  async function populateBrands() {
    if (!brandsList) return;
    const brands = await localDb.getAllBrands();
    brandsList.innerHTML = brands.map(b => `<option value="${b.name}">`).join('');
  }

  async function loadAnnouncementSettings() {
    if (!announceProduct) return;
    
    // Get active products for announcement selection
    const activeProducts = readyProducts.filter(p => p.readyStatus === 'active');
    
    announceProduct.innerHTML = '<option value="">Seleccionar producto...</option>' + 
      activeProducts.map(p => `<option value="${p.id}">${p.brand ? p.brand + ' - ' : ''}${p.name} (${p.sizes ? p.sizes[0] : ''})</option>`).join('');

    const announcement = localDb.getActiveAnnouncement();
    if (announcement) {
      announceToggle.checked = true;
      announceForm.style.display = 'grid';
      announceProduct.value = announcement.productId;
      document.getElementById('announce-type').value = announcement.type;
      document.getElementById('announce-text').value = announcement.text;
    } else {
      announceToggle.checked = false;
      announceForm.style.display = 'none';
      announceProduct.value = '';
      document.getElementById('announce-text').value = '';
    }
  }
}
