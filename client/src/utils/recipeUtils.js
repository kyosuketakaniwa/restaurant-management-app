/**
 * レシピ管理関連のユーティリティ関数
 */

import { getLocalStorageData, setLocalStorageData } from './storeUtils';
import { v4 as uuidv4 } from 'uuid';

// デフォルトのレシピデータ
const DEFAULT_RECIPES = [
  {
    id: 'recipe-1',
    name: '海鮮丼',
    image: 'https://source.unsplash.com/random/300x200/?sushi',
    preparationTime: 20,
    cookingTime: 10,
    difficulty: 'medium',
    servings: 2,
    description: '新鮮な魚介をふんだんに使った海鮮丼です。',
    ingredients: [
      { id: 1, name: '米', quantity: 2, unit: '合' },
      { id: 2, name: 'マグロ', quantity: 100, unit: 'g' },
      { id: 3, name: 'サーモン', quantity: 100, unit: 'g' },
      { id: 4, name: 'イクラ', quantity: 50, unit: 'g' },
      { id: 5, name: 'わさび', quantity: 10, unit: 'g' }
    ],
    steps: [
      { id: 1, description: '米を研いで炊く', image: null },
      { id: 2, description: '魚をさばいて切る', image: 'https://source.unsplash.com/random/300x200/?fish' },
      { id: 3, description: 'ご飯の上に具材を盛り付ける', image: 'https://source.unsplash.com/random/300x200/?sushi' }
    ],
    cost: 1200,
    createdAt: '2023-04-10T10:30:00',
    updatedAt: '2023-04-15T14:45:00',
    version: 2,
    tags: ['丼物', '魚介', '人気'],
    linkedMenuId: 'menu-1'
  },
  {
    id: 'recipe-2',
    name: '天ぷら盛り合わせ',
    image: 'https://source.unsplash.com/random/300x200/?tempura',
    preparationTime: 30,
    cookingTime: 15,
    difficulty: 'hard',
    servings: 4,
    description: '季節の野菜と海老の天ぷら盛り合わせです。',
    ingredients: [
      { id: 1, name: '小麦粉', quantity: 200, unit: 'g' },
      { id: 2, name: '卵', quantity: 1, unit: '個' },
      { id: 3, name: '冷水', quantity: 200, unit: 'ml' },
      { id: 4, name: '海老', quantity: 8, unit: '尾' },
      { id: 5, name: 'なす', quantity: 1, unit: '本' },
      { id: 6, name: 'かぼちゃ', quantity: 1/4, unit: '個' },
      { id: 7, name: 'しいたけ', quantity: 4, unit: '個' },
      { id: 8, name: '揚げ油', quantity: 1000, unit: 'ml' }
    ],
    steps: [
      { id: 1, description: '小麦粉、卵、冷水を混ぜて天ぷら衣を作る', image: null },
      { id: 2, description: '野菜と海老を一口大に切る', image: null },
      { id: 3, description: '180度の油で食材を揚げる', image: 'https://source.unsplash.com/random/300x200/?frying' },
      { id: 4, description: '盛り付けて完成', image: 'https://source.unsplash.com/random/300x200/?tempura' }
    ],
    cost: 1000,
    createdAt: '2023-04-11T11:20:00',
    updatedAt: '2023-04-14T16:30:00',
    version: 1,
    tags: ['揚げ物', '野菜', '海老'],
    linkedMenuId: 'menu-2'
  }
];

/**
 * 全てのレシピを取得
 * @returns {Array} レシピの配列
 */
export const getAllRecipes = () => {
  return getLocalStorageData('recipes', DEFAULT_RECIPES);
};

/**
 * 特定のレシピを取得
 * @param {string} recipeId レシピID
 * @returns {Object|null} レシピオブジェクトまたはnull
 */
export const getRecipeById = (recipeId) => {
  const allRecipes = getAllRecipes();
  return allRecipes.find(recipe => recipe.id === recipeId) || null;
};

/**
 * メニューIDに関連するレシピを取得
 * @param {string} menuId メニューID
 * @returns {Object|null} レシピオブジェクトまたはnull
 */
