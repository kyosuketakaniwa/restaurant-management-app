import apiClient from './apiClient';

// 在庫管理API
const inventoryService = {
  // 在庫アイテムの一覧を取得
  getAllInventoryItems: async () => {
    try {
      const response = await apiClient.get('/inventory');
      return response.data;
    } catch (error) {
      console.error('在庫アイテムの取得に失敗しました', error);
      throw error;
    }
  },

  // 特定の在庫アイテムを取得
  getInventoryItemById: async (id) => {
    try {
      const response = await apiClient.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`在庫アイテム ID:${id} の取得に失敗しました`, error);
      throw error;
    }
  },

  // 新しい在庫アイテムを作成
  createInventoryItem: async (itemData) => {
    try {
      const response = await apiClient.post('/inventory', itemData);
      return response.data;
    } catch (error) {
      console.error('在庫アイテムの作成に失敗しました', error);
      throw error;
    }
  },

  // 在庫アイテムを更新
  updateInventoryItem: async (id, itemData) => {
    try {
      const response = await apiClient.put(`/inventory/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error(`在庫アイテム ID:${id} の更新に失敗しました`, error);
      throw error;
    }
  },

  // 在庫アイテムを削除
  deleteInventoryItem: async (id) => {
    try {
      const response = await apiClient.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`在庫アイテム ID:${id} の削除に失敗しました`, error);
      throw error;
    }
  },

  // 在庫数量を調整
  adjustInventoryQuantity: async (id, adjustment, reason) => {
    try {
      const response = await apiClient.patch(`/inventory/${id}/quantity`, {
        adjustment,
        reason
      });
      return response.data;
    } catch (error) {
      console.error(`在庫アイテム ID:${id} の数量調整に失敗しました`, error);
      throw error;
    }
  },

  // 在庫カテゴリの一覧を取得
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/inventory/categories');
      return response.data;
    } catch (error) {
      console.error('在庫カテゴリの取得に失敗しました', error);
      throw error;
    }
  },

  // 新しい在庫カテゴリを作成
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/inventory/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('在庫カテゴリの作成に失敗しました', error);
      throw error;
    }
  },

  // 在庫カテゴリを更新
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/inventory/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`在庫カテゴリ ID:${id} の更新に失敗しました`, error);
      throw error;
    }
  },

  // 在庫カテゴリを削除
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/inventory/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`在庫カテゴリ ID:${id} の削除に失敗しました`, error);
      throw error;
    }
  },

  // 在庫の使用履歴を取得
  getInventoryUsageHistory: async (id, timeRange) => {
    try {
      const response = await apiClient.get(`/inventory/${id}/usage-history`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error(`在庫アイテム ID:${id} の使用履歴取得に失敗しました`, error);
      throw error;
    }
  },

  // 在庫アイテムに関連するレシピを取得
  getRelatedRecipes: async (id) => {
    try {
      const response = await apiClient.get(`/inventory/${id}/recipes`);
      return response.data;
    } catch (error) {
      console.error(`在庫アイテム ID:${id} に関連するレシピの取得に失敗しました`, error);
      throw error;
    }
  },

  // 在庫アイテムに関連するメニュー項目を取得
  getRelatedMenuItems: async (id) => {
    try {
      const response = await apiClient.get(`/inventory/${id}/menu-items`);
      return response.data;
    } catch (error) {
      console.error(`在庫アイテム ID:${id} に関連するメニュー項目の取得に失敗しました`, error);
      throw error;
    }
  },

  // 在庫の発注リストを取得（最小数量を下回っているアイテム）
  getOrderList: async () => {
    try {
      const response = await apiClient.get('/inventory/order-list');
      return response.data;
    } catch (error) {
      console.error('発注リストの取得に失敗しました', error);
      throw error;
    }
  },

  // メニュー項目の販売による在庫の自動引き落とし
  deductInventoryForMenuItem: async (menuItemId, quantity) => {
    try {
      const response = await apiClient.post('/inventory/deduct-for-menu', {
        menuItemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${menuItemId} の在庫引き落としに失敗しました`, error);
      throw error;
    }
  }
};

export default inventoryService;
