/* ==========================================================================
   KOALA — Universal AI Product Normalization System UI Page
   Vibrant, minimal and highly interactive image pipeline admin panel.
   Strict Separation of Concerns (SoC) — Presentational Layer.
   ========================================================================== */

import { icon } from '../utils/icons.js';
import { validateImage, processImage } from '../utils/mediaEngine.js';

let activeFile = null;
let validationReport = null;
let processingResult = null;

// Default values matching KOALA Visual System v1
let activeBgColor = '#FAF7F3'; 
let activePadding = 10;
let activeShadowOpacity = 15;
let activeAutoBG = true;

export function renderMediaEnginePage() {
  return `
    <div class="module-page animate-fade-in">
      <!-- Page Title Header -->
      <div class="module-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="module-header__title" style="font-family: var(--font-display); font-weight: var(--weight-bold); font-size: var(--text-3xl); color: var(--color-text-primary); margin: 0 0 6px 0;">Universal AI Studio</h1>
          <p class="module-header__subtitle" style="font-family: var(--font-body); color: var(--color-text-secondary); font-size: var(--text-sm); margin: 0;">Aislamiento IA y Normalización Premium (0% Distorsión de Color)</p>
        </div>
        <div class="module-toolbar">
          <button id="btn-reset-engine" class="btn btn--secondary" style="display: none;">
            ${icon('rotate-ccw', 14)} Cargar Nueva Imagen
          </button>
          <button id="btn-save-as-product" class="btn btn--primary" style="display: none;">
            ${icon('plus', 16)} Crear Producto con esta Foto
          </button>
        </div>
      </div>

      <!-- Main Responsive Grid -->
      <div class="media-dashboard">
        
        <!-- Left Side: Interactive Processing Area / Canvas Visualizer -->
        <div class="media-canvas-card" id="canvas-card-viewport">
          
          <!-- Dropzone state -->
          <div class="luxury-dropzone animate-fade-in" id="drag-drop-zone">
            <input type="file" id="media-file-input" accept="image/*" style="display: none;" />
            <div class="luxury-dropzone__icon">
              ${icon('upload-cloud', 32)}
            </div>
            <h3 style="font-family: var(--font-display); font-size: 18px; margin: 0; color: var(--color-text-primary);"> Universal Media Uploader </h3>
            <p style="font-family: var(--font-body); font-size: 12px; color: var(--color-text-secondary); text-align: center; max-width: 320px; line-height: 1.5; margin: 0;">
              Sube sneakers, ropa, carteras, joyería, lo que sea. La IA recortará el fondo perfectamente respetando el color real.
            </p>
            <span style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Soporta JPG, PNG, WEBP (Hasta 10MB)</span>
          </div>

          <!-- Processing Stage -->
          <div class="processing-container animate-fade-in" id="processing-view" style="display: none;">
            <div class="processing-visual">
              <div class="scanner-line"></div>
              <img id="processing-temp-img" src="" alt="Processing..." />
            </div>
            
            <h4 id="processing-stage-title" style="margin: 0; font-family: var(--font-body); font-size: 14px; font-weight: 700; color: var(--color-text-primary);">Analizando Producto...</h4>
            
            <div class="pipeline-stages">
              <div class="stage-item stage-item--pending" id="stage-analyzing">
                <div class="stage-dot"></div>
                <span class="stage-label">Validando Calidad de Imagen</span>
              </div>
              <div class="stage-item stage-item--pending" id="stage-bg">
                <div class="stage-dot"></div>
                <span class="stage-label">AI Silhouette Extraction Engine (WASM)</span>
              </div>
              <div class="stage-item stage-item--pending" id="stage-lighting">
                <div class="stage-dot"></div>
                <span class="stage-label">Smart Centering & Shadow Floor</span>
              </div>
              <div class="stage-item stage-item--pending" id="stage-comp">
                <div class="stage-dot"></div>
                <span class="stage-label">Optimización Universal WebP</span>
              </div>
            </div>
          </div>

          <!-- Interactive Before / After Split Slider Visualizer -->
          <div class="compare-slider-container" id="compare-visualizer" style="display: none;">
            <div class="safe-zone-overlay">
              <span class="safe-zone-label" id="safe-zone-label-text">Margen Seguro 10%</span>
            </div>
            
            <!-- Before Image (Left under clip-path) -->
            <img id="img-compare-before" class="compare-image compare-image--before" src="" alt="Original Image" />
            <span class="compare-badge compare-badge--before">Original</span>

            <!-- After Image (Right clipped dynamically) -->
            <img id="img-compare-after" class="compare-image compare-image--after" src="" alt="Processed Image" />
            <span class="compare-badge compare-badge--after">Luxury WebP</span>
            
            <!-- Split drag bar -->
            <div class="compare-handle" id="compare-drag-bar">
              <div class="compare-handle__circle">
                ${icon('chevrons-left-right', 12)}
              </div>
            </div>
          </div>

        </div>

        <!-- Right Side: Luxury AI Suggestion & Manual Override Controllers -->
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          
          <!-- Quality Analysis log card -->
          <div class="card" id="validation-report-card" style="display: none; padding: var(--space-5);">
            <div class="validation-card">
              <div class="validation-header">
                ${icon('check-circle', 16)} Diagnóstico de Calidad
              </div>
              
              <div id="validation-warnings-container">
                <!-- Warnings injected dynamically -->
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: var(--space-3);">
                <div style="background: var(--color-bg-elevated); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-neutral-border);">
                  <div style="font-size: 9px; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase;">Compresión WebP</div>
                  <div id="metric-reduction" style="font-size: 14px; font-weight: 700; color: var(--color-success); margin-top: 2px;">-94%</div>
                </div>
                <div style="background: var(--color-bg-elevated); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-neutral-border);">
                  <div style="font-size: 9px; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase;">Velocidad IA</div>
                  <div id="metric-speed" style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin-top: 2px;">118ms</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive adjustment controls -->
          <div class="card" style="padding: var(--space-5);">
            <h3 style="font-family: var(--font-display); font-size: 16px; margin: 0 0 16px 0; color: var(--color-text-primary); border-bottom: 1px solid var(--color-neutral-divider); padding-bottom: 10px;">
              Ajustes Universales KOALA
            </h3>
            
            <div class="param-controls-grid">
              
              <!-- Background Replacement Selection -->
              <div class="param-slider-group">
                <span class="param-slider-header">Fondo Oficial Neutral</span>
                <div class="color-option-grid" id="bg-color-selector">
                  <button class="color-circle-btn active" data-color="#FAF7F3" style="background: #FAF7F3;" title="Warm Alabaster">
                    <span style="font-size: 9px; color: var(--color-text-primary); font-weight: 700;">#FAF</span>
                  </button>
                  <button class="color-circle-btn" data-color="#F5EFE8" style="background: #F5EFE8;" title="Warm Canvas">
                    <span style="font-size: 9px; color: var(--color-text-primary); font-weight: 700;">#F5E</span>
                  </button>
                  <button class="color-circle-btn" data-color="#FFFFFF" style="background: #FFFFFF;" title="Pure Light">
                    <span style="font-size: 9px; color: var(--color-text-primary); font-weight: 700;">#FFF</span>
                  </button>
                  <button class="color-circle-btn" data-color="#1E1712" style="background: #1E1712;" title="Obsidian Soil">
                    <span style="font-size: 9px; color: #fff; font-weight: 700;">#1E1</span>
                  </button>
                </div>
              </div>

              <!-- Padding Slider -->
              <div class="param-slider-group">
                <div class="param-slider-header">
                  <span>Padding de Seguridad</span>
                  <span id="label-padding">10%</span>
                </div>
                <input type="range" id="slider-padding" class="param-slider" min="0" max="35" value="10" />
              </div>

              <!-- Shadow Opacity Slider -->
              <div class="param-slider-group">
                <div class="param-slider-header">
                  <span>Sombra de Contacto (Piso)</span>
                  <span id="label-shadow">15%</span>
                </div>
                <input type="range" id="slider-shadow" class="param-slider" min="0" max="40" value="15" />
              </div>

              <!-- INFO ALERT: Color lock -->
              <div style="margin-top: 10px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px;">
                <div style="font-size: 11px; font-weight: 600; color: #3b82f6; display: flex; align-items: center; gap: 6px;">
                  ${icon('lock', 12)} Fidelidad de Color Asegurada
                </div>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: var(--color-text-secondary); line-height: 1.4;">
                  KOALA preserva automáticamente el 100% de los colores y texturas originales del producto.
                </p>
              </div>

              <!-- Bounding Box toggle -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--color-neutral-divider);">
                <span style="font-size: 12px; font-weight: 600; color: var(--color-text-secondary);">Recorte IA de Fondo</span>
                <label class="switch-container" style="position: relative; display: inline-block; width: 36px; height: 20px;">
                  <input type="checkbox" id="toggle-autobg" style="opacity: 0; width: 0; height: 0;" checked />
                  <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-neutral-soft); transition: .4s; border-radius: 20px;"></span>
                </label>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Toggle switch styles -->
    <style>
      .switch-container input:checked + .slider-round {
        background-color: var(--color-success);
      }
      .slider-round:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      .switch-container input:checked + .slider-round:before {
        transform: translateX(16px);
      }
    </style>
  `;
}