export const getRecipeByMenuId = (menuId) => {
  const allRecipes = getAllRecipes();
  return allRecipes.find(recipe => recipe.linkedMenuId === menuId) || null;
};

/**
 * レシピを検索
 * @param {string} term 検索語句
 * @returns {Array} 検索結果のレシピ配列
 */
export const searchRecipes = (term) => {
  if (!term) return getAllRecipes();
  
  const allRecipes = getAllRecipes();
  const lowerTerm = term.toLowerCase();
  
  return allRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(lowerTerm) || 
    recipe.description.toLowerCase().includes(lowerTerm) ||
    (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(lowerTerm)))
  );
};

/**
 * レシピを保存
 * @param {Object} recipe 保存するレシピ
 * @returns {Object} 保存されたレシピ
 */
export const saveRecipe = (recipe) => {
  const allRecipes = getAllRecipes();
  const now = new Date().toISOString();
  
  // 既存のレシピを確認
  const existingRecipeIndex = allRecipes.findIndex(r => r.id === recipe.id);
  
  if (existingRecipeIndex >= 0) {
    // 既存のレシピを更新
    recipe.updatedAt = now;
    recipe.version = (allRecipes[existingRecipeIndex].version || 0) + 1;
    allRecipes[existingRecipeIndex] = { ...recipe };
  } else {
    // 新規レシピを追加
    if (!recipe.id) {
      recipe.id = `recipe-${uuidv4()}`;
    }
    recipe.createdAt = now;
    recipe.updatedAt = now;
    recipe.version = 1;
    allRecipes.push(recipe);
  }
  
  setLocalStorageData('recipes', allRecipes);
  return recipe;
};

/**
 * メニュー項目に連動したレシピを作成または更新
 * @param {Object} menuItem メニュー項目
 * @returns {Object} 作成または更新されたレシピ
 */
export const syncRecipeWithMenuItem = (menuItem) => {
  // 既存のレシピを確認
  const existingRecipe = getRecipeByMenuId(menuItem.id);
  
  if (existingRecipe) {
    // 既存のレシピを更新
    const updatedRecipe = {
      ...existingRecipe,
      name: menuItem.name,
      description: menuItem.description || existingRecipe.description,
      image: menuItem.image || existingRecipe.image,
      updatedAt: new Date().toISOString()
    };
    return saveRecipe(updatedRecipe);
  } else {
    // 新規レシピを作成
    const newRecipe = {
      id: `recipe-${uuidv4()}`,
      name: menuItem.name,
      description: menuItem.description || '',
      image: menuItem.image || 'https://via.placeholder.com/300x200?text=No+Image',
      preparationTime: 0,
      cookingTime: 0,
      difficulty: 'medium',
      servings: 1,
      ingredients: [],
      steps: [],
      cost: 0,
      tags: [],
      linkedMenuId: menuItem.id
    };
    return saveRecipe(newRecipe);
  }
};

/**
 * レシピを削除
 * @param {string} recipeId 削除するレシピのID
 * @returns {boolean} 成功した場合はtrue
 */
export const deleteRecipe = (recipeId) => {
  const allRecipes = getAllRecipes();
  const updatedRecipes = allRecipes.filter(recipe => recipe.id !== recipeId);
  
  if (updatedRecipes.length === allRecipes.length) {
    return false; // 削除対象が見つからない
  }
  
  setLocalStorageData('recipes', updatedRecipes);
  return true;
};

/**
 * メニュー項目に関連するレシピを削除
 * @param {string} menuId 削除するメニュー項目のID
 * @returns {boolean} 成功した場合はtrue
 */
export const deleteRecipeByMenuId = (menuId) => {
  const allRecipes = getAllRecipes();
  const recipe = allRecipes.find(r => r.linkedMenuId === menuId);
  
  if (!recipe) {
    return false; // 関連するレシピが見つからない
  }
  
  return deleteRecipe(recipe.id);
};

/**
 * レシピデータを初期化
 */
export const initializeRecipeData = () => {
  setLocalStorageData('recipes', DEFAULT_RECIPES);
};
