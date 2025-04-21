import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Snackbar, Alert, Grid, Card, CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  Check as CheckIcon
} from '@mui/icons-material';

import {
  getAllStores,
  saveStore,
  deleteStore,
  getCurrentStoreId,
  setCurrentStore,
  getLocalStorageData,
  getAllStoreGroups
} from '../../utils/storeUtils';

/**
 * 店舗管理コンポーネント
 */
const StoreManagement = () => {
  // 状態管理
  const [stores, setStores] = useState([]);
  const [storeGroups, setStoreGroups] = useState([]);
  const [currentStoreId, setCurrentStoreId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [isNewStore, setIsNewStore] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 初期データのロード
  useEffect(() => {
    loadStoreData();
  }, []);

  // 店舗データのロード
  const loadStoreData = () => {
    const loadedStores = getAllStores();
    const loadedGroups = getAllStoreGroups();
    const storeId = getCurrentStoreId();
    
    setStores(loadedStores);
    setStoreGroups(loadedGroups);
    setCurrentStoreId(storeId);
  };

  // 新規店舗作成ダイアログを開く
  const handleOpenNewDialog = () => {
    const defaultStore = {
      id: `store-${Date.now()}`,
      name: '',
      address: '',
      phone: '',
      email: '',
      businessHours: '11:00-22:00',
      taxRate: 10,
      storeType: 'japanese',
      seatingCapacity: 50,
      isHeadquarters: false,
      groupId: 'default'
    };
    
    setEditingStore(defaultStore);
    setIsNewStore(true);
    setDialogOpen(true);
  };

  // 店舗編集ダイアログを開く
  const handleOpenEditDialog = (store) => {
    setEditingStore({...store});
    setIsNewStore(false);
    setDialogOpen(true);
  };

  // 店舗削除確認ダイアログを開く
  const handleOpenDeleteDialog = (store) => {
    setEditingStore(store);
    setDeleteDialogOpen(true);
  };

  // フォーム入力の変更を処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingStore(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 数値入力の変更を処理
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setEditingStore(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };

  // 店舗の保存
  const handleSaveStore = () => {
    // バリデーション
    if (!editingStore.name || !editingStore.address) {
      setSnackbar({
        open: true,
        message: '店舗名と住所は必須項目です',
        severity: 'error'
      });
      return;
    }

    const result = saveStore(editingStore);
    if (result.success) {
      setDialogOpen(false);
      
      // 新規店舗の場合、現在の店舗に設定することもできる
      if (isNewStore && stores.length === 0) {
        setCurrentStore(editingStore.id);
      }
      
      loadStoreData(); // データを再読み込み
      
      setSnackbar({
        open: true,
        message: isNewStore ? '新しい店舗が追加されました' : '店舗情報が更新されました',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: `エラー: ${result.error || '店舗の保存に失敗しました'}`,
        severity: 'error'
      });
    }
  };

  // 店舗の削除
  const handleDeleteStore = () => {
    const result = deleteStore(editingStore.id);
    if (result.success) {
      setDeleteDialogOpen(false);
      loadStoreData(); // データを再読み込み
      
      setSnackbar({
        open: true,
        message: '店舗が削除されました',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: `エラー: ${result.error || '店舗の削除に失敗しました'}`,
        severity: 'error'
      });
    }
  };

  // 現在の店舗を変更
  const handleSetCurrentStore = (storeId) => {
    const result = setCurrentStore(storeId);
    if (result.success) {
      setCurrentStoreId(storeId);
      
      setSnackbar({
        open: true,
        message: '現在の店舗が変更されました',
        severity: 'success'
      });
      
      // MainLayoutに変更を通知するためにstorageイベントを手動で発火
      window.dispatchEvent(new Event('storage'));
    } else {
      setSnackbar({
        open: true,
        message: `エラー: ${result.error || '店舗の変更に失敗しました'}`,
        severity: 'error'
      });
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // グループ名を取得
  const getGroupName = (groupId) => {
    const group = storeGroups.find(g => g.id === groupId);
    return group ? group.name : 'なし';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          店舗一覧
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenNewDialog}
        >
          店舗を追加
        </Button>
      </Box>

      {stores.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography align="center" color="textSecondary">
              店舗が登録されていません。「店舗を追加」ボタンから新しい店舗を登録してください。
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>店舗名</TableCell>
                <TableCell>住所</TableCell>
                <TableCell>グループ</TableCell>
                <TableCell>本店</TableCell>
                <TableCell>現在の店舗</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.address}</TableCell>
                  <TableCell>{getGroupName(store.groupId)}</TableCell>
                  <TableCell>{store.isHeadquarters ? 'はい' : 'いいえ'}</TableCell>
                  <TableCell>
                    {store.id === currentStoreId ? (
                      <CheckIcon color="primary" />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleSetCurrentStore(store.id)}
                        title="この店舗に切り替え"
                      >
                        <StoreIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="編集">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(store)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!store.isHeadquarters && stores.length > 1 && (
                      <Tooltip title="削除">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(store)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 店舗編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isNewStore ? '店舗を追加' : '店舗を編集'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="店舗名"
                name="name"
                value={editingStore?.name || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="住所"
                name="address"
                value={editingStore?.address || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="電話番号"
                name="phone"
                value={editingStore?.phone || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="メールアドレス"
                name="email"
                value={editingStore?.email || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="営業時間"
                name="businessHours"
                value={editingStore?.businessHours || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                placeholder="例: 11:00-22:00"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>店舗タイプ</InputLabel>
                <Select
                  name="storeType"
                  value={editingStore?.storeType || 'japanese'}
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
                value={editingStore?.seatingCapacity || 0}
                onChange={handleNumberInputChange}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                label="消費税率 (%)"
                name="taxRate"
                type="number"
                value={editingStore?.taxRate || 0}
                onChange={handleNumberInputChange}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>店舗グループ</InputLabel>
                <Select
                  name="groupId"
                  value={editingStore?.groupId || 'default'}
                  onChange={handleInputChange}
                  label="店舗グループ"
                >
                  {storeGroups.map(group => (
                    <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>本店区分</InputLabel>
                <Select
                  name="isHeadquarters"
                  value={editingStore?.isHeadquarters ? true : false}
                  onChange={(e) => {
                    const { value } = e.target;
                    setEditingStore(prev => ({
                      ...prev,
                      isHeadquarters: value
                    }));
                  }}
                  label="本店区分"
                >
                  <MenuItem value={true}>本店</MenuItem>
                  <MenuItem value={false}>支店</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSaveStore} color="primary" variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 店舗削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>店舗の削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{editingStore?.name}」を削除してもよろしいですか？この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteStore} color="error" variant="contained">
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

export default StoreManagement;
