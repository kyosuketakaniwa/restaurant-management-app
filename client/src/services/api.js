import axios from 'axios';

// APIのベースURL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // クロスサイトリクエストでクッキーを送信する設定
  withCredentials: true
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    // エラーハンドリング
    if (error.response && error.response.status === 401) {
      // 認証エラーの場合、ログアウト処理
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証関連のAPI
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  getCurrentUser: () => apiClient.get('/auth/me')
};

// ダッシュボード関連のAPI
export const dashboardApi = {
  getSummary: () => apiClient.get('/dashboard/summary'),
  getRecentOrders: () => apiClient.get('/dashboard/recent-orders'),
  getPopularItems: () => apiClient.get('/dashboard/popular-items'),
  getSalesData: (period) => apiClient.get(`/dashboard/sales?period=${period}`),
  getInventoryAlerts: () => apiClient.get('/dashboard/inventory-alerts')
};

// 注文関連のAPI
export const orderApi = {
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  updateOrder: (id, orderData) => apiClient.put(`/orders/${id}`, orderData),
  deleteOrder: (id) => apiClient.delete(`/orders/${id}`),
  completeOrder: (id) => apiClient.put(`/orders/${id}/complete`),
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),
  getOrderItems: (id) => apiClient.get(`/orders/${id}/items`)
};

// メニュー関連のAPI
export const menuApi = {
  getMenuItems: (params) => apiClient.get('/menu-items', { params }),
  getMenuItemById: (id) => apiClient.get(`/menu-items/${id}`),
  createMenuItem: (itemData) => apiClient.post('/menu-items', itemData),
  updateMenuItem: (id, itemData) => apiClient.put(`/menu-items/${id}`, itemData),
  deleteMenuItem: (id) => apiClient.delete(`/menu-items/${id}`),
  getCategories: () => apiClient.get('/categories')
};

// テーブル関連のAPI
export const tableApi = {
  getTables: () => apiClient.get('/tables'),
  getTableById: (id) => apiClient.get(`/tables/${id}`),
  createTable: (tableData) => apiClient.post('/tables', tableData),
  updateTable: (id, tableData) => apiClient.put(`/tables/${id}`, tableData),
  deleteTable: (id) => apiClient.delete(`/tables/${id}`),
  getTableStatus: () => apiClient.get('/tables/status'),
  assignTable: (tableId, orderId) => apiClient.put(`/tables/${tableId}/assign`, { order_id: orderId }),
  releaseTable: (tableId) => apiClient.put(`/tables/${tableId}/release`)
};

// 予約関連のAPI
export const reservationApi = {
  getReservations: (params) => apiClient.get('/reservations', { params }),
  getReservationById: (id) => apiClient.get(`/reservations/${id}`),
  createReservation: (reservationData) => apiClient.post('/reservations', reservationData),
  updateReservation: (id, reservationData) => apiClient.put(`/reservations/${id}`, reservationData),
  deleteReservation: (id) => apiClient.delete(`/reservations/${id}`),
  confirmReservation: (id) => apiClient.put(`/reservations/${id}/confirm`),
  cancelReservation: (id) => apiClient.put(`/reservations/${id}/cancel`),
  checkAvailability: (date, time, partySize) => 
    apiClient.get('/reservations/availability', { params: { date, time, party_size: partySize } })
};

// 顧客関連のAPI
export const customerApi = {
  getCustomers: (params) => apiClient.get('/customers', { params }),
  getCustomerById: (id) => apiClient.get(`/customers/${id}`),
  createCustomer: (customerData) => apiClient.post('/customers', customerData),
  updateCustomer: (id, customerData) => apiClient.put(`/customers/${id}`, customerData),
  deleteCustomer: (id) => apiClient.delete(`/customers/${id}`),
  getCustomerOrders: (id) => apiClient.get(`/customers/${id}/orders`),
  getCustomerReservations: (id) => apiClient.get(`/customers/${id}/reservations`)
};

// 在庫関連のAPI
export const inventoryApi = {
  getInventory: (params) => apiClient.get('/inventory', { params }),
  getInventoryItemById: (id) => apiClient.get(`/inventory/${id}`),
  addInventoryItem: (itemData) => apiClient.post('/inventory', itemData),
  updateInventoryItem: (itemData) => apiClient.put(`/inventory/${itemData.id}`, itemData),
  deleteInventoryItem: (id) => apiClient.delete(`/inventory/${id}`),
  adjustInventory: (id, adjustment) => apiClient.post(`/inventory/${id}/adjust`, { adjustment }),
  getCategories: () => apiClient.get('/inventory/categories'),
  addCategory: (categoryData) => apiClient.post('/inventory/categories', categoryData),
  updateCategory: (id, categoryData) => apiClient.put(`/inventory/categories/${id}`, categoryData),
  deleteCategory: (id) => apiClient.delete(`/inventory/categories/${id}`)
};

