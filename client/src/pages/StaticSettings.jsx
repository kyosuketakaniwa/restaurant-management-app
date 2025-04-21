import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Card, CardContent, Divider,
  Grid, List, ListItem, ListItemText, Tabs, Tab, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Store as StoreIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CompareArrows as CompareIcon,
  Storefront as StorefrontIcon,
  AccountTree as TreeIcon,
  MonetizationOn as MonetizationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// 店舗管理コンポーネント
import StoreManagement from '../components/settings/StoreManagement';
import StoreGroupManagement from '../components/settings/StoreGroupManagement';
import StoreComparison from '../components/settings/StoreComparison';
import TaxCurrencySettings from '../components/settings/TaxCurrencySettings';

// ユーザー管理と権限設定コンポーネント
import UserManagement from '../components/settings/UserManagement';
import RolePermissions from '../components/settings/RolePermissions';
import SystemLogs from '../components/settings/SystemLogs';

// 店舗データユーティリティ
import { 
  migrateToMultiStore, 
  getCurrentStore, 
  saveStore, 
  getLocalStorageData,
  setLocalStorageData
} from '../utils/storeUtils';

// ユーザー管理ユーティリティ
import { initializeUserData } from '../utils/userUtils';

// シンプルなタブパネル
function TabPanel(props) {
  const { children, value, index } = props;
  
  if (value !== index) return null;
  
  return (
    <Box sx={{ py: 3 }}>
      {children}
    </Box>
  );
}

