/**
 * 通貨のフォーマット関数
 * @param {number} amount - フォーマットする金額
 * @param {string} locale - ロケール（デフォルト：ja-JP）
 * @param {string} currency - 通貨コード（デフォルト：JPY）
 * @returns {string} フォーマットされた通貨文字列
 */
export const formatCurrency = (amount, locale = 'ja-JP', currency = 'JPY') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * 日付のフォーマット関数
 * @param {string|Date} date - フォーマットする日付
 * @param {string} locale - ロケール（デフォルト：ja-JP）
 * @param {object} options - フォーマットオプション
 * @returns {string} フォーマットされた日付文字列
 */
export const formatDate = (date, locale = 'ja-JP', options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  return new Date(date).toLocaleDateString(locale, options);
};

/**
 * 時間のフォーマット関数
 * @param {string|Date} time - フォーマットする時間
 * @param {string} locale - ロケール（デフォルト：ja-JP）
 * @returns {string} フォーマットされた時間文字列
 */
export const formatTime = (time, locale = 'ja-JP') => {
  return new Date(time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};

/**
 * パーセンテージのフォーマット関数
 * @param {number} value - フォーマットする値（0-1の範囲）
 * @param {number} digits - 小数点以下の桁数
 * @returns {string} フォーマットされたパーセンテージ文字列
 */
export const formatPercentage = (value, digits = 1) => {
  return `${(value * 100).toFixed(digits)}%`;
};

/**
 * 数値のフォーマット関数
 * @param {number} number - フォーマットする数値
 * @param {string} locale - ロケール（デフォルト：ja-JP）
 * @returns {string} フォーマットされた数値文字列 
 */
export const formatNumber = (number, locale = 'ja-JP') => {
  return new Intl.NumberFormat(locale).format(number);
};
