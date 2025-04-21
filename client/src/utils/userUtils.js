/**
 * ユーザー管理と権限設定関連のユーティリティ関数
 */

import { getLocalStorageData, setLocalStorageData } from './storeUtils';

// アプリケーションの機能権限リスト
export const PERMISSIONS = {
  // ダッシュボード
  DASHBOARD_VIEW: 'dashboard_view',
  DASHBOARD_EDIT: 'dashboard_edit',
  
  // 店舗管理
  STORE_VIEW: 'store_view',
  STORE_EDIT: 'store_edit',
  
  // 販売・POSシステム
  POS_VIEW: 'pos_view',
  POS_OPERATE: 'pos_operate',
  POS_REFUND: 'pos_refund',
  POS_DISCOUNT: 'pos_discount',
  SALES_REPORT: 'sales_report',
  
  // 在庫管理
  INVENTORY_VIEW: 'inventory_view',
  INVENTORY_EDIT: 'inventory_edit',
  INVENTORY_ORDER: 'inventory_order',
  
  // メニュー管理
  MENU_VIEW: 'menu_view',
  MENU_EDIT: 'menu_edit',
  MENU_PRICE: 'menu_price',
  
  // スタッフ管理
  STAFF_VIEW: 'staff_view',
  STAFF_EDIT: 'staff_edit',
  STAFF_ADMIN: 'staff_admin',
  
  // シフト管理
  SHIFT_VIEW: 'shift_view',
  SHIFT_EDIT: 'shift_edit',
  SHIFT_APPROVE: 'shift_approve',
  
  // 勤怠管理
  ATTENDANCE_VIEW: 'attendance_view',
  ATTENDANCE_EDIT: 'attendance_edit',
  ATTENDANCE_APPROVE: 'attendance_approve',
  
  // 財務管理
  FINANCE_VIEW: 'finance_view',
  FINANCE_EDIT: 'finance_edit',
  FINANCE_APPROVE: 'finance_approve',
  
  // 設定
  SETTINGS_VIEW: 'settings_view',
  SETTINGS_EDIT: 'settings_edit',
  SETTINGS_ADMIN: 'settings_admin',
  
  // システム管理
  SYSTEM_ADMIN: 'system_admin',
  ROLE_ADMIN: 'role_admin',
  USER_ADMIN: 'user_admin',
  LOG_ADMIN: 'log_admin'
};

