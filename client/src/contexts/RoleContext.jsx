import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// 権限管理コンテキスト
const RoleContext = createContext();

// 権限種類の定義
export const PERMISSIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  CREATE: 'create',
  DELETE: 'delete',
  APPROVE: 'approve',
  ADMIN: 'admin'
};

// セクション（機能領域）の定義
export const SECTIONS = {
  SETTINGS: 'settings',
  STAFF: 'staff',
  INVENTORY: 'inventory',
  SALES: 'sales',
  MENU: 'menu',
  FINANCE: 'finance',
  REPORTS: 'reports',
  MARKETING: 'marketing',
  MANUALS: 'manuals'
};

// デフォルトの役割定義
const DEFAULT_ROLES = {
  owner: {
    name: 'オーナー',
    description: 'すべての機能にアクセス可能',
    permissions: {
      [SECTIONS.SETTINGS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.ADMIN],
      [SECTIONS.STAFF]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE, PERMISSIONS.DELETE, PERMISSIONS.ADMIN],
      [SECTIONS.INVENTORY]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
      [SECTIONS.SALES]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.APPROVE, PERMISSIONS.ADMIN],
      [SECTIONS.MENU]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE, PERMISSIONS.DELETE, PERMISSIONS.APPROVE],
      [SECTIONS.FINANCE]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.APPROVE, PERMISSIONS.ADMIN],
      [SECTIONS.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.ADMIN],
      [SECTIONS.MARKETING]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE, PERMISSIONS.DELETE, PERMISSIONS.ADMIN],
      [SECTIONS.MANUALS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE, PERMISSIONS.DELETE, PERMISSIONS.ADMIN]
    }
  },
  manager: {
    name: '店長',
    description: '日常業務のすべての管理が可能',
    permissions: {
      [SECTIONS.SETTINGS]: [PERMISSIONS.VIEW],
      [SECTIONS.STAFF]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE],
      [SECTIONS.INVENTORY]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE, PERMISSIONS.APPROVE],
      [SECTIONS.SALES]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
      [SECTIONS.MENU]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE],
      [SECTIONS.FINANCE]: [PERMISSIONS.VIEW],
      [SECTIONS.REPORTS]: [PERMISSIONS.VIEW],
      [SECTIONS.MARKETING]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
      [SECTIONS.MANUALS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE]
    }
  },
  kitchen_manager: {
    name: 'キッチンマネージャー',
    description: 'キッチン関連の業務管理',
    permissions: {
      [SECTIONS.SETTINGS]: [],
      [SECTIONS.STAFF]: [PERMISSIONS.VIEW],
      [SECTIONS.INVENTORY]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE],
      [SECTIONS.SALES]: [PERMISSIONS.VIEW],
      [SECTIONS.MENU]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.CREATE],
      [SECTIONS.FINANCE]: [],
      [SECTIONS.REPORTS]: [PERMISSIONS.VIEW],
      [SECTIONS.MARKETING]: [],
      [SECTIONS.MANUALS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT]
    }
  },
  floor_manager: {
    name: 'フロアマネージャー',
    description: 'ホール業務の管理',
    permissions: {
      [SECTIONS.SETTINGS]: [],
      [SECTIONS.STAFF]: [PERMISSIONS.VIEW],
      [SECTIONS.INVENTORY]: [PERMISSIONS.VIEW],
      [SECTIONS.SALES]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
      [SECTIONS.MENU]: [PERMISSIONS.VIEW],
      [SECTIONS.FINANCE]: [],
      [SECTIONS.REPORTS]: [PERMISSIONS.VIEW],
      [SECTIONS.MARKETING]: [PERMISSIONS.VIEW],
      [SECTIONS.MANUALS]: [PERMISSIONS.VIEW]
    }
  },
  staff: {
    name: 'スタッフ',
    description: '基本的な日常業務のみ',
    permissions: {
      [SECTIONS.SETTINGS]: [],
      [SECTIONS.STAFF]: [PERMISSIONS.VIEW],
      [SECTIONS.INVENTORY]: [PERMISSIONS.VIEW],
      [SECTIONS.SALES]: [PERMISSIONS.VIEW],
      [SECTIONS.MENU]: [PERMISSIONS.VIEW],
      [SECTIONS.FINANCE]: [],
      [SECTIONS.REPORTS]: [],
      [SECTIONS.MARKETING]: [],
      [SECTIONS.MANUALS]: [PERMISSIONS.VIEW]
    }
  }
};

