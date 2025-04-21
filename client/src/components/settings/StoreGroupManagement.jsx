import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, Card, CardContent, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Snackbar, Alert,
  Chip, Grid, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon
} from '@mui/icons-material';

import {
  getAllStoreGroups,
  saveStoreGroup,
  deleteStoreGroup,
  getAllStores
} from '../../utils/storeUtils';

/**
 * 店舗グループ管理コンポーネント
 */
const StoreGroupManagement = () => {
  // 状態管理
  const [storeGroups, setStoreGroups] = useState([]);
  const [stores, setStores] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 初期データのロード
  useEffect(() => {
    loadData();
  }, []);

  // データのロード
  const loadData = () => {
    const loadedGroups = getAllStoreGroups();
    const loadedStores = getAllStores();
    
    setStoreGroups(loadedGroups);
    setStores(loadedStores);
  };

  // 新規グループ作成ダイアログを開く
  const handleOpenNewDialog = () => {
    const defaultGroup = {
      id: `group-${Date.now()}`,
      name: '',
      description: '',
      storeIds: []
    };
    
    setEditingGroup(defaultGroup);
    setSelectedStoreIds([]);
    setIsNewGroup(true);
    setDialogOpen(true);
  };

  // グループ編集ダイアログを開く
  const handleOpenEditDialog = (group) => {
    setEditingGroup({...group});
    setSelectedStoreIds(group.storeIds || []);
    setIsNewGroup(false);
    setDialogOpen(true);
  };

  // グループ削除確認ダイアログを開く
  const handleOpenDeleteDialog = (group) => {
    setEditingGroup(group);
    setDeleteDialogOpen(true);
  };

  // フォーム入力の変更を処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingGroup(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 店舗選択の変更を処理
  const handleStoreSelectionChange = (event) => {
    const { value } = event.target;
    setSelectedStoreIds(value);
  };

  // グループの保存
  const handleSaveGroup = () => {
    // バリデーション
    if (!editingGroup.name) {
      setSnackbar({
        open: true,
        message: 'グループ名は必須項目です',
        severity: 'error'
      });
      return;
    }

    // 選択された店舗IDsを設定
    const updatedGroup = {
      ...editingGroup,
      storeIds: selectedStoreIds
    };

    const result = saveStoreGroup(updatedGroup);
    if (result.success) {
      setDialogOpen(false);
      loadData(); // データを再読み込み
      
      setSnackbar({
        open: true,
        message: isNewGroup ? '新しいグループが追加されました' : 'グループ情報が更新されました',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: `エラー: ${result.error || 'グループの保存に失敗しました'}`,
        severity: 'error'
      });
    }
  };

  // グループの削除
  const handleDeleteGroup = () => {
    const result = deleteStoreGroup(editingGroup.id);
    if (result.success) {
      setDeleteDialogOpen(false);
      loadData(); // データを再読み込み
      
      setSnackbar({
        open: true,
        message: 'グループが削除されました',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: `エラー: ${result.error || 'グループの削除に失敗しました'}`,
        severity: 'error'
      });
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // グループ内の店舗数を計算
  const getStoreCount = (storeIds) => {
    return storeIds ? storeIds.length : 0;
  };

  // グループ内の店舗名の一覧を取得
  const getStoreNames = (storeIds) => {
    if (!storeIds || storeIds.length === 0) return 'なし';
    
    return storeIds
      .map(id => {
        const store = stores.find(s => s.id === id);
        return store ? store.name : '';
      })
      .filter(name => name) // 空の名前を除外
      .join(', ');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          店舗グループ管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenNewDialog}
        >
          グループを追加
        </Button>
      </Box>

      {storeGroups.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography align="center" color="textSecondary">
              店舗グループが登録されていません。「グループを追加」ボタンから新しいグループを登録してください。
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>グループ名</TableCell>
                <TableCell>説明</TableCell>
                <TableCell>店舗数</TableCell>
                <TableCell>所属店舗</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {storeGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>{group.description}</TableCell>
                  <TableCell>{getStoreCount(group.storeIds)}</TableCell>
                  <TableCell>{getStoreNames(group.storeIds)}</TableCell>
                  <TableCell>
                    <Tooltip title="編集">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(group)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {group.id !== 'default' && (
                      <Tooltip title="削除">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(group)}
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

      {/* グループ編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isNewGroup ? 'グループを追加' : 'グループを編集'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="グループ名"
                name="name"
                value={editingGroup?.name || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                disabled={editingGroup?.id === 'default'}
              />
              <TextField
                label="説明"
                name="description"
                value={editingGroup?.description || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>所属店舗</InputLabel>
                <Select
                  multiple
                  value={selectedStoreIds}
                  onChange={handleStoreSelectionChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((storeId) => {
                        const store = stores.find(s => s.id === storeId);
                        return store ? (
                          <Chip key={storeId} label={store.name} />
                        ) : null;
                      })}
                    </Box>
                  )}
                  label="所属店舗"
                >
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      <Checkbox checked={selectedStoreIds.indexOf(store.id) > -1} />
                      <ListItemText primary={store.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveGroup} 
            color="primary" 
            variant="contained"
            disabled={editingGroup?.id === 'default' && editingGroup?.name === 'デフォルトグループ'}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* グループ削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>グループの削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{editingGroup?.name}」を削除してもよろしいですか？この操作は元に戻せません。
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            ※所属していた店舗は自動的にデフォルトグループに移動します。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteGroup} color="error" variant="contained">
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

export default StoreGroupManagement;
