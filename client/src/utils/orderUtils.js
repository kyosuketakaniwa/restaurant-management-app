/**
 * 注文管理関連のユーティリティ関数
 */

import { getLocalStorageData, setLocalStorageData } from './storeUtils';
import { v4 as uuidv4 } from 'uuid';

// 注文ステータスの定義
export const ORDER_STATUS = {
  NEW: 'new',              // 新規注文
  IN_PROGRESS: 'inProgress', // 調理中
  READY: 'ready',          // 提供準備完了
  DELIVERED: 'delivered',   // 提供済み
  CANCELED: 'canceled',     // キャンセル
  PAID: 'paid'             // 支払い済み
};

// 支払い方法の定義
export const PAYMENT_METHODS = {
  CASH: 'cash',           // 現金
  CREDIT_CARD: 'creditCard', // クレジットカード
  DEBIT_CARD: 'debitCard',  // デビットカード
  QR_CODE: 'qrCode',       // QRコード決済
  ELECTRONIC: 'electronic', // 電子マネー
  INVOICE: 'invoice'       // 請求書払い
};

// デフォルトの注文データ
const DEFAULT_ORDERS = [
  {
    id: 'order-1',
    tableId: 'table-1',
    customerId: null,
    customerName: '店内客 1',
    orderNumber: '1001',
    status: ORDER_STATUS.DELIVERED,
    items: [
      {
        id: 'item-1',
        menuItemId: 'menu-1',
        name: '醤油ラーメン',
        price: 850,
        quantity: 2,
        options: ['麺固め', '味濃いめ'],
        notes: '',
        status: ORDER_STATUS.DELIVERED
      },
      {
        id: 'item-2',
        menuItemId: 'menu-5',
        name: '餃子',
        price: 450,
        quantity: 1,
        options: [],
        notes: '',
        status: ORDER_STATUS.DELIVERED
      }
    ],
    subtotal: 2150,
    taxAmount: 215,
    discount: 0,
    total: 2365,
    paymentMethod: PAYMENT_METHODS.CASH,
    paid: true,
    orderDate: '2025-04-17T10:30:00Z',
    completedDate: '2025-04-17T11:15:00Z',
    notes: '',
    createdAt: '2025-04-17T10:30:00Z',
    updatedAt: '2025-04-17T11:15:00Z'
  },
  {
    id: 'order-2',
    tableId: 'table-3',
    customerId: null,
    customerName: '店内客 2',
    orderNumber: '1002',
    status: ORDER_STATUS.IN_PROGRESS,
    items: [
      {
        id: 'item-3',
        menuItemId: 'menu-2',
        name: '味噌ラーメン',
        price: 900,
        quantity: 1,
        options: ['チャーシュー増し'],
        notes: '',
        status: ORDER_STATUS.IN_PROGRESS
      },
      {
        id: 'item-4',
        menuItemId: 'menu-6',
        name: 'ライス',
        price: 200,
        quantity: 1,
        options: [],
        notes: '',
        status: ORDER_STATUS.READY
      }
    ],
    subtotal: 1100,
    taxAmount: 110,
    discount: 0,
    total: 1210,
    paymentMethod: null,
    paid: false,
    orderDate: '2025-04-18T08:45:00Z',
    completedDate: null,
    notes: '',
    createdAt: '2025-04-18T08:45:00Z',
    updatedAt: '2025-04-18T08:50:00Z'
  }
];

/**
 * 全ての注文を取得
 */
export const getAllOrders = () => {
  return getLocalStorageData('orders', DEFAULT_ORDERS);
};

/**
 * 特定の注文を取得
 * @param {string} orderId 注文ID
 */
export const getOrderById = (orderId) => {
  const orders = getAllOrders();
  return orders.find(order => order.id === orderId) || null;
};

/**
 * テーブルに関連する注文を取得
 * @param {string} tableId テーブルID
 */
export const getOrdersByTableId = (tableId) => {
  const orders = getAllOrders();
  return orders.filter(order => order.tableId === tableId);
};

/**
 * アクティブな注文を取得（未支払い・処理中の注文）
 */
