/**
 * メニュー管理関連のユーティリティ関数
 */

import { getLocalStorageData, setLocalStorageData } from './storeUtils';
import { v4 as uuidv4 } from 'uuid';
import { syncRecipeWithMenuItem, deleteRecipeByMenuId } from './recipeUtils';

// デフォルトのメニューカテゴリ
const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: '前菜', description: '食事の始まりにふさわしい一品' },
  { id: 'cat-2', name: 'メイン料理', description: 'シェフのおすすめメイン料理' },
  { id: 'cat-3', name: 'デザート', description: '甘いものでお食事を締めくくり' },
  { id: 'cat-4', name: 'ドリンク', description: '豊富な種類のお飲み物をご用意' }
];

// デフォルトのメニュー項目
const DEFAULT_MENU_ITEMS = [
  { 
    id: 'menu-1', 
    name: 'シーザーサラダ', 
    description: '新鮮なロメインレタスにクルトン、パルメザンチーズを添えた定番サラダ', 
    price: 980, 
    image: 'https://via.placeholder.com/150x150?text=Caesar+Salad', 
    category_id: 'cat-1',
    available: true,
    allergies: ['乳製品', '小麦'],
    tags: ['人気', 'ヘルシー'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  { 
    id: 'menu-2', 
    name: '牛フィレステーキ', 
    description: '厳選された牛フィレ肉を絶妙な焼き加減でご提供', 
    price: 3200, 
    image: 'https://via.placeholder.com/150x150?text=Beef+Steak', 
    category_id: 'cat-2',
    available: true,
    allergies: [],
    tags: ['人気', '肉料理'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  { 
    id: 'menu-3', 
    name: 'ティラミス', 
    description: 'エスプレッソコーヒーとマスカルポーネチーズの絶妙なハーモニー', 
    price: 850, 
    image: 'https://via.placeholder.com/150x150?text=Tiramisu', 
    category_id: 'cat-3',
    available: true,
    allergies: ['乳製品', '小麦', '卵'],
    tags: ['定番', '甘い'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  { 
    id: 'menu-4', 
    name: 'スパークリングワイン', 
    description: 'フルーティーな味わいのスパークリングワイン（グラス）', 
    price: 950, 
    image: 'https://via.placeholder.com/150x150?text=Sparkling+Wine', 
    category_id: 'cat-4',
    available: true,
    allergies: [],
    tags: ['お酒', '飲み物'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  { 
    id: 'menu-5', 
    name: '餃子', 
    description: '特製餃子 5個', 
    price: 450, 
    image: 'https://via.placeholder.com/150x150?text=Gyoza', 
    category_id: 'cat-1',
    available: true,
    allergies: ['小麦'],
    tags: ['人気', '中華'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  { 
    id: 'menu-6', 
    name: 'ライス', 
    description: '国産米使用', 
    price: 200, 
    image: 'https://via.placeholder.com/150x150?text=Rice', 
    category_id: 'cat-2',
    available: true,
    allergies: [],
    tags: ['定番', 'サイドメニュー'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

/**
 * 全てのメニュー項目を取得
 * @returns {Array} メニュー項目の配列
 */
export const getAllMenuItems = () => {
  return getLocalStorageData('menuItems', DEFAULT_MENU_ITEMS);
};

/**
 * 全てのカテゴリを取得
 * @returns {Array} カテゴリの配列
 */
export const getAllCategories = () => {
  return getLocalStorageData('menuCategories', DEFAULT_CATEGORIES);
};

/**
 * 特定のカテゴリに属するメニュー項目を取得
 * @param {string} categoryId カテゴリID
 * @returns {Array} フィルタリングされたメニュー項目の配列
 */
export const getMenuItemsByCategory = (categoryId) => {
  const allItems = getAllMenuItems();
  return allItems.filter(item => item.category_id === categoryId);
};

/**
 * メニュー項目を検索
 * @param {string} term 検索語句
 * @returns {Array} 検索結果のメニュー項目配列
 */
export const searchMenuItems = (term) => {
  if (!term) return getAllMenuItems();
  
  const allItems = getAllMenuItems();
  const lowerTerm = term.toLowerCase();
  
  return allItems.filter(item => 
    item.name.toLowerCase().includes(lowerTerm) || 
    item.description.toLowerCase().includes(lowerTerm) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerTerm)))
  );
};

/**
 * メニュー項目を保存
 * @param {Object} menuItem 保存するメニュー項目
 * @param {boolean} [syncRecipe=true] レシピと同期するかどうか
 * @returns {Object} 保存されたメニュー項目
 */
export const saveMenuItem = (menuItem, syncRecipe = true) => {
  const allItems = getAllMenuItems();
  const now = new Date().toISOString();
  
  // 既存のメニュー項目を確認
  const existingItemIndex = allItems.findIndex(item => item.id === menuItem.id);
  
  if (existingItemIndex >= 0) {
    // 既存のメニュー項目を更新
    menuItem.updated_at = now;
    allItems[existingItemIndex] = { ...menuItem };
  } else {
    // 新規メニュー項目を追加
    if (!menuItem.id) {
      // 新規メニューのIDはシンプルな連番形式にする
      const menuIds = allItems.map(item => {
        const match = String(item.id).match(/^menu-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      
      // 最大のIDに1を加える
      const maxId = Math.max(0, ...menuIds);
      menuItem.id = `menu-${maxId + 1}`;
    }
    menuItem.created_at = now;
    menuItem.updated_at = now;
    allItems.push(menuItem);
  }
  
  setLocalStorageData('menuItems', allItems);
  
  // レシピとの同期
  if (syncRecipe) {
    try {
      // レシピデータとの自動同期
      syncRecipeWithMenuItem(menuItem);
    } catch (error) {
      console.error('レシピ同期エラー:', error);
    }
  }
  
  return menuItem;
};

/**
 * カテゴリを保存
 * @param {Object} category 保存するカテゴリ
 * @returns {Object} 保存されたカテゴリ
 */
export const saveCategory = (category) => {
  const allCategories = getAllCategories();
  
  // 既存のカテゴリを確認
  const existingCategoryIndex = allCategories.findIndex(cat => cat.id === category.id);
  
  if (existingCategoryIndex >= 0) {
    // 既存のカテゴリを更新
    allCategories[existingCategoryIndex] = { ...category };
  } else {
    // 新規カテゴリを追加
    if (!category.id) {
      category.id = `cat-${uuidv4()}`;
    }
    allCategories.push(category);
  }
  
  setLocalStorageData('menuCategories', allCategories);
  return category;
};

/**
 * メニュー項目を削除
 * @param {string} menuItemId 削除するメニュー項目のID
 * @param {boolean} [syncRecipe=true] 関連するレシピも削除するかどうか
 * @returns {boolean} 成功した場合はtrue
 */
export const deleteMenuItem = (menuItemId, syncRecipe = true) => {
  const allItems = getAllMenuItems();
  const updatedItems = allItems.filter(item => item.id !== menuItemId);
  
  if (updatedItems.length === allItems.length) {
    return false; // 削除対象が見つからない
  }
  
  // 先にメニュー項目を削除しておく
  setLocalStorageData('menuItems', updatedItems);
  
  // 関連するレシピの削除
  if (syncRecipe) {
    try {
      // 関連するレシピを削除
      deleteRecipeByMenuId(menuItemId);
    } catch (error) {
      console.error('レシピ削除エラー:', error);
    }
  }
  
  return true;
};

/**
 * カテゴリを削除
 * @param {string} categoryId 削除するカテゴリのID
 * @returns {boolean} 成功した場合はtrue
 */
export const deleteCategory = (categoryId) => {
  const allCategories = getAllCategories();
  const updatedCategories = allCategories.filter(cat => cat.id !== categoryId);
  
  if (updatedCategories.length === allCategories.length) {
    return false; // 削除対象が見つからない
  }
  
  setLocalStorageData('menuCategories', updatedCategories);
  return true;
};

/**
 * メニューデータを初期化
 */
export const initializeMenuData = () => {
  setLocalStorageData('menuItems', DEFAULT_MENU_ITEMS);
  setLocalStorageData('menuCategories', DEFAULT_CATEGORIES);
};
