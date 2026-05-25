/* ============================================
   KOALA — Sidebar Component
   Navigation sidebar with logo, nav items, mascot
   ============================================ */

import { icon } from '../../utils/icons.js';
import { navigationItems, footerNavItems, dashboardData } from '../../data/mockData.js';
import { readyService } from '../../utils/readyService.js';

export function renderSidebar(activeRoute = '/') {
  const navItemsHTML = navigationItems.map(item => {
    const isActive = item.path === activeRoute;
    let iconHTML = icon(item.icon, 20);
    // Bulletproof fallback for missing/cached tag icon
    if (!iconHTML && item.id === 'marcas') {
      iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>`;
    }
    const isReadyItem = item.id === 'ready';
    const badgeHTML = isReadyItem ? `<span class="ready-sidebar-dot" id="ready-sidebar-badge" style="display:none"></span>` : '';
    return `
      <a href="#${item.path}" 
         class="sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}"
         data-route="${item.path}"
         id="nav-${item.id}">
        <span class="sidebar__nav-icon">${iconHTML}</span>
        <span>${item.label}</span>
        ${badgeHTML}
      </a>
    `;
  }).join('');

  const footerItemsHTML = footerNavItems.map(item => {
    const isActive = item.path === activeRoute;
    let iconHTML = icon(item.icon, 20);
    return `
      <a href="#${item.path}" 
         class="sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}"
         data-route="${item.path}"
         id="nav-${item.id}">
        <span class="sidebar__nav-icon">${iconHTML}</span>
        <span>${item.label}</span>
      </a>
    `;
  }).join('');

  return `
    <aside class="sidebar" id="sidebar" style="display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: var(--color-bg-sidebar);">
      <!-- Logo Container (Sticky brand header) -->
      <div class="sidebar__logo" style="position: sticky; top: 0; background: var(--color-bg-sidebar); padding: 16px; display: flex; justify-content: center; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.04); flex-shrink: 0; z-index: 10;">
        <a href="#/" style="width: 100%; display: block; text-decoration: none;">
          <div style="background: #FFFFFF; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid rgba(0,0,0,0.02); transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 24px rgba(0,0,0,0.09)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)';">
            <img src="/assets/koala_logo_principal.png" alt="KOALA by JC" style="max-width: 100%; max-height: 48px; width: auto; height: auto; object-fit: contain; filter: none !important; opacity: 1 !important; display: block;" />
          </div>
        </a>
      </div>

      <!-- Scrollable content area for items & mascot -->
      <div class="sidebar__scrollable" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; justify-content: space-between; padding: 12px 10px;">
        <div>
          <!-- Main Navigation -->
          <nav class="sidebar__nav" aria-label="Navegación principal" style="padding: 0; display: flex; flex-direction: column; gap: 4px;">
            <div class="sidebar__nav-section" style="margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px;">
              ${navItemsHTML}
            </div>
            
            <!-- Divider -->
            <div class="sidebar__divider" style="margin: 8px 6px; height: 1px; background-color: rgba(255, 255, 255, 0.05);"></div>

            <!-- Footer Navigation -->
            <div class="sidebar__footer-nav" style="display: flex; flex-direction: column; gap: 4px;">
              ${footerItemsHTML}
            </div>
          </nav>
        </div>

        <!-- Mascot Card (Koala AI) placed beautifully at bottom of scroll flow -->
        <div class="sidebar__mascot" id="sidebar-mascot" style="background: linear-gradient(135deg, rgba(198, 162, 122, 0.08), rgba(198, 162, 122, 0.02)); border: 1px solid rgba(198, 162, 122, 0.12); padding: 14px; border-radius: 12px; margin: 16px 4px 4px 4px; flex-shrink: 0; transition: all 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div class="mascot-badge" style="width: 32px; height: 32px; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); position: relative; overflow: hidden;">
              <span style="font-size: 16px; z-index: 2; transform: scale(1); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)';" onmouseout="this.style.transform='scale(1)';">🐨</span>
              <div style="position: absolute; top:-50%; left:-50%; width:200%; height:200%; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent); transform: rotate(45deg); animation: pulseGlow 3s infinite;"></div>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 12px; color: white; letter-spacing: 0.5px;">KOALA AI</div>
              <div style="font-size: 9px; color: var(--color-accent); font-weight: 600; text-transform: uppercase;">Activo & Aprendiendo</div>
            </div>
          </div>
          <p style="font-size: 11px; color: rgba(255,255,255,0.55); line-height: 1.4; margin: 0 0 10px 0;">
            Analizando inventario y ventas para sugerencias inteligentes.
          </p>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 5px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; position: relative;">
              <div style="width: 85%; height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); border-radius: 4px; position: relative; overflow: hidden;">
                <div style="position: absolute; top:0; left:-100%; width:100%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: progressGlow 2s infinite;"></div>
              </div>
            </div>
            <span style="font-size: 10px; color: var(--color-accent); font-weight: 700; letter-spacing: 0.5px;">85%</span>
          </div>
        </div>
      </div>
    </aside>
  `;
}

export function updateSidebarActiveState(route) {
  const allItems = document.querySelectorAll('.sidebar__nav-item');
  allItems.forEach(item => {
    const itemRoute = item.getAttribute('data-route');
    if (itemRoute === route) {
      item.classList.add('sidebar__nav-item--active');
    } else {
      item.classList.remove('sidebar__nav-item--active');
    }
  });
}

export function initSidebarMobile() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const hamburger = document.getElementById('hamburger-btn');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar--open');
      overlay.classList.toggle('sidebar-overlay--visible');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('sidebar--open');
      overlay.classList.remove('sidebar-overlay--visible');
    });
  }

  /* Close sidebar on nav click (mobile) */
  const navItems = document.querySelectorAll('.sidebar__nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        sidebar.classList.remove('sidebar--open');
        overlay.classList.remove('sidebar-overlay--visible');
      }
    });
  });

  // Initialize KOALA READY badge
  try {
    readyService.getReadyCount().then(count => {
      const badge = document.getElementById('ready-sidebar-badge');
      if (badge) badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
    readyService.subscribe(count => {
      const badge = document.getElementById('ready-sidebar-badge');
      if (badge) badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
  } catch (e) {
    console.warn('Error initializing ready sidebar badge:', e);
  }
}
