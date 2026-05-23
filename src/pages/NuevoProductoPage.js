/* ============================================
   KOALA — Product Form Page
   Admin view for creating new products with image upload
   ============================================ */

import { icon } from '../utils/icons.js';
import { localDb } from '../utils/localDb.js';
import { classifyProduct } from '../utils/autoClassifier.js';
import { renderSizePicker } from '../utils/sizeChart.js';

let uploadedImages = []; // Array of base64 strings
let selectedSizes = [];

export function renderNuevoProductoPage() {
  // Reset memory on render
  uploadedImages = [];
  selectedSizes = [];

  return `
    <div class="page-header animate-fade-in-up">
      <div>
        <h2 class="page-title">Nuevo Producto</h2>
        <p class="page-subtitle">Añade un artículo al catálogo con imágenes reales.</p>
      </div>
      <div class="page-actions">
        <a href="#/admin/productos" class="btn btn--secondary">Cancelar</a>
        <button id="btn-save-product" class="btn btn--primary">
          ${icon('save', 16)} Guardar Producto
        </button>
      </div>
    </div>

    <div class="card animate-fade-in-up" style="animation-delay: 0.1s; max-width: 800px; margin: 0 auto;">
      <form id="new-product-form" class="product-form" onsubmit="return false;">
        
        <!-- MEDIA UPLOADER -->
        <div class="form-group" style="margin-bottom: 24px;">
          <label style="display: block; font-weight: var(--weight-semibold); margin-bottom: 8px;">Imágenes del Producto</label>
          <div class="uploader-area" id="drop-area">
            <input type="file" id="file-input" multiple accept="image/*" style="display: none;" />
            <div class="uploader-placeholder" id="uploader-placeholder">
              ${icon('upload-cloud', 32)}
              <p>Arrastra imágenes aquí o <strong>haz clic para buscar</strong></p>
              <span style="font-size: 11px; color: var(--color-text-muted);">Soporta JPG, PNG. (Máx 2MB por foto simulado)</span>
            </div>
            <div class="uploader-preview" id="preview-grid" style="display: none;"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label>Nombre del Producto</label>
            <input type="text" id="prod-name" placeholder="Ej. Bolso de Cuero o Tenis" class="auth-input" required />
          </div>
          <div class="form-group">
            <label>Marca</label>
            <input type="text" id="prod-brand" list="brand-list" class="auth-input" placeholder="Escribe o selecciona..." required />
            <datalist id="brand-list"></datalist>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label>Departamento</label>
            <select id="prod-dept" class="auth-input" required>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
              <option value="Niños">Niños</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de Artículo</label>
            <select id="prod-category" class="auth-input" required>
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

        <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label>Precio ($)</label>
            <input type="number" id="prod-price" placeholder="0.00" step="0.01" min="0" class="auth-input" style="max-width:300px;" required />
          </div>
        </div>

        <!-- Size Picker -->
        <div class="form-group" style="margin-bottom: 16px;">
          <div id="size-picker-container"></div>
        </div>
      </form>
    </div>

    <style>
      .uploader-area {
        border: 2px dashed var(--color-neutral-divider);
        border-radius: var(--radius-lg);
        padding: 24px;
        text-align: center;
        background: var(--color-bg-main);
        transition: all var(--duration-fast);
        cursor: pointer;
        min-height: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .uploader-area.dragover {
        border-color: var(--color-primary);
        background: rgba(74, 55, 40, 0.05);
      }
      .uploader-placeholder {
        color: var(--color-text-secondary);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      }
      .uploader-preview {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .preview-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-neutral-divider);
      }
      .preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .preview-item__delete {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0,0,0,0.6);
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
      }
      .preview-item__delete:hover {
        background: var(--color-error);
      }
    </style>
  `;
}