// スタッフ関連のAPI
export const staffApi = {
  getStaff: (params) => apiClient.get('/staff', { params }),
  getStaffById: (id) => apiClient.get(`/staff/${id}`),
  addStaff: (staffData) => apiClient.post('/staff', staffData),
  updateStaff: (staffData) => apiClient.put(`/staff/${staffData.id}`, staffData),
  deleteStaff: (id) => apiClient.delete(`/staff/${id}`),
  getShifts: (staffId) => apiClient.get(`/staff/${staffId}/shifts`),
  addShift: (staffId, shiftData) => apiClient.post(`/staff/${staffId}/shifts`, shiftData),
  updateShift: (staffId, shiftId, shiftData) => 
    apiClient.put(`/staff/${staffId}/shifts/${shiftId}`, shiftData),
  deleteShift: (staffId, shiftId) => apiClient.delete(`/staff/${staffId}/shifts/${shiftId}`)
};

// 設定関連のAPI
export const settingsApi = {
  getRestaurantInfo: () => apiClient.get('/settings/restaurant'),
  updateRestaurantInfo: (infoData) => apiClient.put('/settings/restaurant', infoData),
  getSystemSettings: () => apiClient.get('/settings/system'),
  updateSystemSettings: (settingsData) => apiClient.put('/settings/system', settingsData),
  changePassword: (passwordData) => apiClient.post('/settings/password', passwordData),
  getCategories: () => apiClient.get('/settings/categories'),
  addCategory: (categoryData) => apiClient.post('/settings/categories', categoryData),
  updateCategory: (id, categoryData) => apiClient.put(`/settings/categories/${id}`, categoryData),
  deleteCategory: (id) => apiClient.delete(`/settings/categories/${id}`),
  getPaymentMethods: () => apiClient.get('/settings/payment-methods'),
  addPaymentMethod: (methodData) => apiClient.post('/settings/payment-methods', methodData),
  updatePaymentMethod: (id, methodData) => apiClient.put(`/settings/payment-methods/${id}`, methodData),
  deletePaymentMethod: (id) => apiClient.delete(`/settings/payment-methods/${id}`)
};

// 財務管理関連のAPI
export const financeApi = {
  // 予算関連
  getBudgets: (params) => apiClient.get('/finance/budgets', { params }),
  getBudgetById: (id) => apiClient.get(`/finance/budgets/${id}`),
  createBudget: (budgetData) => apiClient.post('/finance/budgets', budgetData),
  updateBudget: (id, budgetData) => apiClient.put(`/finance/budgets/${id}`, budgetData),
  deleteBudget: (id) => apiClient.delete(`/finance/budgets/${id}`),
  
  // 実績関連
  getActuals: (params) => apiClient.get('/finance/actuals', { params }),
  getActualById: (id) => apiClient.get(`/finance/actuals/${id}`),
  createActual: (actualData) => apiClient.post('/finance/actuals', actualData),
  updateActual: (id, actualData) => apiClient.put(`/finance/actuals/${id}`, actualData),
  deleteActual: (id) => apiClient.delete(`/finance/actuals/${id}`),
  
  // レポート関連
  getFinancialReports: (params) => apiClient.get('/finance/reports', { params }),
  generateReport: (reportData) => apiClient.post('/finance/reports/generate', reportData),
  exportReport: (reportId, format) => apiClient.get(`/finance/reports/${reportId}/export/${format}`),
  
  // 実績データ取得用API
  getSalesData: async (period) => {
    try {
      // 開発環境ではモックデータを返す
      // 実環境ではAPI通信を行う
      /*
      const response = await apiClient.get('/sales/summary', {
        params: {
          startDate: period.startDate,
          endDate: period.endDate
        }
      });
      return response;
      */
      
      // 開発用モックデータ
      return {
        total: 3250000,
        food: 2275000,     // 食事売上
        beverage: 975000,  // ドリンク売上
        byDate: [
          { date: '2025-04-01', amount: 105000 },
          { date: '2025-04-02', amount: 98000 },
          { date: '2025-04-03', amount: 112000 }
          // 他の日付データ...
        ]
      };
    } catch (error) {
      console.error('売上データの取得に失敗しました:', error);
      throw error;
    }
  },
  
  getExpensesData: async (period) => {
    try {
      // 実環境ではAPI通信を行う
      /*
      const response = await apiClient.get('/expenses/summary', {
        params: {
          startDate: period.startDate,
          endDate: period.endDate
        }
      });
      return response;
      */
      
      // 開発用モックデータ
      return {
        total: 2470000,
        rent: 800000,          // 家賃
        utilities: 350000,     // 光熱費
        supplies: 420000,      // 庭品費
        marketing: 180000,     // マーケティング費
        other: 720000          // その他経費
      };
    } catch (error) {
      console.error('経費データの取得に失敗しました:', error);
      throw error;
    }
  },
  
  getPayrollData: async (period) => {
    try {
      // 実環境ではAPI通信を行う
      /*
      const response = await apiClient.get('/payroll/summary', {
        params: {
          startDate: period.startDate,
          endDate: period.endDate
        }
      });
      return response;
      */
      
      // 開発用モックデータ
      return {
        totalLabor: 950000,   // 人件費合計
        regular: 650000,      // 正社員人件費
        partTime: 300000,     // アルバイト人件費
        byDepartment: {
          kitchen: 450000,     // キッチン部門
          hall: 350000,       // ホール部門
          management: 150000   // 管理部門
        }
      };
    } catch (error) {
      console.error('給与データの取得に失敗しました:', error);
      throw error;
    }
  }
};