export function initMediaEnginePage() {
  const dropzone = document.getElementById('drag-drop-zone');
  const fileInput = document.getElementById('media-file-input');
  
  if (!dropzone) return;

  // Open file dialog on dropzone click
  dropzone.addEventListener('click', () => fileInput.click());

  // Bind drag & drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      loadAndProcessFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      loadAndProcessFile(fileInput.files[0]);
    }
  });

  // Slider adjustments event listeners
  setupParamSliders();

  // Reset engine button
  const btnReset = document.getElementById('btn-reset-engine');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      activeFile = null;
      validationReport = null;
      processingResult = null;
      
      document.getElementById('drag-drop-zone').style.display = 'flex';
      document.getElementById('processing-view').style.display = 'none';
      document.getElementById('compare-visualizer').style.display = 'none';
      document.getElementById('validation-report-card').style.display = 'none';
      
      btnReset.style.display = 'none';
      document.getElementById('btn-save-as-product').style.display = 'none';
      fileInput.value = '';
    });
  }

  // Create Product button handler
  const btnSave = document.getElementById('btn-save-as-product');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      if (!processingResult) return;
      
      // Store processed luxury image in localStorage temporarily to pass to the creation form
      localStorage.setItem('koala_temp_media_import', processingResult.resultBase64);
      
      // Navigate directly to create product
      window.location.hash = '/admin/productos/nuevo';
    });
  }
}

