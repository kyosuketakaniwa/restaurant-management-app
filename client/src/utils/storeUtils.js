/**
 * 店舗管理ユーティリティ関数
 * 複数店舗のデータ構造と操作に関する機能を提供
 */

/**
 * LocalStorageからデータを取得する汎用関数
 */
export const getLocalStorageData = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`LocalStorageからの取得エラー: ${key}`, error);
    return defaultValue;
  }
};

/**
 * LocalStorageにデータを保存する汎用関数
 */
export const setLocalStorageData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`LocalStorageへの保存エラー: ${key}`, error);
    return false;
  }
};

/**
 * 既存の単一店舗データを複数店舗形式に変換する
 */
export const migrateToMultiStore = () => {
  try {
    // 現在の店舗情報を取得
    const currentStoreInfo = getLocalStorageData('storeInfo', null);
    
    // 既に移行済みかチェック
    const existingStores = getLocalStorageData('stores', []);
    if (existingStores.length > 0) {
      return { success: true, stores: existingStores };
    }
    
    // 新しい店舗リストを作成
    const stores = [];
    
    // 既存の店舗情報がある場合は追加
    if (currentStoreInfo) {
      stores.push({
        id: 'store-' + Date.now(),
        ...currentStoreInfo,
        isHeadquarters: true,
        groupId: 'default'
      });
    } else {
      // デフォルトの店舗情報を使用
      stores.push({
        id: 'store-' + Date.now(),
        name: '和食レストラン 匠',
        address: '東京都中央区銀座1-1-1',
        phone: '03-1234-5678',
        email: 'info@washoku-takumi.jp',
        businessHours: '11:00-22:00',
        taxRate: 10,
        storeType: 'japanese',
        seatingCapacity: 50,
        isHeadquarters: true,
        groupId: 'default'
      });
    }
    
    // 店舗リストをLocalStorageに保存
    setLocalStorageData('stores', stores);
    
    // 現在の店舗IDをLocalStorageに保存
    setLocalStorageData('currentStoreId', stores[0].id);
    
    // デフォルトの店舗グループを作成
    const defaultGroup = {
      id: 'default',
      name: 'デフォルトグループ',
      description: '自動作成されたデフォルトグループ',
      storeIds: [stores[0].id]
    };
    
    setLocalStorageData('storeGroups', [defaultGroup]);
    
    return { success: true, stores };
  } catch (error) {
    console.error('店舗データ移行エラー:', error);
    return { success: false, error };
  }
};

/**
 * 現在選択中の店舗IDを取得
 */
export const getCurrentStoreId = () => {
  return getLocalStorageData('currentStoreId', null);
};

/**
 * 現在選択中の店舗情報を取得
 */
export const getCurrentStore = () => {
  const storeId = getCurrentStoreId();
  if (!storeId) return null;
  
  const stores = getLocalStorageData('stores', []);
  return stores.find(store => store.id === storeId) || null;
};

/**
 * 店舗IDから店舗情報を取得
 */
export const getStoreById = (storeId) => {
  const stores = getLocalStorageData('stores', []);
  return stores.find(store => store.id === storeId) || null;
};

/**
 * 全店舗リストを取得
 */
export const getAllStores = () => {
  return getLocalStorageData('stores', []);
};

/**
 * 店舗を追加または更新
 */
export const saveStore = (store) => {
  const stores = getAllStores();
  const index = stores.findIndex(s => s.id === store.id);
  
  if (index >= 0) {
    // 既存店舗の更新
    stores[index] = {...store};
  } else {
    // 新規店舗の追加
    stores.push({...store});
  }
  
  setLocalStorageData('stores', stores);
  return {success: true, store};
};

/**
 * 店舗を削除
 */
export const deleteStore = (storeId) => {
  let stores = getAllStores();
  
  // 現在選択中の店舗かチェック
  const currentStoreId = getCurrentStoreId();
  if (currentStoreId === storeId) {
    // 他の店舗があれば選択を変更
    const otherStore = stores.find(s => s.id !== storeId);
    if (otherStore) {
      setLocalStorageData('currentStoreId', otherStore.id);
    } else {
      // 最後の店舗の場合は削除しない
      return {success: false, error: '最後の店舗は削除できません'};
    }
  }
  
  // 店舗を削除
  stores = stores.filter(s => s.id !== storeId);
  setLocalStorageData('stores', stores);
  
  // 店舗グループからも削除
  const groups = getLocalStorageData('storeGroups', []);
  const updatedGroups = groups.map(group => ({
    ...group,
    storeIds: group.storeIds.filter(id => id !== storeId)
  }));
  setLocalStorageData('storeGroups', updatedGroups);
  
  return {success: true};
};

/**
 * 現在選択中の店舗を変更
 */
export const setCurrentStore = (storeId) => {
  const store = getStoreById(storeId);
  if (!store) {
    return {success: false, error: '指定された店舗が見つかりません'};
  }
  
  setLocalStorageData('currentStoreId', storeId);
  return {success: true, store};
};

/**
 * 全店舗グループを取得
 */
export const getAllStoreGroups = () => {
  return getLocalStorageData('storeGroups', []);
};

/**
 * グループIDから店舗グループを取得
 */
export const getGroupById = (groupId) => {
  const groups = getAllStoreGroups();
  return groups.find(group => group.id === groupId) || null;
};

/**
 * 店舗グループを保存
 */
export const saveStoreGroup = (group) => {
  const groups = getAllStoreGroups();
  const index = groups.findIndex(g => g.id === group.id);
  
  if (index >= 0) {
    // 既存グループの更新
    groups[index] = {...group};
  } else {
    // 新規グループの追加
    groups.push({...group});
  }
  
  setLocalStorageData('storeGroups', groups);
  return {success: true, group};
};

/**
 * 店舗グループを削除
 */
export const deleteStoreGroup = (groupId) => {
  // デフォルトグループの削除は禁止
  if (groupId === 'default') {
    return {success: false, error: 'デフォルトグループは削除できません'};
  }
  
  // グループを削除
  const groups = getAllStoreGroups().filter(g => g.id !== groupId);
  setLocalStorageData('storeGroups', groups);
  
  // 所属店舗のgroupIdをデフォルトに変更
  const stores = getAllStores();
  const updatedStores = stores.map(store => {
    if (store.groupId === groupId) {
      return {...store, groupId: 'default'};
    }
    return store;
  });
  
  setLocalStorageData('stores', updatedStores);
  
  return {success: true};
};
