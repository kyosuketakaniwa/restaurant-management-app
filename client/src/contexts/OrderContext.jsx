import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  saveOrder as saveOrderToStorage,
  updateOrderStatus as updateOrderStatusInStorage,
  processPayment as processPaymentInStorage,
  getAllOrders,
  ORDER_STATUS
} from '../utils/orderUtils';
// 注：実際のアプリケーションでは、APIサービスを使用して注文データをサーバーに保存します

// 注文コンテキスト
const OrderContext = createContext();

// 注文コンテキストプロバイダー
export const OrderProvider = ({ children }) => {
  // 注文関連の状態
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cart, setCart] = useState({ items: [], tableId: null, customer: null, notes: '' });
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 初期化時に注文データを読み込む
  useEffect(() => {
    try {
      const allOrders = getAllOrders();
      
      // アクティブな注文とすでに完了した注文を分ける
      const active = allOrders.filter(order => 
        order.status !== ORDER_STATUS.PAID && 
        order.status !== ORDER_STATUS.CANCELED
      );
      
      const completed = allOrders.filter(order => 
        order.status === ORDER_STATUS.PAID || 
        order.status === ORDER_STATUS.CANCELED
      );
      
      setActiveOrders(active);
      setCompletedOrders(completed);
      setOrderHistory(allOrders);
    } catch (err) {
      console.error('注文データの読み込みに失敗しました', err);
    }
  }, []);

  // カートへ商品を追加
  const addToCart = (item, quantity = 1, options = {}) => {
    setCart(prevCart => {
      // 既存アイテムの確認
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => cartItem.id === item.id && 
          JSON.stringify(cartItem.options) === JSON.stringify(options)
      );

      // 商品の新しいコピーを作成
      const newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        options,
        subtotal: item.price * quantity
      };

      // 新しいアイテム配列を作成
      let newItems;
      if (existingItemIndex >= 0) {
        // 既存アイテムを更新
        newItems = [...prevCart.items];
        const updatedQuantity = newItems[existingItemIndex].quantity + quantity;
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: updatedQuantity,
          subtotal: item.price * updatedQuantity
        };
      } else {
        // 新しいアイテムを追加
        newItems = [...prevCart.items, newItem];
      }

      return {
        ...prevCart,
        items: newItems
      };
    });
  };

  // カートから商品を削除
  const removeFromCart = (index) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter((_, i) => i !== index)
    }));
  };

  // カート内の商品の数量を更新
  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart(prevCart => {
      const newItems = [...prevCart.items];
      newItems[index] = {
        ...newItems[index],
        quantity: quantity,
        subtotal: newItems[index].price * quantity
      };
      return {
        ...prevCart,
        items: newItems
      };
    });
  };

  // テーブルIDを設定
  const setTableId = (tableId) => {
    setCart(prevCart => ({
      ...prevCart,
      tableId
    }));
  };

  // 顧客情報を設定
  const setCustomer = (customer) => {
    setCart(prevCart => ({
      ...prevCart,
      customer
    }));
  };

  // 注文メモを設定
  const setOrderNotes = (notes) => {
    setCart(prevCart => ({
      ...prevCart,
      notes
    }));
  };

  // カートをクリア
  const clearCart = () => {
    setCart({
      items: [],
      tableId: null,
      customer: null,
      notes: ''
    });
  };

  // 注文を作成
  // @param {boolean} clearCartAfterCreate - 注文作成後にカートをクリアするかどうか
  const createOrder = async (clearCartAfterCreate = false) => {
    if (cart.items.length === 0) {
      setError('カートが空です');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // 現在の日時
      const now = new Date().toISOString();
      
      // 小計と合計を計算
      const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
      const taxRate = 0.1; // 10%の消費税
      const taxAmount = Math.round(subtotal * taxRate);
      const total = subtotal + taxAmount;
      
      // POSの注文データをorderUtilsのフォーマットに変換
      const orderItems = cart.items.map(item => ({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options ? Object.values(item.options) : [],
        notes: item.notes || '',
        status: ORDER_STATUS.NEW
      }));
      
      // 注文データを作成
      const orderData = {
        customerName: cart.customer?.name || '店内客',
        tableId: cart.tableId || 'table-1',
        status: ORDER_STATUS.NEW,
        items: orderItems,
        subtotal,
        taxAmount,
        discount: 0,
        total,
        paymentMethod: null,
        paid: false,
        notes: cart.notes || '',
        orderDate: now
      };

      // 注文データを保存
      const savedOrder = saveOrderToStorage(orderData);
      
      // アクティブな注文に追加
      setActiveOrders(prevOrders => [...prevOrders, savedOrder]);
      setOrderHistory(prevHistory => [savedOrder, ...prevHistory]);
      
      // 指定された場合のみカートをクリア
      if (clearCartAfterCreate) {
        clearCart();
      }
      
      setLoading(false);
      return savedOrder;
    } catch (err) {
      console.error('注文処理中にエラー:', err);
      setError('注文処理中にエラーが発生しました');
      setLoading(false);
      return null;
    }
  };

  // 注文ステータスを更新
  const updateOrderStatus = (orderId, status) => {
    try {
      // 注文ストレージのステータスを更新
      const result = updateOrderStatusInStorage(orderId, status);
      
      if (result.success) {
        const updatedOrder = result.order;
        
        // アクティブな注文から検索
        const orderIndex = activeOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex >= 0) {
          if (status === ORDER_STATUS.PAID || status === ORDER_STATUS.CANCELED) {
            // 完了した注文に移動
            setActiveOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            setCompletedOrders(prevOrders => [updatedOrder, ...prevOrders]);
            
            // 注文履歴を更新
            setOrderHistory(prevHistory => {
              const index = prevHistory.findIndex(order => order.id === orderId);
              if (index >= 0) {
                const newHistory = [...prevHistory];
                newHistory[index] = updatedOrder;
                return newHistory;
              }
              return [updatedOrder, ...prevHistory];
            });
            
            // ここで売上データとして処理される（SalesContextが監視している）
          } else {
            // ステータスだけ更新
            const newActiveOrders = [...activeOrders];
            newActiveOrders[orderIndex] = updatedOrder;
            setActiveOrders(newActiveOrders);
            
            // 注文履歴を更新
            setOrderHistory(prevHistory => {
              const index = prevHistory.findIndex(order => order.id === orderId);
              if (index >= 0) {
                const newHistory = [...prevHistory];
                newHistory[index] = updatedOrder;
                return newHistory;
              }
              return prevHistory;
            });
          }
        }
        
        return updatedOrder;
      } else {
        setError('注文ステータスの更新に失敗しました');
        return null;
      }
    } catch (err) {
      console.error('注文ステータス更新中にエラー:', err);
      setError('注文ステータス更新中にエラーが発生しました');
      return null;
    }
  };
  
  // 注文を完了処理（支払い処理など）
  const completeOrder = (orderId, paymentDetails) => {
    setLoading(true);
    try {
      // 注文がactiveOrdersにあるか確認
      let targetOrderIndex = activeOrders.findIndex(order => order.id === orderId);
      let isActive = targetOrderIndex !== -1;
      
      // activeOrdersになければ、orderHistoryから探す
      if (!isActive) {
        console.log(`注文 ${orderId} はアクティブな注文に見つからなかったため、履歴から検索します`);
      }

      // 支払い処理を実行（ユーティリティ関数はローカルストレージから直接取得するので、
      // activeOrdersやorderHistoryに関係なく処理できる）
      const result = processPaymentInStorage(orderId, paymentDetails.method);
      
      if (result.success) {
        const completedOrder = result.order;
        
        // アクティブな注文だった場合は削除
        if (isActive) {
          const newActiveOrders = [...activeOrders];
          newActiveOrders.splice(targetOrderIndex, 1);
          setActiveOrders(newActiveOrders);
        }
        
        // 完了済み注文に追加
        setCompletedOrders(prev => {
          // 重複を避けるために既存の同じIDの注文を削除
          const filteredOrders = prev.filter(order => order.id !== orderId);
          return [completedOrder, ...filteredOrders];
        });
        
        // 注文履歴を更新
        setOrderHistory(prevHistory => {
          const index = prevHistory.findIndex(order => order.id === orderId);
          if (index >= 0) {
            const newHistory = [...prevHistory];
            newHistory[index] = completedOrder;
            return newHistory;
          }
          return [completedOrder, ...prevHistory];
        });

        // 売上データとして確実に処理されるために、windowストレージイベントを発火
        // SalesContextが自動的に完了済み注文を監視しているため
        window.dispatchEvent(new Event('storage'));
        console.log(`注文 ${orderId} の支払い処理が完了し、売上管理に反映されました`);

        setLoading(false);
        return completedOrder;
      } else {
        throw new Error('支払い処理に失敗しました');
      }
    } catch (err) {
      console.error('注文完了処理中にエラー:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // コンテキスト値
  const value = {
    activeOrders,
    completedOrders,
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    setTableId,
    setCustomer,
    setOrderNotes,
    clearCart,
    createOrder,
    updateOrderStatus,
    completeOrder,
    orderHistory
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// 注文コンテキストを使用するためのフック
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