export const getActiveOrders = () => {
  const orders = getAllOrders();
  return orders.filter(order => 
    order.status !== ORDER_STATUS.CANCELED && 
    order.status !== ORDER_STATUS.PAID
  );
};

/**
 * 特定のステータスの注文を取得
 * @param {string} status ステータス
 */
export const getOrdersByStatus = (status) => {
  const orders = getAllOrders();
  return orders.filter(order => order.status === status);
};

/**
 * 日付範囲で注文を取得
 * @param {string} startDate 開始日
 * @param {string} endDate 終了日
 */
export const getOrdersByDateRange = (startDate, endDate) => {
  const orders = getAllOrders();
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // 終了日の最後まで
  
  return orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= start && orderDate <= end;
  });
};

/**
 * 注文の保存
 * @param {Object} order 注文データ
 */
export const saveOrder = (order) => {
  const orders = getAllOrders();
  const now = new Date().toISOString();
  
  // 新規注文かどうかを確認
  const existingOrderIndex = orders.findIndex(o => o.id === order.id);
  
  if (existingOrderIndex >= 0) {
    // 既存の注文を更新
    order.updatedAt = now;
    orders[existingOrderIndex] = { ...order };
  } else {
    // 新規注文を追加
    if (!order.id) {
      order.id = `order-${uuidv4()}`;
    }
    if (!order.orderNumber) {
      order.orderNumber = generateOrderNumber();
    }
    if (!order.orderDate) {
      order.orderDate = now;
    }
    
    order.createdAt = now;
    order.updatedAt = now;
    
    orders.push(order);
  }
  
  // LocalStorageに保存
  setLocalStorageData('orders', orders);
  
  return order;
};

/**
 * 注文ステータスの更新
 * @param {string} orderId 注文ID
 * @param {string} status 新しいステータス
 */
export const updateOrderStatus = (orderId, status) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex < 0) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  const now = new Date().toISOString();
  
  // ステータスを更新
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = now;
  
  // 支払い済みの場合は支払い情報も更新
  if (status === ORDER_STATUS.PAID) {
    orders[orderIndex].paid = true;
    orders[orderIndex].paidAt = now;
    orders[orderIndex].paymentMethod = orders[orderIndex].paymentMethod || PAYMENT_METHODS.CASH;
    orders[orderIndex].completedDate = now;
  }
  // 完了またはキャンセルの場合は完了日時を設定
  else if (status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.CANCELED) {
    orders[orderIndex].completedDate = now;
  }
  
  // LocalStorageに保存
  setLocalStorageData('orders', orders);
  
  // 手動でローカルストレージイベントを発行
  window.dispatchEvent(new Event('storage'));
  
  return { success: true, order: orders[orderIndex] };
};

/**
 * 注文アイテムのステータス更新
 * @param {string} orderId 注文ID
 * @param {string} itemId アイテムID
 * @param {string} status 新しいステータス
 */
export const updateOrderItemStatus = (orderId, itemId, status) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex < 0) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  const itemIndex = orders[orderIndex].items.findIndex(item => item.id === itemId);
  
  if (itemIndex < 0) {
    return { success: false, message: '注文アイテムが見つかりません' };
  }
  
  // アイテムのステータスを更新
  orders[orderIndex].items[itemIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  // 全てのアイテムが同じステータスかチェックして、注文全体のステータスを更新
  const allItemsHaveSameStatus = orders[orderIndex].items.every(item => item.status === status);
  
  if (allItemsHaveSameStatus) {
    orders[orderIndex].status = status;
    
    // 完了またはキャンセルの場合は完了日時を設定
    if (status === ORDER_STATUS.DELIVERED || 
        status === ORDER_STATUS.PAID || 
        status === ORDER_STATUS.CANCELED) {
      orders[orderIndex].completedDate = new Date().toISOString();
    }
  }
  
  // LocalStorageに保存
  setLocalStorageData('orders', orders);
  
  return { success: true, order: orders[orderIndex] };
};

