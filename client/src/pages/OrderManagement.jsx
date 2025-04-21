import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Tabs, Tab, Divider,
  Card, CardContent, Button, Chip, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  LocalShipping as DeliveryIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  AttachMoney as PaymentIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import OrderList from '../components/orders/OrderList';
import OrderDetails from '../components/orders/OrderDetails';
import OrderCreate from '../components/orders/OrderCreate';
import OrderStatsCard from '../components/orders/OrderStatsCard';

import {
  getAllOrders,
  getActiveOrders,
  getOrdersByStatus,
  getOrdersByDateRange,
  ORDER_STATUS,
  initializeOrderData,
  generateOrderReport
} from '../utils/orderUtils';

/**
 * 注文管理ページ
 */
const OrderManagement = () => {
  // 状態管理
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10)
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    canceledOrders: 0
  });
  const [reportData, setReportData] = useState(null);

  // 初期化
  useEffect(() => {
    // 注文データが初期化されていることを確認
    initializeOrderData();
    
    // 注文データの読み込み
    loadOrders();
  }, []);

  // タブに応じて注文を読み込む
  useEffect(() => {
    loadOrdersByTab();
  }, [tabValue]);

  // 注文の読み込み
  const loadOrders = () => {
    const allOrders = getAllOrders();
    
    // 注文統計の更新
    updateOrderStats(allOrders);
    
    // タブに応じた注文の読み込み
    loadOrdersByTab();
  };

  // 注文統計の更新
  const updateOrderStats = (allOrders) => {
    const activeOrdersCount = allOrders.filter(order => 
      order.status !== ORDER_STATUS.CANCELED && 
      order.status !== ORDER_STATUS.PAID
    ).length;
    
    const completedOrdersCount = allOrders.filter(order => 
      order.status === ORDER_STATUS.PAID
    ).length;
    
    const canceledOrdersCount = allOrders.filter(order => 
      order.status === ORDER_STATUS.CANCELED
    ).length;
    
    setOrderStats({
      totalOrders: allOrders.length,
      activeOrders: activeOrdersCount,
      completedOrders: completedOrdersCount,
      canceledOrders: canceledOrdersCount
    });
  };

  // タブに応じた注文の読み込み
  const loadOrdersByTab = () => {
    let filteredOrders = [];
    
    switch (tabValue) {
      case 0: // すべての注文
        filteredOrders = getAllOrders();
        break;
      case 1: // アクティブな注文
        filteredOrders = getActiveOrders();
        break;
      case 2: // 処理中の注文
        filteredOrders = getOrdersByStatus(ORDER_STATUS.IN_PROGRESS);
        break;
      case 3: // 完了済みの注文
        filteredOrders = getOrdersByStatus(ORDER_STATUS.PAID);
        break;
      case 4: // キャンセル済みの注文
        filteredOrders = getOrdersByStatus(ORDER_STATUS.CANCELED);
        break;
      default:
        filteredOrders = getAllOrders();
    }
    
    // さらにステータスフィルターが適用されている場合は絞り込む
    if (statusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // 検索語句が入力されている場合は絞り込む
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.tableId.toLowerCase().includes(term)
      );
    }
    
    // 日付でソート（新しい順）
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    setOrders(filteredOrders);
  };

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 注文選択ハンドラー
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // 検索語句変更ハンドラー
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 検索実行ハンドラー
  const handleSearch = () => {
    loadOrdersByTab();
  };

  // ステータスフィルター変更ハンドラー
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setTimeout(() => {
      loadOrdersByTab();
    }, 0);
  };

  // 日付範囲変更ハンドラー
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // レポート生成ダイアログを開く
  const handleOpenReportDialog = () => {
    setIsReportDialogOpen(true);
  };

  // レポート生成
  const handleGenerateReport = () => {
    const report = generateOrderReport(dateRange.startDate, dateRange.endDate);
    setReportData(report);
    
    setSnackbar({
      open: true,
      message: 'レポートが生成されました',
      severity: 'success'
    });
    
    // 実際のアプリケーションではここでレポートの印刷やエクスポート機能を呼び出す
    console.log('Generated Report:', report);
    
    setIsReportDialogOpen(false);
  };

  // 注文詳細を閉じるハンドラー
  const handleCloseDetails = (refresh = false) => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
    
    if (refresh) {
      loadOrders();
    }
  };

  // 新規注文作成ダイアログを開く
  const handleOpenCreateDialog = () => {
    setIsCreateOpen(true);
  };

  // 新規注文作成ダイアログを閉じる
  const handleCloseCreateDialog = (refresh = false) => {
    setIsCreateOpen(false);
    
    if (refresh) {
      loadOrders();
      
      setSnackbar({
        open: true,
        message: '新しい注文が作成されました',
        severity: 'success'
      });
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ステータス表示用の設定
  const getStatusDisplay = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW:
        return { label: '新規注文', color: 'info' };
      case ORDER_STATUS.IN_PROGRESS:
        return { label: '調理中', color: 'warning' };
      case ORDER_STATUS.READY:
        return { label: '提供準備完了', color: 'success' };
      case ORDER_STATUS.DELIVERED:
        return { label: '提供済み', color: 'secondary' };
      case ORDER_STATUS.PAID:
        return { label: '支払済み', color: 'primary' };
      case ORDER_STATUS.CANCELED:
        return { label: 'キャンセル', color: 'error' };
      default:
        return { label: '不明', color: 'default' };
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          注文管理
        </Typography>
        
        {/* 統計カード */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <OrderStatsCard
              title="総注文数"
              count={orderStats.totalOrders}
              icon={<ReceiptIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <OrderStatsCard
              title="アクティブな注文"
              count={orderStats.activeOrders}
              icon={<StoreIcon />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <OrderStatsCard
              title="完了済み注文"
              count={orderStats.completedOrders}
              icon={<PaymentIcon />}
              color="#9c27b0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <OrderStatsCard
              title="キャンセル注文"
              count={orderStats.canceledOrders}
              icon={<CloseIcon />}
              color="#f44336"
            />
          </Grid>
        </Grid>
        
        {/* 検索・フィルターセクション */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="注文番号・顧客名・テーブル検索"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ステータスフィルター</InputLabel>
                <Select
                  value={statusFilter}
                  label="ステータスフィルター"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">すべてのステータス</MenuItem>
                  <MenuItem value={ORDER_STATUS.NEW}>新規注文</MenuItem>
                  <MenuItem value={ORDER_STATUS.IN_PROGRESS}>調理中</MenuItem>
                  <MenuItem value={ORDER_STATUS.READY}>提供準備完了</MenuItem>
                  <MenuItem value={ORDER_STATUS.DELIVERED}>提供済み</MenuItem>
                  <MenuItem value={ORDER_STATUS.PAID}>支払済み</MenuItem>
                  <MenuItem value={ORDER_STATUS.CANCELED}>キャンセル</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={loadOrders}
                fullWidth
              >
                更新
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  startIcon={<PrintIcon />}
                  variant="outlined"
                  onClick={handleOpenReportDialog}
                  sx={{ mr: 1 }}
                >
                  レポート
                </Button>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleOpenCreateDialog}
                >
                  新規注文
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* タブセクション */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="すべての注文" />
            <Tab label="アクティブな注文" />
            <Tab label="調理中" />
            <Tab label="支払済み" />
            <Tab label="キャンセル" />
          </Tabs>
        </Box>
        
        {/* 注文リスト */}
        <OrderList
          orders={orders}
          onOrderSelect={handleOrderSelect}
          getStatusDisplay={getStatusDisplay}
        />
        
        {/* 注文詳細ダイアログ */}
        <OrderDetails
          open={isDetailsOpen}
          order={selectedOrder}
          onClose={handleCloseDetails}
        />
        
        {/* 新規注文作成ダイアログ */}
        <OrderCreate
          open={isCreateOpen}
          onClose={handleCloseCreateDialog}
        />
        
        {/* レポート生成ダイアログ */}
        <Dialog
          open={isReportDialogOpen}
          onClose={() => setIsReportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>注文レポート生成</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="開始日"
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="終了日"
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              指定した期間の注文データに基づいてレポートを生成します。集計結果はコンソールに出力されます。
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsReportDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleGenerateReport}
              variant="contained"
              color="primary"
            >
              レポート生成
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
    </Container>
  );
};

export default OrderManagement;
