/* ============================================
   KOALA — Login Page
   Authentication screen for admin access
   ============================================ */

import { authService } from '../utils/authService.js';

export function renderLoginPage() {
  return `
    <div class="auth-layout">
      <div class="auth-split">
        <div class="auth-side">
          <img src="/assets/store_hero.png" alt="KOALA Admin" class="auth-side__bg" />
        </div>
        <div class="auth-content">
          <div class="auth-card">
            <a href="#/" class="auth-logo">KOALA</a>
            
            <div class="auth-header">
              <h1 class="auth-title">Bienvenido</h1>
              <p class="auth-subtitle">Ingresa a tu centro de control operacional</p>
            </div>
            
            <form id="login-form" class="auth-form" onsubmit="return false;">
              <div id="login-error" class="auth-error"></div>
              
              <div class="auth-form-group">
                <label class="auth-label" for="email">Correo electrónico</label>
                <input type="email" id="email" class="auth-input" placeholder="tu@correo.com" required />
              </div>
              
              <div class="auth-form-group">
                <label class="auth-label" for="password">Contraseña</label>
                <input type="password" id="password" class="auth-input" placeholder="Tu contraseña" required />
              </div>
              
              <button type="submit" class="auth-btn">Iniciar Sesión</button>
            </form>
            
            <div class="auth-footer">
              KOALA Platform &copy; 2026. Solo personal autorizado.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initLoginPage() {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        window.location.hash = '/admin';
      } else {
        errorDiv.textContent = result.message;
        errorDiv.classList.add('visible');
        
        // Shake animation for error
        form.style.animation = 'none';
        form.offsetHeight; /* trigger reflow */
        form.style.animation = 'shake 0.5s ease';
      }
    });
  }
}

// Add simple shake keyframes to doc if not exists
if (!document.getElementById('shake-style')) {
  const style = document.createElement('style');
  style.id = 'shake-style';
  style.innerHTML = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}