export const RoleProvider = ({ children }) => {
  // 役割の状態
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [customRoles, setCustomRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 認証コンテキストからユーザー情報を取得
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  
  // 現在のユーザーの役割
  const [currentRole, setCurrentRole] = useState('staff'); // デフォルト
  
  // 初期データのロード
  useEffect(() => {
    const loadRoles = async () => {
      try {
        // LocalStorageからカスタム役割を読み込む
        const savedCustomRoles = localStorage.getItem('customRoles');
        if (savedCustomRoles) {
          setCustomRoles(JSON.parse(savedCustomRoles));
        }
        
        // 現在のユーザーの役割を取得
        if (currentUser) {
          // 実際のアプリでは、APIからユーザーの役割を取得
          // モックとして、ユーザーIDに基づいて役割を割り当て
          const role = getUserRole(currentUser.id);
          setCurrentRole(role);
        }
      } catch (err) {
        console.error('役割の読み込み中にエラーが発生しました:', err);
        setError('役割情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadRoles();
  }, [currentUser]);
  
  // ユーザーの役割を取得（モック）
  const getUserRole = (userId) => {
    // 実際のアプリでは、APIから取得
    // モックとして、IDに基づいて役割を返す
    if (userId === '1') return 'owner';
    if (userId === '2') return 'manager';
    if (userId === '3') return 'kitchen_manager';
    if (userId === '4') return 'floor_manager';
    return 'staff'; // デフォルト
  };
  
  // すべての役割（デフォルト + カスタム）を取得
  const getAllRoles = () => {
    return { ...roles, ...customRoles };
  };
  
  // 権限チェック
  const hasPermission = (section, permission) => {
    // すべての役割を取得
    const allRoles = getAllRoles();
    
    // 現在のユーザーの役割を取得
    const userRole = allRoles[currentRole] || allRoles.staff;
    
    // 指定されたセクションと権限を持っているかチェック
    return userRole.permissions[section]?.includes(permission) || false;
  };
  
  // 新しい役割の作成
  const createRole = (roleId, roleData) => {
    // roleIdがすでに存在するか確認
    if (roles[roleId] || customRoles[roleId]) {
      setError(`役割 "${roleId}" はすでに存在します`);
      return false;
    }
    
    // 新しい役割をカスタム役割に追加
    const updatedCustomRoles = {
      ...customRoles,
      [roleId]: {
        ...roleData,
        permissions: roleData.permissions || {}
      }
    };
    
    setCustomRoles(updatedCustomRoles);
    
    // LocalStorageに保存
    localStorage.setItem('customRoles', JSON.stringify(updatedCustomRoles));
    
    return true;
  };
  
  // 役割の更新
  const updateRole = (roleId, roleData) => {
    // デフォルト役割かカスタム役割かを確認
    if (DEFAULT_ROLES[roleId]) {
      // デフォルト役割は直接更新せず、同じIDでカスタム役割として保存
      setCustomRoles(prev => {
        const updatedRoles = {
          ...prev,
          [roleId]: {
            ...DEFAULT_ROLES[roleId],
            ...roleData,
            permissions: {
              ...DEFAULT_ROLES[roleId].permissions,
              ...(roleData.permissions || {})
            }
          }
        };
        
        // LocalStorageに保存
        localStorage.setItem('customRoles', JSON.stringify(updatedRoles));
        
        return updatedRoles;
      });
    } else {
      // カスタム役割の更新
      setCustomRoles(prev => {
        // 指定された役割が存在するか確認
        if (!prev[roleId]) {
          setError(`役割 "${roleId}" が見つかりません`);
          return prev;
        }
        
        const updatedRoles = {
          ...prev,
          [roleId]: {
            ...prev[roleId],
            ...roleData,
            permissions: {
              ...prev[roleId].permissions,
              ...(roleData.permissions || {})
            }
          }
        };
        
        // LocalStorageに保存
        localStorage.setItem('customRoles', JSON.stringify(updatedRoles));
        
        return updatedRoles;
      });
    }
    
    return true;
  };
  
  // 役割の削除
  const deleteRole = (roleId) => {
    // デフォルト役割は削除できない
    if (DEFAULT_ROLES[roleId]) {
      setError('デフォルトの役割は削除できません');
      return false;
    }
    
    // 指定された役割が存在するか確認
    if (!customRoles[roleId]) {
      setError(`役割 "${roleId}" が見つかりません`);
      return false;
    }
    
    // 役割を削除
    setCustomRoles(prev => {
      const { [roleId]: removed, ...rest } = prev;
      
      // LocalStorageに保存
      localStorage.setItem('customRoles', JSON.stringify(rest));
      
      return rest;
    });
    
    return true;
  };
  
  // エラーリセット
  const resetError = () => {
    setError(null);
  };
  
  // コンテキスト値
  const value = {
    roles: getAllRoles(),
    currentRole,
    loading,
    error,
    hasPermission,
    createRole,
    updateRole,
    deleteRole,
    resetError,
    PERMISSIONS,
    SECTIONS
  };
  
  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

// カスタムフック
export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export default RoleContext;
