import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  Divider, 
  TextField,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Badge,
  Drawer,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  TableRestaurant as TableIcon,
  Comment as CommentIcon,
  PriceCheck as PriceCheckIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
  LocalOffer as LocalOfferIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import PaymentDialog from '../components/payment/PaymentDialog';
import { useOrder } from '../contexts/OrderContext';
import { getAllMenuItems, getAllCategories } from '../utils/menuUtils';

// サンプル画像URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80x80';

/**
 * POSレジ画面
 * レストランスタッフが注文処理や支払い処理を行うための画面
 */
const POSRegister = () => {
  const navigate = useNavigate();
  
  // 注文コンテキスト
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    setTableId, 
    setCustomer, 
    setOrderNotes,
    createOrder,
    completeOrder
  } = useOrder();
  
  // ローカルステート
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [orderOptionsDrawerOpen, setOrderOptionsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // メニューデータとテーブルデータの取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // menuUtilsからメニューデータを取得
        const menuItems = getAllMenuItems();
        const categories = getAllCategories();
        
        // モックテーブルデータ（テーブルAPIが実装されるまで）
        const mockTables = [
          { id: 'A1', name: 'テーブルA1', seats: 2, status: 'available' },
          { id: 'A2', name: 'テーブルA2', seats: 2, status: 'occupied' },
          { id: 'B1', name: 'テーブルB1', seats: 4, status: 'available' },
          { id: 'B2', name: 'テーブルB2', seats: 4, status: 'reserved' },
          { id: 'C1', name: 'テーブルC1', seats: 6, status: 'available' },
          { id: 'VIP', name: 'VIPルーム', seats: 8, status: 'available' }
        ];

        // メニューデータを設定
        setCategories(categories);
        setMenuItems(menuItems);
        setTables(mockTables);
      } catch (err) {
        console.error('データの取得に失敗しました', err);
        setError('データの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // テーブル選択ハンドラー
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setTableId(table.id);
    setTableDialogOpen(false);
  };

  // 顧客情報設定ハンドラー
  const handleSetCustomer = () => {
    if (customerName.trim()) {
      setCustomer({ name: customerName });
      setCustomerDialogOpen(false);
    }
  };

  // 注文メモ設定ハンドラー
  const handleSetOrderNote = () => {
    setOrderNotes(orderNote);
    setNoteDialogOpen(false);
  };

  // 割引設定ハンドラー
  const handleSetDiscount = () => {
    // 割引は0-100%の範囲で設定
    const discount = Math.min(Math.max(parseFloat(discountPercent) || 0, 0), 100);
    setDiscountPercent(discount);
    setDiscountDialogOpen(false);
  };

  // 注文作成ハンドラー
  const handleCreateOrder = async () => {
    if (!selectedTable) {
      alert('テーブルを選択してください');
      setTableDialogOpen(true);
      return;
    }

    // 注文作成時はカートをクリアしない
    const order = await createOrder(false);
    if (order) {
      // 注文成功
      alert(`注文が作成されました。注文ID: ${order.id}`);
    }
  };

  // 支払いダイアログを開く前の処理
  const handleOpenPayment = async () => {
    try {
      if (cart.items.length === 0) {
        alert('カートが空です');
        return;
      }
      
      if (!selectedTable) {
        alert('テーブルを選択してください');
        setTableDialogOpen(true);
        return;
      }
      
      // まず注文を作成する（カートはクリアしない）
      setLoading(true);
      const order = await createOrder(false);
      
      if (!order) {
        throw new Error('注文の作成に失敗しました');
      }
      
      // 注文IDを記録
      setCurrentOrderId(order.id);
      
      // 支払いダイアログを開く
      setPaymentDialogOpen(true);
      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      console.error('注文作成中にエラーが発生しました:', error);
      alert('注文作成中にエラーが発生しました: ' + error.message);
    }
  };
  
  // 支払い完了時のコールバック
  const handlePaymentComplete = (completedOrder) => {
    console.log('注文の支払い処理完了:', completedOrder);
    
    // カートと状態をクリア
    clearCart();
    setSelectedTable(null);
    setCustomerName('');
    setOrderNote('');
    setDiscountPercent(0);
    setPaymentDialogOpen(false);
    
    // 手動でローカルストレージイベントを発行して確実に売上管理に反映させる
    window.dispatchEvent(new Event('storage'));
    
    // 成功メッセージ
    alert(`支払いが完了しました。領収書を印刷します。`);
  };

  // カテゴリ別にメニューアイテムをフィルタリング
  const getFilteredItems = () => {
    let filteredItems = menuItems;
    
    // 検索クエリによるフィルタリング
    if (searchQuery) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // カテゴリによるフィルタリング
    if (activeTab > 0 && categories.length > 0) {
      const categoryId = categories[activeTab - 1]?.id;
      filteredItems = filteredItems.filter(item => 
        item.category_id === categoryId
      );
    }
    
    // 利用可能なメニューのみ表示
    filteredItems = filteredItems.filter(item => item.available !== false);
    
    return filteredItems;
  };

  // 小計計算
  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // 割引額計算
  const calculateDiscount = () => {
    return Math.round(calculateSubtotal() * (discountPercent / 100));
  };

  // 消費税計算
  const calculateTax = () => {
    return Math.round((calculateSubtotal() - calculateDiscount()) * 0.1);
  };

  // 合計金額計算
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ヘッダー */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            POSレジ
          </Typography>
          {selectedTable && (
            <Chip 
              icon={<TableIcon />}
              label={selectedTable.name} 
              color="secondary" 
              sx={{ mr: 1 }}
              onClick={() => setTableDialogOpen(true)}
            />
          )}
          {cart.customer && (
            <Chip 
              icon={<PersonIcon />}
              label={cart.customer.name} 
              sx={{ mr: 1 }}
              onClick={() => setCustomerDialogOpen(true)}
            />
          )}
          <IconButton 
            color="inherit" 
            onClick={() => setOrderOptionsDrawerOpen(true)}
          >
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: 8 }}>
        {/* 左側: メニュー一覧 */}
        <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column', p: 2 }}>
          {/* 検索バー */}
          <Paper sx={{ p: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="メニュー検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              variant="outlined"
              size="small"
            />
          </Paper>

          {/* カテゴリタブ */}
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="すべて" />
              {categories.map(category => (
                <Tab key={category.id} label={category.name} />
              ))}
            </Tabs>
          </Paper>

          {/* メニューアイテムグリッド */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Grid container spacing={2}>
              {getFilteredItems().map(item => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      opacity: item.available ? 1 : 0.6
                    }}
                    onClick={() => item.available && addToCart(item)}
                  >
                    <Box sx={{ display: 'flex', p: 1 }}>
                      <Box
                        component="img"
                        sx={{ width: 80, height: 80, borderRadius: 1 }}
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="subtitle2" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                          {item.description}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          ¥{item.price.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* 右側: 注文カート */}
        <Box sx={{ width: '40%', bgcolor: 'background.default', p: 2, borderLeft: '1px solid #eee' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              注文内容
            </Typography>

            {cart.items.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <CartIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">
                  カートに商品がありません
                </Typography>
              </Box>
            ) : (
              <List sx={{ mb: 2 }}>
                {cart.items.map((item, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      py: 1, 
                      px: 0, 
                      borderBottom: index < cart.items.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={`¥${item.price.toLocaleString()} × ${item.quantity}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        ¥{item.subtotal.toLocaleString()}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => removeFromCart(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}

            {/* 金額計算 */}
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>小計</Typography>
                <Typography>¥{calculateSubtotal().toLocaleString()}</Typography>
              </Box>

              {discountPercent > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>割引 ({discountPercent}%)</Typography>
                  <Typography color="error">-¥{calculateDiscount().toLocaleString()}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>消費税 (10%)</Typography>
                <Typography>¥{calculateTax().toLocaleString()}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  合計
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  ¥{calculateTotal().toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* 注文アクション */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PersonIcon />}
                onClick={() => setCustomerDialogOpen(true)}
              >
                顧客情報
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TableIcon />}
                onClick={() => setTableDialogOpen(true)}
              >
                テーブル選択
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CommentIcon />}
                onClick={() => setNoteDialogOpen(true)}
              >
                注文メモ
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<LocalOfferIcon />}
                onClick={() => setDiscountDialogOpen(true)}
              >
                割引設定
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<AssignmentIcon />}
                onClick={handleCreateOrder}
                disabled={cart.items.length === 0}
              >
                注文確定
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<PaymentIcon />}
                onClick={handleOpenPayment}
                disabled={cart.items.length === 0}
              >
                会計
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* テーブル選択ダイアログ */}
      <Dialog
        open={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>テーブル選択</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {tables.map(table => (
              <Grid item xs={6} sm={4} key={table.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: 
                      selectedTable?.id === table.id 
                        ? 'primary.light'
                        : table.status === 'occupied'
                        ? 'error.light'
                        : table.status === 'reserved'
                        ? 'warning.light'
                        : 'background.paper',
                    '&:hover': {
                      bgcolor: selectedTable?.id === table.id 
                        ? 'primary.light' 
                        : 'action.hover'
                    }
                  }}
                  onClick={() => table.status !== 'occupied' && handleTableSelect(table)}
                >
                  <CardContent>
                    <Box sx={{ textAlign: 'center' }}>
                      <TableIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">{table.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {table.seats}人席
                      </Typography>
                      <Chip 
                        label={
                          table.status === 'occupied' 
                            ? '使用中'
                            : table.status === 'reserved'
                            ? '予約済'
                            : '利用可能'
                        }
                        color={
                          table.status === 'occupied' 
                            ? 'error'
                            : table.status === 'reserved'
                            ? 'warning'
                            : 'success'
                        }
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialogOpen(false)}>キャンセル</Button>
          <Button 
            onClick={() => {
              setSelectedTable(null);
              setTableId(null);
              setTableDialogOpen(false);
            }}
            color="error"
          >
            クリア
          </Button>
        </DialogActions>
      </Dialog>

      {/* 顧客情報ダイアログ */}
      <Dialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>顧客情報</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="顧客名"
            fullWidth
            variant="outlined"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>キャンセル</Button>
          <Button 
            onClick={() => {
              setCustomer(null);
              setCustomerName('');
              setCustomerDialogOpen(false);
            }}
            color="error"
          >
            クリア
          </Button>
          <Button onClick={handleSetCustomer} color="primary">
            設定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 注文メモダイアログ */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>注文メモ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="メモ"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSetOrderNote} color="primary">
            設定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 割引設定ダイアログ */}
      <Dialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>割引設定</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="割引率 (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSetDiscount} color="primary">
            設定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 支払いダイアログ - 共通コンポーネントを使用 */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        orderId={currentOrderId}
        orderTotal={calculateTotal()}
        orderDiscount={calculateDiscount()}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* オプションドロワー */}
      <Drawer
        anchor="right"
        open={orderOptionsDrawerOpen}
        onClose={() => setOrderOptionsDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2, pt: 10 }}>
          <Typography variant="h6" gutterBottom>
            オプション
          </Typography>
          <List>
            <ListItem button onClick={() => {
              clearCart();
              setOrderOptionsDrawerOpen(false);
            }}>
              <ListItemText primary="カートをクリア" />
            </ListItem>
            <ListItem button onClick={() => {
              // TODO: レシート印刷
              alert('レシートを印刷しました');
              setOrderOptionsDrawerOpen(false);
            }}>
              <ListItemText primary="レシート印刷" />
            </ListItem>
            <ListItem button onClick={() => {
              // TODO: オーダーリスト表示
              setOrderOptionsDrawerOpen(false);
              navigate('/pos/orders');
            }}>
              <ListItemText primary="注文リスト" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default POSRegister;
