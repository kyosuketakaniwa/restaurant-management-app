import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Button, Divider, Grid, TextField,
  Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Paper, Chip, TableContainer, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  RestaurantMenu as FoodIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';

import {
  saveOrder,
  ORDER_STATUS,
  recalculateOrderTotals,
  generateOrderNumber
} from '../../utils/orderUtils';

// モックメニューデータ
const MOCK_MENU_ITEMS = [
  { id: 'menu-1', name: '醤油ラーメン', price: 850, category: 'ラーメン' },
  { id: 'menu-2', name: '味噌ラーメン', price: 900, category: 'ラーメン' },
  { id: 'menu-3', name: '塩ラーメン', price: 850, category: 'ラーメン' },
  { id: 'menu-4', name: '豚骨ラーメン', price: 950, category: 'ラーメン' },
  { id: 'menu-5', name: '餃子', price: 450, category: 'サイドメニュー' },
  { id: 'menu-6', name: 'ライス', price: 200, category: 'サイドメニュー' },
  { id: 'menu-7', name: 'チャーシュー丼', price: 500, category: 'サイドメニュー' },
  { id: 'menu-8', name: 'ビール', price: 550, category: '飲み物' },
  { id: 'menu-9', name: 'ソフトドリンク', price: 250, category: '飲み物' }
];

// モックテーブルデータ
const MOCK_TABLES = [
  { id: 'table-1', name: 'テーブル1' },
  { id: 'table-2', name: 'テーブル2' },
  { id: 'table-3', name: 'テーブル3' },
  { id: 'table-4', name: 'テーブル4' },
  { id: 'table-5', name: 'テーブル5' }
];

// ラーメンのオプション
const RAMEN_OPTIONS = [
  '麺固め', '麺柔らかめ', '味濃いめ', '味薄め', 'チャーシュー増し', '海苔増し', '玉ねぎ増し', 'ニンニク増し'
];

/**
 * 新規注文作成コンポーネント
 * @param {Object} props
 * @param {boolean} props.open ダイアログの表示状態
 * @param {Function} props.onClose ダイアログを閉じる際のコールバック
 */
