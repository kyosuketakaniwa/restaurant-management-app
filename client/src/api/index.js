import apiClient from './apiClient';
import menuService from './menuService';
import recipeService from './recipeService';
import salesAnalysisService from './salesAnalysisService';
import inventoryService from './inventoryService';

// すべてのAPIサービスをエクスポート
export {
  apiClient,
  menuService,
  recipeService,
  salesAnalysisService,
  inventoryService
};

// デフォルトエクスポート
export default {
  apiClient,
  menuService,
  recipeService,
  salesAnalysisService,
  inventoryService
};
