import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Button,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useOrder } from '../contexts/OrderContext';

// サンプル画像URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200';

/**
 * 顧客向けデジタルメニューページ
 * QRコードからアクセスされることを想定
 */
const CustomerMenu = () => {
  // URLパラメータからテーブルIDを取得
  const { tableId } = useParams();
  const navigate = useNavigate();
  
  // 注文コンテキスト
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    setTableId, 
    setOrderNotes,
    createOrder 
  } = useOrder();
  
  // ローカルステート
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState({});
  const [notes, setNotes] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // テーブルIDをカートに設定
  useEffect(() => {
    if (tableId) {
      setTableId(tableId);
    }
  }, [tableId, setTableId]);

  // メニューデータの取得
  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      try {
        // TODO: 実際のAPIからデータ取得
        // const menuResponse = await menuApi.getMenuItems();
        // const categoriesResponse = await menuApi.getCategories();
        
        // モックデータ（APIが実装されるまで）
        const mockCategories = [
          { id: 1, name: '前菜', description: '食事の始まりにふさわしい一品' },
          { id: 2, name: 'メイン料理', description: 'シェフのおすすめメイン料理' },
          { id: 3, name: 'デザート', description: '甘いものでお食事を締めくくり' },
          { id: 4, name: 'ドリンク', description: '豊富な種類のお飲み物をご用意' }
        ];
        
        const mockMenuItems = [
          { 
            id: 1, 
            name: 'シーザーサラダ', 
            description: '新鮮なロメインレタスとクルトン、パルメザンチーズ、特製シーザードレッシング', 
            price: 980, 
            image: PLACEHOLDER_IMAGE, 
            category_id: 1,
            available: true,
            options: [
              { name: 'ドレッシング', choices: ['シーザー', 'イタリアン', '和風'] },
              { name: 'サイズ', choices: ['S', 'M', 'L'] }
            ],
            allergies: ['小麦', '卵', '乳']
          },
          { 
            id: 2, 
            name: '牛フィレステーキ', 
            description: '厳選された牛フィレ肉を丁寧に焼き上げた一品。赤ワインソース添え', 
            price: 3200, 
            image: PLACEHOLDER_IMAGE, 
            category_id: 2,
            available: true,
            options: [
              { name: '焼き加減', choices: ['レア', 'ミディアムレア', 'ミディアム', 'ウェルダン'] },
              { name: 'サイドディッシュ', choices: ['マッシュポテト', 'フライドポテト', '季節の野菜'] }
            ],
            allergies: ['牛肉']
          },
          { 
            id: 3, 
            name: 'ティラミス', 
            description: 'エスプレッソコーヒーとマスカルポーネチーズの絶妙なハーモニー', 
            price: 850, 
            image: PLACEHOLDER_IMAGE, 
            category_id: 3,
            available: true,
            options: [],
            allergies: ['乳', '小麦', '卵']
          },
          { 
            id: 4, 
            name: 'スパークリングワイン', 
            description: 'フルーティーな味わいの辛口スパークリングワイン', 
            price: 950, 
            image: PLACEHOLDER_IMAGE, 
            category_id: 4,
            available: true,
            options: [
              { name: 'サイズ', choices: ['グラス', 'ボトル'] }
            ],
            allergies: []
          }
        ];

        setCategories(mockCategories);
        setMenuItems(mockMenuItems);
      } catch (err) {
        console.error('メニューデータの取得に失敗しました', err);
        setError('メニューデータの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // アラート表示
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 商品詳細ダイアログを開く
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setOptions({});
    setNotes('');
    setItemDialogOpen(true);
  };

  // 商品をカートに追加
  const handleAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, quantity, { ...options, notes });
      setItemDialogOpen(false);
      showAlert(`${selectedItem.name}をカートに追加しました`);
    }
  };

  // 注文を確定
  const handlePlaceOrder = async () => {
    const order = await createOrder();
    if (order) {
      setCartDialogOpen(false);
      showAlert('ご注文ありがとうございます！');
      navigate(`/customer/order-confirmation/${order.id}`);
    } else {
      showAlert('注文処理中にエラーが発生しました', 'error');
    }
  };

  // 商品オプション選択の変更ハンドラー
  const handleOptionChange = (optionName, value) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      [optionName]: value
    }));
  };

  // カテゴリ別にメニューアイテムをフィルタリング
  const getFilteredItems = () => {
    if (activeTab === 0) return menuItems; // すべて表示
    return menuItems.filter(item => item.category_id === categories[activeTab - 1]?.id);
  };

  // カート内の合計金額を計算
  const calculateTotal = () => {
    return cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // カート内の合計アイテム数を計算
  const cartItemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          再読み込み
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 7 }}>
      {/* ヘッダー */}
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            デジタルメニュー
          </Typography>
          {tableId && (
            <Chip 
              label={`テーブル: ${tableId}`} 
              color="secondary" 
              sx={{ mr: 1 }}
            />
          )}
          <IconButton 
            color="inherit" 
            onClick={() => setCartDialogOpen(true)}
            disabled={cart.items.length === 0}
          >
            <Badge badgeContent={cartItemCount} color="secondary">
              <CartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* メニューカテゴリタブ */}
      <Paper square elevation={1}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="すべて" />
          {categories.map(category => (
            <Tab key={category.id} label={category.name} />
          ))}
        </Tabs>
      </Paper>

      {/* カテゴリの説明 */}
      {activeTab > 0 && (
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary">
            {categories[activeTab - 1]?.description}
          </Typography>
        </Box>
      )}

      {/* メニューアイテム一覧 */}
      <Container sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {getFilteredItems().map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: item.available ? 1 : 0.6 
                }}
                onClick={() => item.available && handleItemClick(item)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image || PLACEHOLDER_IMAGE}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name}
                    {!item.available && (
                      <Chip 
                        label="売切れ" 
                        color="error" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ¥{item.price.toLocaleString()}
                  </Typography>
                  {item.allergies.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {item.allergies.map(allergy => (
                        <Chip 
                          key={allergy} 
                          label={allergy} 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    fullWidth
                    variant="contained"
                    disabled={!item.available}
                  >
                    カートに追加
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 商品詳細ダイアログ */}
      {selectedItem && (
        <Dialog
          open={itemDialogOpen}
          onClose={() => setItemDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{selectedItem.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <img 
                src={selectedItem.image || PLACEHOLDER_IMAGE} 
                alt={selectedItem.name} 
                style={{ width: '100%', borderRadius: 8 }}
              />
            </Box>
            <Typography variant="body1" paragraph>
              {selectedItem.description}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              ¥{selectedItem.price.toLocaleString()}
            </Typography>
            
            {selectedItem.allergies.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>アレルギー物質</Typography>
                <Box>
                  {selectedItem.allergies.map(allergy => (
                    <Chip 
                      key={allergy} 
                      label={allergy} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* オプション選択 */}
            {selectedItem.options.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>オプション</Typography>
                {selectedItem.options.map(option => (
                  <FormControl key={option.name} fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{option.name}</InputLabel>
                    <Select
                      value={options[option.name] || ''}
                      label={option.name}
                      onChange={(e) => handleOptionChange(option.name, e.target.value)}
                    >
                      {option.choices.map(choice => (
                        <MenuItem key={choice} value={choice}>{choice}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>
            )}
            
            {/* 数量選択 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>数量</Typography>
              <IconButton 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ mx: 2 }}>{quantity}</Typography>
              <IconButton onClick={() => setQuantity(quantity + 1)}>
                <AddIcon />
              </IconButton>
            </Box>
            
            {/* 特別リクエスト */}
            <TextField
              label="特別リクエスト（オプション）"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="ソースを少なめにするなど、特別なリクエストがあればご記入ください"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setItemDialogOpen(false)}>キャンセル</Button>
            <Button 
              onClick={handleAddToCart} 
              variant="contained" 
              startIcon={<AddIcon />}
            >
              カートに追加 (¥{(selectedItem.price * quantity).toLocaleString()})
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* カート内容ダイアログ */}
      <Dialog
        open={cartDialogOpen}
        onClose={() => setCartDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ご注文内容の確認</DialogTitle>
        <DialogContent>
          {cart.items.length === 0 ? (
            <Typography align="center" sx={{ py: 3 }}>
              カートに商品がありません
            </Typography>
          ) : (
            <>
              {cart.items.map((item, index) => (
                <Box key={index} sx={{ py: 2, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">
                      {item.name}
                    </Typography>
                    <Typography variant="subtitle1">
                      ¥{item.subtotal.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ¥{item.price.toLocaleString()} × {item.quantity}
                      </Typography>
                      {Object.entries(item.options).length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {Object.entries(item.options)
                            .filter(([key, value]) => key !== 'notes' && value)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </Typography>
                      )}
                      {item.options.notes && (
                        <Typography variant="body2" color="text.secondary">
                          メモ: {item.options.notes}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
              
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  合計金額
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>小計</Typography>
                  <Typography>¥{calculateTotal().toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>消費税（10%）</Typography>
                  <Typography>¥{Math.floor(calculateTotal() * 0.1).toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">合計</Typography>
                  <Typography variant="h6">
                    ¥{Math.floor(calculateTotal() * 1.1).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  特別リクエスト（オプション）
                </Typography>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  variant="outlined"
                  placeholder="ご要望があればご記入ください"
                  value={cart.notes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartDialogOpen(false)}>
            戻る
          </Button>
          <Button 
            variant="contained" 
            disabled={cart.items.length === 0}
            onClick={handlePlaceOrder}
          >
            注文を確定する
          </Button>
        </DialogActions>
      </Dialog>

      {/* アラート */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerMenu;