const StaticSettings = () => {
  // デフォルトの店舗情報
  const defaultStoreInfo = {
    name: '和食レストラン 匠',
    address: '東京都中央区銀座1-1-1',
    phone: '03-1234-5678',
    email: 'info@washoku-takumi.jp',
    businessHours: '11:00-22:00',
    taxRate: 10,
    storeType: 'japanese',
    seatingCapacity: 50
  };
  
  // デフォルトのロール情報
  const defaultRoles = [
    { id: 'owner', name: 'オーナー', description: 'すべての機能にアクセス可能' },
    { id: 'manager', name: '店長', description: '日常業務のすべての管理が可能' },
    { id: 'staff', name: 'スタッフ', description: '基本的な日常業務のみ' }
  ];
  
  // ステート管理
  const [storeInfo, setStoreInfo] = useState(() => getLocalStorageData('storeInfo', defaultStoreInfo));
  const [roles, setRoles] = useState(() => getLocalStorageData('roles', defaultRoles));
  const [currentStore, setCurrentStore] = useState(null);
  const [multiStoreInitialized, setMultiStoreInitialized] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({...defaultStoreInfo});
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleEditData, setRoleEditData] = useState({ id: '', name: '', description: '' });
  const [isNewRole, setIsNewRole] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  
  // タブ管理用の状態
  const [tabValue, setTabValue] = useState(0);
  
  // 複数店舗機能の初期化とユーザーデータの初期化
  useEffect(() => {
    // 既存の単一店舗データを複数店舗形式に移行
    if (!multiStoreInitialized) {
      const result = migrateToMultiStore();
      if (result.success) {
        setMultiStoreInitialized(true);
        
        // 現在選択中の店舗情報を取得
        const store = getCurrentStore();
        if (store) {
          setCurrentStore(store);
          // 既存の単一店舗ビューにも反映
          setStoreInfo(store);
        }
        
        setSnackbar({
          open: true,
          message: '複数店舗管理機能が初期化されました',
          severity: 'info'
        });
      }
    }
    
    // ユーザー管理機能の初期化
    initializeUserData();
  }, [multiStoreInitialized]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 編集ダイアログを開く
  const handleOpenEditDialog = () => {
    setEditData({...storeInfo});
    setEditDialogOpen(true);
  };
  
  // 入力変更ハンドラー
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 変更を保存
  const handleSaveChanges = () => {
    const updatedStoreInfo = {...editData};
    setStoreInfo(updatedStoreInfo);
    
    // 単一店舗ビュー用のLocalStorage保存
    setLocalStorageData('storeInfo', updatedStoreInfo);
    
    // 現在選択中の店舗情報にも反映（複数店舗対応）
    if (currentStore) {
      const updatedStore = {
        ...currentStore,
        ...updatedStoreInfo
      };
      saveStore(updatedStore);
      setCurrentStore(updatedStore);
    }
    
    setEditDialogOpen(false);
    setSnackbar({
      open: true,
      message: '店舗情報が正常に保存されました',
      severity: 'success'
    });
    
    // MainLayoutに変更を通知
    window.dispatchEvent(new Event('storage'));
  };
  
  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ロール編集ダイアログを開く
  const handleOpenRoleDialog = (role = null) => {
    if (role) {
      setRoleEditData({...role});
      setIsNewRole(false);
    } else {
      // 新規ロール作成の場合
      setRoleEditData({ id: `role-${Date.now()}`, name: '', description: '' });
      setIsNewRole(true);
    }
    setRoleDialogOpen(true);
  };

  // ロール入力変更ハンドラー
  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ロール変更を保存
  const handleSaveRole = () => {
    let updatedRoles;
    if (isNewRole) {
      // 新規ロールを追加
      updatedRoles = [...roles, roleEditData];
      setRoles(updatedRoles);
      setSnackbar({
        open: true,
        message: '新しいロールが正常に追加されました',
        severity: 'success'
      });
    } else {
      // 既存ロールを更新
      updatedRoles = roles.map(role => role.id === roleEditData.id ? roleEditData : role);
      setRoles(updatedRoles);
      setSnackbar({
        open: true,
        message: 'ロールが正常に更新されました',
        severity: 'success'
      });
    }
    // LocalStorageに保存
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    setRoleDialogOpen(false);
  };

  // ロール削除確認ダイアログを開く
  const handleOpenDeleteConfirm = (roleId) => {
    setSelectedRoleId(roleId);
    setDeleteConfirmOpen(true);
  };

  // ロール削除の実行
  const handleDeleteRole = () => {
    const updatedRoles = roles.filter(role => role.id !== selectedRoleId);
    setRoles(updatedRoles);
    // LocalStorageに保存
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    setDeleteConfirmOpen(false);
    setSnackbar({
      open: true,
      message: 'ロールが正常に削除されました',
      severity: 'success'
    });
  };
  
  // 編集ダイアログのレンダリング
  // useEffectでデータの変更を監視してLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
  }, [storeInfo]);
  
  useEffect(() => {
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [roles]);
  
  const renderEditDialog = () => {
    return (
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>店舗情報を編集</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="店舗名"
                name="name"
                value={editData.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="住所"
                name="address"
                value={editData.address}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="電話番号"
                name="phone"
                value={editData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="メールアドレス"
                name="email"
                value={editData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="営業時間"
                name="businessHours"
                value={editData.businessHours}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                placeholder="例: 11:00-22:00"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>店舗タイプ</InputLabel>
                <Select
                  name="storeType"
                  value={editData.storeType}
                  onChange={handleInputChange}
                  label="店舗タイプ"
                >
                  <MenuItem value="japanese">和食</MenuItem>
                  <MenuItem value="western">洋食</MenuItem>
                  <MenuItem value="chinese">中華</MenuItem>
                  <MenuItem value="italian">イタリアン</MenuItem>
                  <MenuItem value="french">フレンチ</MenuItem>
                  <MenuItem value="cafe">カフェ</MenuItem>
                  <MenuItem value="other">その他</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="座席数"
                name="seatingCapacity"
                type="number"
                value={editData.seatingCapacity}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                label="消費税率 (%)"
                name="taxRate"
                type="number"
                value={editData.taxRate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
            キャンセル
          </Button>
          <Button onClick={handleSaveChanges} color="primary" variant="contained" startIcon={<SaveIcon />}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <SettingsIcon sx={{ mr: 2, fontSize: 30, color: 'primary.main' }} />
            <Typography variant="h4">システム設定</Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            店舗情報や権限設定などを管理できます。
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="settings tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<StoreIcon />} label="店舗情報" iconPosition="start" />
              <Tab icon={<StorefrontIcon />} label="店舗管理" iconPosition="start" />
              <Tab icon={<TreeIcon />} label="店舗グループ" iconPosition="start" />
              <Tab icon={<CompareIcon />} label="店舗比較" iconPosition="start" />
              <Tab icon={<MonetizationIcon />} label="税率/通貨設定" iconPosition="start" />
              <Tab icon={<PersonIcon />} label="ユーザー管理" iconPosition="start" />
              <Tab icon={<AdminIcon />} label="役割と権限" iconPosition="start" />
              <Tab icon={<HistoryIcon />} label="ログと監査" iconPosition="start" />
              <Tab icon={<SecurityIcon />} label="権限管理" iconPosition="start" />
              <Tab icon={<SettingsIcon />} label="その他設定" iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* 店舗情報タブ */}
          <TabPanel value={tabValue} index={0}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    店舗情報
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleOpenEditDialog}
                  >
                    編集
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">基本情報</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="店舗名" secondary={storeInfo.name} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="住所" secondary={storeInfo.address} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="電話番号" secondary={storeInfo.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="メール" secondary={storeInfo.email} />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">営業情報</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="営業時間" secondary={storeInfo.businessHours} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="店舗タイプ" 
                          secondary={storeInfo.storeType === 'japanese' ? '和食' : storeInfo.storeType} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="座席数" secondary={`${storeInfo.seatingCapacity}席`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="消費税率" secondary={`${storeInfo.taxRate}%`} />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
          
          {/* 店舗管理タブ */}
          <TabPanel value={tabValue} index={1}>
            <StoreManagement />
          </TabPanel>
          
          {/* 店舗グループ管理タブ */}
          <TabPanel value={tabValue} index={2}>
            <StoreGroupManagement />
          </TabPanel>
          
          {/* 店舗比較タブ */}
          <TabPanel value={tabValue} index={3}>
            <StoreComparison />
          </TabPanel>
          
          {/* 税率/通貨設定タブ */}
          <TabPanel value={tabValue} index={4}>
            <TaxCurrencySettings />
          </TabPanel>
          
          {/* ユーザー管理 */}
          <TabPanel value={tabValue} index={5}>
            <UserManagement />
          </TabPanel>
          
          {/* 役割と権限 */}
          <TabPanel value={tabValue} index={6}>
            <RolePermissions />
          </TabPanel>
          
          {/* ログと監査 */}
          <TabPanel value={tabValue} index={7}>
            <SystemLogs />
          </TabPanel>
          
          {/* 権限管理 (レガシー) */}
          <TabPanel value={tabValue} index={8}>
            <Typography variant="h6" gutterBottom>
              権限管理 (レガシー)
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                この画面は旧バージョンの権限管理画面です。新しい役割と権限管理機能をご利用ください。
              </Alert>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        ロール（役割）管理
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenRoleDialog()}
                          sx={{ mb: 2 }}
                        >
                          新規ロール作成
                        </Button>
                      </Box>
                      
                      <List>
                        {roles.map((role) => (
                          <Box key={role.id} sx={{ mb: 2 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={5}>
                                  <Typography variant="subtitle1">
                                    {role.name}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                  <Typography variant="body2" color="textSecondary">
                                    {role.description}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                  <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => handleOpenRoleDialog(role)}
                                    sx={{ mr: 1 }}
                                  >
                                    編集
                                  </Button>
                                  {/* デフォルトロールは削除不可 */}
                                  {!['owner', 'manager', 'staff'].includes(role.id) && (
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={() => handleOpenDeleteConfirm(role.id)}
                                    >
                                      削除
                                    </Button>
                                  )}
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        権限設定
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Alert severity="info" sx={{ mb: 2 }}>
                        役割ごとに、アクセス可能な機能を設定します。
                      </Alert>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1">
                          この機能は現在開発中です。
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
          
          {/* その他設定 */}
          <TabPanel value={tabValue} index={9}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    店舗情報
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">基本情報</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="店舗名" secondary={storeInfo.name} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="住所" secondary={storeInfo.address} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="電話番号" secondary={storeInfo.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="メール" secondary={storeInfo.email} />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">営業情報</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="営業時間" secondary={storeInfo.businessHours} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="店舗タイプ" 
                          secondary={storeInfo.storeType === 'japanese' ? '和食' : storeInfo.storeType} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="座席数" secondary={`${storeInfo.seatingCapacity}席`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="消費税率" secondary={`${storeInfo.taxRate}%`} />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        </Paper>
      </Container>
      
      {/* 店舗情報編集ダイアログ */}
      {renderEditDialog()}
      
      {/* ロール編集ダイアログ */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isNewRole ? 'ロールを追加' : 'ロールを編集'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="ロール名"
            name="name"
            value={roleEditData.name}
            onChange={handleRoleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="説明"
            name="description"
            value={roleEditData.description}
            onChange={handleRoleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)} startIcon={<CancelIcon />}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveRole} 
            color="primary" 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!roleEditData.name}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ロール削除確認ダイアログ */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>ロールの削除</DialogTitle>
        <DialogContent>
          <Typography>このロールを削除してもよろしいですか？この操作は元に戻せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
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
    </>
  );
};

export default StaticSettings;
