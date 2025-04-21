import apiClient from './apiClient';

// レシピ管理API
const recipeService = {
  // レシピの一覧を取得
  getAllRecipes: async () => {
    try {
      const response = await apiClient.get('/recipes');
      return response.data;
    } catch (error) {
      console.error('レシピの取得に失敗しました', error);
      throw error;
    }
  },

  // 特定のレシピを取得
  getRecipeById: async (id) => {
    try {
      const response = await apiClient.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`レシピ ID:${id} の取得に失敗しました`, error);
      throw error;
    }
  },

  // 新しいレシピを作成
  createRecipe: async (recipeData) => {
    try {
      const formData = new FormData();
      
      // 画像ファイルがある場合は追加
      if (recipeData.image) {
        formData.append('image', recipeData.image);
      }
      
      // その他のデータをJSON形式で追加
      const recipeDataWithoutImage = { ...recipeData };
      delete recipeDataWithoutImage.image;
      delete recipeDataWithoutImage.imagePreview;
      
      formData.append('data', JSON.stringify(recipeDataWithoutImage));
      
      const response = await apiClient.post('/recipes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('レシピの作成に失敗しました', error);
      throw error;
    }
  },

  // レシピを更新
  updateRecipe: async (id, recipeData) => {
    try {
      const formData = new FormData();
      
      // 画像ファイルがある場合は追加
      if (recipeData.image && recipeData.image instanceof File) {
        formData.append('image', recipeData.image);
      }
      
      // その他のデータをJSON形式で追加
      const recipeDataWithoutImage = { ...recipeData };
      delete recipeDataWithoutImage.image;
      delete recipeDataWithoutImage.imagePreview;
      
      formData.append('data', JSON.stringify(recipeDataWithoutImage));
      
      const response = await apiClient.put(`/recipes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`レシピ ID:${id} の更新に失敗しました`, error);
      throw error;
    }
  },

  // レシピを削除
  deleteRecipe: async (id) => {
    try {
      const response = await apiClient.delete(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`レシピ ID:${id} の削除に失敗しました`, error);
      throw error;
    }
  },

  // レシピの材料を取得
  getRecipeIngredients: async (id) => {
    try {
      const response = await apiClient.get(`/recipes/${id}/ingredients`);
      return response.data;
    } catch (error) {
      console.error(`レシピ ID:${id} の材料取得に失敗しました`, error);
      throw error;
    }
  },

  // レシピの手順を取得
  getRecipeSteps: async (id) => {
    try {
      const response = await apiClient.get(`/recipes/${id}/steps`);
      return response.data;
    } catch (error) {
      console.error(`レシピ ID:${id} の手順取得に失敗しました`, error);
      throw error;
    }
  },

  // レシピのバージョン履歴を取得
  getRecipeVersionHistory: async (id) => {
    try {
      const response = await apiClient.get(`/recipes/${id}/versions`);
      return response.data;
    } catch (error) {
      console.error(`レシピ ID:${id} のバージョン履歴取得に失敗しました`, error);
      throw error;
    }
  },

  // レシピに関連するメニュー項目を取得
  getLinkedMenuItems: async (id) => {
    try {
      const response = await apiClient.get(`/recipes/${id}/menu-items`);
      return response.data;
    } catch (error) {
      console.error(`レシピ ID:${id} に関連するメニュー項目の取得に失敗しました`, error);
      throw error;
    }
  },

  // レシピの原価計算
  calculateRecipeCost: async (recipeData) => {
    try {
      const response = await apiClient.post('/recipes/calculate-cost', recipeData);
      return response.data;
    } catch (error) {
      console.error('レシピの原価計算に失敗しました', error);
      throw error;
    }
  }
};

export default recipeService;
