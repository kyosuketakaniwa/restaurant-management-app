import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
  Avatar, Chip, Divider, Alert, Snackbar, Card, CardContent,
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

import { 
  getUsers, saveUser, updateUserStatus, getUserById, resetUserPassword,
  getRoles, assignRoleToUser, removeRoleFromUser, USER_STATUS,
  initializeUserData
} from '../../utils/userUtils';
import UserProfileDialog from './UserProfileDialog';
import UserPasswordDialog from './UserPasswordDialog';

/**
 * ユーザー管理コンポーネント
 */
const UserManagement = () => {
  // 状態管理
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 初期化
  useEffect(() => {
    // ユーザーデータが初期化されていることを確認
    initializeUserData();
    
    // データのロード
    loadData();
  }, []);

  // データのロード
  const loadData = () => {
    const loadedUsers = getUsers();
    const loadedRoles = getRoles();
    
    setUsers(loadedUsers);
    setRoles(loadedRoles);
    
    // デフォルトで最初のユーザーを選択
    if (loadedUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(loadedUsers[0].id);
    }
  };

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ステータスフィルター変更ハンドラー
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // ユーザー選択ハンドラー
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  // 新規ユーザープロファイルダイアログを開く
  const handleOpenNewUserDialog = () => {
    setSelectedUserId(null);
    setProfileDialogOpen(true);
  };

  // ユーザープロファイル編集ダイアログを開く
  const handleOpenEditUserDialog = (userId) => {
    setSelectedUserId(userId);
    setProfileDialogOpen(true);
  };

  // パスワードリセットダイアログを開く
  const handleOpenPasswordDialog = (userId) => {
    setSelectedUserId(userId);
    setPasswordDialogOpen(true);
  };

  // ユーザー削除ダイアログを開く
  const handleOpenDeleteDialog = (userId) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  // ユーザープロファイルの保存
  const handleSaveUserProfile = (userData) => {
    // ユーザーIDが指定されていない場合は新規作成
    if (!userData.id) {
      userData.id = `user-${Date.now()}`;
      userData.status = USER_STATUS.ACTIVE;
      userData.lastLogin = null;
      userData.roles = ['staff']; // デフォルトでスタッフロールを割り当て
    }
    
    saveUser(userData);
    
    // データの再ロード
    loadData();
    
    setProfileDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: userData.id ? 'ユーザー情報が更新されました' : '新しいユーザーが作成されました',
      severity: 'success'
    });
  };

  // パスワードのリセット
  const handleResetPassword = (userId, newPassword) => {
    resetUserPassword(userId, newPassword);
    
    setPasswordDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: 'パスワードがリセットされました',
      severity: 'success'
    });
  };

  // ユーザーの削除
  const handleDeleteUser = () => {
    // 実際のアプリでは完全削除ではなく、ステータスをINACTIVEに変更することが多い
    updateUserStatus(selectedUserId, USER_STATUS.INACTIVE);
    
    // データの再ロード
    loadData();
    
    setDeleteDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: 'ユーザーアカウントが無効化されました',
      severity: 'success'
    });
  };

  // ユーザーステータスの更新
  const handleUpdateUserStatus = (userId, newStatus) => {
    updateUserStatus(userId, newStatus);
    
    // データの再ロード
    loadData();
    
    setSnackbar({
      open: true,
      message: 'ユーザーステータスが更新されました',
      severity: 'success'
    });
  };

  // ユーザーに役割を割り当て
  const handleAssignRole = (userId, roleId) => {
    assignRoleToUser(userId, roleId);
    
    // データの再ロード
    loadData();
    
    setSnackbar({
      open: true,
      message: '役割が割り当てられました',
      severity: 'success'
    });
  };

  // ユーザーから役割を削除
  const handleRemoveRole = (userId, roleId) => {
    removeRoleFromUser(userId, roleId);
    
    // データの再ロード
    loadData();
    
    setSnackbar({
      open: true,
      message: '役割が削除されました',
      severity: 'success'
    });
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // フィルター適用後のユーザーリストを取得
  const getFilteredUsers = () => {
    if (statusFilter === 'all') {
      return users;
    }
    
    return users.filter(user => user.status === statusFilter);
  };

  // 選択されたユーザーの情報を取得
  const getSelectedUser = () => {
    return users.find(user => user.id === selectedUserId) || null;
  };

  // ユーザー詳細情報を表示
  const renderUserDetails = () => {
    const user = getSelectedUser();
    
    if (!user) {
      return (
        <Alert severity="info">
          ユーザーを選択してください
        </Alert>
      );
    }
    
    return (
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems="center">
              <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                {user.firstName ? user.firstName.charAt(0) : <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {user.lastName} {user.firstName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {user.position || '役職なし'} - {user.department || '部署なし'}
                </Typography>
                <Box mt={1}>
                  {user.roles.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return (
                      <Chip 
                        key={roleId} 
                        label={role?.name || roleId} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Box>
            
            <Box>
              <Chip 
                label={(() => {
                  switch(user.status) {
                    case USER_STATUS.ACTIVE: return '有効';
                    case USER_STATUS.INACTIVE: return '無効';
                    case USER_STATUS.SUSPENDED: return '停止中';
                    case USER_STATUS.PENDING: return '保留中';
                    default: return user.status;
                  }
                })()}
                color={(() => {
                  switch(user.status) {
                    case USER_STATUS.ACTIVE: return 'success';
                    case USER_STATUS.INACTIVE: return 'default';
                    case USER_STATUS.SUSPENDED: return 'error';
                    case USER_STATUS.PENDING: return 'warning';
                    default: return 'default';
                  }
                })()}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">ユーザー名</Typography>
              <Typography>{user.username}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">メールアドレス</Typography>
              <Typography>{user.email || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">電話番号</Typography>
              <Typography>{user.phone || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">緊急連絡先</Typography>
              <Typography>{user.emergencyContact || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">入社日</Typography>
              <Typography>{user.hireDate || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">最終ログイン</Typography>
              <Typography>
                {user.lastLogin 
                  ? new Date(user.lastLogin).toLocaleString() 
                  : 'ログイン記録なし'}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => handleOpenEditUserDialog(user.id)}
                sx={{ mr: 1 }}
              >
                編集
              </Button>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => handleOpenPasswordDialog(user.id)}
                sx={{ mr: 1 }}
              >
                パスワードリセット
              </Button>
            </Box>
            
            <Box>
              {user.status === USER_STATUS.ACTIVE && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<BlockIcon />}
                  onClick={() => handleUpdateUserStatus(user.id, USER_STATUS.SUSPENDED)}
                  sx={{ mr: 1 }}
                >
                  アカウント停止
                </Button>
              )}
              
              {user.status === USER_STATUS.SUSPENDED && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleUpdateUserStatus(user.id, USER_STATUS.ACTIVE)}
                  sx={{ mr: 1 }}
                >
                  アカウント復活
                </Button>
              )}
              
              {user.status !== USER_STATUS.INACTIVE && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleOpenDeleteDialog(user.id)}
                >
                  アカウント無効化
                </Button>
              )}
            </Box>
          </Box>
          
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              役割の管理
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>役割を追加</InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAssignRole(user.id, e.target.value);
                  }
                }}
                label="役割を追加"
              >
                <MenuItem value="">
                  <em>選択してください</em>
                </MenuItem>
                {roles
                  .filter(role => !user.roles.includes(role.id))
                  .map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <Box mt={1}>
              {user.roles.map(roleId => {
                const role = roles.find(r => r.id === roleId);
                return (
                  <Chip 
                    key={roleId} 
                    label={role?.name || roleId}
                    onDelete={() => {
                      // 少なくとも1つの役割は残す
                      if (user.roles.length > 1) {
                        handleRemoveRole(user.id, roleId);
                      } else {
                        setSnackbar({
                          open: true,
                          message: 'ユーザーは少なくとも1つの役割が必要です',
                          severity: 'warning'
                        });
                      }
                    }}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ユーザー管理
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="user management tabs"
        >
          <Tab label="ユーザー一覧" />
          <Tab label="詳細情報" />
        </Tabs>
      </Box>
      
      {/* ユーザー一覧タブ */}
      {tabValue === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>ステータスフィルター</InputLabel>
              <Select
                value={statusFilter}
                label="ステータスフィルター"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">すべて</MenuItem>
                <MenuItem value={USER_STATUS.ACTIVE}>有効</MenuItem>
                <MenuItem value={USER_STATUS.INACTIVE}>無効</MenuItem>
                <MenuItem value={USER_STATUS.SUSPENDED}>停止中</MenuItem>
                <MenuItem value={USER_STATUS.PENDING}>保留中</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenNewUserDialog}
            >
              新規ユーザー作成
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ユーザー名</TableCell>
                  <TableCell>氏名</TableCell>
                  <TableCell>役職</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>役割</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredUsers().map((user) => (
                  <TableRow 
                    key={user.id}
                    selected={selectedUserId === user.id}
                    onClick={() => handleUserSelect(user.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.lastName} {user.firstName}</TableCell>
                    <TableCell>{user.position || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={(() => {
                          switch(user.status) {
                            case USER_STATUS.ACTIVE: return '有効';
                            case USER_STATUS.INACTIVE: return '無効';
                            case USER_STATUS.SUSPENDED: return '停止中';
                            case USER_STATUS.PENDING: return '保留中';
                            default: return user.status;
                          }
                        })()}
                        size="small"
                        color={(() => {
                          switch(user.status) {
                            case USER_STATUS.ACTIVE: return 'success';
                            case USER_STATUS.INACTIVE: return 'default';
                            case USER_STATUS.SUSPENDED: return 'error';
                            case USER_STATUS.PENDING: return 'warning';
                            default: return 'default';
                          }
                        })()}
                      />
                    </TableCell>
                    <TableCell>
                      {user.roles.map(roleId => {
                        const role = roles.find(r => r.id === roleId);
                        return (
                          <Chip 
                            key={roleId} 
                            label={role?.name || roleId} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditUserDialog(user.id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {getFilteredUsers().length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary">
                ユーザーが見つかりません
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      {/* ユーザー詳細タブ */}
      {tabValue === 1 && (
        <Box>
          {renderUserDetails()}
        </Box>
      )}
      
      {/* ユーザー削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>アカウント無効化の確認</DialogTitle>
        <DialogContent>
          <Typography>
            このユーザーアカウントを無効化してもよろしいですか？無効化されたアカウントはシステムにログインできなくなります。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            無効化
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 通知用スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* ユーザープロファイルダイアログ（別コンポーネント） */}
      <UserProfileDialog 
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onSave={handleSaveUserProfile}
        userId={selectedUserId}
      />
      
      {/* パスワードリセットダイアログ（別コンポーネント） */}
      <UserPasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSave={handleResetPassword}
        userId={selectedUserId}
      />
    </Box>
  );
};

export default UserManagement;
