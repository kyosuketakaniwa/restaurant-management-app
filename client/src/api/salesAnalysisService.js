import apiClient from './apiClient';

// 売上分析API
const salesAnalysisService = {
  // メニュー項目の売上データを取得
  getMenuItemSales: async (menuItemId, timeRange) => {
    try {
      const response = await apiClient.get(`/analytics/menu/${menuItemId}/sales`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${menuItemId} の売上データ取得に失敗しました`, error);
      throw error;
    }
  },

  // メニュー項目の人気度データを取得
  getMenuItemPopularity: async (menuItemId) => {
    try {
      const response = await apiClient.get(`/analytics/menu/${menuItemId}/popularity`);
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${menuItemId} の人気度データ取得に失敗しました`, error);
      throw error;
    }
  },

  // メニュー項目の比較データを取得
  getMenuItemComparison: async (menuItemId, compareWithIds, timeRange) => {
    try {
      const response = await apiClient.get(`/analytics/menu/${menuItemId}/compare`, {
        params: { 
          compareWith: compareWithIds.join(','),
          timeRange 
        }
      });
      return response.data;
    } catch (error) {
      console.error(`メニュー項目の比較データ取得に失敗しました`, error);
      throw error;
    }
  },

  // カテゴリ別の売上データを取得
  getCategorySales: async (timeRange) => {
    try {
      const response = await apiClient.get('/analytics/categories/sales', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('カテゴリ別売上データの取得に失敗しました', error);
      throw error;
    }
  },

  // 時間帯別の売上データを取得
  getHourlySales: async (date) => {
    try {
      const response = await apiClient.get('/analytics/hourly-sales', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('時間帯別売上データの取得に失敗しました', error);
      throw error;
    }
  },

  // 曜日別の売上データを取得
  getDailySales: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/analytics/daily-sales', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('曜日別売上データの取得に失敗しました', error);
      throw error;
    }
  },

  // 月間売上データを取得
  getMonthlySales: async (year) => {
    try {
      const response = await apiClient.get('/analytics/monthly-sales', {
        params: { year }
      });
      return response.data;
    } catch (error) {
      console.error('月間売上データの取得に失敗しました', error);
      throw error;
    }
  },

  // よく一緒に注文される商品の組み合わせを取得
  getFrequentItemSets: async (menuItemId) => {
    try {
      const response = await apiClient.get(`/analytics/menu/${menuItemId}/pairings`);
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${menuItemId} のペアリングデータ取得に失敗しました`, error);
      throw error;
    }
  },

  // 売上予測データを取得
  getSalesForecast: async (menuItemId, days) => {
    try {
      const response = await apiClient.get(`/analytics/menu/${menuItemId}/forecast`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error(`メニュー項目 ID:${menuItemId} の売上予測データ取得に失敗しました`, error);
      throw error;
    }
  },

  // ダッシュボード用のサマリーデータを取得
  getDashboardSummary: async () => {
    try {
      const response = await apiClient.get('/analytics/dashboard-summary');
      return response.data;
    } catch (error) {
      console.error('ダッシュボードサマリーデータの取得に失敗しました', error);
      throw error;
    }
  }
};

export default salesAnalysisService;
