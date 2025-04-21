import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Divider,
  Snackbar, Alert, CircularProgress, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormGroup, FormControlLabel, Checkbox, Chip, Card,
  CardContent, Tab, Tabs, TableContainer, Table, TableHead,
  TableBody, TableRow, TableCell
} from '@mui/material';
import { useRole, PERMISSIONS, SECTIONS } from '../../contexts/RoleContext';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const RoleManagement = () => {
  const {
    roles, currentRole, loading, error, resetError,
    createRole, updateRole, deleteRole, hasPermission,
    PERMISSIONS, SECTIONS
  } = useRole();

  // 状態
  const [selectedRole, setSelectedRole] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: {}
  });
  const [isNewRole, setIsNewRole] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [tabValue, setTabValue] = useState(0);

  // 編集権限チェック
  const canEdit = hasPermission(SECTIONS.STAFF, PERMISSIONS.ADMIN);

  // 役割の選択
  const handleSelectRole = (role) => {
    setSelectedRole(role);
  };

  // 新しい役割作成ダイアログを開く
  const handleOpenNewRoleDialog = () => {
    setIsNewRole(true);
    setRoleId('');
    setRoleFormData({
      name: '',
      description: '',
      permissions: {}
    });
    setEditDialogOpen(true);
  };

  // 役割編集ダイアログを開く
  const handleOpenEditRoleDialog = (roleKey) => {
    setIsNewRole(false);
    setRoleId(roleKey);
    setRoleFormData({
      ...roles[roleKey],
      permissions: { ...roles[roleKey].permissions }
    });
    setEditDialogOpen(true);
  };

  // 役割削除ダイアログを開く
  const handleOpenDeleteDialog = (roleKey) => {
    setRoleId(roleKey);
    setDeleteDialogOpen(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
  };

  // フォーム入力変更ハンドラー
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRoleFormData({
      ...roleFormData,
      [name]: value
    });
  };

  // 役割IDの入力変更ハンドラー
  const handleRoleIdChange = (e) => {
    setRoleId(e.target.value.toLowerCase().replace(/\s+/g, '_'));
  };

  // 権限変更ハンドラー
  const handlePermissionChange = (section, permission) => {
    setRoleFormData(prev => {
      const currentPermissions = prev.permissions[section] || [];
      const updatedPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [section]: updatedPermissions
        }
      };
    });
  };

  // 役割の保存
  const handleSaveRole = () => {
    // 必須フィールドのバリデーション
    if (!roleFormData.name) {
      setSnackbar({
        open: true,
        message: '役割名を入力してください',
        severity: 'error'
      });
      return;
    }

    if (isNewRole && !roleId) {
      setSnackbar({
        open: true,
        message: '役割IDを入力してください',
        severity: 'error'
      });
      return;
    }

    try {
      if (isNewRole) {
        // 新しい役割を作成
        const success = createRole(roleId, roleFormData);
        if (success) {
          setSnackbar({
            open: true,
            message: `役割 "${roleFormData.name}" が正常に作成されました`,
            severity: 'success'
          });
          setEditDialogOpen(false);
        }
      } else {
        // 既存の役割を更新
        const success = updateRole(roleId, roleFormData);
        if (success) {
          setSnackbar({
            open: true,
            message: `役割 "${roleFormData.name}" が正常に更新されました`,
            severity: 'success'
          });
          setEditDialogOpen(false);
        }
      }
    } catch (err) {
      console.error('役割の保存中にエラーが発生しました:', err);
      setSnackbar({
        open: true,
        message: '役割の保存中にエラーが発生しました',
        severity: 'error'
      });
    }
  };

  // 役割の削除
  const handleDeleteRole = () => {
    try {
      const success = deleteRole(roleId);
      if (success) {
        setSnackbar({
          open: true,
          message: `役割が正常に削除されました`,
          severity: 'success'
        });
        setDeleteDialogOpen(false);
        setSelectedRole(null);
      }
    } catch (err) {
      console.error('役割の削除中にエラーが発生しました:', err);
      setSnackbar({
        open: true,
        message: '役割の削除中にエラーが発生しました',
        severity: 'error'
      });
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 権限を持っているかチェック
  const checkPermission = (roleData, section, permission) => {
    return roleData?.permissions?.[section]?.includes(permission) || false;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" display="flex" alignItems="center">
          <SecurityIcon sx={{ mr: 1 }} />
          役割と権限管理
        </Typography>

        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenNewRoleDialog}
          >
            新しい役割
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3 }}>
          この情報は表示のみ可能です。編集には管理者権限が必要です。
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 役割リスト */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                役割一覧
              </Typography>
              <List>
                {Object.entries(roles).map(([key, role]) => (
                  <ListItem
                    key={key}
                    button
                    selected={selectedRole === key}
                    onClick={() => handleSelectRole(key)}
                  >
                    <ListItemText
                      primary={role.name}
                      secondary={role.description}
                    />
                    {key === currentRole && (
                      <Chip size="small" label="現在の役割" color="primary" sx={{ mr: 1 }} />
                    )}
                    {canEdit && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenEditRoleDialog(key)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        {/* デフォルト役割は削除不可 */}
                        {!['owner', 'manager', 'kitchen_manager', 'floor_manager', 'staff'].includes(key) && (
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleOpenDeleteDialog(key)}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 役割詳細 */}
        <Grid item xs={12} md={8}>
          {selectedRole ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {roles[selectedRole].name}の詳細
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {roles[selectedRole].description}
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="role detail tabs">
                    <Tab label="権限一覧" id="permissions-tab" />
                    <Tab label="権限マトリックス" id="matrix-tab" />
                  </Tabs>
                </Box>

                {/* 権限リスト表示 */}
                {tabValue === 0 && (
                  <List>
                    {Object.entries(SECTIONS).map(([sectionKey, sectionValue]) => (
                      <React.Fragment key={sectionKey}>
                        <ListItem>
                          <ListItemText
                            primary={getSectionName(sectionValue)}
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                {roles[selectedRole].permissions[sectionValue]?.map(permission => (
                                  <Chip
                                    key={permission}
                                    label={getPermissionName(permission)}
                                    size="small"
                                    sx={{ mr: 1, mb: 1 }}
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                                {(!roles[selectedRole].permissions[sectionValue] ||
                                  roles[selectedRole].permissions[sectionValue].length === 0) && (
                                  <Typography variant="body2" color="textSecondary">
                                    権限なし
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}

                {/* 権限マトリックス表示 */}
                {tabValue === 1 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>セクション / 権限</TableCell>
                          {Object.values(PERMISSIONS).map(permission => (
                            <TableCell key={permission} align="center">
                              {getPermissionName(permission)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(SECTIONS).map(([sectionKey, sectionValue]) => (
                          <TableRow key={sectionKey}>
                            <TableCell component="th" scope="row">
                              {getSectionName(sectionValue)}
                            </TableCell>
                            {Object.values(PERMISSIONS).map(permission => (
                              <TableCell key={permission} align="center">
                                {checkPermission(roles[selectedRole], sectionValue, permission) ? (
                                  <CheckIcon color="success" fontSize="small" />
                                ) : (
                                  <CloseIcon color="action" fontSize="small" />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <Typography variant="body1" color="textSecondary">
                    左側のリストから役割を選択してください
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 役割編集/作成ダイアログ */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isNewRole ? '新しい役割を作成' : `役割を編集: ${roleFormData.name}`}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* 基本情報フォーム */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                基本情報
              </Typography>
              {isNewRole && (
                <TextField
                  label="役割ID"
                  name="roleId"
                  value={roleId}
                  onChange={handleRoleIdChange}
                  fullWidth
                  margin="normal"
                  required
                  helperText="英数字とアンダースコアのみ使用可能"
                />
              )}
              <TextField
                label="役割名"
                name="name"
                value={roleFormData.name}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="説明"
                name="description"
                value={roleFormData.description}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>

            {/* 権限設定 */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                権限設定
              </Typography>
              {Object.entries(SECTIONS).map(([sectionKey, sectionValue]) => (
                <Box key={sectionKey} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {getSectionName(sectionValue)}
                  </Typography>
                  <FormGroup row>
                    {Object.entries(PERMISSIONS).map(([permKey, permValue]) => (
                      <FormControlLabel
                        key={permKey}
                        control={
                          <Checkbox
                            checked={checkPermission(roleFormData, sectionValue, permValue)}
                            onChange={() => handlePermissionChange(sectionValue, permValue)}
                          />
                        }
                        label={getPermissionName(permValue)}
                      />
                    ))}
                  </FormGroup>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            キャンセル
          </Button>
          <Button
            onClick={handleSaveRole}
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 役割削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>役割を削除</DialogTitle>
        <DialogContent>
          <Typography>
            {`役割「${roles[roleId]?.name || ''}」を削除してもよろしいですか？`}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteRole}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* エラー通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* API/コンテキストエラー通知 */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={resetError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={resetError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
};

// セクション名を取得
const getSectionName = (section) => {
  const sectionNames = {
    [SECTIONS.SETTINGS]: '設定',
    [SECTIONS.STAFF]: 'スタッフ管理',
    [SECTIONS.INVENTORY]: '在庫管理',
    [SECTIONS.SALES]: '売上管理',
    [SECTIONS.MENU]: 'メニュー管理',
    [SECTIONS.FINANCE]: '財務管理',
    [SECTIONS.REPORTS]: 'レポート',
    [SECTIONS.MARKETING]: 'マーケティング',
    [SECTIONS.MANUALS]: 'マニュアル'
  };
  return sectionNames[section] || section;
};

// 権限名を取得
const getPermissionName = (permission) => {
  const permissionNames = {
    [PERMISSIONS.VIEW]: '閲覧',
    [PERMISSIONS.EDIT]: '編集',
    [PERMISSIONS.CREATE]: '作成',
    [PERMISSIONS.DELETE]: '削除',
    [PERMISSIONS.APPROVE]: '承認',
    [PERMISSIONS.ADMIN]: '管理者'
  };
  return permissionNames[permission] || permission;
};

export default RoleManagement;