// 機能グループの定義
export const PERMISSION_GROUPS = [
  {
    id: 'dashboard',
    name: 'ダッシュボード',
    permissions: [
      { id: PERMISSIONS.DASHBOARD_VIEW, name: '閲覧', description: 'ダッシュボードの閲覧' },
      { id: PERMISSIONS.DASHBOARD_EDIT, name: '編集', description: 'ダッシュボードの編集' }
    ]
  },
  {
    id: 'store',
    name: '店舗管理',
    permissions: [
      { id: PERMISSIONS.STORE_VIEW, name: '閲覧', description: '店舗情報の閲覧' },
      { id: PERMISSIONS.STORE_EDIT, name: '編集', description: '店舗情報の編集' }
    ]
  },
  {
    id: 'pos',
    name: 'POS・販売',
    permissions: [
      { id: PERMISSIONS.POS_VIEW, name: '閲覧', description: 'POSシステムへのアクセス' },
      { id: PERMISSIONS.POS_OPERATE, name: '操作', description: 'POSでの販売操作' },
      { id: PERMISSIONS.POS_REFUND, name: '返金', description: '返金処理の実行' },
      { id: PERMISSIONS.POS_DISCOUNT, name: '割引', description: '割引の適用' },
      { id: PERMISSIONS.SALES_REPORT, name: '売上レポート', description: '売上レポートの閲覧' }
    ]
  },
  {
    id: 'inventory',
    name: '在庫管理',
    permissions: [
      { id: PERMISSIONS.INVENTORY_VIEW, name: '閲覧', description: '在庫情報の閲覧' },
      { id: PERMISSIONS.INVENTORY_EDIT, name: '編集', description: '在庫情報の編集' },
      { id: PERMISSIONS.INVENTORY_ORDER, name: '発注', description: '発注の作成と管理' }
    ]
  },
  {
    id: 'menu',
    name: 'メニュー管理',
    permissions: [
      { id: PERMISSIONS.MENU_VIEW, name: '閲覧', description: 'メニュー情報の閲覧' },
      { id: PERMISSIONS.MENU_EDIT, name: '編集', description: 'メニュー情報の編集' },
      { id: PERMISSIONS.MENU_PRICE, name: '価格設定', description: 'メニュー価格の設定' }
    ]
  },
  {
    id: 'staff',
    name: 'スタッフ管理',
    permissions: [
      { id: PERMISSIONS.STAFF_VIEW, name: '閲覧', description: 'スタッフ情報の閲覧' },
      { id: PERMISSIONS.STAFF_EDIT, name: '編集', description: 'スタッフ情報の編集' },
      { id: PERMISSIONS.STAFF_ADMIN, name: '管理', description: 'スタッフの追加・削除権限' }
    ]
  },
  {
    id: 'shift',
    name: 'シフト管理',
    permissions: [
      { id: PERMISSIONS.SHIFT_VIEW, name: '閲覧', description: 'シフト情報の閲覧' },
      { id: PERMISSIONS.SHIFT_EDIT, name: '編集', description: 'シフト情報の編集' },
      { id: PERMISSIONS.SHIFT_APPROVE, name: '承認', description: 'シフトリクエストの承認' }
    ]
  },
  {
    id: 'attendance',
    name: '勤怠管理',
    permissions: [
      { id: PERMISSIONS.ATTENDANCE_VIEW, name: '閲覧', description: '勤怠情報の閲覧' },
      { id: PERMISSIONS.ATTENDANCE_EDIT, name: '編集', description: '勤怠情報の編集' },
      { id: PERMISSIONS.ATTENDANCE_APPROVE, name: '承認', description: '勤怠記録の承認' }
    ]
  },
  {
    id: 'finance',
    name: '財務管理',
    permissions: [
      { id: PERMISSIONS.FINANCE_VIEW, name: '閲覧', description: '財務情報の閲覧' },
      { id: PERMISSIONS.FINANCE_EDIT, name: '編集', description: '財務情報の編集' },
      { id: PERMISSIONS.FINANCE_APPROVE, name: '承認', description: '財務処理の承認' }
    ]
  },
  {
    id: 'settings',
    name: '設定管理',
    permissions: [
      { id: PERMISSIONS.SETTINGS_VIEW, name: '閲覧', description: '設定の閲覧' },
      { id: PERMISSIONS.SETTINGS_EDIT, name: '編集', description: '設定の編集' },
      { id: PERMISSIONS.SETTINGS_ADMIN, name: '管理', description: 'システム設定の管理' }
    ]
  },
  {
    id: 'system',
    name: 'システム管理',
    permissions: [
      { id: PERMISSIONS.SYSTEM_ADMIN, name: 'システム管理', description: 'システム全体の管理' },
      { id: PERMISSIONS.ROLE_ADMIN, name: '役割管理', description: '役割と権限の管理' },
      { id: PERMISSIONS.USER_ADMIN, name: 'ユーザー管理', description: 'ユーザーアカウントの管理' },
      { id: PERMISSIONS.LOG_ADMIN, name: 'ログ閲覧', description: 'システムログの閲覧' }
    ]
  }
];

// ユーザー状態の定義
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// デフォルトのユーザー
const DEFAULT_USERS = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123', // 実際のアプリケーションではハッシュ化が必要
    firstName: '管理者',
    lastName: '太郎',
    email: 'admin@example.com',
    phone: '090-1234-5678',
    emergencyContact: '03-1234-5678',
    hireDate: '2023-01-01',
    position: '店長',
    department: '管理部',
    status: USER_STATUS.ACTIVE,
    lastLogin: null,
    roles: ['owner'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'user-staff',
    username: 'staff',
    password: 'staff123', // 実際のアプリケーションではハッシュ化が必要
    firstName: 'スタッフ',
    lastName: '花子',
    email: 'staff@example.com',
    phone: '090-8765-4321',
    emergencyContact: '03-8765-4321',
    hireDate: '2023-02-01',
    position: 'スタッフ',
    department: '調理部',
    status: USER_STATUS.ACTIVE,
    lastLogin: null,
    roles: ['staff'],
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-01T00:00:00Z'
  }
];