/**
 * 注文アイテムの追加
 * @param {string} orderId 注文ID
 * @param {Object} item 追加するアイテム
 */
export const addOrderItem = (orderId, item) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex < 0) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  // アイテムIDがない場合は生成
  if (!item.id) {
    item.id = `item-${uuidv4()}`;
  }
  
  // アイテムのステータスがない場合は注文のステータスを設定
  if (!item.status) {
    item.status = orders[orderIndex].status;
  }
  
  // アイテムを追加
  orders[orderIndex].items.push(item);
  
  // 金額を再計算
  recalculateOrderTotals(orders[orderIndex]);
  
  // 更新日時を設定
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  // LocalStorageに保存
  setLocalStorageData('orders', orders);
  
  return { success: true, order: orders[orderIndex] };
};

/**
 * 注文アイテムの更新
 * @param {string} orderId 注文ID
 * @param {string} itemId アイテムID
 * @param {Object} updatedItem 更新するアイテムデータ
 */
export const updateOrderItem = (orderId, itemId, updatedItem) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex < 0) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  const itemIndex = orders[orderIndex].items.findIndex(item => item.id === itemId);
  
  if (itemIndex < 0) {
    return { success: false, message: '注文アイテムが見つかりません' };
  }
  
  // アイテムを更新
  orders[orderIndex].items[itemIndex] = {
    ...orders[orderIndex].items[itemIndex],
    ...updatedItem
  };
  
  // 金額を再計算
  recalculateOrderTotals(orders[orderIndex]);
  
  // 更新日時を設定
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  // LocalStorageに保存
  setLocalStorageData('orders', orders);
  
  return { success: true, order: orders[orderIndex] };
};

/**
 * 注文アイテムの削除
 * @param {string} orderId 注文ID
 * @param {string} itemId アイテムID
 */
export const removeOrderItem = (orderId, itemId) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex < 0) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  // アイテムを削除
  orders[orderIndex].items = orders[orderIndex].items.filter(item => item.id !== itemId);
  
  // 金額を再計算
  recalculateOrderTotals(orders[orderIndex]);
  
  // 更新日時を設定
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  // LocalStorageに保存
  setLocalStorageData('orders', orders);
  
  return { success: true, order: orders[orderIndex] };
};

/**
 * 注文の削除
 * @param {string} orderId 注文ID
 */
export const deleteOrder = (orderId) => {
  const orders = getAllOrders();
  const updatedOrders = orders.filter(order => order.id !== orderId);
  
  if (updatedOrders.length === orders.length) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  // LocalStorageに保存
  setLocalStorageData('orders', updatedOrders);
  
  return { success: true };
};

/**
 * 注文番号の生成
 * 現在の日付をもとに連番の注文番号を生成
 */
export const generateOrderNumber = () => {
  const orders = getAllOrders();
  const today = new Date();
  
  // 今日の日付を取得 (YYYYMMDD形式)
  const datePrefix = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0');
  
  // 今日の注文のみをフィルタリング
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= todayStart && orderDate <= todayEnd;
  });
  
  // 今日の注文数+1を注文番号に設定
  const orderCount = todayOrders.length + 1;
  
  // 形式: YYYYMMDD-XXX (XXXは連番、3桁で0埋め)
  return `${datePrefix}-${orderCount.toString().padStart(3, '0')}`;
};

/**
 * 注文の合計金額を再計算
 * @param {Object} order 計算対象の注文
 */
export const recalculateOrderTotals = (order) => {
  // 小計の計算
  order.subtotal = order.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // 税額の計算 (消費税率は10%と仮定)
  order.taxAmount = Math.round(order.subtotal * 0.1);
  
  // 合計金額の計算
  order.total = order.subtotal + order.taxAmount - (order.discount || 0);
  
  return order;
};

/**
 * 支払い処理
 * @param {string} orderId 注文ID
 * @param {string} paymentMethod 支払い方法
 */
