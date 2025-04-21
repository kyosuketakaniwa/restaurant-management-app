import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Badge,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  ButtonGroup,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  LocalDining as LocalDiningIcon,
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Timer as TimerIcon,
  HighlightOff as HighlightOffIcon
} from '@mui/icons-material';
import { useOrder } from '../contexts/OrderContext';
import OrderCard from '../components/kitchen/OrderCard';
import OrderDetailDialog from '../components/kitchen/OrderDetailDialog';

/**
 * キッチンディスプレイシステム（KDS）
 * 調理スタッフが注文を確認し、進捗状況を管理するためのインターフェース
 */
const KitchenDisplay = () => {
  // 注文コンテキスト
  const { activeOrders, updateOrderStatus } = useOrder();
  
  // ローカルステート
  const [tabValue, setTabValue] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [kitchenNote, setKitchenNote] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [sortType, setSortType] = useState('time'); // time, priority, table
  
  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 注文フィルタリング
  useEffect(() => {
    const filterOrdersByTab = () => {
      let ordersToShow = [...activeOrders];
      
      // ステータスによるフィルタリング
      switch (tabValue) {
        case 0: // すべての注文
          // フィルタリングなし
          break;
        case 1: // 新規注文
          ordersToShow = ordersToShow.filter(order => 
            order.status === 'confirmed' || order.status === 'pending'
          );
          break;
        case 2: // 調理中
          ordersToShow = ordersToShow.filter(order => 
            order.status === 'preparing'
          );
          break;
        case 3: // 準備完了
          ordersToShow = ordersToShow.filter(order => 
            order.status === 'ready'
          );
          break;
        default:
          break;
      }
      
      // 並べ替え
      ordersToShow = sortOrders(ordersToShow, sortType);
      
      setFilteredOrders(ordersToShow);
    };
    
    filterOrdersByTab();
  }, [activeOrders, tabValue, sortType]);
  
  // 注文の並べ替え
  const sortOrders = (orders, sortType) => {
    const ordersCopy = [...orders];
    
    switch (sortType) {
      case 'time': // 注文時間順
        return ordersCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'priority': // 優先度順
        return ordersCopy.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      case 'table': // テーブル番号順
        return ordersCopy.sort((a, b) => {
          if (!a.tableId) return 1;
          if (!b.tableId) return -1;
          return a.tableId.localeCompare(b.tableId);
        });
      default:
        return ordersCopy;
    }
  };
  
  // 注文の詳細を表示
  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
    
    // 注文に関連するキッチンノートがあれば取得
    setKitchenNote(order.kitchenNote || '');
  };
  
  // キッチンノートを保存
  const handleSaveNote = () => {
    if (selectedOrder) {
      // 実際のアプリケーションではAPIを呼び出してノートを保存
      // ここではモック実装
      const updatedOrders = activeOrders.map(order => {
        if (order.id === selectedOrder.id) {
          return { ...order, kitchenNote };
        }
        return order;
      });
      
      // 注文コンテキストに更新を反映させる機能が必要
      // ここではモック通知だけを表示
      setAlertMessage('キッチンノートが保存されました');
      setAlertSeverity('success');
      setNewOrderAlert(true);
      
      setNoteDialogOpen(false);
    }
  };
  
  // 注文ステータスを更新
  const handleUpdateStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrderDetailOpen(false);
    
    // ステータス更新の通知
    const statusMessages = {
      'preparing': '調理を開始しました',
      'ready': '調理が完了しました',
      'delivered': '商品が提供されました'
    };
    
    setAlertMessage(statusMessages[newStatus] || 'ステータスが更新されました');
    setAlertSeverity('success');
    setNewOrderAlert(true);
  };
  
  // データを更新
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // 実際のアプリケーションではAPIからデータを再取得
    // ここではモック操作
    setTimeout(() => {
      setIsRefreshing(false);
      setAlertMessage('データが更新されました');
      setAlertSeverity('info');
      setNewOrderAlert(true);
    }, 1000);
  };
  
  // 並べ替え方法を変更
  const handleChangeSortType = (type) => {
    setSortType(type);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ヘッダー */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            キッチンディスプレイ
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* 注文数バッジ */}
            <Badge 
              badgeContent={activeOrders.filter(o => o.status === 'confirmed' || o.status === 'pending').length} 
              color="error"
              sx={{ mr: 2 }}
            >
              <NotificationsIcon />
            </Badge>
            
            {/* 更新ボタン */}
            <IconButton 
              color="inherit" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* タブとフィルター */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab 
                label={`すべて (${activeOrders.length})`} 
                icon={<RestaurantMenuIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={`新規 (${activeOrders.filter(o => o.status === 'confirmed' || o.status === 'pending').length})`}
                icon={<AccessTimeIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`調理中 (${activeOrders.filter(o => o.status === 'preparing').length})`}
                icon={<LocalDiningIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`完了 (${activeOrders.filter(o => o.status === 'ready').length})`}
                icon={<CheckCircleIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ButtonGroup variant="outlined" size="small" fullWidth>
              <Button 
                variant={sortType === 'time' ? 'contained' : 'outlined'} 
                onClick={() => handleChangeSortType('time')}
                startIcon={<AccessTimeIcon />}
              >
                時間順
              </Button>
              <Button 
                variant={sortType === 'priority' ? 'contained' : 'outlined'} 
                onClick={() => handleChangeSortType('priority')}
                startIcon={<TimerIcon />}
              >
                優先度
              </Button>
              <Button 
                variant={sortType === 'table' ? 'contained' : 'outlined'} 
                onClick={() => handleChangeSortType('table')}
                startIcon={<RestaurantMenuIcon />}
              >
                テーブル
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>
      
      {/* 注文リスト */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        {filteredOrders.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary">
              {tabValue === 0 ? '注文はありません' : 'この状態の注文はありません'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredOrders.map(order => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                <OrderCard 
                  order={order} 
                  onView={() => handleViewOrderDetail(order)}
                  onStatusChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* 注文詳細ダイアログ */}
      {selectedOrder && (
        <OrderDetailDialog
          open={orderDetailOpen}
          order={selectedOrder}
          onClose={() => setOrderDetailOpen(false)}
          onStatusChange={(newStatus) => handleUpdateStatus(selectedOrder.id, newStatus)}
          onNoteClick={() => setNoteDialogOpen(true)}
        />
      )}
      
      {/* キッチンノートダイアログ */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>キッチンノート</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="調理に関するメモ"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={kitchenNote}
            onChange={(e) => setKitchenNote(e.target.value)}
            placeholder="材料の置き換え、調理の注意点などを記録"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveNote} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* アラート通知 */}
      <Snackbar
        open={newOrderAlert}
        autoHideDuration={3000}
        onClose={() => setNewOrderAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNewOrderAlert(false)} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KitchenDisplay;
