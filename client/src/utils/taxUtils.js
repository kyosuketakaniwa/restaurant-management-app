/**
 * 税率と通貨設定関連のユーティリティ関数
 */

import { getLocalStorageData, setLocalStorageData } from './storeUtils';

// デフォルトの税率設定
export const DEFAULT_TAX_SETTINGS = {
  // 標準税率 (10%)
  standardRate: 10,
  // 軽減税率 (8%)
  reducedRate: 8,
  // 非課税
  exemptRate: 0,
  // アクティブな税率設定
  activeTaxSystem: 'multiple', // 'single'(単一税率) or 'multiple'(複数税率)
  // 設定された税区分リスト
  taxCategories: [
    {
      id: 'standard',
      name: '標準税率',
      rate: 10,
      description: '標準的な消費税率が適用される商品・サービス',
      isDefault: true,
      color: '#e57373' // 識別用の色
    },
    {
      id: 'reduced',
      name: '軽減税率',
      rate: 8,
      description: '飲食料品（酒類・外食を除く）、新聞の定期購読',
      isDefault: false,
      color: '#81c784'
    },
    {
      id: 'exempt',
      name: '非課税',
      rate: 0,
      description: '非課税対象の商品・サービス（土地、有価証券など）',
      isDefault: false,
      color: '#64b5f6'
    }
  ]
};

// デフォルトの通貨設定
export const DEFAULT_CURRENCY_SETTINGS = {
  // 通貨コード
  code: 'JPY',
  // 通貨記号
  symbol: '¥',
  // 記号の位置 (before/after)
  position: 'before',
  // 小数点以下の桁数
  decimalPlaces: 0,
  // 千単位の区切り文字
  thousandsSeparator: ',',
  // 小数点の文字
  decimalSeparator: '.',
  // 丸め方 (up/down/nearest)
  roundingMethod: 'nearest'
};

/**
 * 税率設定を取得
 */
export const getTaxSettings = () => {
  return getLocalStorageData('taxSettings', DEFAULT_TAX_SETTINGS);
};

/**
 * 税率設定を保存
 */
export const saveTaxSettings = (settings) => {
  return setLocalStorageData('taxSettings', {
    ...DEFAULT_TAX_SETTINGS,
    ...settings
  });
};

/**
 * 通貨設定を取得
 */
export const getCurrencySettings = () => {
  return getLocalStorageData('currencySettings', DEFAULT_CURRENCY_SETTINGS);
};

/**
 * 通貨設定を保存
 */
export const saveCurrencySettings = (settings) => {
  return setLocalStorageData('currencySettings', {
    ...DEFAULT_CURRENCY_SETTINGS,
    ...settings
  });
};

/**
 * 税区分を取得
 */
export const getTaxCategories = () => {
  const settings = getTaxSettings();
  return settings.taxCategories || DEFAULT_TAX_SETTINGS.taxCategories;
};

/**
 * 税区分を保存
 */
export const saveTaxCategories = (categories) => {
  const settings = getTaxSettings();
  settings.taxCategories = categories;
  return saveTaxSettings(settings);
};

/**
 * 税区分を追加/更新
 */
export const saveTaxCategory = (category) => {
  const categories = getTaxCategories();
  const index = categories.findIndex(c => c.id === category.id);
  
  if (index >= 0) {
    // 既存の税区分を更新
    categories[index] = {...category};
  } else {
    // 新規税区分を追加
    categories.push({...category});
  }
  
  return saveTaxCategories(categories);
};

/**
 * 税区分を削除
 */
export const deleteTaxCategory = (categoryId) => {
  // デフォルト税区分（標準、軽減、非課税）は削除できないように保護
  if (['standard', 'reduced', 'exempt'].includes(categoryId)) {
    return false;
  }
  
  const categories = getTaxCategories();
  const filteredCategories = categories.filter(c => c.id !== categoryId);
  
  if (categories.length === filteredCategories.length) {
    return false; // 削除対象が見つからない
  }
  
  return saveTaxCategories(filteredCategories);
};

/**
 * デフォルトの税区分を設定
 */
export const setDefaultTaxCategory = (categoryId) => {
  const categories = getTaxCategories();
  const updatedCategories = categories.map(category => ({
    ...category,
    isDefault: category.id === categoryId
  }));
  
  return saveTaxCategories(updatedCategories);
};

/**
 * 金額をフォーマット
 */
export const formatCurrency = (amount, customSettings = null) => {
  const settings = customSettings || getCurrencySettings();
  
  // 数値の丸め処理
  let roundedAmount;
  switch (settings.roundingMethod) {
    case 'up':
      roundedAmount = Math.ceil(amount);
      break;
    case 'down':
      roundedAmount = Math.floor(amount);
      break;
    case 'nearest':
    default:
      roundedAmount = Math.round(amount);
      break;
  }
  
  // フォーマット
  const formatter = new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: settings.decimalPlaces,
    maximumFractionDigits: settings.decimalPlaces,
    useGrouping: !!settings.thousandsSeparator
  });
  
  const formattedAmount = formatter.format(roundedAmount);
  
  // 記号の位置に基づいて返す
  return settings.position === 'before' 
    ? `${settings.symbol}${formattedAmount}` 
    : `${formattedAmount}${settings.symbol}`;
};

/**
 * 税額を計算
 */
export const calculateTax = (amount, categoryId = null) => {
  const taxSettings = getTaxSettings();
  const categories = taxSettings.taxCategories;
  
  // カテゴリIDが指定されている場合
  if (categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      return (amount * category.rate) / 100;
    }
  }
  
  // デフォルトのカテゴリを探す
  const defaultCategory = categories.find(c => c.isDefault) || categories[0];
  return (amount * defaultCategory.rate) / 100;
};

/**
 * 税込金額を計算
 */
export const calculateWithTax = (amount, categoryId = null) => {
  const tax = calculateTax(amount, categoryId);
  return amount + tax;
};
