/* ============================================
   KOALA — Topbar Component
   Header with greeting, CTA, notifications, profile
   ============================================ */

import { icon } from '../../utils/icons.js';
import { dashboardData } from '../../data/mockData.js';
import { authService } from '../../utils/authService.js';
import { localDb } from '../../utils/localDb.js';
import { formatRelativeTime } from '../../utils/formatters.js';

export function renderTopbar() {
  const { user } = dashboardData;
  const initials = user.name.charAt(0).toUpperCase();

  return `
    <header class="topbar" id="topbar">
      <!-- Mobile hamburger -->
      <button class="topbar__hamburger" id="hamburger-btn" aria-label="Abrir menú">
        ${icon('menu', 24)}
      </button>

      <!-- Left: Greeting -->
      <div class="topbar__left">
        <h1 class="topbar__greeting">¡Hola, ${user.name}! 👋</h1>
        <p class="topbar__subtitle">Aquí tienes el panorama de tu negocio hoy.</p>
      </div>

      <!-- Right: Actions -->
      <div class="topbar__right">
        <!-- New Entry CTA -->
        <button class="topbar__cta" id="btn-new-entry">
          <span class="topbar__cta-icon">${icon('plus', 16)}</span>
          <span>Nueva entrada</span>
        </button>

        <!-- Notifications -->
        <div class="action-menu" style="position:relative;">
          <button class="topbar__notification" id="btn-notifications" aria-label="Notificaciones">
            <span class="topbar__notification-icon">${icon('bell', 20)}</span>
            <span class="topbar__notification-badge" id="notification-badge" style="display:none;">0</span>
          </button>
          
          <div class="notif-panel" id="notifications-dropdown">
            <div class="notif-panel__header">
              <h3 class="notif-panel__title">${icon('bell', 16)} Notificaciones</h3>
            </div>
            <div class="notif-panel__list" id="notifications-list">
              <div class="notif-panel__empty">Cargando...</div>
            </div>
          </div>
        </div>

        <!-- Profile -->
        <div class="topbar__profile" id="btn-profile" title="Cerrar sesión" style="cursor: pointer;">
          <div class="topbar__avatar">
            ${initials}
          </div>
          <div class="topbar__profile-info">
            <span class="topbar__profile-name">${user.name}</span>
            <span class="topbar__profile-role">${user.role}</span>
          </div>
          <span class="topbar__profile-chevron">${icon('log-out', 16)}</span>
        </div>
      </div>
    </header>
  `;
}

export async function initTopbar() {
  const ctaBtn = document.getElementById('btn-new-entry');
  const notificationsBtn = document.getElementById('btn-notifications');
  const profileBtn = document.getElementById('btn-profile');
  const notifDropdown = document.getElementById('notifications-dropdown');
  const notifBadge = document.getElementById('notification-badge');
  const notifList = document.getElementById('notifications-list');

  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      window.location.hash = '/admin/productos/nuevo';
    });
  }

  if (notificationsBtn && notifDropdown) {
    // Load notifications
    try {
      const allNotifs = await localDb.getAllNotifications();
      const unreadCount = allNotifs.filter(n => !n.read).length;
      
      if (unreadCount > 0) {
        notifBadge.style.display = 'flex';
        notifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      } else {
        notifBadge.style.display = 'none';
      }

      if (allNotifs.length === 0) {
        notifList.innerHTML = `<div class="notif-panel__empty">No tienes notificaciones nuevas</div>`;
      } else {
        notifList.innerHTML = allNotifs.map(n => {
          const isUnread = !n.read;
          const timeAgo = formatRelativeTime(n.date);
          const notifMessage = n.message || n.description || '';
          const notifLink = n.link || '#/admin/ventas';
          const notifIcon = n.type === 'order' ? 'shopping-bag' : 'package';
          return `
            <div class="notif-card ${isUnread ? 'notif-card--unread' : ''}" data-id="${n.id}" data-link="${notifLink}" style="cursor: pointer;">
              <div class="notif-card__icon">
                ${icon(notifIcon, 18)}
              </div>
              <div class="notif-card__body">
                <div class="notif-card__title">${n.title || 'Notificación'}</div>
                <div class="notif-card__message">${notifMessage}</div>
                <div class="notif-card__time">${timeAgo}</div>
              </div>
              ${isUnread ? '<div class="notif-card__dot"></div>' : ''}
            </div>
          `;
        }).join('');

        // Mark as read on click
        notifList.querySelectorAll('.notif-card').forEach(el => {
          el.addEventListener('click', async (e) => {
            const notifId = e.currentTarget.getAttribute('data-id');
            const targetLink = e.currentTarget.getAttribute('data-link');
            
            await localDb.markNotificationRead(notifId);
            
            // Update badge count visually
            const currentCount = parseInt(notifBadge.textContent) || 0;
            if (currentCount > 1) {
              notifBadge.textContent = currentCount - 1;
            } else {
              notifBadge.style.display = 'none';
            }
            
            e.currentTarget.classList.remove('notif-card--unread');
            const dot = e.currentTarget.querySelector('.notif-card__dot');
            if (dot) dot.remove();
            
            // Close dropdown
            notifDropdown.classList.remove('active');
            
            // Navigate manually
            if (targetLink) {
              window.location.hash = targetLink;
            }
          });
        });
      }
    } catch (e) {
      console.error('Error loading notifs', e);
      notifList.innerHTML = `<div class="notif-panel__empty">Error al cargar notificaciones</div>`;
    }

    notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== notificationsBtn) {
        notifDropdown.classList.remove('active');
      }
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        authService.logout();
      }
    });
  }
}
