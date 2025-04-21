import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, FormControlLabel, Switch, Divider, Alert, Snackbar,
  Card, CardContent, Chip, Tooltip, Tab, Tabs, Collapse, List, ListItem,
  ListItemText, ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  LockOpen as LockOpenIcon,
  Check as CheckIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import {
  getRoles,
  saveRolePermissions,
  getRolePermissions,
  updateRolePermissions,
  PERMISSION_GROUPS,
  initializeUserData
} from '../../utils/userUtils';

/**
 * 役割（ロール）と権限設定コンポーネント
 */
const RolePermissions = () => {
  // 状態管理
  const [roles, setRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ id: '', name: '', description: '' });
  const [expandedGroups, setExpandedGroups] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [tabValue, setTabValue] = useState(0);

  // 初期化
  useEffect(() => {
    // ユーザーデータが初期化されていることを確認
    initializeUserData();
    
    // データのロード
    loadData();
  }, []);

  // データのロード
  const loadData = () => {
    const loadedRoles = getRoles();
    const loadedPermissions = getRolePermissions();
    
    setRoles(loadedRoles);
    setRolePermissions(loadedPermissions);
    
    // デフォルトで最初のロールを選択
    if (loadedRoles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(loadedRoles[0].id);
      setEditingPermissions(loadedPermissions[loadedRoles[0].id] || []);
    }
    
    // すべてのグループを閉じた状態にする
    const groups = {};
    PERMISSION_GROUPS.forEach(group => {
      groups[group.id] = false;
    });
    setExpandedGroups(groups);
  };

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ロール選択の変更ハンドラー
  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    setEditingPermissions(rolePermissions[roleId] || []);
  };

  // 権限の編集ダイアログを開く
  const handleOpenPermissionDialog = () => {
    setEditingPermissions(rolePermissions[selectedRoleId] || []);
    setDialogOpen(true);
  };

  // グループの展開状態を切り替える
  const toggleGroupExpand = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // 権限の選択状態を切り替える
  const togglePermission = (permissionId) => {
    setEditingPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // グループ内のすべての権限を選択/解除
  const toggleGroupPermissions = (groupId, permissions) => {
    const groupPermissionIds = permissions.map(p => p.id);
    const allSelected = groupPermissionIds.every(id => editingPermissions.includes(id));
    
    if (allSelected) {
      // すべて解除
      setEditingPermissions(prev => 
        prev.filter(id => !groupPermissionIds.includes(id))
      );
    } else {
      // すべて選択
      setEditingPermissions(prev => {
        const newPermissions = [...prev];
        groupPermissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  // 権限を保存
  const handleSavePermissions = () => {
    updateRolePermissions(selectedRoleId, editingPermissions);
    
    // 状態を更新
    setRolePermissions(prev => ({
      ...prev,
      [selectedRoleId]: editingPermissions
    }));
    
    setDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: '権限設定が保存されました',
      severity: 'success'
    });
  };

  // 新規ロールダイアログを開く
  const handleOpenNewRoleDialog = () => {
    setNewRoleData({
      id: `role-${Date.now()}`,
      name: '',
      description: ''
    });
    setRoleDialogOpen(true);
  };

  // ロール削除ダイアログを開く
  const handleOpenDeleteRoleDialog = (roleId) => {
    setSelectedRoleId(roleId);
    setDeleteDialogOpen(true);
  };

  // 新規ロール入力ハンドラー
  const handleNewRoleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 新規ロールを保存
  const handleSaveNewRole = () => {
    // バリデーション
    if (!newRoleData.name) {
      setSnackbar({
        open: true,
        message: 'ロール名は必須です',
        severity: 'error'
      });
      return;
    }
    
    // IDがカスタマイズされていない場合は自動生成
    if (!newRoleData.id || newRoleData.id.trim() === '') {
      newRoleData.id = `role-${Date.now()}`;
    }
    
    // 既存のロールに追加
    const updatedRoles = [...roles, newRoleData];
    
    // ロールに空の権限リストを追加
    const updatedPermissions = {
      ...rolePermissions,
      [newRoleData.id]: []
    };
    
    // LocalStorageに保存
    const savedRoles = localStorage.getItem('roles');
    const parsedRoles = savedRoles ? JSON.parse(savedRoles) : [];
    parsedRoles.push(newRoleData);
    localStorage.setItem('roles', JSON.stringify(parsedRoles));
    
    // 状態を更新
    setRoles(updatedRoles);
    setRolePermissions(updatedPermissions);
    setSelectedRoleId(newRoleData.id);
    setEditingPermissions([]);
    
    setRoleDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: `新しいロール「${newRoleData.name}」が作成されました`,
      severity: 'success'
    });
  };

  // ロールを削除
  const handleDeleteRole = () => {
    // プリセットロールは削除できないようにする
    if (['owner', 'manager', 'staff'].includes(selectedRoleId)) {
      setSnackbar({
        open: true,
        message: '標準ロールは削除できません',
        severity: 'error'
      });
      setDeleteDialogOpen(false);
      return;
    }
    
    // ロールリストから削除
    const updatedRoles = roles.filter(role => role.id !== selectedRoleId);
    
    // 権限マッピングから削除
    const updatedPermissions = { ...rolePermissions };
    delete updatedPermissions[selectedRoleId];
    
    // LocalStorageに保存
    const savedRoles = localStorage.getItem('roles');
    const parsedRoles = savedRoles ? JSON.parse(savedRoles) : [];
    const filteredRoles = parsedRoles.filter(role => role.id !== selectedRoleId);
    localStorage.setItem('roles', JSON.stringify(filteredRoles));
    
    // 状態を更新
    setRoles(updatedRoles);
    setRolePermissions(updatedPermissions);
    
    // 別のロールを選択
    if (updatedRoles.length > 0) {
      setSelectedRoleId(updatedRoles[0].id);
      setEditingPermissions(updatedPermissions[updatedRoles[0].id] || []);
    } else {
      setSelectedRoleId(null);
      setEditingPermissions([]);
    }
    
    setDeleteDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: 'ロールが削除されました',
      severity: 'success'
    });
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // 選択されたロールを取得
  const getSelectedRole = () => {
    return roles.find(role => role.id === selectedRoleId) || null;
  };

  // ロールが持っている権限の数を計算
  const getPermissionCount = (roleId) => {
    return (rolePermissions[roleId] || []).length;
  };

  // すべての権限の数を計算
  const getTotalPermissionCount = () => {
    return PERMISSION_GROUPS.reduce((total, group) => {
      return total + group.permissions.length;
    }, 0);
  };

  // グループ内のすべての権限が選択されているかチェック
  const isGroupFullySelected = (groupPermissions) => {
    const permissionIds = groupPermissions.map(p => p.id);
    return permissionIds.every(id => editingPermissions.includes(id));
  };

  // グループ内の一部の権限が選択されているかチェック
  const isGroupPartiallySelected = (groupPermissions) => {
    const permissionIds = groupPermissions.map(p => p.id);
    return permissionIds.some(id => editingPermissions.includes(id)) && 
           !permissionIds.every(id => editingPermissions.includes(id));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        権限と役割の管理
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="role management tabs"
        >
          <Tab label="役割管理" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="詳細な権限設定" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* 役割管理タブ */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                役割(ロール)一覧
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewRoleDialog}
              >
                新規役割を作成
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>役割名</TableCell>
                    <TableCell>説明</TableCell>
                    <TableCell>権限数</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow 
                      key={role.id}
                      selected={selectedRoleId === role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {role.name}
                        {['owner', 'manager', 'staff'].includes(role.id) && (
                          <Chip 
                            size="small" 
                            label="標準" 
                            variant="outlined" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        {getPermissionCount(role.id)} / {getTotalPermissionCount()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<SecurityIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleSelect(role.id);
                            handleOpenPermissionDialog();
                          }}
                          sx={{ mr: 1 }}
                        >
                          権限設定
                        </Button>
                        
                        {/* 標準ロールは削除不可 */}
                        {!['owner', 'manager', 'staff'].includes(role.id) && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteRoleDialog(role.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {roles.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  役割が登録されていません
                </Typography>
              </Box>
            )}
          </Grid>
          
          {/* 選択された役割の詳細 */}
          {selectedRoleId && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      {getSelectedRole()?.name} の詳細
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      onClick={handleOpenPermissionDialog}
                    >
                      権限を編集
                    </Button>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" paragraph>
                    {getSelectedRole()?.description || '説明なし'}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    付与されている権限:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {(rolePermissions[selectedRoleId] || []).length > 0 ? (
                      PERMISSION_GROUPS.map(group => {
                        const groupPerms = group.permissions.filter(
                          p => rolePermissions[selectedRoleId]?.includes(p.id)
                        );
                        
                        if (groupPerms.length === 0) return null;
                        
                        return (
                          <Box key={group.id} sx={{ mb: 2, width: '100%' }}>
                            <Typography variant="subtitle2" color="primary">
                              {group.name}:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 2 }}>
                              {groupPerms.map(perm => (
                                <Chip 
                                  key={perm.id} 
                                  label={perm.name} 
                                  size="small"
                                  icon={<LockOpenIcon fontSize="small" />}
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography color="textSecondary">
                        権限が設定されていません
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* 詳細な権限設定タブ */}
      {tabValue === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            このページでは、アプリケーションの権限グループと個別の権限を確認できます。特定の役割に権限を割り当てるには、役割管理タブから行ってください。
          </Alert>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              権限グループと権限一覧
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {PERMISSION_GROUPS.map((group) => (
                <React.Fragment key={group.id}>
                  <ListItem 
                    button 
                    onClick={() => toggleGroupExpand(group.id)}
                    sx={{ bgcolor: 'background.default', mb: 1 }}
                  >
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={group.name} 
                      secondary={`${group.permissions.length}個の権限`} 
                    />
                  </ListItem>
                  
                  <Collapse in={expandedGroups[group.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {group.permissions.map((permission) => (
                        <ListItem key={permission.id} sx={{ pl: 4 }}>
                          <ListItemIcon>
                            <LockOpenIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={permission.name} 
                            secondary={permission.description} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}
      
      {/* 権限編集ダイアログ */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          「{getSelectedRole()?.name}」の権限を編集
        </DialogTitle>
        <DialogContent dividers>
          {PERMISSION_GROUPS.map((group) => (
            <Box key={group.id} sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isGroupFullySelected(group.permissions)}
                    indeterminate={isGroupPartiallySelected(group.permissions)}
                    onChange={() => toggleGroupPermissions(group.id, group.permissions)}
                  />
                }
                label={
                  <Typography variant="subtitle1" fontWeight="bold">
                    {group.name}
                  </Typography>
                }
              />
              
              <Box sx={{ pl: 4 }}>
                <Grid container spacing={1}>
                  {group.permissions.map((permission) => (
                    <Grid item xs={12} sm={6} md={4} key={permission.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editingPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            size="small"
                          />
                        }
                        label={
                          <Tooltip title={permission.description} arrow>
                            <Typography variant="body2">
                              {permission.name}
                            </Typography>
                          </Tooltip>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSavePermissions} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 新規役割作成ダイアログ */}
      <Dialog 
        open={roleDialogOpen} 
        onClose={() => setRoleDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          新規役割を作成
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="役割名"
            name="name"
            value={newRoleData.name}
            onChange={handleNewRoleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="説明"
            name="description"
            value={newRoleData.description}
            onChange={handleNewRoleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveNewRole} 
            color="primary" 
            variant="contained"
            disabled={!newRoleData.name}
          >
            作成
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 役割削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>役割の削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{roles.find(r => r.id === selectedRoleId)?.name}」を削除してもよろしいですか？この操作は元に戻せません。
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            この役割が割り当てられているユーザーはその権限を失います。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteRole} color="error" variant="contained">
            削除
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
    </Box>
  );
};

export default RolePermissions;
