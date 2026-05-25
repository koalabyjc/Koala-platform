/* ============================================
   KOALA — Mock Data
   Demo data for the dashboard
   ============================================ */

export const dashboardData = {
  user: {
    name: 'Jessi',
    role: 'Dueña de negocio',
    avatar: null
  },

  kpis: [
    {
      id: 'revenue',
      label: 'Ingresos del mes',
      value: 98560,
      trend: 18,
      trendDirection: 'up',
      icon: 'dollar-sign',
      iconClass: 'kpi-card__icon--revenue'
    },
    {
      id: 'profit',
      label: 'Ganancia neta',
      value: 23850,
      trend: 12,
      trendDirection: 'up',
      icon: 'trending-up',
      iconClass: 'kpi-card__icon--profit'
    },
    {
      id: 'expense',
      label: 'Gasto operativo',
      value: 18420,
      trend: 5,
      trendDirection: 'down',
      icon: 'credit-card',
      iconClass: 'kpi-card__icon--expense'
    },
    {
      id: 'cashflow',
      label: 'Flujo de caja',
      value: 31670,
      trend: 15,
      trendDirection: 'up',
      icon: 'wallet',
      iconClass: 'kpi-card__icon--cashflow'
    }
  ],

  healthScore: {
    label: 'Salud del negocio',
    value: 'Muy saludable',
    subtitle: '¡Vas por buen camino! 🌿',
    icon: 'heart'
  },

  executiveSummary: [
    {
      type: 'success',
      text: 'Tus ingresos están creciendo consistentemente. ¡Excelente trabajo!'
    },
    {
      type: 'info',
      text: 'Los gastos operativos disminuyeron este mes. Mantén el enfoque.'
    },
    {
      type: 'warning',
      text: 'Atención: 3 productos tienen bajo stock. Revisa tu inventario.'
    },
    {
      type: 'star',
      text: 'Tienes 2 metas activas. Estás a un paso de alcanzarlas.'
    }
  ],

  revenueChart: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    revenue: [42000, 48000, 55000, 72000, 85000, 98560],
    expenses: [35000, 38000, 45000, 52000, 60000, 66000]
  },

  alerts: [
    {
      type: 'warning',
      title: '3 productos con stock bajo',
      description: 'Toma acción para evitar quiebres de stock.',
      time: 0
    },
    {
      type: 'info',
      title: 'Pago a proveedor próximo',
      description: 'Tienes un pago programado para en 2 días.',
      time: 2
    },
    {
      type: 'success',
      title: 'Meta de ahorro en progreso',
      description: 'Llevas 70% de tu meta mensual.',
      time: 3
    }
  ],

  salesByCategory: {
    total: 98560,
    categories: [
      { name: 'Accesorios', percent: 45, value: 44352, color: '#4A3728' },
      { name: 'Ropa', percent: 30, value: 29568, color: '#C6A27A' },
      { name: 'Calzado', percent: 15, value: 14784, color: '#7A6453' },
      { name: 'Otros', percent: 10, value: 9856, color: '#D9C8B8' }
    ]
  },

  topProducts: [
    { rank: 1, name: 'Bolso Luna', revenue: 12560, units: 128, image: 'bolso' },
    { rank: 2, name: 'Cartera Mini', revenue: 9850, units: 96, image: 'cartera' },
    { rank: 3, name: 'Sandalias Daisy', revenue: 7420, units: 74, image: 'sandalias' },
    { rank: 4, name: 'Gafas Sol', revenue: 6300, units: 60, image: 'gafas' },
    { rank: 5, name: 'Collar Estrella', revenue: 5120, units: 55, image: 'collar' }
  ],

  activeGoals: [
    {
      name: 'Ahorro mensual',
      current: 7000,
      target: 10000,
      percent: 70,
      remaining: 3000
    },
    {
      name: 'Ventas mensuales',
      current: 98560,
      target: 115000,
      percent: 85,
      remaining: 16440
    }
  ],

  insight: {
    message: 'Si aumentas el stock del Bolso Luna en 20 unidades, podrías aumentar tus ventas en $2,300 este mes.',
    ctaText: 'Ver recomendación'
  },

  mascot: {
    text: 'Koala está aprendiendo de tu negocio para darte mejores recomendaciones.',
    progress: 75
  }
};

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: '/admin' },
  { id: 'clientes', label: 'Clientes', icon: 'users', path: '/admin/clientes' },
  { id: 'productos', label: 'Productos', icon: 'shopping-bag', path: '/admin/productos' },
  { id: 'marcas', label: 'Marcas', icon: 'tag', path: '/admin/marcas' },
  { id: 'ventas', label: 'Ventas', icon: 'bar-chart-2', path: '/admin/ventas' },
  { id: 'ready', label: 'KOALA READY', icon: 'zap', path: '/admin/ready' },
  { id: 'finanzas', label: 'Finanzas', icon: 'wallet', path: '/admin/finanzas' }
];

