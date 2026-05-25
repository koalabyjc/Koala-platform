/* ============================================
   KOALA — Main Application Bootstrap
   App shell, routing, initialization
   ============================================ */

/* Styles */
import './styles/tokens.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/placeholder.css';
import './styles/modules.css';
import './styles/store.css';
import './styles/auth.css';
import './styles/dropdown.css';
import './styles/modal.css';

/* Components (Admin) */
import { renderSidebar, updateSidebarActiveState, initSidebarMobile } from './components/sidebar/Sidebar.js';
import { renderTopbar, initTopbar } from './components/topbar/Topbar.js';

/* Components (Store) */
import { renderStoreNavbar, renderStoreFooter, initStoreShell } from './store/StoreLayout.js';

/* Pages (Admin) */
import { renderDashboardPage, initDashboard } from './pages/DashboardPage.js';
import { renderProductosPage, initProductosPage } from './pages/ProductosPage.js';
import { renderNuevoProductoPage, initNuevoProductoPage } from './pages/NuevoProductoPage.js';
import { renderVentasPage, initVentasPage } from './pages/VentasPage.js';
import { renderEditarPedidoPage, initEditarPedidoPage } from './pages/EditarPedidoPage.js';
import { renderMarcasPage, initMarcasPage } from './pages/MarcasPage.js';
import { renderClientesPage, initClientesPage } from './pages/ClientesPage.js';
import { renderFinanzasPage, initFinanzasPage } from './pages/FinanzasPage.js';
import { renderPlaceholderPage } from './pages/PlaceholderPage.js';
import { renderLoginPage, initLoginPage } from './pages/LoginPage.js';
import { renderConfiguracionPage, initConfiguracionPage } from './pages/ConfiguracionPage.js';
import { renderKoalaReadyPage, initKoalaReadyPage } from './pages/KoalaReadyPage.js';

/* Pages (Store) */
import { renderHomePage, initHomePage } from './store/HomePage.js';
import { renderProductPage, initProductPage } from './store/ProductPage.js';
import { renderCheckoutPage, initCheckoutPage } from './store/CheckoutPage.js';
import { renderReadyPage, initReadyPage } from './store/ReadyPage.js';
import { initAnnouncements } from './store/ReadyAnnouncement.js';

/* Utilities */
import { Router } from './utils/router.js';
import { authService } from './utils/authService.js';

/* ============================================
   Application Initialization
   ============================================ */

class KoalaApp {
  constructor() {
    this.router = new Router();
    this.contentContainer = null;
    this.currentShell = null;
    
    // Intercept route changes to change shell if needed
    this.router.onRouteChange = (route) => {
      this.ensureShell(route);
    };

    this.init();
  }

  init() {
    this.setupRoutes();
    // Manual trigger for first load
    this.router.handleRouteChange();
  }

  ensureShell(route) {
    const isAdmin = route.startsWith('/admin');
    const isLogin = route === '/login';
    
    // Auth Guard
    if (isAdmin && !authService.isLoggedIn()) {
      window.location.hash = '/login';
      return;
    }
    
    // Prevent logged-in users from seeing login page
    if (isLogin && authService.isLoggedIn()) {
      window.location.hash = '/admin';
      return;
    }

    const requiredShell = isAdmin ? 'admin' : isLogin ? 'none' : 'store';

    if (this.currentShell !== requiredShell) {
      this.currentShell = requiredShell;
      if (isAdmin) {
        this.renderAdminShell(route);
      } else if (isLogin) {
        this.renderBlankShell();
      } else {
        this.renderStoreShell();
      }
    } else if (isAdmin) {
      updateSidebarActiveState(route);
    }
  }

  renderBlankShell() {
    const app = document.getElementById('app');
    app.className = '';
    app.innerHTML = `<div id="content-area"></div>`;
    this.contentContainer = document.getElementById('content-area');
  }

  renderAdminShell(route) {
    const app = document.getElementById('app');
    app.className = ''; // Remove store classes
    
    app.innerHTML = `
      ${renderSidebar(route)}
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <main class="main-area" id="main-area">
        ${renderTopbar()}
        <div class="content" id="content-area">
          <!-- Dynamic page content renders here -->
        </div>
      </main>
    `;

    this.contentContainer = document.getElementById('content-area');
    initSidebarMobile();
    initTopbar();
  }

  renderStoreShell() {
    const app = document.getElementById('app');
    app.className = 'store-layout';
    
    app.innerHTML = `
      ${renderStoreNavbar()}
      <main class="store-main" id="content-area">
        <!-- Store pages render here -->
      </main>
      ${renderStoreFooter()}
    `;

    this.contentContainer = document.getElementById('content-area');
    initStoreShell();
    initAnnouncements();
  }

  /**
   * Register all application routes
   */
  setupRoutes() {
    /* STORE ROUTES (Public) */
    this.router.register('/', () => {
      this.renderPage(renderHomePage(), () => initHomePage());
    });
    this.router.register('/p/:id', (params) => {
      this.renderPage(renderProductPage(params), () => initProductPage(params));
    });
    this.router.register('/cart', () => {
      this.renderPage(renderCheckoutPage(), () => initCheckoutPage());
    });
    this.router.register('/ready', () => {
      this.renderPage(renderReadyPage(), () => initReadyPage());
    });

    /* AUTH ROUTES */
    this.router.register('/login', () => {
      this.renderPage(renderLoginPage(), () => initLoginPage());
    });

    /* ADMIN ROUTES */
    this.router.register('/admin', () => {
      this.renderPage(renderDashboardPage(), () => initDashboard());
    });
    this.router.register('/admin/productos', () => {
      this.renderPage(renderProductosPage(), () => initProductosPage());
    });
    this.router.register('/admin/productos/nuevo', () => {
      this.renderPage(renderNuevoProductoPage(), () => initNuevoProductoPage());
    });
    this.router.register('/admin/ventas', () => {
      this.renderPage(renderVentasPage(), () => initVentasPage());
    });
    this.router.register('/admin/ventas/editar/:id', (params) => {
      this.renderPage(renderEditarPedidoPage(params), () => initEditarPedidoPage(params));
    });
    this.router.register('/admin/marcas', () => {
      this.renderPage(renderMarcasPage(), () => initMarcasPage());
    });
    this.router.register('/admin/clientes', () => {
      this.renderPage(renderClientesPage(), () => initClientesPage());
    });
    this.router.register('/admin/finanzas', () => {
      this.renderPage(renderFinanzasPage(), () => initFinanzasPage());
    });
    this.router.register('/admin/ready', () => {
      this.renderPage(renderKoalaReadyPage(), () => initKoalaReadyPage());
    });

    this.router.register('/admin/configuracion', () => {
      this.renderPage(renderConfiguracionPage(), () => initConfiguracionPage());
    });

    /* Module pages (placeholders) */
    const placeholderRoutes = [
      '/admin/inventario',
      '/admin/alertas',
      '/admin/ayuda'
    ];

    placeholderRoutes.forEach(route => {
      this.router.register(route, () => {
        const routeId = route.replace('/admin/', '');
        this.renderPage(renderPlaceholderPage(routeId));
      });
    });
  }

  /**
   * Inject page content into the content container
   */
  renderPage(html, onMountCallback = null) {
    if (this.contentContainer) {
      this.contentContainer.innerHTML = html;
      
      // Execute page-specific scripts after rendering
      if (typeof onMountCallback === 'function') {
        setTimeout(onMountCallback, 0); // Allow DOM to update first
      }
    }
  }
}

/* Launch the application */
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  window.app = new KoalaApp();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new KoalaApp();
  });
}