/**
 * Validates the file first, triggers luxury pipeline states,
 * and outputs the interactive Split Slider with before/after graphics.
 */
async function loadAndProcessFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
    return;
  }

  activeFile = file;
  
  const dropzone = document.getElementById('drag-drop-zone');
  const procView = document.getElementById('processing-view');
  const tempImg = document.getElementById('processing-temp-img');
  
  // Show raw temp image preview inside scanner
  const reader = new FileReader();
  reader.onload = (e) => {
    tempImg.src = e.target.result;
  };
  reader.readAsDataURL(file);

  dropzone.style.display = 'none';
  procView.style.display = 'flex';

  // Quality Validation Pass
  try {
    const report = await validateImage(file);
    validationReport = report;
    
    // Animate stage status step by step
    setStageState('stage-analyzing', 'active');
    
    // Trigger Image Pipeline and listen to progress
    const onProgress = (step, pct) => {
      if (step === 'background_removal') {
         setStageState('stage-analyzing', 'complete');
         setStageState('stage-bg', 'active');
         document.getElementById('processing-stage-title').textContent = 'Descargando Motor de IA (La primera vez demora unos segundos)...';
      }
      if (step.startsWith('background_removal_model')) {
         document.getElementById('processing-stage-title').textContent = `Recortando fondo con IA (${Math.round(pct)}%)...`;
      }
      if (step === 'centering') {
         setStageState('stage-bg', 'complete');
         setStageState('stage-lighting', 'active');
         document.getElementById('processing-stage-title').textContent = 'Alineando Producto...';
      }
      if (step === 'compression') {
         setStageState('stage-lighting', 'complete');
         setStageState('stage-comp', 'active');
         document.getElementById('processing-stage-title').textContent = 'Optimizando formato WEBP...';
      }
    };
    
    // Execute luxury automated render
    await triggerImagePipeline(onProgress);
    
    setStageState('stage-comp', 'complete');
    document.getElementById('processing-stage-title').textContent = '¡Listo!';
    await waitMs(300);

    // Swap to Split Compare Screen!
    procView.style.display = 'none';
    
    const compVisualizer = document.getElementById('compare-visualizer');
    compVisualizer.style.display = 'block';
    
    document.getElementById('img-compare-before').src = processingResult.originalBase64;
    
    const afterImg = document.getElementById('img-compare-after');
    afterImg.src = processingResult.resultBase64;
    
    // Show validation & action headers
    document.getElementById('validation-report-card').style.display = 'block';
    document.getElementById('btn-reset-engine').style.display = 'flex';
    document.getElementById('btn-save-as-product').style.display = 'flex';
    
    // Populate validation DOM
    populateQualityReport();
    
    // Start interactive compare slider drag events
    initCompareSliderDrag();

  } catch (err) {
    console.error(err);
    alert('Ocurrió un error en el pipeline IA: ' + err.message);
    dropzone.style.display = 'flex';
    procView.style.display = 'none';
  }
}

function setStageState(id, state) {
  const el = document.getElementById(id);
  if (!el) return;
  
  el.className = 'stage-item';
  if (state === 'active') el.classList.add('stage-item--active');
  if (state === 'complete') el.classList.add('stage-item--complete');
  if (state === 'pending') el.classList.add('stage-item--pending');
}

/**
 * Triggers the core processImage with current parameters and saves to processingResult
 */
async function triggerImagePipeline(onProgress = null) {
  if (!activeFile) return;

  const result = await processImage(activeFile, {
    bgColor: activeBgColor,
    padding: activePadding / 100,
    shadowOpacity: activeShadowOpacity / 100,
    autoBackgroundRemoval: activeAutoBG
  }, onProgress);

  processingResult = result;
}

