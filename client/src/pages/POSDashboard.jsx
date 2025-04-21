import { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  LocalDining as LocalDiningIcon,
  TableBar as TableBarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { dashboardApi, mockData } from '../services/api';

// Chart.jsの登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const POSDashboard = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 実際のAPIが実装されるまでモックデータを使用
        // const summary = await dashboardApi.getSummary();
        // const orders = await dashboardApi.getRecentOrders();
        // const items = await dashboardApi.getPopularItems();
        // const sales = await dashboardApi.getSalesData(salesPeriod);
        // const alerts = await dashboardApi.getInventoryAlerts();
        
        // モックデータを使用
        const summary = mockData?.dashboardSummary || {};
        const orders = mockData?.recentOrders || [];
        const items = mockData?.popularItems || [];
        const sales = mockData?.salesData?.[salesPeriod] || [];
        const alerts = mockData?.inventoryAlerts || [];
        
        setSummaryData(summary);
        setRecentOrders(Array.isArray(orders) ? orders : []);
        setPopularItems(Array.isArray(items) ? items : []);
        setSalesData(Array.isArray(sales) ? sales : []);
        setInventoryAlerts(Array.isArray(alerts) ? alerts : []);
      } catch (err) {
        console.error('ダッシュボードデータの取得エラー:', err);
        setError('データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [salesPeriod]);

  // 売上グラフのオプション
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `¥${value.toLocaleString()}`,
        },
      },
    },
  };

  // 売上グラフのデータ
  const chartData = {
    labels: Array.isArray(salesData) ? salesData.map(item => item?.date || '') : [],
    datasets: [
      {
        label: '売上',
        data: Array.isArray(salesData) ? salesData.map(item => item?.sales || 0) : [],
        borderColor: '#4a6da7',
        backgroundColor: 'rgba(74, 109, 167, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // 期間の変更ハンドラ
  const handlePeriodChange = (event) => {
    setSalesPeriod(event.target.value);
  };

  // 注文ステータスに基づいて色を決定
  const getStatusColor = (status) => {
    // nullやundefinedの場合はデフォルト色を返す
    if (!status) return 'default';
    
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'ready':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // 注文ステータスのテキストを取得
  const getStatusText = (status) => {
    // nullやundefinedの場合は空文字を返す
    if (!status) return '';
    
    switch (status) {
      case 'completed':
        return '完了';
      case 'in_progress':
        return '調理中';
      case 'ready':
        return '準備完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          データを読み込んでいます...
        </Typography>
      </Container>
    );
  }

  // エラー状態の表示
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            再読み込み
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        POSダッシュボード
      </Typography>
      
      {/* 概要カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              本日の売上
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                ¥{(summaryData?.dailySales || 0).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              本日の注文数
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ReceiptIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {summaryData?.orderCount || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              平均客単価
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <LocalDiningIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                ¥{(summaryData?.averageOrderValue || 0).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              テーブル使用率
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <TableBarIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {summaryData?.tableOccupancy || 0}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 売上グラフ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                売上推移
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>期間</InputLabel>
                <Select
                  value={salesPeriod}
                  label="期間"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="daily">日次</MenuItem>
                  <MenuItem value="weekly">週次</MenuItem>
                  <MenuItem value="monthly">月次</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 300 }}>
              <Line options={chartOptions} data={chartData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 最近の注文と人気メニュー */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              最近の注文
            </Typography>
            <List>
              {recentOrders.map((order) => (
                <Box key={order.id}>
                  <ListItem
                    secondaryAction={
                      <Chip 
                        label={getStatusText(order.status)} 
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    }
                  >
                    <ListItemText
                      primary={`注文 #${order?.id || ''} - ¥${(order?.total || 0).toLocaleString()}`}
                      secondary={`${order?.table || ''} - ${order?.time || ''}`}
                    />
                  </ListItem>
                  <Divider component="li" />
                </Box>
              ))}
            </List>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="outlined" size="small" href="/orders">
                すべての注文を表示
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              人気メニュー
            </Typography>
            <List>
              {popularItems.map((item) => (
                <Box key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={item?.name || ''}
                      secondary={`${item?.orderCount || 0}件の注文 - ¥${(item?.price || 0).toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider component="li" />
                </Box>
              ))}
            </List>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="outlined" size="small" href="/menu">
                すべてのメニューを表示
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 在庫アラート */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              在庫アラート
            </Typography>
            {inventoryAlerts.length > 0 ? (
              <List>
                {inventoryAlerts.map((alert) => (
                  <Box key={alert.id}>
                    <ListItem>
                      <ListItemText
                        primary={alert?.name || ''}
                        secondary={`${alert?.quantity || 0} ${alert?.unit || ''} 残り - 要発注`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Box>
                ))}
              </List>
            ) : (
              <Typography align="center" sx={{ py: 2 }}>
                現在、在庫アラートはありません
              </Typography>
            )}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="outlined" size="small" href="/inventory">
                在庫管理へ
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default POSDashboard;