// モック用のデータ（開発中のみ使用）
export const mockData = {
  // ダッシュボード用モックデータ
  dashboardSummary: {
    total_sales: 125000,
    total_orders: 42,
    average_order_value: 2976,
    active_tables: 8
  },
  recentOrders: [
    { id: 1, table: 'テーブル 3', items: 4, total: 5600, status: 'completed', time: '10分前' },
    { id: 2, table: 'テーブル 7', items: 2, total: 2800, status: 'in_progress', time: '15分前' },
    { id: 3, table: 'テイクアウト', items: 3, total: 3200, status: 'ready', time: '20分前' },
    { id: 4, table: 'テーブル 1', items: 5, total: 7500, status: 'completed', time: '30分前' },
    { id: 5, table: 'テーブル 5', items: 2, total: 2400, status: 'completed', time: '45分前' }
  ],
  popularItems: [
    { id: 1, name: '海鮮丼', count: 28, revenue: 42000 },
    { id: 2, name: '天ぷら盛り合わせ', count: 24, revenue: 36000 },
    { id: 3, name: '刺身盛り合わせ', count: 22, revenue: 44000 },
    { id: 4, name: '焼き魚定食', count: 18, revenue: 27000 },
    { id: 5, name: '抹茶アイス', count: 15, revenue: 9000 }
  ],
  salesData: {
    daily: [
      { date: '4/10', sales: 98000 },
      { date: '4/11', sales: 85000 },
      { date: '4/12', sales: 110000 },
      { date: '4/13', sales: 125000 },
      { date: '4/14', sales: 95000 },
      { date: '4/15', sales: 140000 },
      { date: '4/16', sales: 125000 }
    ],
    weekly: [
      { date: '3/15 - 3/21', sales: 720000 },
      { date: '3/22 - 3/28', sales: 680000 },
      { date: '3/29 - 4/4', sales: 750000 },
      { date: '4/5 - 4/11', sales: 810000 },
      { date: '4/12 - 4/18', sales: 778000 }
    ],
    monthly: [
      { date: '11月', sales: 2800000 },
      { date: '12月', sales: 3200000 },
      { date: '1月', sales: 2600000 },
      { date: '2月', sales: 2750000 },
      { date: '3月', sales: 3100000 },
      { date: '4月', sales: 3300000 }
    ]
  },
  inventoryAlerts: [
    { id: 1, name: '米', quantity: 5, unit: 'kg', min_quantity: 10 },
    { id: 2, name: 'マグロ', quantity: 2, unit: 'kg', min_quantity: 5 },
    { id: 3, name: '醤油', quantity: 1, unit: 'L', min_quantity: 3 }
  ],

  // メニュー用モックデータ
  menuItems: [
    {
      id: 1,
      name: '海鮮丼',
      description: '新鮮な魚介をふんだんに使った海鮮丼です。',
      price: 1500,
      category_id: 1,
      category_name: '丼物',
      image_url: 'https://example.com/images/kaisen-don.jpg',
      is_available: true,
      preparation_time: 10,
      ingredients: ['米', 'マグロ', 'サーモン', 'イクラ', 'わさび'],
      allergens: ['魚']
    },
    {
      id: 2,
      name: '天ぷら盛り合わせ',
      description: '季節の野菜と海老の天ぷら盛り合わせです。',
      price: 1200,
      category_id: 2,
      category_name: '揚げ物',
      image_url: 'https://example.com/images/tempura.jpg',
      is_available: true,
      preparation_time: 15,
      ingredients: ['海老', 'さつまいも', 'なす', 'しいたけ', '小麦粉'],
      allergens: ['小麦', 'えび']
    },
    {
      id: 3,
      name: '刺身盛り合わせ',
      description: '新鮮な魚介の刺身盛り合わせです。',
      price: 2000,
      category_id: 3,
      category_name: '刺身',
      image_url: 'https://example.com/images/sashimi.jpg',
      is_available: true,
      preparation_time: 8,
      ingredients: ['マグロ', 'サーモン', 'ハマチ', 'タイ', 'わさび'],
      allergens: ['魚']
    }
  ],
  categories: [
    { id: 1, name: '丼物' },
    { id: 2, name: '揚げ物' },
    { id: 3, name: '刺身' },
    { id: 4, name: '焼き物' },
    { id: 5, name: '煮物' },
    { id: 6, name: '麺類' },
    { id: 7, name: 'デザート' },
    { id: 8, name: 'ドリンク' }
  ],

  // テーブル用モックデータ
  tables: [
    { id: 1, name: 'テーブル 1', capacity: 4, status: 'occupied', order_id: 101 },
    { id: 2, name: 'テーブル 2', capacity: 2, status: 'available', order_id: null },
    { id: 3, name: 'テーブル 3', capacity: 6, status: 'occupied', order_id: 102 },
    { id: 4, name: 'テーブル 4', capacity: 4, status: 'reserved', order_id: null },
    { id: 5, name: 'テーブル 5', capacity: 2, status: 'available', order_id: null },
    { id: 6, name: 'テーブル 6', capacity: 8, status: 'occupied', order_id: 103 },
    { id: 7, name: 'テーブル 7', capacity: 4, status: 'available', order_id: null },
    { id: 8, name: 'テーブル 8', capacity: 2, status: 'occupied', order_id: 104 }
  ],

  // 注文用モックデータ
  orders: [
    {
      id: 101,
      table_id: 1,
      table_name: 'テーブル 1',
      customer_name: '山田太郎',
      status: 'completed',
      total: 5600,
      tax: 560,
      created_at: '2023-04-16T13:45:00',
      completed_at: '2023-04-16T14:30:00',
      payment_method: 'cash',
      items: [
        { id: 1, menu_item_id: 1, name: '海鮮丼', quantity: 2, price: 1500, subtotal: 3000 },
        { id: 2, menu_item_id: 2, name: '天ぷら盛り合わせ', quantity: 1, price: 1200, subtotal: 1200 },
        { id: 3, menu_item_id: 8, name: '緑茶', quantity: 2, price: 300, subtotal: 600 }
      ]
    },
    {
      id: 102,
      table_id: 3,
      table_name: 'テーブル 3',
      customer_name: '佐藤花子',
      status: 'in_progress',
      total: 7800,
      tax: 780,
      created_at: '2023-04-16T14:15:00',
      completed_at: null,
      payment_method: null,
      items: [
        { id: 4, menu_item_id: 3, name: '刺身盛り合わせ', quantity: 2, price: 2000, subtotal: 4000 },
        { id: 5, menu_item_id: 4, name: '焼き魚定食', quantity: 1, price: 1500, subtotal: 1500 },
        { id: 6, menu_item_id: 7, name: '抹茶アイス', quantity: 2, price: 600, subtotal: 1200 },
        { id: 7, menu_item_id: 9, name: '日本酒', quantity: 1, price: 800, subtotal: 800 }
      ]
    }
  ],

  // 予約用モックデータ
  reservations: [
    {
      id: 1,
      customer_name: '田中一郎',
      phone: '090-1234-5678',
      email: 'tanaka@example.com',
      date: '2023-04-17',
      time: '18:00',
      party_size: 4,
      table_id: 1,
      status: 'confirmed',
      note: 'アレルギー：エビ',
      created_at: '2023-04-10T10:30:00'
    },
    {
      id: 2,
      customer_name: '鈴木次郎',
      phone: '090-8765-4321',
      email: 'suzuki@example.com',
      date: '2023-04-17',
      time: '19:30',
      party_size: 2,
      table_id: 5,
      status: 'confirmed',
      note: '',
      created_at: '2023-04-11T15:45:00'
    },
    {
      id: 3,
      customer_name: '高橋三郎',
      phone: '090-2468-1357',
      email: 'takahashi@example.com',
      date: '2023-04-18',
      time: '12:00',
      party_size: 6,
      table_id: 6,
      status: 'pending',
      note: '窓際の席希望',
      created_at: '2023-04-12T09:15:00'
    }
  ],

  // 顧客用モックデータ
  customers: [
    {
      id: 1,
      name: '山田太郎',
      phone: '090-1111-2222',
      email: 'yamada@example.com',
      address: '東京都新宿区新宿1-1-1',
      birthday: '1980-05-15',
      membership_level: 'gold',
      total_visits: 15,
      total_spent: 75000,
      notes: '魚アレルギーあり',
      created_at: '2022-10-15T10:30:00'
    },
    {
      id: 2,
      name: '佐藤花子',
      phone: '090-3333-4444',
      email: 'sato@example.com',
      address: '東京都渋谷区渋谷2-2-2',
      birthday: '1985-08-23',
      membership_level: 'silver',
      total_visits: 8,
      total_spent: 42000,
      notes: 'ワインが好き',
      created_at: '2022-11-20T14:45:00'
    },
    {
      id: 3,
      name: '田中一郎',
      phone: '090-5555-6666',
      email: 'tanaka@example.com',
      address: '東京都品川区大崎3-3-3',
      birthday: '1975-12-10',
      membership_level: 'platinum',
      total_visits: 25,
      total_spent: 150000,
      notes: '窓際の席を好む',
      created_at: '2022-09-05T18:20:00'
    }
  ],

  // 在庫用モックデータ
  inventory: [
    {
      id: 1,
      name: '米',
      category_id: 1,
      category_name: '主食',
      quantity: 25,
      unit: 'kg',
      min_quantity: 10,
      cost_per_unit: 500,
      supplier: '農業協同組合',
      location: '倉庫A',
      last_updated: '2023-04-15T09:00:00'
    },
    {
      id: 2,
      name: 'マグロ',
      category_id: 2,
      category_name: '魚介類',
      quantity: 8,
      unit: 'kg',
      min_quantity: 5,
      cost_per_unit: 3000,
      supplier: '築地市場',
      location: '冷蔵庫B',
      last_updated: '2023-04-16T07:30:00'
    },
    {
      id: 3,
      name: '醤油',
      category_id: 3,
      category_name: '調味料',
      quantity: 5,
      unit: 'L',
      min_quantity: 3,
      cost_per_unit: 800,
      supplier: '調味料卸売',
      location: '棚C',
      last_updated: '2023-04-14T14:15:00'
    }
  ],
  inventoryCategories: [
    { id: 1, name: '主食' },
    { id: 2, name: '魚介類' },
    { id: 3, name: '調味料' },
    { id: 4, name: '野菜' },
    { id: 5, name: '肉類' },
    { id: 6, name: '飲料' }
  ],

  // スタッフ用モックデータ
  staff: [
    {
      id: 1,
      name: '鈴木一郎',
      role: '店長',
      email: 'suzuki@example.com',
      phone: '090-1111-2222',
      hire_date: '2020-04-01',
      status: 'active',
      hourly_rate: 1500,
      note: ''
    },
    {
      id: 2,
      name: '佐藤健太',
      role: 'シェフ',
      email: 'sato@example.com',
      phone: '090-3333-4444',
      hire_date: '2020-06-15',
      status: 'active',
      hourly_rate: 1300,
      note: '寿司担当'
    },
    {
      id: 3,
      name: '田中美咲',
      role: 'ウェイトレス',
      email: 'tanaka@example.com',
      phone: '090-5555-6666',
      hire_date: '2021-03-10',
      status: 'active',
      hourly_rate: 1100,
      note: '英語対応可'
    },
    {
      id: 4,
      name: '山本太郎',
      role: 'ウェイター',
      email: 'yamamoto@example.com',
      phone: '090-7777-8888',
      hire_date: '2021-08-22',
      status: 'active',
      hourly_rate: 1100,
      note: ''
    },
    {
      id: 5,
      name: '高橋裕子',
      role: 'アシスタントシェフ',
      email: 'takahashi@example.com',
      phone: '090-9999-0000',
      hire_date: '2022-01-15',
      status: 'active',
      hourly_rate: 1200,
      note: '天ぷら担当'
    }
  ]
};

