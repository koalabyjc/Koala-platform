/* ============================================
   KOALA — SPA Hash Router
   Lightweight client-side routing
   ============================================ */

export class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.onRouteChange = null;

    window.addEventListener('hashchange', () => this.handleRouteChange());
  }

  register(path, handler) {
    // Convert path to regex. E.g., /p/:id -> ^\/p\/([^/]+)$
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    
    this.routes.push({
      pattern: new RegExp('^' + regexPath + '$'),
      paramNames,
      handler
    });
    
    return this;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    
    for (const route of this.routes) {
      const match = hash.match(route.pattern);
      if (match) {
        this.currentRoute = hash;
        
        // Extract params
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        
        // Ensure correct shell is rendered BEFORE page handler fires
        if (this.onRouteChange) {
          this.onRouteChange(hash);
        }

        route.handler(params);
        return;
      }
    }
    
    // Default fallback
    this.navigate('/');
  }

  getCurrentRoute() {
    return window.location.hash.slice(1) || '/';
  }
}
