/* ============================================
   KOALA — Auth Service
   Mock authentication management using localStorage
   ============================================ */

const AUTH_KEY = 'koala_auth_session';

class AuthService {
  constructor() {
    this.isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';
    this.listeners = [];
  }

  async login(email, password) {
    // Custom credentials check
    if (email === 'koalabyjc@gmail.com' && password === 'Jckoala3062') {
      this.isAuthenticated = true;
      localStorage.setItem(AUTH_KEY, 'true');
      this.notify();
      return { success: true };
    }
    return { success: false, message: 'Credenciales incorrectas. Verifica tu correo y contraseña.' };
  }

  async logout() {
    this.isAuthenticated = false;
    localStorage.removeItem(AUTH_KEY);
    this.notify();
    
    // Force redirect to login page
    window.location.hash = '/login';
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.isAuthenticated));
  }
}

export const authService = new AuthService();
