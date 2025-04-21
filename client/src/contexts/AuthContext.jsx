import { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

// 認証コンテキストの作成
const AuthContext = createContext();

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // APIからユーザー情報を取得する試み
          try {
            const userData = await authApi.getCurrentUser();
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } catch (apiError) {
            console.warn('認証エラー: APIが実装されていません。モックユーザーを使用します。', apiError);
            
            // 開発用モックユーザー
            if (token === 'mock-token') {
              setCurrentUser({
                id: '1',
                email: 'test@example.com',
                name: 'テストユーザー',
                role: 'admin'
              });
              setIsAuthenticated(true);
            } else {
              // トークンが不正な場合はクリア
              localStorage.removeItem('token');
            }
          }
        } catch (error) {
          console.error('認証エラー:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // ログイン処理
  const login = async (credentials) => {
    try {
      setError(null);
      let data;
      
      // APIログインとモックログインをサポート
      if (credentials.token && credentials.user) {
        // モックデータが直接渡された場合
        data = credentials;
      } else {
        // 実際のAPIを呼び出す場合
        try {
          data = await authApi.login(credentials);
        } catch (apiError) {
          console.warn('認証エラー: APIが実装されていません。モック認証を使用します。', apiError);
          // 開発用モックデータ
          data = {
            token: 'mock-token',
            user: {
              id: '1',
              email: credentials.email || 'test@example.com',
              name: 'テストユーザー',
              role: 'admin'
            }
          };
        }
      }
      
      // トークンをローカルストレージに保存
      localStorage.setItem('token', data.token);
      
      // ユーザー情報を設定
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      console.error('ログインエラー:', error);
      setError(error.response?.data?.message || 'ログインに失敗しました');
      throw error;
    }
  };

  // 登録処理
  const register = async (userData) => {
    try {
      setError(null);
      const data = await authApi.register(userData);
      
      // トークンをローカルストレージに保存
      localStorage.setItem('token', data.token);
      
      // ユーザー情報を設定
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      console.error('登録エラー:', error);
      setError(error.response?.data?.message || '登録に失敗しました');
      throw error;
    }
  };

  // ログアウト処理
  const logout = async () => {
    try {
      await authApi.logout();
      
      // ユーザー情報をリセット
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      return true;
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  // コンテキスト値
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 認証コンテキストを使用するためのフック
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
