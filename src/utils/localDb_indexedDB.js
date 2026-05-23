/* ============================================
   KOALA — Local Database Service
   Uses IndexedDB to store products and images locally
   without the 5MB limit of localStorage.
   ============================================ */

const DB_NAME = 'KoalaLocalDB';
const STORE_NAME = 'products';
const ORDERS_STORE = 'orders';
const CLIENTS_STORE = 'clients';
const NOTIFICATIONS_STORE = 'notifications';
const BRANDS_STORE = 'brands';
const DB_VERSION = 4;

class LocalDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Error abriendo IndexedDB', event);
        reject('Error abriendo DB');
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        
        // Seed initial data if empty
        try {
          const countRequest = this.db.transaction([STORE_NAME], 'readonly').objectStore(STORE_NAME).count();
          countRequest.onsuccess = async () => {
            if (countRequest.result === 0) {
              const { productsData } = await import('../data/mockData.js');
              const tx = this.db.transaction([STORE_NAME], 'readwrite');
              const store = tx.objectStore(STORE_NAME);
              productsData.forEach(p => store.put(p));
            }
          };

          const countOrders = this.db.transaction([ORDERS_STORE], 'readonly').objectStore(ORDERS_STORE).count();
          countOrders.onsuccess = async () => {
            if (countOrders.result === 0) {
              const { ordersData } = await import('../data/mockData.js');
              const tx = this.db.transaction([ORDERS_STORE], 'readwrite');
              const store = tx.objectStore(ORDERS_STORE);
              ordersData.forEach(o => store.put(o));
            }
          };
        } catch(e) {
          console.warn('Could not seed initial data:', e);
        }

        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(ORDERS_STORE)) {
          db.createObjectStore(ORDERS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(CLIENTS_STORE)) {
          db.createObjectStore(CLIENTS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(NOTIFICATIONS_STORE)) {
          db.createObjectStore(NOTIFICATIONS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(BRANDS_STORE)) {
          db.createObjectStore(BRANDS_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  // --- DATABASE EXPORT/IMPORT ---
  async exportData() {
    return {
      products: await this.getAllProducts(),
      orders: await this.getAllOrders(),
      clients: await this.getAllClients(),
      brands: await this.getAllBrands()
    };
  }

  async importData(data) {
    await this.initPromise;
    const stores = [
      { name: STORE_NAME, items: data.products || [] },
      { name: ORDERS_STORE, items: data.orders || [] },
      { name: CLIENTS_STORE, items: data.clients || [] },
      { name: BRANDS_STORE, items: data.brands || [] }
    ];

    for (let s of stores) {
      if (!s.items.length) continue;
      await new Promise((resolve) => {
        const tx = this.db.transaction([s.name], 'readwrite');
        const store = tx.objectStore(s.name);
        const clearReq = store.clear();
        clearReq.onsuccess = () => {
          s.items.forEach(item => store.put(item));
          tx.oncomplete = () => resolve();
        };
      });
    }
    return true;
  }

  async getAllProducts() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Ordenar del más nuevo al más viejo (por ID descendente asumiendo P00X)
        const items = request.result || [];
        items.reverse();
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveProduct(product) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(product);

      request.onsuccess = () => resolve(product);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProduct(id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // --- TOP PRODUCTS (Simulated AI Ranking) ---
  async getTop5Products() {
    const products = await this.getAllProducts();
    // Simulate an AI algorithm picking the top 5 best-selling/most popular products.
    // For consistency, we sort by a mix of price and name length to create a static but realistic "score".
    // In a real scenario, this would aggregate `ordersCount` per product item.
    return products
      .filter(p => p.status !== 'draft')
      .sort((a, b) => {
        const scoreA = (a.price || 0) + (a.name.length * 2);
        const scoreB = (b.price || 0) + (b.name.length * 2);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  // --- ORDERS ---
  async getOrder(id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([ORDERS_STORE], 'readonly');
      const store = transaction.objectStore(ORDERS_STORE);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllOrders() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([ORDERS_STORE], 'readonly');
      const store = transaction.objectStore(ORDERS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result || [];
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveOrder(order) {
    await this.initPromise;
    
    // Check if new to trigger notifications and clients
    let isNew = false;
    try {
      const existing = await this.getOrder(order.id);
      if (!existing) isNew = true;
    } catch(e) { isNew = true; }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([ORDERS_STORE], 'readwrite');
      const store = transaction.objectStore(ORDERS_STORE);
      const request = store.put(order);

      request.onsuccess = async () => {
        if (isNew) {
          // Trigger notification
          await this.saveNotification({
            id: 'NOTIF-' + Date.now(),
            title: 'Nuevo Pedido Recibido',
            message: `${order.customer} ha realizado la orden ${order.id} por $${order.total}`,
            date: new Date().toISOString(),
            read: false,
            link: `#/admin/ventas`
          });

          // Check if client exists (Auto-save client logic)
          await this.ensureClientExists(order.customer, order);
        }
        resolve(order);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOrder(id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([ORDERS_STORE], 'readwrite');
      const store = transaction.objectStore(ORDERS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // --- CLIENTS ---
  _evaluateClientStatus(client) {
    // Nuevo: Al momento de crearlo (0 o 1 ordenes)
    if (!client.ordersCount || client.ordersCount <= 1) {
      return 'new';
    }
    
    // VIP: Más de $250 en consumo total, o más de 3 órdenes (asumiendo ~1 por semana en un mes)
    if (client.spent >= 250 || client.ordersCount >= 4) {
      return 'vip';
    }
    
    // Activo: Más de 1 orden pero no llega a VIP
    return 'active';
  }

  async getAllClients() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CLIENTS_STORE], 'readonly');
      const store = transaction.objectStore(CLIENTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const clients = request.result || [];
        // Evaluate status dynamically
        clients.forEach(c => {
          c.status = this._evaluateClientStatus(c);
        });
        resolve(clients);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveClient(client) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CLIENTS_STORE], 'readwrite');
      const store = transaction.objectStore(CLIENTS_STORE);
      const request = store.put(client);
      request.onsuccess = () => {
        this.syncToServer();
        resolve(client);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async ensureClientExists(customerName, orderData = null) {
    const clients = await this.getAllClients();
    const clientExists = clients.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    
    if (!clientExists) {
      const newClient = {
        id: 'C' + Math.floor(100 + Math.random() * 900).toString(),
        name: customerName,
        email: 'pendiente@cliente.com',
        phone: '---',
        spent: orderData ? orderData.total : 0,
        ordersCount: orderData ? 1 : 0,
        lastOrder: orderData ? orderData.date : new Date().toISOString(),
        status: 'new'
      };
      await this.saveClient(newClient);
      return newClient;
    } else if (orderData) {
       // Update existing client stats
       clientExists.spent += orderData.total;
       clientExists.ordersCount += 1;
       clientExists.lastOrder = orderData.date;
       await this.saveClient(clientExists);
       return clientExists;
    }
    return clientExists;
  }

  async deleteClient(id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CLIENTS_STORE], 'readwrite');
      const store = transaction.objectStore(CLIENTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // --- NOTIFICATIONS ---
  async getAllNotifications() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTIFICATIONS_STORE], 'readonly');
      const store = transaction.objectStore(NOTIFICATIONS_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
         const items = request.result || [];
         items.sort((a, b) => new Date(b.date) - new Date(a.date));
         resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveNotification(notif) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([NOTIFICATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(NOTIFICATIONS_STORE);
      const request = store.put(notif);
      request.onsuccess = () => resolve(notif);
      request.onerror = () => reject(request.error);
    });
  }

  // --- BRANDS ---
  async getAllBrands() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BRANDS_STORE], 'readonly');
      const store = transaction.objectStore(BRANDS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBrand(brand) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BRANDS_STORE], 'readwrite');
      const store = transaction.objectStore(BRANDS_STORE);
      const request = store.put(brand);
      request.onsuccess = () => {
        this.syncToServer();
        resolve(brand);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBrand(id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BRANDS_STORE], 'readwrite');
      const store = transaction.objectStore(BRANDS_STORE);
      const request = store.delete(id);
      request.onsuccess = () => {
        this.syncToServer();
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const localDb = new LocalDB();