export async function initNuevoProductoPage() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const placeholder = document.getElementById('uploader-placeholder');
  const previewGrid = document.getElementById('preview-grid');
  const btnSave = document.getElementById('btn-save-product');
  const brandList = document.getElementById('brand-list');
  let allBrands = [];

  // Load dynamically processed luxury asset if navigated from Media Engine
  const tempImport = localStorage.getItem('koala_temp_media_import');
  if (tempImport) {
    uploadedImages.push(tempImport);
    localStorage.removeItem('koala_temp_media_import');
    setTimeout(() => {
      renderPreviews();
    }, 50);
  }

  // Load brands dynamically
  try {
    allBrands = await localDb.getAllBrands();
    if (brandList) {
      brandList.innerHTML = allBrands.map(b => `<option value="${b.name}">`).join('');
    }
  } catch(e) {
    console.error(e);
  }

  // Open file dialog on click
  dropArea.addEventListener('click', (e) => {
    // Avoid triggering if clicking the delete button
    if (e.target.closest('.preview-item__delete')) return;
    fileInput.click();
  });

  // Drag and drop events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
  });

  dropArea.addEventListener('drop', (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
  });

  fileInput.addEventListener('change', function() {
    handleFiles(this.files);
  });

  function handleFiles(files) {
    ([...files]).forEach(uploadFile);
  }

  async function uploadFile(file) {
    if (!file.type.startsWith('image/')) return;

    placeholder.style.display = 'none';
    previewGrid.style.display = 'grid';

    // Render an elegant luxury loading placeholder inside the preview grid
    const loadingCard = document.createElement('div');
    loadingCard.className = 'preview-item preview-item--loading';
    loadingCard.id = 'loading-placeholder-card';
    loadingCard.style.cssText = `
      position: relative;
      aspect-ratio: 4 / 5;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px dashed var(--color-accent);
      background: linear-gradient(180deg, var(--color-bg-main) 0%, var(--color-accent-light) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;
    loadingCard.innerHTML = `
      <div class="spinner" style="width: 24px; height: 24px; border: 2px solid var(--color-neutral-soft); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 1s infinite linear;"></div>
      <span style="font-size: 9px; color: var(--color-text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing:0.05em; text-align:center; padding: 0 4px;">Alineando IA...</span>
      <div style="position: absolute; left: 0; width: 100%; height: 4px; background: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); animation: scanEffect 1.5s infinite ease-in-out;"></div>
    `;
    
    // Inject scanning loader keyframe if not present
    if (!document.getElementById('loading-keyframe-style')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'loading-keyframe-style';
      styleSheet.textContent = `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes scanEffect { 0% { top: 0%; } 50% { top: 95%; } 100% { top: 0%; } }
      `;
      document.head.appendChild(styleSheet);
    }
    
    previewGrid.appendChild(loadingCard);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const placeholderEl = document.getElementById('loading-placeholder-card');
        if (placeholderEl) placeholderEl.remove();

        uploadedImages.push(e.target.result);
        renderPreviews();
      };
      reader.onerror = (err) => {
        console.error(err);
        alert('Error leyendo la imagen');
        renderPreviews();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      renderPreviews();
    }
  }

  function renderPreviews() {
    if (uploadedImages.length > 0) {
      placeholder.style.display = 'none';
      previewGrid.style.display = 'grid';
    } else {
      placeholder.style.display = 'flex';
      previewGrid.style.display = 'none';
    }

    previewGrid.innerHTML = '';
    uploadedImages.forEach((src, index) => {
      const item = document.createElement('div');
      item.className = 'preview-item animate-fade-in';
      item.style.cssText = `
        position: relative;
        aspect-ratio: 4 / 5;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-neutral-border);
        box-shadow: var(--shadow-soft);
        background: var(--color-bg-surface);
      `;
      item.innerHTML = `
        <img src="${src}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
        <span class="koala-badge" style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: rgba(77, 139, 85, 0.85); backdrop-filter: blur(4px); color: white; font-size: 8px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">
          ${icon('check-circle', 10)} KOALA SYSTEM v1 OK
        </span>
        <button class="preview-item__delete" data-index="${index}" title="Eliminar" style="position: absolute; top: 6px; right: 6px; background: rgba(43, 34, 28, 0.7); backdrop-filter: blur(4px); border: none; border-radius: 50%; width: 22px; height: 22px; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
          ${icon('x', 12)}
        </button>
      `;
      previewGrid.appendChild(item);
    });

    // Attach delete listeners
    document.querySelectorAll('.preview-item__delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent opening file dialog
        const idx = parseInt(btn.getAttribute('data-index'));
        uploadedImages.splice(idx, 1);
        renderPreviews();
      });
    });
  }

  // --- AI Auto-Categorization (uses centralized engine) ---
  const nameInput = document.getElementById('prod-name');
  const catSelect = document.getElementById('prod-category');
  const depSelect = document.getElementById('prod-dept');
  const brandInput = document.getElementById('prod-brand');

  // Initial size picker render
  function refreshSizePicker() {
    selectedSizes.length = 0;
    renderSizePicker('size-picker-container', selectedSizes, catSelect.value, depSelect.value);
  }
  refreshSizePicker();

  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      const tempProduct = { name: nameInput.value, brand: brandInput.value, category: '', department: '' };
      const suggestions = classifyProduct(tempProduct);

      if (suggestions.category && !catSelect.dataset.modified) {
        catSelect.value = suggestions.category;
        refreshSizePicker();
      }
      if (suggestions.department && !depSelect.dataset.modified) {
        depSelect.value = suggestions.department;
        refreshSizePicker();
      }
      if (suggestions.brand && !brandInput.value) {
        brandInput.value = suggestions.brand;
      }
    });
  }

  // Track manual changes and refresh size picker
  if (catSelect) catSelect.addEventListener('change', function() {
    this.dataset.modified = 'true';
    refreshSizePicker();
  });
  if (depSelect) depSelect.addEventListener('change', function() {
    this.dataset.modified = 'true';
    refreshSizePicker();
  });
  // ----------------------------------------

  // Handle Save
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = document.getElementById('prod-name').value;
      const brand = document.getElementById('prod-brand').value;
      const dept = document.getElementById('prod-dept').value;
      const category = document.getElementById('prod-category').value;
      const price = document.getElementById('prod-price').value;

      if (!name || !price) {
        alert('Por favor completa el nombre y precio del producto.');
        return;
      }

      // Generate Image
      let imageContent = '';
      if (uploadedImages.length > 0) {
        imageContent = `<img src="${uploadedImages[0]}" alt="${name}" style="width:100%; height:100%; object-fit:cover;" />`;
      } else {
        const initial = name.charAt(0).toUpperCase();
        imageContent = `<div style="font-size: 80px; font-weight: bold; color: var(--color-primary);">${initial}</div>`;
      }

      const newProduct = {
        id: 'P' + Math.floor(100 + Math.random() * 900).toString(),
        name,
        brand,
        department: dept,
        category,
        price: parseFloat(price),
        sizes: [...selectedSizes],
        status: 'active',
        image: imageContent
      };

      // AI auto-classify at save time (fills any gaps)
      const aiSuggestions = classifyProduct(newProduct);
      if (aiSuggestions.category && !newProduct.category) newProduct.category = aiSuggestions.category;
      if (aiSuggestions.department && !newProduct.department) newProduct.department = aiSuggestions.department;
      if (aiSuggestions.brand && !newProduct.brand) {
        newProduct.brand = aiSuggestions.brand;
      }

      // Auto-create brand if it's completely new
      const existingBrand = allBrands.find(b => b.name.toLowerCase() === brand.toLowerCase());
      if (!existingBrand && brand.trim() !== '') {
         localDb.saveBrand({
            id: 'B' + Date.now(),
            name: brand,
            logo: brand.substring(0, 2).toUpperCase()
         }).catch(err => console.error('Error auto-saving brand', err));
      }

      // Add to IndexedDB
      localDb.saveProduct(newProduct).then(() => {
        // Feedback
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = `${icon('check', 16)} Guardado`;
        btnSave.style.background = 'var(--color-success)';

        setTimeout(() => {
          window.location.hash = '/admin/productos';
        }, 1000);
      });
    });
  }
}