export const footerNavItems = [
  { id: 'configuracion', label: 'Configuración', icon: 'settings', path: '/admin/configuracion' },
  { id: 'ayuda', label: 'Ayuda', icon: 'help-circle', path: '/admin/ayuda' }
];

export const productsData = [
  { id: 'P001', name: 'Bolso Luna', price: 120.00, stock: 12, category: 'Accesorios', image: '👜', status: 'in-stock', variants: 3 },
  { id: 'P002', name: 'Cartera Mini', price: 45.00, stock: 3, category: 'Accesorios', image: '👛', status: 'low-stock', variants: 2 },
  { id: 'P003', name: 'Sandalias Daisy', price: 85.00, stock: 0, category: 'Calzado', image: '👡', status: 'out-of-stock', variants: 4 },
  { id: 'P004', name: 'Gafas Sol', price: 65.00, stock: 24, category: 'Accesorios', image: '🕶️', status: 'in-stock', variants: 1 },
  { id: 'P005', name: 'Collar Estrella', price: 35.00, stock: 8, category: 'Joyas', image: '📿', status: 'in-stock', variants: 1 },
  { id: 'P006', name: 'Chaqueta Denim', price: 150.00, stock: 15, category: 'Ropa', image: '🧥', status: 'in-stock', variants: 5 },
  { id: 'P007', name: 'Vestido Verano', price: 95.00, stock: 5, category: 'Ropa', image: '👗', status: 'low-stock', variants: 3 },
  { id: 'P008', name: 'Sombrero Paja', price: 25.00, stock: 40, category: 'Accesorios', image: '👒', status: 'in-stock', variants: 1 },
];

export const ordersData = [
  { id: 'ORD-1024', customer: 'María Rodríguez', total: 165.00, status: 'pending', date: '2026-05-16T10:30:00Z', paymentMethod: 'ATH Móvil', items: 2 },
  { id: 'ORD-1023', customer: 'Carlos Gómez', total: 85.00, status: 'processing', date: '2026-05-15T14:20:00Z', paymentMethod: 'PayPal', items: 1 },
  { id: 'ORD-1022', customer: 'Laura Sánchez', total: 210.00, status: 'shipped', date: '2026-05-14T09:15:00Z', paymentMethod: 'Credit Card', items: 3 },
  { id: 'ORD-1021', customer: 'Ana Martínez', total: 45.00, status: 'delivered', date: '2026-05-12T16:45:00Z', paymentMethod: 'Cash', items: 1 },
  { id: 'ORD-1020', customer: 'Roberto Díaz', total: 120.00, status: 'cancelled', date: '2026-05-10T11:00:00Z', paymentMethod: 'ATH Móvil', items: 1 },
  { id: 'ORD-1019', customer: 'Sofía López', total: 320.00, status: 'pending', date: '2026-05-16T18:20:00Z', paymentMethod: 'Transfer', items: 4 },
];

export const clientsData = [
  { id: 'C001', name: 'María Rodríguez', email: 'maria.r@email.com', phone: '787-555-0101', spent: 1450.00, ordersCount: 12, lastOrder: '2026-05-16T10:30:00Z', status: 'active' },
  { id: 'C002', name: 'Carlos Gómez', email: 'carlos.g@email.com', phone: '787-555-0102', spent: 340.00, ordersCount: 3, lastOrder: '2026-05-15T14:20:00Z', status: 'active' },
  { id: 'C003', name: 'Laura Sánchez', email: 'laura.s@email.com', phone: '787-555-0103', spent: 2890.00, ordersCount: 24, lastOrder: '2026-05-14T09:15:00Z', status: 'vip' },
  { id: 'C004', name: 'Ana Martínez', email: 'ana.m@email.com', phone: '787-555-0104', spent: 85.00, ordersCount: 1, lastOrder: '2026-05-12T16:45:00Z', status: 'new' },
  { id: 'C005', name: 'Roberto Díaz', email: 'roberto.d@email.com', phone: '787-555-0105', spent: 560.00, ordersCount: 5, lastOrder: '2026-05-10T11:00:00Z', status: 'active' },
  { id: 'C006', name: 'Sofía López', email: 'sofia.l@email.com', phone: '787-555-0106', spent: 120.00, ordersCount: 2, lastOrder: '2026-05-16T18:20:00Z', status: 'active' },
];