// デフォルトの役割と権限のマッピング
const DEFAULT_ROLE_PERMISSIONS = {
  // 全権限を持つオーナー
  owner: Object.values(PERMISSIONS),
  
  // 管理権限を持つ店長
  manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EDIT,
    PERMISSIONS.STORE_VIEW,
    PERMISSIONS.STORE_EDIT,
    PERMISSIONS.POS_VIEW,
    PERMISSIONS.POS_OPERATE,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.SALES_REPORT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.INVENTORY_ORDER,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_EDIT,
    PERMISSIONS.MENU_PRICE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_EDIT,
    PERMISSIONS.SHIFT_VIEW,
    PERMISSIONS.SHIFT_EDIT,
    PERMISSIONS.SHIFT_APPROVE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_EDIT,
    PERMISSIONS.ATTENDANCE_APPROVE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT
  ],
  
  // 基本権限を持つスタッフ
  staff: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STORE_VIEW,
    PERMISSIONS.POS_VIEW,
    PERMISSIONS.POS_OPERATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.SHIFT_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW
  ]
};

/**
 * ユーザー一覧を取得
 */
export const getUsers = () => {
  return getLocalStorageData('users', DEFAULT_USERS);
};

/**
 * ユーザーを保存
 */
export const saveUsers = (users) => {
  return setLocalStorageData('users', users);
};

/**
 * ユーザーを取得
 */
export const getUserById = (userId) => {
  const users = getUsers();
  return users.find(user => user.id === userId) || null;
};

/**
 * ユーザーを追加/更新
 */
export const saveUser = (user) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index >= 0) {
    // 既存ユーザーの更新
    users[index] = {
      ...users[index],
      ...user,
      updatedAt: new Date().toISOString()
    };
  } else {
    // 新規ユーザーの追加
    users.push({
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // 変更をログに記録
  const logEntry = {
    id: `log-${Date.now()}`,
    type: index >= 0 ? 'USER_UPDATE' : 'USER_CREATE',
    userId: user.id,
    timestamp: new Date().toISOString(),
    details: {
      user: { ...user }
    }
  };
  
  addLogEntry(logEntry);
  
  return saveUsers(users);
};

/**
 * ユーザーのステータスを更新
 */
export const updateUserStatus = (userId, status) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index < 0) {
    return false;
  }
  
  users[index].status = status;
  users[index].updatedAt = new Date().toISOString();
  
  // 変更をログに記録
  const logEntry = {
    id: `log-${Date.now()}`,
    type: 'USER_STATUS_CHANGE',
    userId: userId,
    timestamp: new Date().toISOString(),
    details: {
      oldStatus: users[index].status,
      newStatus: status
    }
  };
  
  addLogEntry(logEntry);
  
  return saveUsers(users);
};

/**
 * ユーザーにログインを記録
 */
export const recordUserLogin = (userId) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index < 0) {
    return false;
  }
  
  users[index].lastLogin = new Date().toISOString();
  
  // ログインをログに記録
  const logEntry = {
    id: `log-${Date.now()}`,
    type: 'USER_LOGIN',
    userId: userId,
    timestamp: new Date().toISOString(),
    details: {}
  };
  
  addLogEntry(logEntry);
  
  return saveUsers(users);
};

/**
 * ユーザーパスワードをリセット
 */
export const resetUserPassword = (userId, newPassword) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index < 0) {
    return false;
  }
  
  // 実際のアプリケーションではパスワードをハッシュ化する
  users[index].password = newPassword;
  users[index].updatedAt = new Date().toISOString();
  
  // パスワードリセットをログに記録
  const logEntry = {
    id: `log-${Date.now()}`,
    type: 'PASSWORD_RESET',
    userId: userId,
    timestamp: new Date().toISOString(),
    details: {}
  };
  
  addLogEntry(logEntry);
  
  return saveUsers(users);
};

/**
 * 役割一覧を取得
 */
export const getRoles = () => {
  return getLocalStorageData('roles', [
    { id: 'owner', name: 'オーナー', description: 'すべての機能にアクセス可能' },
    { id: 'manager', name: '店長', description: '日常業務のすべての管理が可能' },
    { id: 'staff', name: 'スタッフ', description: '基本的な日常業務のみ' }
  ]);
};

/**
 * 役割の権限マッピングを取得
 */
export const getRolePermissions = () => {
  return getLocalStorageData('rolePermissions', DEFAULT_ROLE_PERMISSIONS);
};

/**
 * 役割の権限マッピングを保存
 */
export const saveRolePermissions = (rolePermissions) => {
  return setLocalStorageData('rolePermissions', rolePermissions);
};

/**
 * 役割の権限を更新
 */