// タスク管理関連のAPI
export const taskApi = {
  // タスク関連
  getTasks: (params) => apiClient.get('/tasks', { params }),
  getTaskById: (id) => apiClient.get(`/tasks/${id}`),
  createTask: (taskData) => apiClient.post('/tasks', taskData),
  updateTask: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => apiClient.delete(`/tasks/${id}`),
  completeTask: (id) => apiClient.put(`/tasks/${id}/complete`),
  getTasksByAssignee: (assigneeId) => apiClient.get(`/tasks/assignee/${assigneeId}`),
  getRecurringTasks: () => apiClient.get('/tasks/recurring'),
  createRecurringTask: (taskData) => apiClient.post('/tasks/recurring', taskData),
  updateRecurringTask: (id, taskData) => apiClient.put(`/tasks/recurring/${id}`, taskData),
  deleteRecurringTask: (id) => apiClient.delete(`/tasks/recurring/${id}`),
  
  // タスク開発中用のモックデータ
  getMockTasks: () => {
    return Promise.resolve({
      tasks: [
        {
          id: 1,
          title: '仕入れ発注',
          description: '野菜と肉の発注をする',
          assigneeId: 1,
          assigneeName: '鈴木一郎',
          dueDate: new Date(Date.now() + 86400000).toISOString(), // 明日
          priority: 'high',
          status: 'not_started', // not_started, in_progress, completed
          recurring: true,
          recurringPattern: { type: 'weekly', days: [1, 4] }, // 月曜と木曜
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'スタッフミーティング',
          description: '週間目標と前週の振り返り',
          assigneeId: 1,
          assigneeName: '鈴木一郎',
          dueDate: new Date(Date.now() + 172800000).toISOString(), // 2日後
          priority: 'medium',
          status: 'not_started',
          recurring: true,
          recurringPattern: { type: 'weekly', days: [1] }, // 月曜のみ
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: '清掃業者との打ち合わせ',
          description: '定期清掃の予定確認',
          assigneeId: 1,
          assigneeName: '鈴木一郎',
          dueDate: new Date(Date.now() + 259200000).toISOString(), // 3日後
          priority: 'low',
          status: 'not_started',
          recurring: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          title: '在庫確認',
          description: '在庫数の確認と発注が必要な食材のリストアップ',
          assigneeId: 2,
          assigneeName: '佐藤次郎',
          dueDate: new Date().toISOString(), // 今日
          priority: 'high',
          status: 'in_progress',
          recurring: true,
          recurringPattern: { type: 'daily' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 5,
          title: '新メニュー開発',
          description: '夏季限定メニューのレシピ開発と試作',
          assigneeId: 3,
          assigneeName: '田中三郎',
          dueDate: new Date(Date.now() + 604800000).toISOString(), // 1週間後
          priority: 'medium',
          status: 'in_progress',
          recurring: false,
          createdAt: new Date().toISOString(),
        }
      ]
    });
  }
};

// チェックリスト関連のAPI
export const checklistApi = {
  // チェックリスト関連
  getChecklists: (params) => apiClient.get('/checklists', { params }),
  getChecklistById: (id) => apiClient.get(`/checklists/${id}`),
  createChecklist: (checklistData) => apiClient.post('/checklists', checklistData),
  updateChecklist: (id, checklistData) => apiClient.put(`/checklists/${id}`, checklistData),
  deleteChecklist: (id) => apiClient.delete(`/checklists/${id}`),
  getChecklistItems: (checklistId) => apiClient.get(`/checklists/${checklistId}/items`),
  createChecklistItem: (checklistId, itemData) => apiClient.post(`/checklists/${checklistId}/items`, itemData),
  updateChecklistItem: (checklistId, itemId, itemData) => apiClient.put(`/checklists/${checklistId}/items/${itemId}`, itemData),
  deleteChecklistItem: (checklistId, itemId) => apiClient.delete(`/checklists/${checklistId}/items/${itemId}`),
  completeChecklistItem: (checklistId, itemId) => apiClient.put(`/checklists/${checklistId}/items/${itemId}/complete`),
  getChecklistTemplates: () => apiClient.get('/checklists/templates'),
  
  // チェックリスト開発中用のモックデータ
  getMockChecklists: () => {
    return Promise.resolve({
      checklists: [
        {
          id: 1,
          title: '開店準備チェックリスト',
          description: '開店前に確認すべき項目リスト',
          type: 'opening',
          items: [
            { id: 1, title: '清掃状況の確認', completed: false },
            { id: 2, title: 'テーブルセッティング', completed: true },
            { id: 3, title: 'メニュー在庫確認', completed: true },
            { id: 4, title: 'レジの準備', completed: false },
            { id: 5, title: 'スタッフの出勤確認', completed: true }
          ],
          assigneeId: 1,
          completedBy: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          title: '閉店チェックリスト',
          description: '閉店時に確認すべき項目リスト',
          type: 'closing',
          items: [
            { id: 1, title: 'キッチン機器の電源オフ', completed: false },
            { id: 2, title: '食材の適切な保管', completed: false },
            { id: 3, title: 'ゴミ出し', completed: false },
            { id: 4, title: '現金管理とレジ締め', completed: false },
            { id: 5, title: '施錠確認', completed: false }
          ],
          assigneeId: 1,
          completedBy: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          title: '定期清掃チェックリスト',
          description: '週次の清掃チェックリスト',
          type: 'cleaning',
          items: [
            { id: 1, title: 'フロア清掃', completed: true },
            { id: 2, title: 'キッチン設備清掃', completed: false },
            { id: 3, title: 'トイレ清掃', completed: true },
            { id: 4, title: '冷蔵庫内清掃', completed: false },
            { id: 5, title: '換気扇清掃', completed: false }
          ],
          assigneeId: 2,
          completedBy: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          title: '衛生管理チェックリスト',
          description: '衛生基準の確認事項',
          type: 'hygiene',
          items: [
            { id: 1, title: 'スタッフの手洗い確認', completed: true },
            { id: 2, title: '食材の保存温度確認', completed: true },
            { id: 3, title: '調理器具の消毒', completed: false },
            { id: 4, title: '害虫対策の確認', completed: true },
            { id: 5, title: 'アレルギー対応の確認', completed: true }
          ],
          assigneeId: 3,
          completedBy: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }
};

// マーケティング管理関連のAPI
export const marketingApi = {
  // キャンペーン管理
  getCampaigns: (params) => apiClient.get('/marketing/campaigns', { params }),
  getCampaignById: (id) => apiClient.get(`/marketing/campaigns/${id}`),
  createCampaign: (campaignData) => apiClient.post('/marketing/campaigns', campaignData),
  updateCampaign: (id, campaignData) => apiClient.put(`/marketing/campaigns/${id}`, campaignData),
  deleteCampaign: (id) => apiClient.delete(`/marketing/campaigns/${id}`),
  
  // クーポン管理
  getCoupons: (params) => apiClient.get('/marketing/coupons', { params }),
  getCouponById: (id) => apiClient.get(`/marketing/coupons/${id}`),
  createCoupon: (couponData) => apiClient.post('/marketing/coupons', couponData),
  updateCoupon: (id, couponData) => apiClient.put(`/marketing/coupons/${id}`, couponData),
  deleteCoupon: (id) => apiClient.delete(`/marketing/coupons/${id}`),
  validateCoupon: (code) => apiClient.post('/marketing/coupons/validate', { code }),
  redeemCoupon: (code, orderId) => apiClient.post('/marketing/coupons/redeem', { code, orderId }),
  
  // 効果測定・分析
  getCampaignAnalytics: (campaignId, params) => apiClient.get(`/marketing/analytics/campaigns/${campaignId}`, { params }),
  getCouponUsageAnalytics: (params) => apiClient.get('/marketing/analytics/coupons', { params }),
  getCustomerSegmentAnalytics: (params) => apiClient.get('/marketing/analytics/segments', { params }),
  
  // 顧客管理
  getCustomers: (params) => apiClient.get('/marketing/customers', { params }),
  getCustomerById: (id) => apiClient.get(`/marketing/customers/${id}`),
  createCustomer: (customerData) => apiClient.post('/marketing/customers', customerData),
  updateCustomer: (id, customerData) => apiClient.put(`/marketing/customers/${id}`, customerData),
  deleteCustomer: (id) => apiClient.delete(`/marketing/customers/${id}`),
  getCustomerVisits: (customerId) => apiClient.get(`/marketing/customers/${customerId}/visits`),
  addCustomerVisit: (customerId, visitData) => apiClient.post(`/marketing/customers/${customerId}/visits`, visitData),
  
  // ロイヤルティプログラム
  getLoyaltyPrograms: () => apiClient.get('/marketing/loyalty/programs'),
  getLoyaltyProgramById: (id) => apiClient.get(`/marketing/loyalty/programs/${id}`),
  createLoyaltyProgram: (programData) => apiClient.post('/marketing/loyalty/programs', programData),
  updateLoyaltyProgram: (id, programData) => apiClient.put(`/marketing/loyalty/programs/${id}`, programData),
  deleteLoyaltyProgram: (id) => apiClient.delete(`/marketing/loyalty/programs/${id}`),
  getCustomerLoyalty: (customerId) => apiClient.get(`/marketing/loyalty/customers/${customerId}`),
  addLoyaltyPoints: (customerId, points, reason) => apiClient.post(`/marketing/loyalty/customers/${customerId}/points/add`, { points, reason }),
  redeemLoyaltyPoints: (customerId, points, reward) => apiClient.post(`/marketing/loyalty/customers/${customerId}/points/redeem`, { points, reward }),
  
  // 開発環境用モックデータ
  getMockCampaigns: () => {
    return Promise.resolve({
      campaigns: [
        {
          id: 1,
          name: '夏の特別フェア',
          description: '夏季限定の特別メニューと割引キャンペーン',
          startDate: '2025-07-01',
          endDate: '2025-08-31',
          budget: 100000,
          status: 'active',
          targetAudience: ['families', 'young_adults'],
          goals: {
            revenue: 1000000,
            newCustomers: 50,
            redemptionRate: 30
          },
          channels: ['in_store', 'social_media', 'email'],
          createdAt: '2025-06-15T09:00:00Z'
        },
        {
          id: 2,
          name: '新規顧客引込キャンペーン',
          description: '無料デザート付きの初回来店特典',
          startDate: '2025-05-01',
          endDate: '2025-06-30',
          budget: 50000,
          status: 'completed',
          targetAudience: ['new_customers', 'young_adults'],
          goals: {
            revenue: 500000,
            newCustomers: 100,
            redemptionRate: 40
          },
          channels: ['social_media', 'flyers', 'website'],
          createdAt: '2025-04-15T09:00:00Z'
        },
        {
          id: 3,
          name: 'アプリ会員限定キャンペーン',
          description: 'アプリユーザー限定の10%割引クーポン',
          startDate: '2025-09-01',
          endDate: '2025-10-31',
          budget: 30000,
          status: 'planned',
          targetAudience: ['app_users', 'loyal_customers'],
          goals: {
            revenue: 300000,
            appDownloads: 200,
            redemptionRate: 60
          },
          channels: ['app', 'email', 'push_notification'],
          createdAt: '2025-08-01T09:00:00Z'
        }
      ]
    });
  },
  
  getMockCoupons: () => {
    return Promise.resolve({
      coupons: [
        {
          id: 1,
          code: 'SUMMER25',
          name: '夏季電子クーポン',
          description: '全商品25%割引',
          discountType: 'percentage',
          discountValue: 25,
          minOrderAmount: 3000,
          startDate: '2025-07-01',
          endDate: '2025-08-31',
          campaignId: 1,
          status: 'active',
          limit: 500,
          usageCount: 125,
          createdAt: '2025-06-15T09:00:00Z'
        },
        {
          id: 2,
          code: 'WELCOME500',
          name: '新規顧客特典',
          description: '500円引き',
          discountType: 'fixed',
          discountValue: 500,
          minOrderAmount: 2000,
          startDate: '2025-05-01',
          endDate: '2025-06-30',
          campaignId: 2,
          status: 'expired',
          limit: 200,
          usageCount: 178,
          createdAt: '2025-04-15T09:00:00Z'
        },
        {
          id: 3,
          code: 'APP10',
          name: 'アプリ限定クーポン',
          description: '全商品10%割引',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 0,
          startDate: '2025-09-01',
          endDate: '2025-10-31',
          campaignId: 3,
          status: 'scheduled',
          limit: 1000,
          usageCount: 0,
          createdAt: '2025-08-01T09:00:00Z'
        }
      ]
    });
  },
  
  getMockCustomers: () => {
    return Promise.resolve({
      customers: [
        {
          id: 1,
          name: '佐藤雅人',
          email: 'msato@example.com',
          phoneNumber: '090-1234-5678',
          birthDate: '1985-05-15',
          registeredAt: '2024-01-10T09:00:00Z',
          marketingConsent: true,
          segment: 'loyal',
          totalVisits: 25,
          totalSpent: 125000,
          lastVisitDate: '2025-04-10T19:30:00Z',
          preferences: ['japanese', 'seafood'],
          loyaltyPoints: 1250,
          loyaltyTier: 'gold'
        },
        {
          id: 2,
          name: '田中淳',
          email: 'jtanaka@example.com',
          phoneNumber: '080-9876-5432',
          birthDate: '1990-10-08',
          registeredAt: '2024-03-05T14:30:00Z',
          marketingConsent: true,
          segment: 'regular',
          totalVisits: 12,
          totalSpent: 45000,
          lastVisitDate: '2025-04-05T12:45:00Z',
          preferences: ['meat', 'dessert'],
          loyaltyPoints: 450,
          loyaltyTier: 'silver'
        },
        {
          id: 3,
          name: '鈴木美子',
          email: 'ysuzuki@example.com',
          phoneNumber: '070-1122-3344',
          birthDate: '1995-12-20',
          registeredAt: '2025-02-15T18:20:00Z',
          marketingConsent: false,
          segment: 'new',
          totalVisits: 3,
          totalSpent: 9500,
          lastVisitDate: '2025-04-12T20:15:00Z',
          preferences: ['vegetarian'],
          loyaltyPoints: 95,
          loyaltyTier: 'bronze'
        }
      ]
    });
  },
  
  getMockLoyaltyPrograms: () => {
    return Promise.resolve({
      programs: [
        {
          id: 1,
          name: 'レストラン平日ポイント',
          description: '平日利用で通常の2倍のポイント還元',
          pointsPerYen: 1,
          startDate: '2025-05-01',
          endDate: '2025-07-31',
          status: 'active',
          applicableDays: ['monday', 'tuesday', 'wednesday', 'thursday'],
          excludedHolidays: true,
          bonusMultiplier: 2,
          minimumSpend: 2000
        },
        {
          id: 2,
          name: '誕生日特典',
          description: 'お誕生日月の利用でポイント3倍還元',
          pointsPerYen: 1,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          status: 'active',
          applicableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          birthdayOnly: true,
          bonusMultiplier: 3,
          minimumSpend: 0
        },
        {
          id: 3,
          name: 'ゴールド会員優待',
          description: 'ゴールド会員専用の特別優待プログラム',
          pointsPerYen: 2,
          startDate: '2025-01-01',
          endDate: null,
          status: 'active',
          applicableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          tierRestriction: 'gold',
          minimumSpend: 0
        }
      ],
      tiers: [
        {
          id: 1,
          name: 'bronze',
          displayName: 'ブロンズ',
          requiredPoints: 0,
          benefits: [
            '通常ポイント還元率',
            '誕生日特典'
          ]
        },
        {
          id: 2,
          name: 'silver',
          displayName: 'シルバー',
          requiredPoints: 1000,
          benefits: [
            '1.5倍ポイント還元率',
            '優先予約',
            '誕生日特典と無料デザート'
          ]
        },
        {
          id: 3,
          name: 'gold',
          displayName: 'ゴールド',
          requiredPoints: 5000,
          benefits: [
            '2倍ポイント還元率',
            '即時予約保証',
            '専用ラウンジ利用可',
            '誕生日に無料コースメニュー'
          ]
        }
      ]
    });
  }
};

export default apiClient;
