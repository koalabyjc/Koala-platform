import { supabase } from './supabaseClient.js';

class SupabaseDB {
  constructor() {
    this.initPromise = Promise.resolve();
  }

  // --- EXPORT/IMPORT ---
  async exportData() { return {}; }
  async importData(data) { return true; }

  // --- PRODUCTS ---
  async getAllProducts(limit = null) {
    let query = supabase.from('products').select('*').order('id', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    // Parse sizes from JSON array if it was stored as string, but Supabase handles TEXT[] as JS arrays
    // Filter out KOALA READY products (whose status starts with 'ready::') from the standard made-to-order catalog
    return (data || []).filter(p => !p.status || !p.status.startsWith('ready::'));
  }

  async saveProduct(product) {
    const { data, error } = await supabase.from('products').upsert(product).select();
    if (error) {
      console.error('Error saving product:', error);
      throw error;
    }
    return data?.[0] || product;
  }

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    return true;
  }

  async getTop5Products() {
    const products = await this.getAllProducts();
    
    // Check manual override
    try {
      const manualIds = JSON.parse(localStorage.getItem('koala_top_products'));
      if (manualIds && Array.isArray(manualIds) && manualIds.length > 0) {
         const manualProducts = manualIds.map(id => products.find(p => p.id === id)).filter(Boolean);
         // If we found any valid products, pad with auto-calculated if less than 5, or just return them
         if (manualProducts.length > 0) {
           const manualSet = new Set(manualProducts.map(p => p.id));
           let autoProducts = products.filter(p => p.status !== 'draft' && !manualSet.has(p.id)).sort((a, b) => {
             const scoreA = (a.price || 0) + ((a.name || '').length * 2);
             const scoreB = (b.price || 0) + ((b.name || '').length * 2);
             return scoreB - scoreA;
           });
           return [...manualProducts, ...autoProducts].slice(0, 5);
         }
      }
    } catch(e) {}

    return products
      .filter(p => p.status !== 'draft')
      .sort((a, b) => {
        const scoreA = (a.price || 0) + ((a.name || '').length * 2);
        const scoreB = (b.price || 0) + ((b.name || '').length * 2);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  async saveTop5Products(idsArray) {
    localStorage.setItem('koala_top_products', JSON.stringify(idsArray));
  }

  // --- ORDERS ---
  async getOrder(id) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async getAllOrders(limit = null) {
    let query = supabase.from('orders').select('*').order('date', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    
    // Cloud Sync Polyfill: Unpack metadata from itemslist 
    return (data || []).map(order => {
      if (order.itemslist && Array.isArray(order.itemslist)) {
        const metaIndex = order.itemslist.findIndex(item => item.__koala_meta === true);
        if (metaIndex !== -1) {
          const meta = order.itemslist[metaIndex];
          order.customerPhone = meta.phone;
          order.customerEmail = meta.email;
          order.customerCity = meta.city;
          order.dueDate = meta.dueDate;
          order.payments = meta.payments || [];
          order.shippingCost = meta.shippingCost || 0;
          order.totalPaid = meta.totalPaid || 0;
          order.pendingBalance = meta.pendingBalance !== undefined ? meta.pendingBalance : order.total;
          
          // Remove meta object so it doesn't render as a product in the UI
          order.itemslist.splice(metaIndex, 1);
        }
      }
      
      order.itemsList = order.itemslist; // standardize case
      return order;
    });
  }

  async saveOrder(order) {
    // Check if new to trigger notifications
    const { data: existing } = await supabase.from('orders').select('id').eq('id', order.id).single();
    
    // Pack metadata into itemslist to bypass schema limitations safely into the cloud
    const finalItemsList = [...(order.itemsList || order.itemslist || [])];
    finalItemsList.push({
      __koala_meta: true,
      phone: order.customerPhone || '',
      email: order.customerEmail || '',
      city: order.customerCity || '',
      dueDate: order.dueDate || '',
      payments: order.payments || [],
      shippingCost: order.shippingCost || 0,
      totalPaid: order.totalPaid || 0,
      pendingBalance: order.pendingBalance !== undefined ? order.pendingBalance : order.total
    });
    
    // Sanitize payload to match exact Supabase schema and prevent PGRST204 errors
    const payload = {
      id: order.id,
      customer: order.customer,
      total: order.total,
      status: order.status,
      date: order.date,
      paymentmethod: order.paymentMethod || order.paymentmethod || '',
      items: order.items || 0,
      itemslist: finalItemsList
    };
    
    const { data, error } = await supabase.from('orders').upsert(payload).select();
    if (error) throw error;
    
    if (!existing) {
      // Build a detailed notification with real order data
      const itemsSummary = (order.itemsList && order.itemsList.length > 0)
        ? order.itemsList.map(i => `${i.name} x${i.qty}`).join(', ')
        : `${order.items || 0} artículo(s)`;

      await this.saveNotification({
        id: 'NOTIF-' + Date.now(),
        type: 'order',
        title: `Nuevo pedido ${order.id}`,
        message: `Cliente: ${order.customer || 'Desconocido'} — ${itemsSummary} — Total: $${(order.total || 0).toFixed(2)}${order.paymentMethod ? ' — Pago: ' + order.paymentMethod : ''}`,
        link: '#/admin/ventas',
        date: new Date().toISOString(),
        read: false
      });
    }
    return data?.[0] || order;
  }

  async deleteOrder(id) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // --- CLIENTS ---
  async getAllClients(limit = null) {
    let query = supabase.from('clients').select('*').order('lastorder', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    
    // Polyfill missing 'city' and 'clientType' column parsing from status
    return (data || []).map(client => {
      if (client.status && client.status.includes('||')) {
        const parts = client.status.split('||');
        client.status = parts[0];
        client.city = parts[1] || '';
        client.clientType = parts[2] || 'standard';
      }
      return client;
    });
  }

  async saveClient(client) {
    // Encode extra data into status to avoid modifying Supabase schema
    const safeStatus = (client.status || 'new').split('||')[0];
    const encodedStatus = `${safeStatus}||${client.city || ''}||${client.clientType || 'standard'}`;

    // Sanitize payload for Supabase schema
    const payload = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      spent: client.spent,
      orderscount: client.ordersCount || client.orderscount || 0,
      lastorder: client.lastOrder || client.lastorder || new Date().toISOString(),
      status: encodedStatus
    };
    
    const { data, error } = await supabase.from('clients').upsert(payload).select();
    if (error) throw error;
    
    // Parse back before returning
    const savedClient = data?.[0] || client;
    if (savedClient.status && savedClient.status.includes('||')) {
      const parts = savedClient.status.split('||');
      savedClient.status = parts[0];
      savedClient.city = parts[1] || '';
      savedClient.clientType = parts[2] || 'standard';
    }
    return savedClient;
    
    return data?.[0] || client;
  }

  async deleteClient(id) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  async ensureClientExists(customerName, order, customerData = {}) {
    const clients = await this.getAllClients();
    const nameLower = (customerName || '').toLowerCase().trim();
    const phoneTrimmed = (customerData.phone || '').replace(/[^0-9]/g, '');
    const emailLower = (customerData.email || '').toLowerCase().trim();

    // Smart matching: find by name, phone, or email
    const existing = clients.find(c => {
      const cName = (c.name || '').toLowerCase().trim();
      const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
      const cEmail = (c.email || '').toLowerCase().trim();

      if (cName && nameLower && cName === nameLower) return true;
      if (cPhone && phoneTrimmed && cPhone === phoneTrimmed) return true;
      if (cEmail && emailLower && cEmail === emailLower) return true;
      return false;
    });

    if (existing) {
      // Update existing client with latest data
      existing.spent = (existing.spent || 0) + (order.total || 0);
      existing.ordersCount = (existing.ordersCount || 0) + 1;
      existing.lastOrder = order.date || new Date().toISOString();
      if (customerData.phone && !existing.phone) existing.phone = customerData.phone;
      if (customerData.email && !existing.email) existing.email = customerData.email;
      if (customerData.city && !existing.city) existing.city = customerData.city;
      // Auto-promote status based on orders
      if (existing.ordersCount >= 5) existing.status = 'vip';
      else if (existing.ordersCount >= 2) existing.status = 'active';
      return this.saveClient(existing);
    }

    // New client — auto-register with all available data
    const newClient = {
      id: 'C' + Date.now(),
      name: customerName,
      email: customerData.email || '',
      phone: customerData.phone || '',
      city: customerData.city || '',
      spent: order.total || 0,
      ordersCount: 1,
      lastOrder: order.date || new Date().toISOString(),
      status: 'new'
    };
    return this.saveClient(newClient);
  }

  // --- NOTIFICATIONS (Using local storage for now if no table) ---
  async getAllNotifications() {
    try {
      const notifs = JSON.parse(localStorage.getItem('koala_notifs') || '[]');
      // Sort by date descending (newest first)
      return notifs.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch(e) { return []; }
  }

  async saveNotification(notif) {
    const notifs = await this.getAllNotifications();
    // Update existing notification by id, or push new
    const existingIndex = notifs.findIndex(n => n.id === notif.id);
    if (existingIndex >= 0) {
      notifs[existingIndex] = notif;
    } else {
      notifs.unshift(notif);
    }
    localStorage.setItem('koala_notifs', JSON.stringify(notifs));
    return notif;
  }

  async markNotificationRead(notifId) {
    const notifs = await this.getAllNotifications();
    const notif = notifs.find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
      localStorage.setItem('koala_notifs', JSON.stringify(notifs));
    }
  }

  // --- BRANDS ---
  async getAllBrands() {
    const { data, error } = await supabase.from('brands').select('*');
    if (error) return [];
    return data || [];
  }

  async saveBrand(brand) {
    const payload = {
      id: brand.id,
      name: brand.name
    };
    const { data, error } = await supabase.from('brands').upsert(payload).select();
    if (error) throw error;
    return data?.[0] || brand;
  }

  async deleteBrand(id) {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // ── KOALA READY Methods ──

  async getAllReadyProducts(limit = 100) {
    let query = supabase.from('products').select('*').order('id', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) { console.error('Error fetching ready products:', error); return []; }
    
    return (data || [])
      .filter(p => p.status && p.status.startsWith('ready::'))
      .map(p => this._unpackReadyProduct(p))
      .filter(p => p.readyStatus === 'active');
  }

  async getAllReadyProductsAdmin(limit = 100) {
    let query = supabase.from('products').select('*').order('id', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) { console.error('Error fetching ready products admin:', error); return []; }
    
    return (data || [])
      .filter(p => p.status && p.status.startsWith('ready::'))
      .map(p => this._unpackReadyProduct(p));
  }

  _unpackReadyProduct(product) {
    if (!product.status || !product.status.startsWith('ready::')) {
      return {
        ...product,
        inventoryType: 'made_to_order',
        readyStatus: 'hidden',
        readyBadge: 'READY NOW',
        readyQuantity: 1,
        isFeatured: false
      };
    }
    const parts = product.status.split('::');
    // ready::{readyStatus}::{readyBadge}::{readyQuantity}::{isFeatured}
    return {
      ...product,
      inventoryType: 'ready_now',
      readyStatus: parts[1] || 'active',
      readyBadge: parts[2] || 'READY NOW',
      readyQuantity: parseInt(parts[3] || '1', 10),
      isFeatured: parts[4] === 'true'
    };
  }

  _packReadyStatus(readyStatus, readyBadge, readyQuantity, isFeatured) {
    return `ready::${readyStatus || 'active'}::${readyBadge || 'READY NOW'}::${readyQuantity || 1}::${isFeatured || false}`;
  }

  async saveReadyProduct(product) {
    const statusField = this._packReadyStatus(
      product.readyStatus,
      product.readyBadge,
      product.readyQuantity,
      product.isFeatured
    );

    // Make sure id starts with R if new
    const record = {
      id: product.id || 'R' + Math.floor(Math.random() * 9000 + 1000),
      name: product.name,
      price: parseFloat(product.price || 0),
      brand: product.brand || '',
      department: product.department || '',
      category: product.category || '',
      sizes: Array.isArray(product.sizes) ? product.sizes : [product.sizes || ''],
      image: product.image || '',
      status: statusField
    };

    const { data, error } = await supabase.from('products').upsert(record).select();
    if (error) {
      console.error('Error saving ready product:', error);
      throw error;
    }
    return this._unpackReadyProduct(data?.[0] || record);
  }

  async markReadySold(id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      const unpacked = this._unpackReadyProduct(data);
      unpacked.readyStatus = 'sold';
      unpacked.readyQuantity = 0;
      const statusField = this._packReadyStatus(
        unpacked.readyStatus,
        unpacked.readyBadge,
        unpacked.readyQuantity,
        unpacked.isFeatured
      );
      await supabase.from('products').update({ status: statusField }).eq('id', id);
    }
  }

  async toggleReadyFeatured(id) {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      const unpacked = this._unpackReadyProduct(data);
      unpacked.isFeatured = !unpacked.isFeatured;
      const statusField = this._packReadyStatus(
        unpacked.readyStatus,
        unpacked.readyBadge,
        unpacked.readyQuantity,
        unpacked.isFeatured
      );
      await supabase.from('products').update({ status: statusField }).eq('id', id);
      return unpacked.isFeatured;
    }
    return false;
  }

  async updateReadyStatus(id, status) {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      const unpacked = this._unpackReadyProduct(data);
      unpacked.readyStatus = status;
      const statusField = this._packReadyStatus(
        unpacked.readyStatus,
        unpacked.readyBadge,
        unpacked.readyQuantity,
        unpacked.isFeatured
      );
      await supabase.from('products').update({ status: statusField }).eq('id', id);
    }
  }

  async deleteReadyProduct(id) {
    await this.deleteProduct(id);
  }

  async getReadySalesThisWeek() {
    // Calculate from orders that contain ready products
    const orders = await this.getAllOrders(200);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let total = 0;
    orders.forEach(order => {
      const orderDate = new Date(order.date || order.created_at);
      if (orderDate >= weekAgo && order.itemslist && Array.isArray(order.itemslist)) {
        const hasReady = order.itemslist.some(item => item.inventoryType === 'ready_now' || (item.name && item.name.includes('(READY)')));
        if (hasReady) {
          total += parseFloat(order.total || 0);
        }
      }
    });
    return total;
  }

  // ── Announcement Methods ──
  getActiveAnnouncement() {
    try {
      const data = localStorage.getItem('koala_ready_announcement');
      if (!data) return null;
      const announcement = JSON.parse(data);
      return announcement.active ? announcement : null;
    } catch(e) { return null; }
  }

  saveAnnouncement(announcement) {
    localStorage.setItem('koala_ready_announcement', JSON.stringify({ ...announcement, active: true }));
  }

  clearAnnouncement() {
    try {
      const data = localStorage.getItem('koala_ready_announcement');
      if (data) {
        const announcement = JSON.parse(data);
        announcement.active = false;
        localStorage.setItem('koala_ready_announcement', JSON.stringify(announcement));
      }
    } catch(e) {}
  }
}

export const localDb = new SupabaseDB();
