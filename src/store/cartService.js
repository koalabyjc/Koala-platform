/* ============================================
   KOALA — Cart Service
   Manages global cart state for the Front Store
   ============================================ */

class CartService {
  constructor() {
    this.items = [];
    this.listeners = [];
  }

  getItems() {
    return this.items;
  }

  addItem(product, quantity = 1) {
    // Unique key includes size so same product in different sizes are separate entries
    const sizeKey = product.selectedSize || '';
    const existingItem = this.items.find(item => item.id === product.id && (item.selectedSize || '') === sizeKey);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    this.notify();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.notify();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.notify();
    }
  }

  clear() {
    this.items = [];
    this.notify();
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.items));
  }
}

export const cartService = new CartService();