export const processPayment = (orderId, paymentMethod) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex < 0) {
    return { success: false, message: '注文が見つかりません' };
  }
  
  // 支払い情報を更新
  const now = new Date().toISOString();
  orders[orderIndex].paymentMethod = paymentMethod;
  orders[orderIndex].paid = true;
  orders[orderIndex].status = ORDER_STATUS.PAID;
  orders[orderIndex].paidAt = now; // 支払い日時を追加
  orders[orderIndex].completedDate = now;
  orders[orderIndex].updatedAt = now;
  
  // LocalStorageに保存
  setLocalStorageData('orders', orders);
  
  // 手動でローカルストレージイベントを発行
  window.dispatchEvent(new Event('storage'));
  
  return { success: true, order: orders[orderIndex] };
};

/**
 * 注文レポートの生成
 * @param {string} startDate 開始日
 * @param {string} endDate 終了日
 */
export const generateOrderReport = (startDate, endDate) => {
  // 指定された期間の注文を取得
  const orders = getOrdersByDateRange(startDate, endDate);
  
  // 報告用のデータを集計
  const report = {
    period: {
      startDate,
      endDate
    },
    totalOrders: orders.length,
    totalSales: 0,
    totalTax: 0,
    totalDiscount: 0,
    paymentMethodBreakdown: {
      [PAYMENT_METHODS.CASH]: 0,
      [PAYMENT_METHODS.CREDIT_CARD]: 0,
      [PAYMENT_METHODS.DEBIT_CARD]: 0,
      [PAYMENT_METHODS.QR_CODE]: 0,
      [PAYMENT_METHODS.ELECTRONIC]: 0,
      [PAYMENT_METHODS.INVOICE]: 0
    },
    statusBreakdown: {
      [ORDER_STATUS.NEW]: 0,
      [ORDER_STATUS.IN_PROGRESS]: 0,
      [ORDER_STATUS.READY]: 0,
      [ORDER_STATUS.DELIVERED]: 0,
      [ORDER_STATUS.CANCELED]: 0,
      [ORDER_STATUS.PAID]: 0
    },
    topItems: [],
    averageOrderValue: 0,
    hourlyDistribution: {}
  };
  
  // アイテムの集計用一時オブジェクト
  const itemCounts = {};
  
  // 各注文を処理
  orders.forEach(order => {
    // 合計金額の集計
    report.totalSales += order.total || 0;
    report.totalTax += order.taxAmount || 0;
    report.totalDiscount += order.discount || 0;
    
    // 支払い方法の集計
    if (order.paymentMethod) {
      report.paymentMethodBreakdown[order.paymentMethod]++;
    }
    
    // 注文ステータスの集計
    report.statusBreakdown[order.status]++;
    
    // アイテムの集計
    order.items.forEach(item => {
      const itemId = item.menuItemId;
      if (!itemCounts[itemId]) {
        itemCounts[itemId] = {
          id: itemId,
          name: item.name,
          count: 0,
          revenue: 0
        };
      }
      
      itemCounts[itemId].count += item.quantity;
      itemCounts[itemId].revenue += (item.price * item.quantity);
    });
    
    // 時間帯別の集計
    if (order.orderDate) {
      const hour = new Date(order.orderDate).getHours();
      const hourKey = `${hour}:00`;
      
      if (!report.hourlyDistribution[hourKey]) {
        report.hourlyDistribution[hourKey] = {
          count: 0,
          revenue: 0
        };
      }
      
      report.hourlyDistribution[hourKey].count++;
      report.hourlyDistribution[hourKey].revenue += order.total || 0;
    }
  });
  
  // 平均注文金額を計算
  if (orders.length > 0) {
    report.averageOrderValue = Math.round(report.totalSales / orders.length);
  }
  
  // 人気アイテムのソートとトップ10の抽出
  report.topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return report;
};

/**
 * 注文データの初期化
 */
export const initializeOrderData = () => {
  // すでに初期化されているかチェック
  const initialized = getLocalStorageData('orderDataInitialized', false);
  if (initialized) {
    return true;
  }
  
  // 注文データの初期化
  setLocalStorageData('orders', DEFAULT_ORDERS);
  
  // 初期化フラグを設定
  setLocalStorageData('orderDataInitialized', true);
  
  return true;
};
