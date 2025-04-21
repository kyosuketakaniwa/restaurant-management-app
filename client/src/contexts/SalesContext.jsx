import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOrder } from './OrderContext';
import { getAllOrders, ORDER_STATUS, processPayment } from '../utils/orderUtils';

// 売上コンテキスト
const SalesContext = createContext();

// 売上コンテキストプロバイダー
export const SalesProvider = ({ children }) => {
  // 売上関連の状態
  const [salesData, setSalesData] = useState([]);
  const [dailySales, setDailySales] = useState({});
  const [weeklySales, setWeeklySales] = useState({});
  const [monthlySales, setMonthlySales] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // OrderContextから注文データにアクセス
  const { completedOrders } = useOrder();
  
  // 初期化時とOrderContextの完了注文が更新されたときに売上データを更新
  useEffect(() => {
    // 初期化時に売上データを読み込む
    updateSalesData();
    
    // LocalStorageのイベントリスナーを追加
    const handleStorageChange = (e) => {
      if (!e.key || e.key === 'orders') {
        console.log('ストレージ変更イベントを検知しました');
        updateSalesData();
      }
    };
    
    // イベントリスナーを登録
    window.addEventListener('storage', handleStorageChange);
    
    // unmount時にイベントリスナーを解除
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // OrderContextの完了注文が更新されたときにデータを更新
  useEffect(() => {
    if (completedOrders && completedOrders.length > 0) {
      updateSalesData();
    }
  }, [completedOrders]);
  
  // 売上データを更新
  const updateSalesData = () => {
    try {
      console.log('売上データを更新中...');
      
      // LocalStorageから直接すべての注文データを取得
      const allOrders = getAllOrders();
      console.log('取得した注文数:', allOrders.length);
      
      // 完了・支払い済みの注文のみをフィルタリング
      const paidOrders = allOrders.filter(order => 
        (order.status === ORDER_STATUS.PAID && order.paid === true) ||
        (order.status === 'completed' && order.paymentMethod) // 互換性のためレガシーフォーマットにも対応
      );
      console.log('支払い済み注文数:', paidOrders.length);
      
      if (paidOrders.length === 0) {
        console.log('支払い済みの注文がありません');
        return;
      }
      
      // 注文データから売上データを生成
      const salesFromOrders = paidOrders.map(order => {
        const saleData = {
          id: order.id,
          date: order.paidAt || order.completedDate || order.completedAt || order.updatedAt || order.orderDate || order.createdAt || new Date().toISOString(),
          totalAmount: order.total || calculateTotalAmount(order),
          paymentMethod: order.paymentMethod || 'cash',
          items: order.items || [],
          tableId: order.tableId || 'unknown',
          customerId: order.customerName ? `customer-${order.customerName}` : (order.customer?.name ? `customer-${order.customer.name}` : null)
        };
        console.log('売上データ生成:', saleData.id, saleData.totalAmount);
        return saleData;
      });
      
      // 既存のデータと重複を除いて更新
      setSalesData(prevData => {
        const existingIds = new Set(prevData.map(sale => sale.id));
        const newSales = salesFromOrders.filter(sale => !existingIds.has(sale.id));
        console.log('新規売上データ数:', newSales.length);
        
        const updatedData = [...prevData, ...newSales];
        console.log('更新後の売上データ数:', updatedData.length);
        return updatedData;
      });
      
      // 当日・当週・当月の売上データも更新
      setDailySales(getDailySales());
      setWeeklySales(getWeeklySales());
      setMonthlySales(getMonthlySales());
    } catch (err) {
      console.error('売上データの更新に失敗しました:', err);
      setError('売上データの更新に失敗しました');
    }
  };
  
  // 注文の合計金額を計算
  const calculateTotalAmount = (order) => {
    return order.items.reduce((total, item) => total + item.subtotal, 0);
  };
  
  // 新しい売上データを手動で追加
  const addSalesRecord = (saleData) => {
    const newSale = {
      id: `sale_${Date.now()}`,
      date: new Date().toISOString(),
      ...saleData
    };
    
    setSalesData(prevData => [...prevData, newSale]);
    return newSale;
  };
  
  // 日別の売上データを取得
  const getDailySales = (date) => {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    const dailyData = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toISOString().split('T')[0] === targetDateStr;
    });
    
    const total = dailyData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    return {
      date: targetDateStr,
      sales: dailyData,
      totalAmount: total,
      count: dailyData.length
    };
  };
  
  // 週別の売上データを取得
  const getWeeklySales = (startDate) => {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    // その週の日曜日に設定
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    
    const weeklyData = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate < end;
    });
    
    // 日別に集計
    const dailyTotals = {};
    weeklyData.forEach(sale => {
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      if (!dailyTotals[saleDate]) {
        dailyTotals[saleDate] = 0;
      }
      dailyTotals[saleDate] += sale.totalAmount;
    });
    
    const total = weeklyData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      sales: weeklyData,
      dailyTotals,
      totalAmount: total,
      count: weeklyData.length
    };
  };
  
  // 月別の売上データを取得
  const getMonthlySales = (month, year) => {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month !== undefined ? month : now.getMonth();
    
    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    const monthlyData = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
    
    // 日別に集計
    const dailyTotals = {};
    monthlyData.forEach(sale => {
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      if (!dailyTotals[saleDate]) {
        dailyTotals[saleDate] = 0;
      }
      dailyTotals[saleDate] += sale.totalAmount;
    });
    
    const total = monthlyData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    return {
      month: targetMonth,
      year: targetYear,
      sales: monthlyData,
      dailyTotals,
      totalAmount: total,
      count: monthlyData.length
    };
  };
  
  // 売上データをカテゴリ別に集計
  const getSalesByCategory = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const filteredSales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
    
    // カテゴリ別に集計
    const categoryTotals = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const category = item.category || '未分類';
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += item.subtotal;
      });
    });
    
    return categoryTotals;
  };
  
  // 時間帯別売上集計
  const getSalesByHour = (date) => {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dailyData = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= targetDate && saleDate < nextDate;
    });
    
    // 時間別に集計
    const hourlyTotals = Array(24).fill(0);
    dailyData.forEach(sale => {
      const saleDate = new Date(sale.date);
      const hour = saleDate.getHours();
      hourlyTotals[hour] += sale.totalAmount;
    });
    
    return hourlyTotals;
  };
  
  // 支払い方法別売上集計
  const getSalesByPaymentMethod = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const filteredSales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
    
    // 支払い方法別に集計
    const paymentMethodTotals = {};
    filteredSales.forEach(sale => {
      const method = sale.paymentMethod || 'その他';
      if (!paymentMethodTotals[method]) {
        paymentMethodTotals[method] = 0;
      }
      paymentMethodTotals[method] += sale.totalAmount;
    });
    
    return paymentMethodTotals;
  };
  
  // テスト用支払い処理関数（デバッグ用）
  const testProcessPayment = async (orderId) => {
    try {
      console.log('テスト支払い処理開始:', orderId);
      const result = processPayment(orderId, 'cash');
      if (result.success) {
        console.log('テスト支払い処理成功:', result.order);
        // 即時更新
        updateSalesData();
        return result.order;
      } else {
        console.error('テスト支払い処理失敗:', result.message);
        return null;
      }
    } catch (err) {
      console.error('テスト支払い処理エラー:', err);
      return null;
    }
  };

  // コンテキスト値
  const value = {
    salesData,
    dailySales,
    weeklySales,
    monthlySales,
    loading,
    error,
    getDailySales,
    getWeeklySales,
    getMonthlySales,
    getSalesByCategory,
    getSalesByHour,
    getSalesByPaymentMethod,
    addSalesRecord,
    updateSalesData,
    testProcessPayment // デバッグ用
  };
  
  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};

// 売上コンテキストを使用するためのフック
export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export default SalesContext;
