import axios from 'axios';

// OpenWeatherMap API キー
// 注: 実際のアプリケーションでは環境変数に保存することをお勧めします
const OPENWEATHERMAP_API_KEY = 'YOUR_API_KEY_HERE';
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * 住所から緯度と経度を取得する
 * @param {string} address 住所文字列
 * @returns {Promise<{lat: number, lon: number}>} 緯度と経度
 */
export const getCoordinatesFromAddress = async (address) => {
  try {
    // 日本語住所をURLエンコード
    const encodedAddress = encodeURIComponent(address);
    
    const response = await axios.get(`${GEOCODING_API_URL}?q=${encodedAddress}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`);
    
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat, lon };
    }
    
    throw new Error('住所から座標を取得できませんでした。');
  } catch (error) {
    console.error('座標取得エラー:', error);
    throw error;
  }
};

/**
 * 緯度と経度から天気情報を取得する
 * @param {number} lat 緯度
 * @param {number} lon 経度
 * @returns {Promise<Object>} 天気情報
 */
export const getWeatherByCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(
      `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${OPENWEATHERMAP_API_KEY}`
    );
    
    if (response.data) {
      // OpenWeatherMapからのレスポンスを整形
      const weatherData = {
        temperature: Math.round(response.data.main.temp),
        humidity: response.data.main.humidity,
        condition: mapWeatherCondition(response.data.weather[0].main),
        description: response.data.weather[0].description,
        windSpeed: response.data.wind.speed,
        city: response.data.name,
        date: new Date(),
        icon: response.data.weather[0].icon
      };
      
      return weatherData;
    }
    
    throw new Error('天気情報を取得できませんでした。');
  } catch (error) {
    console.error('天気情報取得エラー:', error);
    throw error;
  }
};

/**
 * OpenWeatherMapの天気状態を独自の形式にマッピングする
 * @param {string} condition OpenWeatherMapの天気状態
 * @returns {string} マッピングされた天気状態
 */
const mapWeatherCondition = (condition) => {
  const conditionMap = {
    'Clear': 'sunny',
    'Clouds': 'cloudy',
    'Rain': 'rainy',
    'Drizzle': 'rainy',
    'Thunderstorm': 'rainy',
    'Snow': 'snowy',
    'Mist': 'cloudy',
    'Smoke': 'cloudy',
    'Haze': 'cloudy',
    'Dust': 'cloudy',
    'Fog': 'cloudy',
    'Sand': 'cloudy',
    'Ash': 'cloudy',
    'Squall': 'cloudy',
    'Tornado': 'cloudy'
  };
  
  return conditionMap[condition] || 'sunny';
};

/**
 * 住所から天気情報を取得する（統合関数）
 * @param {string} address 住所文字列
 * @returns {Promise<Object>} 天気情報
 */
export const getWeatherByAddress = async (address) => {
  try {
    // 住所から座標を取得
    const { lat, lon } = await getCoordinatesFromAddress(address);
    
    // 座標から天気情報を取得
    const weatherData = await getWeatherByCoordinates(lat, lon);
    
    return weatherData;
  } catch (error) {
    console.error('住所からの天気情報取得エラー:', error);
    
    // エラーが発生した場合はデフォルトの天気情報を返す
    return {
      temperature: 23,
      humidity: 45,
      condition: 'sunny',
      description: '晴れ',
      windSpeed: 2.5,
      city: '不明',
      date: new Date(),
      icon: '01d'
    };
  }
};
