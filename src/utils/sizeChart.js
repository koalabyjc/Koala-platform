/* ============================================
   KOALA — Size Chart System
   US-based size tables for shoes and clothing.
   Used by Admin (product creation/editing) and 
   Store (customer selection).
   ============================================ */

export const SIZE_CHARTS = {
  'Tenis y Zapatos': {
    'Hombre': ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'],
    'Mujer': ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '11'],
    'Niños': ['1Y', '1.5Y', '2Y', '2.5Y', '3Y', '3.5Y', '4Y', '4.5Y', '5Y', '5.5Y', '6Y', '6.5Y', '7Y'],
    'Unisex': ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13']
  },
  'Pantalones': {
    'Hombre': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'Mujer': ['0', '2', '4', '6', '8', '10', '12', '14', '16', 'XS', 'S', 'M', 'L', 'XL'],
    'Niños': ['2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14', '16'],
    'Unisex': ['XS', 'S', 'M', 'L', 'XL', '2XL']
  },
  'Ropa Superior': {
    'Hombre': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    'Mujer': ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    'Niños': ['2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14', '16'],
    'Unisex': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  'Gorras': {
    'Unisex': ['OSFA (Única)', '7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4', '7 7/8', '8'],
    'Hombre': ['OSFA (Única)', '7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4', '7 7/8', '8'],
    'Mujer': ['OSFA (Única)']
  },
  'Sortijas': {
    'Unisex': ['4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
    'Hombre': ['7', '8', '9', '10', '11', '12', '13', '14'],
    'Mujer': ['4', '5', '6', '7', '8', '9', '10']
  },
  'Splash': {
    'Unisex': ['2 oz', '4 oz', '8 oz'],
    'Mujer': ['2 oz', '4 oz', '8 oz'],
    'Hombre': ['2 oz', '4 oz', '8 oz']
  },
  'Medias': {
    'Unisex': ['S', 'M', 'L', 'XL', 'Única'],
    'Hombre': ['S', 'M', 'L', 'XL', 'Única'],
    'Mujer': ['S', 'M', 'L', 'Única']
  }
};

// Categories that don't use sizes (one-size or N/A)
const NO_SIZE_CATEGORIES = ['Gafas', 'Carteras', 'Relojes', 'Accesorios', 'Prendas - Collares', 'Prendas - Pantallas', 'Prendas - Pulseras', 'Prendas - Cadenas'];

/**
 * Get available sizes for a category + department combo.
 * Returns null if the category doesn't use sizes.
 */
export function getSizesFor(category, department) {
  if (NO_SIZE_CATEGORIES.includes(category)) return null;
  
  let chartKey = null;
  if (category === 'Tenis y Zapatos') chartKey = 'Tenis y Zapatos';
  else if (category.includes('Pantalones')) chartKey = 'Pantalones';
  else if (category.includes('Ropa -')) chartKey = 'Ropa Superior';
  else if (category === 'Gorras') chartKey = 'Gorras';
  else if (category === 'Prendas - Sortijas') chartKey = 'Sortijas';
  else if (category === 'Splash') chartKey = 'Splash';
  else if (category === 'Medias') chartKey = 'Medias';

  if (!chartKey) return null;
  
  const chart = SIZE_CHARTS[chartKey];
  if (!chart) return null;
  
  return chart[department] || chart['Unisex'] || null;
}

/**
 * Render a size picker grid (checkboxes).
 * containerId: the DOM id to inject into
 * selectedSizes: array of already-selected sizes
 * category: product category
 * department: product department
 */
export function renderSizePicker(containerId, selectedSizes = [], category, department) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sizes = getSizesFor(category, department);

  if (!sizes) {
    container.innerHTML = `<div style="font-size:13px; color:var(--color-text-muted); padding:12px 0;">Este tipo de artículo no requiere tallas.</div>`;
    return;
  }

  const allSelected = sizes.every(s => selectedSizes.includes(s));

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
      <label style="font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
        Tallas Disponibles (US)
      </label>
      <button type="button" class="size-select-all-btn" style="
        font-size:11px; padding:3px 12px; border-radius:4px; border:1px solid var(--color-primary);
        background:${allSelected ? 'var(--color-primary)' : 'transparent'};
        color:${allSelected ? '#fff' : 'var(--color-primary)'};
        cursor:pointer; font-weight:600; transition:all 0.2s;
      ">
        ${allSelected ? '✓ Todas' : 'Elegir Todas'}
      </button>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      ${sizes.map(size => {
        const isActive = selectedSizes.includes(size);
        return `
          <button type="button" class="size-chip" data-size="${size}" style="
            min-width:44px; padding:8px 12px; border-radius:8px; font-size:13px; font-weight:600;
            cursor:pointer; transition:all 0.15s; text-align:center;
            border:1.5px solid ${isActive ? 'var(--color-primary)' : 'var(--color-neutral-border)'};
            background:${isActive ? 'var(--color-primary)' : 'var(--color-bg-surface)'};
            color:${isActive ? '#fff' : 'var(--color-text-main)'};
          ">${size}</button>
        `;
      }).join('')}
    </div>
  `;

  // Bind chip clicks
  container.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const size = chip.getAttribute('data-size');
      const idx = selectedSizes.indexOf(size);
      if (idx > -1) {
        selectedSizes.splice(idx, 1);
      } else {
        selectedSizes.push(size);
      }
      renderSizePicker(containerId, selectedSizes, category, department);
    });
  });

  // Bind Select All
  const selectAllBtn = container.querySelector('.size-select-all-btn');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      if (allSelected) {
        selectedSizes.length = 0; // Clear all
      } else {
        selectedSizes.length = 0;
        sizes.forEach(s => selectedSizes.push(s));
      }
      renderSizePicker(containerId, selectedSizes, category, department);
    });
  }
}

/**
 * Render a size selector for the CLIENT side (radio-style, pick one).
 */
export function renderStoreSizePicker(containerId, availableSizes = [], onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!availableSizes || availableSizes.length === 0) {
    container.innerHTML = `<div style="font-size:13px; color:var(--color-text-muted);">Talla única</div>`;
    return;
  }

  container.innerHTML = `
    <label style="display:block; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; color:var(--color-text-secondary);">
      Selecciona tu talla (US)
    </label>
    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      ${availableSizes.map(size => `
        <button type="button" class="store-size-chip" data-size="${size}" style="
          min-width:48px; padding:10px 14px; border-radius:8px; font-size:14px; font-weight:600;
          cursor:pointer; transition:all 0.15s; text-align:center;
          border:1.5px solid var(--color-neutral-border);
          background:var(--color-bg-surface);
          color:var(--color-text-main);
        ">${size}</button>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.store-size-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      // Deselect all
      container.querySelectorAll('.store-size-chip').forEach(c => {
        c.style.border = '1.5px solid var(--color-neutral-border)';
        c.style.background = 'var(--color-bg-surface)';
        c.style.color = 'var(--color-text-main)';
      });
      // Select this one
      chip.style.border = '1.5px solid var(--color-primary)';
      chip.style.background = 'var(--color-primary)';
      chip.style.color = '#fff';

      if (typeof onSelect === 'function') {
        onSelect(chip.getAttribute('data-size'));
      }
    });
  });
}
