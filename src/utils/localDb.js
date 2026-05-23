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
    return data || [];
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
    return products
      .filter(p => p.status !== 'draft')
      .sort((a, b) => {
        const scoreA = (a.price || 0) + ((a.name || '').length * 2);
        const scoreB = (b.price || 0) + ((b.name || '').length * 2);
        return scoreB - scoreA;
      })
      .slice(0, 5);
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
          // Remove meta object so it doesn't render as a product in the UI
          order.itemslist.splice(metaIndex, 1);
        }
      }
      
      // Keep localStorage as fallback just in case
      try {
        const localMeta = JSON.parse(localStorage.getItem(`koala_order_meta_${order.id}`));
        if (localMeta && !order.customerPhone) {
          order.customerPhone = localMeta.phone;
          order.customerEmail = localMeta.email;
          order.customerCity = localMeta.city;
        }
      } catch (e) {}
      
      order.itemsList = order.itemslist; // standardize case
      return order;
    });
  }

  async saveOrder(order) {
    // Check if new to trigger notifications
    const { data: existing } = await supabase.from('orders').select('id').eq('id', order.id).single();
    
    // Pack metadata into itemslist to bypass schema limitations safely into the cloud
    const finalItemsList = [...(order.itemsList || order.itemslist || [])];
    if (order.customerPhone || order.customerEmail || order.customerCity) {
      finalItemsList.push({
        __koala_meta: true,
        phone: order.customerPhone || '',
        email: order.customerEmail || '',
        city: order.customerCity || ''
      });
    }
    
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
    
    // Polyfill: Save extra contact data locally since Supabase schema lacks these columns
    if (order.customerPhone || order.customerEmail || order.customerCity) {
      localStorage.setItem(`koala_order_meta_${order.id}`, JSON.stringify({
        phone: order.customerPhone || '',
        email: order.customerEmail || '',
        city: order.customerCity || ''
      }));
    }
    
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
    
    // Polyfill missing 'city' column
    return (data || []).map(client => {
      try {
        const meta = JSON.parse(localStorage.getItem(`koala_client_meta_${client.id}`));
        if (meta && meta.city) client.city = meta.city;
      } catch (e) {}
      return client;
    });
  }

  async saveClient(client) {
    // Sanitize payload for Supabase schema
    const payload = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      spent: client.spent,
      orderscount: client.ordersCount || client.orderscount || 0,
      lastorder: client.lastOrder || client.lastorder || new Date().toISOString(),
      status: client.status
    };
    
    const { data, error } = await supabase.from('clients').upsert(payload).select();
    if (error) throw error;
    
    // Polyfill locally
    if (client.city) {
      localStorage.setItem(`koala_client_meta_${client.id}`, JSON.stringify({ city: client.city }));
    }
    
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
    const { data, error } = await supabase.from('brands').upsert(brand).select();
    if (error) throw error;
    return data?.[0] || brand;
  }

  async deleteBrand(id) {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

export const localDb = new SupabaseDB();
