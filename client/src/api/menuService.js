import apiClient from './apiClient';

// メニュー管理API
const menuService = {
  // メニュー項目の一覧を取得
  getAllMenuItems: async () => {
    try {
      const response = await apiClient.get('/menu');
      return response.data;
    } catch (error) {
      console.error('メニュー項目の取得に失敗しました', error);
      throw error;
    }
  },

  // 特定のメニュー項目を取得
  getMenuItemById: async (id) => {
    try {
      const response = await apiClient.get(`/menu/${id}`);
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${id} の取得に失敗しました`, error);
      throw error;
    }
  },

  // 新しいメニュー項目を作成
  createMenuItem: async (menuItemData) => {
    try {
      const response = await apiClient.post('/menu', menuItemData);
      return response.data;
    } catch (error) {
      console.error('メニュー項目の作成に失敗しました', error);
      throw error;
    }
  },

  // メニュー項目を更新
  updateMenuItem: async (id, menuItemData) => {
    try {
      const response = await apiClient.put(`/menu/${id}`, menuItemData);
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${id} の更新に失敗しました`, error);
      throw error;
    }
  },

  // メニュー項目を削除
  deleteMenuItem: async (id) => {
    try {
      const response = await apiClient.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${id} の削除に失敗しました`, error);
      throw error;
    }
  },

  // メニュー項目の価格を更新し、履歴を追加
  updateMenuItemPrice: async (id, newPrice, reason) => {
    try {
      const response = await apiClient.patch(`/menu/${id}/price`, { 
        newPrice, 
        reason 
      });
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${id} の価格更新に失敗しました`, error);
      throw error;
    }
  },

  // メニュー項目の価格履歴を取得
  getMenuItemPriceHistory: async (id) => {
    try {
      const response = await apiClient.get(`/menu/${id}/price-history`);
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${id} の価格履歴取得に失敗しました`, error);
      throw error;
    }
  },

  // メニュー項目にレシピをリンク
  linkRecipeToMenuItem: async (menuItemId, recipeId) => {
    try {
      const response = await apiClient.post(`/menu/${menuItemId}/link-recipe`, { recipeId });
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${menuItemId} へのレシピリンクに失敗しました`, error);
      throw error;
    }
  },

  // メニュー項目の売上データを取得
  getMenuItemSalesData: async (id, timeRange) => {
    try {
      const response = await apiClient.get(`/menu/${id}/sales`, { 
        params: { timeRange } 
      });
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${id} の売上データ取得に失敗しました`, error);
      throw error;
    }
  },

  // カテゴリ一覧を取得
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/menu/categories');
      return response.data;
    } catch (error) {
      console.error('カテゴリの取得に失敗しました', error);
      throw error;
    }
  },

  // 新しいカテゴリを作成
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/menu/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('カテゴリの作成に失敗しました', error);
      throw error;
    }
  },

  // カテゴリを更新
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/menu/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`カテゴリ ID:${id} の更新に失敗しました`, error);
      throw error;
    }
  },

  // カテゴリを削除
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/menu/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`カテゴリ ID:${id} の削除に失敗しました`, error);
      throw error;
    }
  }
};

export default menuService;