const OrderCreate = ({ open, onClose }) => {
  // 初期注文データ
  const initialOrderData = {
    customerName: '店内客',
    tableId: '',
    status: ORDER_STATUS.NEW,
    items: [],
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    paymentMethod: null,
    paid: false,
    notes: ''
  };

  // 状態管理
  const [orderData, setOrderData] = useState(initialOrderData);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [filteredMenuItems, setFilteredMenuItems] = useState(MOCK_MENU_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemNotes, setItemNotes] = useState('');
  const [error, setError] = useState('');

  // カテゴリーリスト
  const categories = ['すべて', ...new Set(MOCK_MENU_ITEMS.map(item => item.category))];

  // カテゴリーでメニューをフィルタリング
  useEffect(() => {
    if (selectedCategory === 'すべて') {
      setFilteredMenuItems(MOCK_MENU_ITEMS);
    } else {
      setFilteredMenuItems(MOCK_MENU_ITEMS.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory]);

  // 商品選択変更時
  useEffect(() => {
    if (selectedItemId) {
      const item = MOCK_MENU_ITEMS.find(item => item.id === selectedItemId);
      setSelectedItem(item);
      setItemQuantity(1);
      setItemOptions([]);
      setItemNotes('');
    } else {
      setSelectedItem(null);
    }
  }, [selectedItemId]);

  // 基本情報入力変更ハンドラー
  const handleOrderDataChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // カテゴリー変更ハンドラー
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // 商品選択変更ハンドラー
  const handleItemSelect = (itemId) => {
    setSelectedItemId(itemId);
  };

  // 数量変更ハンドラー
  const handleQuantityChange = (value) => {
    setItemQuantity(Math.max(1, value));
  };

  // オプション切り替えハンドラー
  const handleOptionToggle = (option) => {
    setItemOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  // 注文アイテム追加ハンドラー
  const handleAddItemToOrder = () => {
    if (!selectedItem) {
      setError('商品を選択してください');
      return;
    }

    // 新しいアイテムを作成
    const newItem = {
      id: `item-${Date.now()}`,
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: itemQuantity,
      options: itemOptions,
      notes: itemNotes,
      status: ORDER_STATUS.NEW
    };

    // 注文アイテムリストに追加
    setOrderData(prev => {
      const updatedOrder = {
        ...prev,
        items: [...prev.items, newItem]
      };
      
      // 金額を再計算
      return recalculateOrderTotals(updatedOrder);
    });

    // フォームをリセット
    setSelectedItemId('');
    setSelectedItem(null);
    setItemQuantity(1);
    setItemOptions([]);
    setItemNotes('');
    setError('');
  };

  // 注文アイテム削除ハンドラー
  const handleRemoveItem = (itemId) => {
    setOrderData(prev => {
      const updatedOrder = {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      };
      
      // 金額を再計算
      return recalculateOrderTotals(updatedOrder);
    });
  };

  // 注文保存ハンドラー
  const handleSaveOrder = () => {
    // バリデーション
    if (!orderData.customerName.trim()) {
      setError('顧客名を入力してください');
      return;
    }

    if (!orderData.tableId) {
      setError('テーブルを選択してください');
      return;
    }

    if (orderData.items.length === 0) {
      setError('注文アイテムを追加してください');
      return;
    }

    // 注文番号の生成
    const orderNumber = generateOrderNumber();
    
    // 注文日時の設定
    const now = new Date().toISOString();
    
    // 保存用の注文データを作成
    const orderToSave = {
      ...orderData,
      orderNumber,
      orderDate: now
    };
    
    // 注文を保存
    saveOrder(orderToSave);
    
    // ダイアログを閉じる
    onClose(true);
  };

  // ダイアログがリセットされたときに状態をリセット
  useEffect(() => {
    if (open) {
      setOrderData(initialOrderData);
      setSelectedCategory('すべて');
      setSelectedItemId('');
      setSelectedItem(null);
      setItemQuantity(1);
      setItemOptions([]);
      setItemNotes('');
      setError('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">新規注文作成</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* 基本情報 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                基本情報
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="顧客名"
                    name="customerName"
                    value={orderData.customerName}
                    onChange={handleOrderDataChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>テーブル</InputLabel>
                    <Select
                      name="tableId"
                      value={orderData.tableId}
                      onChange={handleOrderDataChange}
                      label="テーブル"
                    >
                      <MenuItem value="">
                        <em>選択してください</em>
                      </MenuItem>
                      {MOCK_TABLES.map(table => (
                        <MenuItem key={table.id} value={table.id}>
                          {table.name}
                        </MenuItem>
                      ))}
                      <MenuItem value="takeout">持ち帰り</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="備考"
                    name="notes"
                    value={orderData.notes}
                    onChange={handleOrderDataChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* 注文アイテム追加 */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                メニュー
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* カテゴリー選択 */}
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map(category => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryChange(category)}
                    color={selectedCategory === category ? 'primary' : 'default'}
                    variant={selectedCategory === category ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
              
              {/* メニューリスト */}
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List dense>
                  {filteredMenuItems.map(item => (
                    <ListItem
                      key={item.id}
                      button
                      selected={selectedItemId === item.id}
                      onClick={() => handleItemSelect(item.id)}
                      divider
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <FoodIcon fontSize="small" sx={{ mr: 1 }} />
                            {item.name}
                          </Box>
                        }
                        secondary={`¥${item.price.toLocaleString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            handleItemSelect(item.id);
                            handleAddItemToOrder();
                          }}
                        >
                          追加
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              {/* アイテム詳細設定 */}
              {selectedItem && (
                <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedItem.name} - ¥{selectedItem.price.toLocaleString()}
                  </Typography>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(itemQuantity - 1)}
                          disabled={itemQuantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={itemQuantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          size="small"
                          InputProps={{ inputProps: { min: 1, style: { textAlign: 'center' } } }}
                          sx={{ width: 60, mx: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(itemQuantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box textAlign="right">
                        <Typography variant="subtitle2">
                          小計: ¥{(selectedItem.price * itemQuantity).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* ラーメンの場合はオプションを表示 */}
                    {selectedItem.category === 'ラーメン' && (
                      <Grid item xs={12}>
                        <Typography variant="body2" gutterBottom>
                          オプション:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {RAMEN_OPTIONS.map(option => (
                            <Chip
                              key={option}
                              label={option}
                              size="small"
                              variant={itemOptions.includes(option) ? 'filled' : 'outlined'}
                              color={itemOptions.includes(option) ? 'primary' : 'default'}
                              onClick={() => handleOptionToggle(option)}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <TextField
                        label="備考"
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddItemToOrder}
                        fullWidth
                      >
                        カートに追加
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* 注文サマリー */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom>
                注文内容
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {orderData.items.length > 0 ? (
                <>
                  <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>商品名</TableCell>
                          <TableCell align="right">単価</TableCell>
                          <TableCell align="right">数量</TableCell>
                          <TableCell align="right">小計</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant="body2">{item.name}</Typography>
                              {item.options && item.options.length > 0 && (
                                <Typography variant="caption" display="block" color="textSecondary">
                                  {item.options.join(', ')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              ¥{item.price.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              {item.quantity}
                            </TableCell>
                            <TableCell align="right">
                              ¥{(item.price * item.quantity).toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* 金額サマリー */}
                  <Box>
                    <Grid container spacing={1}>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          小計
                        </Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="right">
                        <Typography variant="body2">
                          ¥{orderData.subtotal.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          消費税 (10%)
                        </Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="right">
                        <Typography variant="body2">
                          ¥{orderData.taxAmount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          合計
                        </Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="right">
                        <Typography variant="subtitle1" fontWeight="bold">
                          ¥{orderData.total.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    カートに商品がありません
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => onClose(false)}
        >
          キャンセル
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveOrder}
          disabled={orderData.items.length === 0}
        >
          注文を作成
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCreate;
