import React, { createContext, useState, useContext, useEffect } from 'react';

// 設定管理コンテキスト
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  console.log('SettingsProvider initializing');
  // 基本的な設定データ構造
  const defaultSettings = {
    storeInfo: {
      name: '和食レストラン 匠',
      address: '東京都中央区銀座1-1-1',
      phone: '03-1234-5678',
      email: 'info@washoku-takumi.jp',
      businessHours: '11:00-22:00',
      taxRate: 10,
      currency: 'JPY',
      logo: null,
      storeType: 'japanese',
      seatingCapacity: 50
    },
    system: {
      language: 'ja',
      dateFormat: 'yyyy/MM/dd',
      timeFormat: 'HH:mm',
      notifications: {
        inventoryAlert: true,
        reservationReminder: true,
        salesReport: true
      },
      backupFrequency: 'daily'
    },
    branches: [
      {
        id: 'main',
        name: '銀座本店',
        address: '東京都中央区銀座1-1-1',
        phone: '03-1234-5678',
        isMainBranch: true
      }
    ]
  };
  
  const [settings, setSettings] = useState(defaultSettings);

  // 設定の永続化（モック）
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初期データのロード
  useEffect(() => {
    console.log('SettingsProvider - useEffect for loading settings');
    const loadSettings = async () => {
      try {
        console.log('Loading settings from localStorage...');
        // 実際のAPIからデータを取得する代わりにLocalStorageから取得
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          console.log('Found saved settings in localStorage');
          try {
            const parsedSettings = JSON.parse(savedSettings);
            console.log('Parsed settings:', parsedSettings);
            setSettings(parsedSettings);
          } catch (parseErr) {
            console.error('Error parsing saved settings:', parseErr);
            // パースエラーの場合はデフォルト設定を使用
            localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
          }
        } else {
          console.log('No saved settings found, using defaults');
          // 初回はデフォルト設定をLocalStorageに保存
          localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
        }
      } catch (err) {
        console.error('設定のロード中にエラーが発生しました:', err);
        setError('設定の読み込みに失敗しました');
      } finally {
        console.log('Finished loading settings, setting loading=false');
        setLoading(false);
      }
    };

    // 即時関数を使用して非同期処理を実行
    loadSettings();
  }, []);

  // 設定の更新
  const updateSettings = (section, data) => {
    setSettings(prev => {
      // 深いマージを行う関数
      const mergeDeep = (target, source) => {
        const output = { ...target };
        
        if (isObject(target) && isObject(source)) {
          Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
              if (!(key in target)) {
                output[key] = source[key];
              } else {
                output[key] = mergeDeep(target[key], source[key]);
              }
            } else {
              output[key] = source[key];
            }
          });
        }
        
        return output;
      };
      
      // オブジェクトかどうかを判定する関数
      const isObject = (item) => {
        return (item && typeof item === 'object' && !Array.isArray(item));
      };

      // 特定のセクションのみ更新
      const newSettings = {
        ...prev,
        [section]: mergeDeep(prev[section], data)
      };
      
      // LocalStorageに保存
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      
      return newSettings;
    });
  };

  // 店舗（支店）の追加
  const addBranch = (branchData) => {
    setSettings(prev => {
      const newBranch = {
        id: `branch-${Date.now()}`,
        isMainBranch: false,
        ...branchData
      };
      
      const newSettings = {
        ...prev,
        branches: [...prev.branches, newBranch]
      };
      
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // 店舗（支店）の更新
  const updateBranch = (branchId, branchData) => {
    setSettings(prev => {
      const branches = prev.branches.map(branch => 
        branch.id === branchId ? { ...branch, ...branchData } : branch
      );
      
      const newSettings = {
        ...prev,
        branches
      };
      
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // 店舗（支店）の削除
  const deleteBranch = (branchId) => {
    setSettings(prev => {
      // メイン店舗は削除できない
      const branch = prev.branches.find(b => b.id === branchId);
      if (branch && branch.isMainBranch) {
        setError('メイン店舗は削除できません');
        return prev;
      }
      
      const branches = prev.branches.filter(branch => branch.id !== branchId);
      
      const newSettings = {
        ...prev,
        branches
      };
      
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // バックアップ作成（モック）
  const createBackup = () => {
    const backupData = JSON.stringify(settings);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `restaurant-app-backup-${timestamp}`;
    
    // 実際のアプリケーションではAPIを使用してサーバーにバックアップを保存
    localStorage.setItem(backupName, backupData);
    
    return backupName;
  };

  // バックアップから復元（モック）
  const restoreFromBackup = (backupName) => {
    try {
      const backupData = localStorage.getItem(backupName);
      if (backupData) {
        const parsedData = JSON.parse(backupData);
        setSettings(parsedData);
        localStorage.setItem('appSettings', backupData);
        return true;
      }
      return false;
    } catch (err) {
      console.error('バックアップからの復元中にエラーが発生しました:', err);
      setError('バックアップからの復元に失敗しました');
      return false;
    }
  };

  // エラーリセット
  const resetError = () => {
    setError(null);
  };

  // コンテキスト値
  const value = {
    settings,
    loading,
    error,
    updateSettings,
    addBranch,
    updateBranch,
    deleteBranch,
    createBackup,
    restoreFromBackup,
    resetError
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// カスタムフック
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    console.error('useSettings must be used within a SettingsProvider');
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  console.log('useSettings hook called, returning context:', context);
  return context;
};

export default SettingsContext;