export const updateRolePermissions = (roleId, permissions) => {
  const rolePermissions = getRolePermissions();
  
  // 以前の権限を記録
  const oldPermissions = rolePermissions[roleId] || [];
  
  // 権限を更新
  rolePermissions[roleId] = permissions;
  
  // 変更をログに記録
  const logEntry = {
    id: `log-${Date.now()}`,
    type: 'ROLE_PERMISSIONS_UPDATE',
    timestamp: new Date().toISOString(),
    details: {
      roleId,
      oldPermissions,
      newPermissions: permissions
    }
  };
  
  addLogEntry(logEntry);
  
  return saveRolePermissions(rolePermissions);
};

/**
 * ユーザーに役割を割り当て
 */
export const assignRoleToUser = (userId, roleId) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return false;
  }
  
  // 現在の役割を記録
  const oldRoles = [...user.roles];
  
  // 既に役割が割り当てられていなければ追加
  if (!user.roles.includes(roleId)) {
    user.roles.push(roleId);
    user.updatedAt = new Date().toISOString();
    
    // 変更をログに記録
    const logEntry = {
      id: `log-${Date.now()}`,
      type: 'USER_ROLE_ASSIGN',
      userId: userId,
      timestamp: new Date().toISOString(),
      details: {
        roleId,
        oldRoles,
        newRoles: user.roles
      }
    };
    
    addLogEntry(logEntry);
    
    return saveUsers(users);
  }
  
  return true;
};

/**
 * ユーザーから役割を削除
 */
export const removeRoleFromUser = (userId, roleId) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return false;
  }
  
  // 現在の役割を記録
  const oldRoles = [...user.roles];
  
  // 役割を削除
  user.roles = user.roles.filter(r => r !== roleId);
  user.updatedAt = new Date().toISOString();
  
  // 変更をログに記録
  const logEntry = {
    id: `log-${Date.now()}`,
    type: 'USER_ROLE_REMOVE',
    userId: userId,
    timestamp: new Date().toISOString(),
    details: {
      roleId,
      oldRoles,
      newRoles: user.roles
    }
  };
  
  addLogEntry(logEntry);
  
  return saveUsers(users);
};

/**
 * ユーザーが特定の権限を持っているかチェック
 */
export const hasPermission = (userId, permissionId) => {
  const user = getUserById(userId);
  
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    return false;
  }
  
  const rolePermissions = getRolePermissions();
  
  // ユーザーの役割が持つすべての権限を取得
  const userPermissions = user.roles.reduce((permissions, roleId) => {
    const rolePerms = rolePermissions[roleId] || [];
    return [...permissions, ...rolePerms];
  }, []);
  
  return userPermissions.includes(permissionId);
};

/**
 * ログエントリーを取得
 */
export const getLogs = () => {
  return getLocalStorageData('systemLogs', []);
};

/**
 * ログエントリーを保存
 */
export const saveLogs = (logs) => {
  return setLocalStorageData('systemLogs', logs);
};

/**
 * ログエントリーを追加
 */
export const addLogEntry = (logEntry) => {
  const logs = getLogs();
  logs.unshift(logEntry); // 新しいログを先頭に追加
  
  // ログの数が多すぎる場合は古いものを削除（最大1000件）
  const maxLogs = 1000;
  if (logs.length > maxLogs) {
    logs.splice(maxLogs);
  }
  
  return saveLogs(logs);
};

/**
 * ログをフィルタリング
 */
export const filterLogs = (filters) => {
  const logs = getLogs();
  
  return logs.filter(log => {
    // ユーザーIDでフィルタリング
    if (filters.userId && log.userId !== filters.userId) {
      return false;
    }
    
    // タイプでフィルタリング
    if (filters.type && log.type !== filters.type) {
      return false;
    }
    
    // 日付範囲でフィルタリング
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const logDate = new Date(log.timestamp);
      if (logDate < startDate) {
        return false;
      }
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // 日の終わりに設定
      const logDate = new Date(log.timestamp);
      if (logDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * デフォルトのデータを初期化
 */
export const initializeUserData = () => {
  // すでに初期化されているかチェック
  const initialized = getLocalStorageData('userDataInitialized', false);
  if (initialized) {
    return true;
  }
  
  // ユーザーの初期化
  saveUsers(DEFAULT_USERS);
  
  // 役割の権限マッピングの初期化
  saveRolePermissions(DEFAULT_ROLE_PERMISSIONS);
  
  // 初期化フラグを設定
  setLocalStorageData('userDataInitialized', true);
  
  return true;
};
