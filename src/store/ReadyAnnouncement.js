/* ============================================
   KOALA READY — Announcement System
   Floating toasts & top banners for drop notification
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { readyService } from '../utils/readyService.js';

let activeElements = {
  toast: null,
  banner: null
};

export async function initAnnouncements() {
  // Listen for changes (e.g., if a product is sold out)
  readyService.subscribe(async () => {
    await updateAnnouncementsVisibility();
  });

  // Initial trigger
  await updateAnnouncementsVisibility();
}

async function updateAnnouncementsVisibility() {
  const announcement = await readyService.getAnnouncement();

  // If no announcement or it's not active anymore, clear UI
  if (!announcement) {
    destroyAnnouncements();
    return;
  }

  // Double check if the product still exists and is active
  const products = await localDb.getAllReadyProducts();
  const prodExists = products.some(p => p.id === announcement.productId && p.readyStatus === 'active');
  
  if (!prodExists) {
    destroyAnnouncements();
    localDb.clearAnnouncement();
    return;
  }

  // Render based on type
  if (announcement.type === 'toast') {
    destroyBanner();
    renderToast(announcement);
  } else if (announcement.type === 'banner') {
    destroyToast();
    renderBanner(announcement);
  }
}

function renderToast(announcement) {
  // Only show toast once per session
  if (sessionStorage.getItem(`koala_toast_shown_${announcement.productId}`)) {
    return;
  }

  // Avoid duplicate rendering
  if (document.getElementById('ready-toast')) return;

  const hasImg = announcement.productImage && announcement.productImage.length > 10;
  let thumbHtml = '';
  
  if (hasImg) {
    if (announcement.productImage.trim().startsWith('<img')) {
      // Si ya es un tag img completo, lo envolvemos en un contenedor y limpiamos sus estilos inline rígidos
      thumbHtml = `<div style="width:40px; height:40px; border-radius:4px; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        ${announcement.productImage.replace(/style="[^"]*"/g, 'style="width:100%; height:100%; object-fit:cover;"')}
      </div>`;
    } else {
      thumbHtml = `<img src="${announcement.productImage}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" />`;
    }
  } else {
    thumbHtml = `<div style="width:40px; height:40px; border-radius:4px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.1); font-size:20px;">${announcement.productImage || '⚡'}</div>`;
  }

  const toastHTML = `
    <div class="ready-toast" id="ready-toast">
      <div class="ready-toast__icon">⚡</div>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
        ${thumbHtml}
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--color-accent); text-transform:uppercase; letter-spacing:0.5px;">${announcement.productBrand || 'KOALA READY'}</div>
          <div class="ready-toast__title" style="margin:0; font-size:13px; line-height:1.2; font-weight:600;">${announcement.productName}</div>
        </div>
      </div>
      <div class="ready-toast__content">
        <p style="margin:0 0 10px 0; font-size:12px; opacity:0.85; line-height:1.4;">${announcement.text}</p>
        <div class="ready-toast__actions">
          <button class="ready-toast__btn ready-toast__btn--primary" id="btn-toast-view">Ver Item</button>
          <button class="ready-toast__btn ready-toast__btn--dismiss" id="btn-toast-dismiss">Descartar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', toastHTML);
  const toast = document.getElementById('ready-toast');
  activeElements.toast = toast;

  // Slide in with delay
  setTimeout(() => {
    if (toast) toast.classList.add('ready-toast--visible');
  }, 2000);

  // Auto dismiss after 10s
  const autoDismissTimer = setTimeout(() => {
    dismissToast();
  }, 10000);

  // Event handlers
  const viewBtn = document.getElementById('btn-toast-view');
  const dismissBtn = document.getElementById('btn-toast-dismiss');

  if (viewBtn) {
    viewBtn.onclick = () => {
      clearTimeout(autoDismissTimer);
      dismissToast();
      window.location.hash = `/ready`;
    };
  }

  if (dismissBtn) {
    dismissBtn.onclick = () => {
      clearTimeout(autoDismissTimer);
      dismissToast();
    };
  }

  function dismissToast() {
    if (toast) {
      toast.classList.remove('ready-toast--visible');
      sessionStorage.setItem(`koala_toast_shown_${announcement.productId}`, 'true');
      setTimeout(() => {
        if (toast) toast.remove();
        activeElements.toast = null;
      }, 500);
    }
  }
}

function renderBanner(announcement) {
  // Avoid duplicate rendering
  if (document.getElementById('ready-banner')) return;

  const bannerHTML = `
    <div class="ready-banner" id="ready-banner">
      <span>⚡ <strong>${announcement.productBrand || 'KOALA'}:</strong> ${announcement.text}</span>
      <span class="ready-banner__link" id="btn-banner-view">Ver stock hoy</span>
      <button class="ready-banner__close" id="btn-banner-close" aria-label="Cerrar">&times;</button>
    </div>
  `;

  // We want to insert this banner right below the store navbar
  const navbar = document.querySelector('.store-navbar');
  if (navbar) {
    navbar.insertAdjacentHTML('afterend', bannerHTML);
  } else {
    // Fallback: at top of main container or body
    const main = document.querySelector('.store-main') || document.body;
    main.insertAdjacentHTML('afterbegin', bannerHTML);
  }

  const banner = document.getElementById('ready-banner');
  activeElements.banner = banner;

  // Adjust page content top margin slightly to accommodate banner if needed (handled beautifully by layout margins, or can let it flow naturally in flex column)

  const viewLink = document.getElementById('btn-banner-view');
  const closeBtn = document.getElementById('btn-banner-close');

  if (viewLink) {
    viewLink.onclick = () => {
      window.location.hash = `/ready`;
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      destroyBanner();
    };
  }
}

function destroyToast() {
  const toast = document.getElementById('ready-toast') || activeElements.toast;
  if (toast) {
    toast.remove();
    activeElements.toast = null;
  }
}

function destroyBanner() {
  const banner = document.getElementById('ready-banner') || activeElements.banner;
  if (banner) {
    banner.remove();
    activeElements.banner = null;
  }
}

function destroyAnnouncements() {
  destroyToast();
  destroyBanner();
}
