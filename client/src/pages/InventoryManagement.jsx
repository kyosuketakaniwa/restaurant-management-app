import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Divider,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarningIcon from '@mui/icons-material/Warning';
import LinkIcon from '@mui/icons-material/Link';
import { mockData } from '../services/api';
import { inventoryService } from '../api';
import InventoryUsageHistoryDialog from '../components/InventoryUsageHistoryDialog';

const InventoryManagement = () => {
  // 状態管理
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [usageHistoryDialogOpen, setUsageHistoryDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderListOpen, setOrderListOpen] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    category_id: '',
    quantity: '',
    unit: '',
    min_quantity: '',
    cost_per_unit: '',
    supplier: '',
    location: '',
    note: '',
    related_recipes: [],
    related_menu_items: []
  });

  // データ取得
  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, [filterCategory, filterStatus, searchQuery]);

  // 在庫データの取得
  const fetchInventory = async () => {
    setLoading(true);
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await inventoryService.getAllInventoryItems();
      
      // モックデータを使用
      const mockInventory = mockData.inventory;
      setInventory(mockInventory);
    } catch (error) {
      showAlert('在庫データの取得に失敗しました', 'error');
    }
  };

  // カテゴリデータの取得
  const fetchCategories = async () => {
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await inventoryService.getAllCategories();
      
      // モックデータを使用
      const mockCategories = mockData.inventoryCategories;
      setCategories(mockCategories);
    } catch (error) {
      showAlert('カテゴリデータの取得に失敗しました', 'error');
    }
  };
  
  // 発注リストの取得
  const fetchOrderList = async () => {
    setLoading(true);
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await inventoryService.getOrderList();
      const data = inventory.filter(item => item.quantity <= item.min_quantity);
      setOrderList(data);
    } catch (error) {
      console.error('発注リストの取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 在庫使用履歴ダイアログを開く
  const handleUsageHistoryClick = (item) => {
    setSelectedItem(item);
    setUsageHistoryDialogOpen(true);
  };
  
  // 発注リストダイアログを開く
  const handleOrderListClick = () => {
    fetchOrderList();
    setOrderListOpen(true);
  };
  
  // 検索とフィルタリングのハンドラ
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // フォーム入力の処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // フォーム送信の処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        // 在庫アイテムを更新
        // await inventoryApi.updateInventoryItem(formData);
        
        // モック更新処理
        const updatedInventory = inventory.map(item => {
          if (item.id === formData.id) {
            const categoryObj = categories.find(cat => cat.id === parseInt(formData.category_id));
            return {
              ...formData,
              category_name: categoryObj ? categoryObj.name : '',
              quantity: parseFloat(formData.quantity),
              min_quantity: parseFloat(formData.min_quantity),
              cost_per_unit: parseFloat(formData.cost_per_unit),
              last_updated: new Date().toISOString()
            };
          }
          return item;
        });
        setInventory(updatedInventory);
        
        showAlert('在庫アイテムが正常に更新されました', 'success');
      } else {
        // 新しい在庫アイテムを追加
        // await inventoryApi.addInventoryItem(formData);
        
        // モック追加処理
        const categoryObj = categories.find(cat => cat.id === parseInt(formData.category_id));
        const newItem = {
          ...formData,
          id: Math.max(...inventory.map(item => item.id), 0) + 1,
          category_name: categoryObj ? categoryObj.name : '',
          quantity: parseFloat(formData.quantity),
          min_quantity: parseFloat(formData.min_quantity),
          cost_per_unit: parseFloat(formData.cost_per_unit),
          last_updated: new Date().toISOString()
        };
        setInventory([newItem, ...inventory]);
        
        showAlert('在庫アイテムが正常に追加されました', 'success');
      }
      
      // フォームをリセット
      resetForm();
    } catch (error) {
      showAlert(
        editMode 
          ? '在庫アイテムの更新に失敗しました' 
          : '在庫アイテムの追加に失敗しました', 
        'error'
      );
    }
  };

  // 編集モードを開始
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      category_id: item.category_id.toString(),
      quantity: item.quantity.toString(),
      unit: item.unit,
      min_quantity: item.min_quantity.toString(),
      cost_per_unit: item.cost_per_unit.toString(),
      supplier: item.supplier || '',
      location: item.location || '',
      note: item.note || ''
    });
    setEditMode(true);
    setFormOpen(true);
  };

  // 削除確認ダイアログを開く
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  // 削除処理の実行
  const handleDeleteConfirm = () => {
    // 実際のアプリでは、APIを呼び出して在庫アイテムを削除
    const updatedInventory = inventory.filter(item => item.id !== selectedItem.id);
    setInventory(updatedInventory);
    
    setAlert({
      open: true,
      message: '在庫アイテムが正常に削除されました',
      severity: 'success'
    });
    
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  // 在庫アイテムを削除
  const handleDelete = async () => {
    try {
      // await inventoryApi.deleteInventoryItem(selectedItem.id);
      
      // モック削除処理
      const filteredInventory = inventory.filter(item => item.id !== selectedItem.id);
      setInventory(filteredInventory);
      
      showAlert('在庫アイテムが正常に削除されました', 'success');
    } catch (error) {
      showAlert('在庫アイテムの削除に失敗しました', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  // フォームのリセット
  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      category_id: '',
      quantity: '',
      unit: '',
      min_quantity: '',
      cost_per_unit: '',
      supplier: '',
      location: '',
      note: ''
    });
    setEditMode(false);
    setFormOpen(false);
  };

  // アラートの表示
  const showAlert = (message, severity) => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  // アラートを閉じる
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // ページネーションの処理
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 在庫ステータスの色を取得
  const getStockStatusColor = (item) => {
    if (item.quantity <= item.min_quantity) {
      return 'error';
    }
    return 'success';
  };

  // カテゴリ名を取得
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '未分類';
  };

  // 在庫状況のテキストを取得
  const getStockStatusText = (item) => {
    if (item.quantity <= 0) {
      return '在庫切れ';
    } else if (item.quantity <= item.min_quantity) {
      return '要補充';
    } else {
      return '十分';
    }
  };

  return (
    <Container className="content-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          在庫管理
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<WarningIcon />}
            onClick={handleOrderListClick}
            sx={{ mr: 2 }}
          >
            発注リスト
            {inventory.filter(item => item.quantity <= item.min_quantity).length > 0 && (
              <Badge 
                badgeContent={inventory.filter(item => item.quantity <= item.min_quantity).length} 
                color="error" 
                sx={{ ml: 1 }}
              />
            )}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData({
                id: null,
                name: '',
                category_id: '',
                quantity: '',
                unit: '',
                min_quantity: '',
                cost_per_unit: '',
                supplier: '',
                location: '',
                note: ''
              });
              setEditMode(false);
              setFormOpen(true);
            }}
          >
            在庫を追加
          </Button>
        </Box>
      </Box>

      {/* 検索とフィルタリング */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="検索"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="名前、仕入先、保管場所で検索"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={filterCategory}
                label="カテゴリ"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="">すべて</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>在庫状況</InputLabel>
              <Select
                value={filterStatus}
                label="在庫状況"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="low">在庫不足</MenuItem>
                <MenuItem value="ok">在庫十分</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {formOpen && (
        <Paper className="form-container" sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {editMode ? '在庫アイテムを編集' : '在庫アイテムを追加'}
          </Typography>
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="アイテム名"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>カテゴリ</InputLabel>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="数量"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="単位"
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  fullWidth
                  required
                  placeholder="kg, 個, 本, etc."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="最小在庫数"
                  type="number"
                  name="min_quantity"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="単価"
                  type="number"
                  name="cost_per_unit"
                  value={formData.cost_per_unit}
                  onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="仕入先"
                  name="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="保管場所"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="備考"
                  name="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
            <Box className="form-actions">
              <Button 
                variant="outlined" 
                onClick={() => {
                  setFormData({
                    id: null,
                    name: '',
                    category_id: '',
                    quantity: '',
                    unit: '',
                    min_quantity: '',
                    cost_per_unit: '',
                    supplier: '',
                    location: '',
                    note: ''
                  });
                  setEditMode(false);
                  setFormOpen(false);
                }}
              >
                キャンセル
              </Button>
              <Button 
                variant="contained" 
                type="submit"
              >
                {editMode ? '更新する' : '追加する'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>アイテム名</TableCell>
              <TableCell>カテゴリ</TableCell>
              <TableCell align="right">数量</TableCell>
              <TableCell>単位</TableCell>
              <TableCell align="right">単価</TableCell>
              <TableCell>在庫状況</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory
              .filter(item => {
                if (searchQuery) {
                  return item.name.includes(searchQuery) || item.supplier.includes(searchQuery) || item.location.includes(searchQuery);
                }
                return true;
              })
              .filter(item => {
                if (filterCategory) {
                  return item.category_id === filterCategory;
                }
                return true;
              })
              .filter(item => {
                if (filterStatus === 'low') {
                  return item.quantity <= item.min_quantity;
                } else if (filterStatus === 'ok') {
                  return item.quantity > item.min_quantity;
                }
                return true;
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{getCategoryName(item.category_id)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell align="right">¥{item.cost_per_unit.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStockStatusText(item)} 
                      color={getStockStatusColor(item)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEdit(item)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="info"
                      onClick={() => handleUsageHistoryClick(item)}
                    >
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={inventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="表示件数:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}–${to} / ${count !== -1 ? count : `${to}以上`}`
          }
        />
      </TableContainer>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedItem?.name}を削除してもよろしいですか？
          </Typography>
          {selectedItem?.related_recipes?.length > 0 || selectedItem?.related_menu_items?.length > 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                この材料は以下のアイテムで使用されています：
              </Typography>
              {selectedItem?.related_recipes?.length > 0 && (
                <Typography variant="body2">
                  • {selectedItem.related_recipes.length}個のレシピ
                </Typography>
              )}
              {selectedItem?.related_menu_items?.length > 0 && (
                <Typography variant="body2">
                  • {selectedItem.related_menu_items.length}個のメニュー項目
                </Typography>
              )}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 発注リストダイアログ */}
      <Dialog
        open={orderListOpen}
        onClose={() => setOrderListOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>発注リスト</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : orderList.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                以下のアイテムは在庫が最小数量を下回っています。発注を検討してください。
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>名前</TableCell>
                      <TableCell>カテゴリ</TableCell>
                      <TableCell>現在の在庫</TableCell>
                      <TableCell>最小数量</TableCell>
                      <TableCell>不足量</TableCell>
                      <TableCell>単価</TableCell>
                      <TableCell>仕入先</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{getCategoryName(item.category_id)}</TableCell>
                        <TableCell>
                          <Typography color="error">
                            {item.quantity} {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.min_quantity} {item.unit}</TableCell>
                        <TableCell>
                          {(item.min_quantity - item.quantity).toFixed(2)} {item.unit}
                        </TableCell>
                        <TableCell>¥{item.cost_per_unit.toLocaleString()}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="body1">
                  合計発注金額: ¥{orderList.reduce((total, item) => {
                    return total + ((item.min_quantity - item.quantity) * item.cost_per_unit);
                  }, 0).toLocaleString()}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
              発注が必要なアイテムはありません
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderListOpen(false)}>閉じる</Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={orderList.length === 0}
          >
            発注書を作成
          </Button>
        </DialogActions>
      </Dialog>

      {/* 在庫使用履歴ダイアログ */}
      <InventoryUsageHistoryDialog
        open={usageHistoryDialogOpen}
        onClose={() => setUsageHistoryDialogOpen(false)}
        inventoryItem={selectedItem}
      />

      {/* アラート */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InventoryManagement;
