import React, { useState } from 'react';
import { 
  Box, 
  Container,
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Tabs, 
  Tab, 
  List,
  ListItem,
  ListItemText,
  Chip,
  Badge,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  CircularProgress
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  LocalDining as LocalDiningIcon,
  Kitchen as KitchenIcon,
  RoomService as RoomServiceIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Print as PrintIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';

/**
 * POSレジ注文管理画面
 * レストランスタッフが注文の状況を確認・更新するための画面
 */
const POSOrders = () => {
  const navigate = useNavigate();
  const { activeOrders, completedOrders, updateOrderStatus } = useOrder();
  
  // ローカルステート
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 注文詳細を表示
  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  // 注文ステータスを更新
  const handleUpdateStatus = (orderId, newStatus) => {
    setIsLoading(true);
    setTimeout(() => {
      updateOrderStatus(orderId, newStatus);
      setIsLoading(false);
      setOrderDetailOpen(false);
    }, 500);
  };

  // 注文キャンセル
  const handleCancelOrder = () => {
    if (selectedOrder) {
      setIsLoading(true);
      setTimeout(() => {
        updateOrderStatus(selectedOrder.id, 'cancelled');
        setCancelDialogOpen(false);
        setOrderDetailOpen(false);
        setIsLoading(false);
      }, 500);
    }
  };

  // 注文の検索
  const getFilteredOrders = () => {
    const orders = tabValue === 0 ? activeOrders : completedOrders;
    
    if (!searchQuery) return orders;
    
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.tableId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // ステータスに基づいた色とラベルを取得
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', label: '受付待ち' };
      case 'confirmed':
        return { color: 'info', label: '受付済み' };
      case 'preparing':
        return { color: 'primary', label: '調理中' };
      case 'ready':
        return { color: 'success', label: '提供準備完了' };
      case 'delivered':
        return { color: 'success', label: '提供済み' };
      case 'completed':
        return { color: 'default', label: '完了' };
      case 'cancelled':
        return { color: 'error', label: 'キャンセル' };
      default:
        return { color: 'default', label: '不明' };
    }
  };

  // 日時のフォーマット
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 合計金額の計算
  const calculateTotal = (order) => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // 次のステータスを取得
  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return { value: 'confirmed', label: '注文確認' };
      case 'confirmed':
        return { value: 'preparing', label: '調理開始' };
      case 'preparing':
        return { value: 'ready', label: '準備完了' };
      case 'ready':
        return { value: 'delivered', label: '提供済み' };
      case 'delivered':
        return { value: 'completed', label: '完了' };
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ヘッダー */}
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/pos')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            注文管理
          </Typography>
          <Badge 
            badgeContent={activeOrders.length} 
            color="error"
            sx={{ mr: 2 }}
          >
            <LocalDiningIcon />
          </Badge>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* 検索バー */}
        <Paper sx={{ p: 1, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="注文検索 (注文ID、テーブル、顧客名)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            variant="outlined"
            size="small"
          />
        </Paper>

        {/* タブ */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={`進行中の注文 (${activeOrders.length})`} />
            <Tab label={`完了した注文 (${completedOrders.length})`} />
          </Tabs>
        </Paper>

        {/* 注文リスト */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {getFilteredOrders().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                {tabValue === 0 ? '進行中の注文はありません' : '完了した注文はありません'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {getFilteredOrders().map(order => (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleViewOrderDetail(order)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          注文 #{order.id.substring(0, 8)}
                        </Typography>
                        <Chip 
                          label={getStatusInfo(order.status).label}
                          color={getStatusInfo(order.status).color}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(order.createdAt)}
                        </Typography>
                      </Box>
                      
                      {order.tableId && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalDiningIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            テーブル: {order.tableId}
                          </Typography>
                        </Box>
                      )}
                      
                      {order.customer && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            顧客: {order.customer.name}
                          </Typography>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {order.items.length}アイテム
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          ¥{calculateTotal(order).toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* 注文詳細ダイアログ */}
      {selectedOrder && (
        <Dialog
          open={orderDetailOpen}
          onClose={() => setOrderDetailOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                注文詳細 #{selectedOrder.id.substring(0, 8)}
              </Typography>
              <Chip 
                label={getStatusInfo(selectedOrder.status).label}
                color={getStatusInfo(selectedOrder.status).color}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                注文日時: {formatDateTime(selectedOrder.createdAt)}
              </Typography>
              
              {selectedOrder.tableId && (
                <Typography variant="body2" gutterBottom>
                  テーブル: {selectedOrder.tableId}
                </Typography>
              )}
              
              {selectedOrder.customer && (
                <Typography variant="body2" gutterBottom>
                  顧客: {selectedOrder.customer.name}
                </Typography>
              )}
              
              {selectedOrder.notes && (
                <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    メモ: {selectedOrder.notes}
                  </Typography>
                </Paper>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              注文アイテム
            </Typography>
            
            <List disablePadding>
              {selectedOrder.items.map((item, index) => (
                <ListItem 
                  key={index}
                  sx={{ 
                    py: 1, 
                    px: 0, 
                    borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #eee' : 'none' 
                  }}
                >
                  <ListItemText
                    primary={`${item.name} × ${item.quantity}`}
                    secondary={
                      Object.entries(item.options || {}).length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {Object.entries(item.options)
                            .filter(([key, value]) => key !== 'notes' && value)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </Typography>
                      )
                    }
                  />
                  <Typography variant="body2">
                    ¥{item.subtotal.toLocaleString()}
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>小計</Typography>
                <Typography>¥{calculateTotal(selectedOrder).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>消費税 (10%)</Typography>
                <Typography>¥{Math.round(calculateTotal(selectedOrder) * 0.1).toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  合計
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  ¥{Math.round(calculateTotal(selectedOrder) * 1.1).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
            <Box>
              <Button 
                startIcon={<PrintIcon />}
                onClick={() => alert('注文票を印刷しました')}
                sx={{ mr: 1 }}
              >
                印刷
              </Button>
              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                <Button 
                  startIcon={<CancelIcon />}
                  color="error"
                  onClick={() => {
                    setOrderDetailOpen(false);
                    setCancelDialogOpen(true);
                  }}
                >
                  キャンセル
                </Button>
              )}
            </Box>
            <Box>
              <Button onClick={() => setOrderDetailOpen(false)}>
                閉じる
              </Button>
              {getNextStatus(selectedOrder.status) && (
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateStatus(
                    selectedOrder.id, 
                    getNextStatus(selectedOrder.status).value
                  )}
                  disabled={isLoading}
                  endIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {getNextStatus(selectedOrder.status).label}
                </Button>
              )}
            </Box>
          </DialogActions>
        </Dialog>
      )}

      {/* キャンセル確認ダイアログ */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>注文をキャンセル</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            この注文をキャンセルしてもよろしいですか？この操作は取り消せません。
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="キャンセル理由（オプション）"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            戻る
          </Button>
          <Button 
            onClick={handleCancelOrder} 
            color="error"
            variant="contained"
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            キャンセル確定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POSOrders;
