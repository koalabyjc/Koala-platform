import { localDb } from './localDb.js';

class ReadyService {
  constructor() {
    this.listeners = [];
    this._cachedCount = 0;
    this._announcement = null;
  }

  // Get count of active ready products
  async getReadyCount() {
    const products = await localDb.getAllReadyProducts();
    this._cachedCount = products.length;
    return this._cachedCount;
  }

  getCachedCount() { return this._cachedCount; }

  // Check if any active ready products exist
  async isReadyActive() {
    const count = await this.getReadyCount();
    return count > 0;
  }

  // Observer pattern
  subscribe(callback) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
  }

  async notifyChange() {
    const count = await this.getReadyCount();
    this.listeners.forEach(cb => cb(count));
    await this.updateAllBadges();
  }

  // Get active announcement
  async getAnnouncement() {
    this._announcement = await localDb.getActiveAnnouncement();
    return this._announcement;
  }

  // Mark product as sold and sync everything
  async markSold(productId) {
    await localDb.markReadySold(productId);
    await this.notifyChange();
    // Auto-clear announcement if it references this product
    if (this._announcement && this._announcement.productId === productId) {
      await localDb.clearAnnouncement();
      this._announcement = null;
    }
  }

  // Update all UI badges (called from components)
  async updateAllBadges() {
    const count = await this.getReadyCount();
    // Store navbar badge
    const storeIndicator = document.getElementById('ready-indicator');
    if (storeIndicator) {
      storeIndicator.style.display = count > 0 ? 'inline-block' : 'none';
      storeIndicator.textContent = count > 0 ? count : '';
    }
    // Admin sidebar badge
    const sidebarBadge = document.getElementById('ready-sidebar-badge');
    if (sidebarBadge) {
      sidebarBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    return count;
  }
}

export const readyService = new ReadyService();