/**
 * Populate dynamic warning items and compression metric badges in the report card
 */
function populateQualityReport() {
  const warnContainer = document.getElementById('validation-warnings-container');
  if (!warnContainer) return;

  warnContainer.innerHTML = '';
  
  if (validationReport && validationReport.warnings && validationReport.warnings.length > 0) {
    validationReport.warnings.forEach(warning => {
      const item = document.createElement('div');
      item.className = 'warning-item';
      item.innerHTML = `
        ${icon('alert-triangle', 14)}
        <span>${warning}</span>
      `;
      warnContainer.appendChild(item);
    });
  } else {
    // Beautiful clean validation state
    warnContainer.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center; padding: 10px; background: var(--color-success-bg); color: var(--color-success); border-radius: var(--radius-sm); font-size: 11px;">
        ${icon('check', 14)}
        <span>Fidelidad preservada al 100%. Color intacto.</span>
      </div>
    `;
  }

  // Update speed & file size reduction metrics
  const reductionMetric = document.getElementById('metric-reduction');
  const speedMetric = document.getElementById('metric-speed');

  if (processingResult && validationReport) {
    const origSizeKB = validationReport.sizeBytes / 1024;
    const finalSizeKB = processingResult.processedSize / 1024;
    const diffPct = Math.round(((origSizeKB - finalSizeKB) / origSizeKB) * 100);

    reductionMetric.innerHTML = `-${diffPct}% <span style="font-size:10px; font-weight:500; color:var(--color-text-secondary);">${Math.round(finalSizeKB)}KB</span>`;
    speedMetric.textContent = `${processingResult.executionTimeMs}ms`;
  }
}

/**
 * Binds sliders change events to dynamically re-trigger processing
 */
function setupParamSliders() {
  const bgSelector = document.getElementById('bg-color-selector');
  const sPadding = document.getElementById('slider-padding');
  const sShadow = document.getElementById('slider-shadow');
  const toggleBG = document.getElementById('toggle-autobg');

  const reprocess = async () => {
    if (!activeFile) return;
    try {
      await triggerImagePipeline();
      // Update interactive output base64
      document.getElementById('img-compare-after').src = processingResult.resultBase64;
      populateQualityReport();
    } catch (e) { console.error('Reprocess failed', e); }
  };

  // Background switches
  if (bgSelector) {
    bgSelector.querySelectorAll('.color-circle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        bgSelector.querySelectorAll('.color-circle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeBgColor = btn.getAttribute('data-color');
        reprocess();
      });
    });
  }

  // Sliders
  if (sPadding) {
    sPadding.addEventListener('input', () => {
      activePadding = parseInt(sPadding.value);
      document.getElementById('label-padding').textContent = `${activePadding}%`;
      const txt = document.getElementById('safe-zone-label-text');
      if (txt) txt.textContent = `Margen Seguro ${activePadding}%`;
    });
    sPadding.addEventListener('change', reprocess);
  }

  if (sShadow) {
    sShadow.addEventListener('input', () => {
      activeShadowOpacity = parseInt(sShadow.value);
      document.getElementById('label-shadow').textContent = `${activeShadowOpacity}%`;
    });
    sShadow.addEventListener('change', reprocess);
  }

  if (toggleBG) {
    toggleBG.addEventListener('change', () => {
      activeAutoBG = toggleBG.checked;
      reprocess();
    });
  }
}

/**
 * Premium native split slider controller.
 * Enables dragging with mouse or touch to slice Before and After.
 */
function initCompareSliderDrag() {
  const container = document.getElementById('compare-visualizer');
  const dragBar = document.getElementById('compare-drag-bar');
  const imgAfter = document.getElementById('img-compare-after');
  
  if (!container || !dragBar || !imgAfter) return;

  let isDragging = false;

  const onDrag = (xCoord) => {
    const rect = container.getBoundingClientRect();
    let posX = xCoord - rect.left;
    
    // Constraint bounds
    if (posX < 0) posX = 0;
    if (posX > rect.width) posX = rect.width;
    
    const pct = (posX / rect.width) * 100;
    
    // Shift split drag bar
    dragBar.style.left = `${pct}%`;
    
    // Slice After image clip-path (reveals Before underneath)
    imgAfter.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
  };

  // Mouse events
  dragBar.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    onDrag(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch support for premium mobile UX
  dragBar.addEventListener('touchstart', (e) => {
    isDragging = true;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      onDrag(e.touches[0].clientX);
    }
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Set default middle split
  dragBar.style.left = '50%';
  imgAfter.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)';
}

function waitMs(ms) {
  return new Promise(r => setTimeout(r, ms));
}
