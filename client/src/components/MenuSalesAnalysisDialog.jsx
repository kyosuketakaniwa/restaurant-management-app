import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Chart.jsコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const MenuSalesAnalysisDialog = ({ open, onClose, menuItem }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);

  // 売上データの取得（モック）
  useEffect(() => {
    if (open) {
      setLoading(true);
      
      // 実際のアプリでは、APIから売上データを取得
      // const fetchSalesData = async () => {
      //   try {
      //     const data = await salesApi.getMenuItemSales(menuItem.id, timeRange);
      //     setSalesData(data);
      //   } catch (error) {
      //     console.error('売上データの取得に失敗しました', error);
      //   } finally {
      //     setLoading(false);
      //   }
      // };
      
      // fetchSalesData();
      
      // モックデータを使用
      setTimeout(() => {
        // 日付の生成
        const generateDates = (days) => {
          const dates = [];
          const today = new Date();
          
          for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            dates.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
          }
          
          return dates;
        };
        
        // 週間データ
        const weekData = {
          labels: generateDates(7),
          sales: [4, 7, 5, 8, 6, 9, 12],
          revenue: [7200, 12600, 9000, 14400, 10800, 16200, 21600],
          comparisons: [
            { name: '天ぷら盛り合わせ', sales: [3, 5, 4, 6, 5, 7, 8] },
            { name: '焼き魚定食', sales: [5, 6, 4, 7, 8, 6, 9] }
          ]
        };
        
        // 月間データ
        const monthData = {
          labels: generateDates(30),
          sales: Array.from({ length: 30 }, () => Math.floor(Math.random() * 15) + 3),
          revenue: Array.from({ length: 30 }, (_, i) => (Math.floor(Math.random() * 15) + 3) * 1800),
          comparisons: [
            { name: '天ぷら盛り合わせ', sales: Array.from({ length: 30 }, () => Math.floor(Math.random() * 12) + 2) },
            { name: '焼き魚定食', sales: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 3) }
          ]
        };
        
        // 年間データ
        const yearData = {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          sales: [85, 78, 92, 110, 120, 145, 160, 175, 140, 125, 105, 95],
          revenue: [153000, 140400, 165600, 198000, 216000, 261000, 288000, 315000, 252000, 225000, 189000, 171000],
          comparisons: [
            { name: '天ぷら盛り合わせ', sales: [70, 65, 80, 90, 100, 110, 120, 130, 115, 105, 90, 80] },
            { name: '焼き魚定食', sales: [90, 85, 95, 100, 110, 120, 115, 125, 110, 100, 95, 90] }
          ]
        };
        
        // 人気度データ
        const popularityData = {
          rank: 3,
          totalSold: 1245,
          totalRevenue: 2241000,
          categoryRank: 1,
          percentageOfSales: 18.5,
          customerRating: 4.7,
          topPairings: [
            { name: '味噌汁', count: 523 },
            { name: '日本酒（小）', count: 412 },
            { name: '茶碗蒸し', count: 287 }
          ]
        };
        
        const mockData = {
          week: weekData,
          month: monthData,
          year: yearData,
          popularity: popularityData
        };
        
        setSalesData(mockData);
        setLoading(false);
      }, 1000);
    }
  }, [open, menuItem, timeRange]);

  // タブ切り替え
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 時間範囲変更
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // 売上チャートのデータ
  const getSalesChartData = () => {
    if (!salesData) return null;
    
    const currentData = salesData[timeRange];
    
    return {
      labels: currentData.labels,
      datasets: [
        {
          label: `${menuItem.name}の販売数`,
          data: currentData.sales,
          backgroundColor: 'rgba(74, 109, 167, 0.7)',
          borderColor: 'rgba(74, 109, 167, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // 売上比較チャートのデータ
  const getComparisonChartData = () => {
    if (!salesData) return null;
    
    const currentData = salesData[timeRange];
    
    return {
      labels: currentData.labels,
      datasets: [
        {
          label: menuItem.name,
          data: currentData.sales,
          backgroundColor: 'rgba(74, 109, 167, 0.7)',
          borderColor: 'rgba(74, 109, 167, 1)',
          borderWidth: 1,
          type: 'line',
          fill: false,
          tension: 0.4
        },
        ...currentData.comparisons.map((item, index) => ({
          label: item.name,
          data: item.sales,
          backgroundColor: index === 0 ? 'rgba(229, 115, 115, 0.5)' : 'rgba(102, 187, 106, 0.5)',
          borderColor: index === 0 ? 'rgba(229, 115, 115, 1)' : 'rgba(102, 187, 106, 1)',
          borderWidth: 1,
          type: 'line',
          fill: false,
          tension: 0.4
        }))
      ]
    };
  };

  // 売上金額チャートのデータ
  const getRevenueChartData = () => {
    if (!salesData) return null;
    
    const currentData = salesData[timeRange];
    
    return {
      labels: currentData.labels,
      datasets: [
        {
          label: `${menuItem.name}の売上金額`,
          data: currentData.revenue,
          backgroundColor: 'rgba(255, 183, 77, 0.7)',
          borderColor: 'rgba(255, 183, 77, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // 人気度ペアリングチャートのデータ
  const getPairingChartData = () => {
    if (!salesData || !salesData.popularity || !salesData.popularity.topPairings) return null;
    
    return {
      labels: salesData.popularity.topPairings.map(item => item.name),
      datasets: [
        {
          data: salesData.popularity.topPairings.map(item => item.count),
          backgroundColor: [
            'rgba(74, 109, 167, 0.7)',
            'rgba(229, 115, 115, 0.7)',
            'rgba(102, 187, 106, 0.7)'
          ],
          borderColor: [
            'rgba(74, 109, 167, 1)',
            'rgba(229, 115, 115, 1)',
            'rgba(102, 187, 106, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // チャートオプション
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            売上分析 - {menuItem?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab icon={<BarChartIcon />} label="売上推移" />
          <Tab icon={<TrendingUpIcon />} label="比較分析" />
          <Tab icon={<PieChartIcon />} label="人気度" />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* 売上推移タブ */}
            {activeTab === 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>期間</InputLabel>
                    <Select
                      value={timeRange}
                      label="期間"
                      onChange={handleTimeRangeChange}
                      size="small"
                    >
                      <MenuItem value="week">週間</MenuItem>
                      <MenuItem value="month">月間</MenuItem>
                      <MenuItem value="year">年間</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 350 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        販売数推移
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar data={getSalesChartData()} options={chartOptions} />
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 350 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        売上金額推移
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar data={getRevenueChartData()} options={chartOptions} />
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        売上サマリー
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="primary">
                              {salesData[timeRange].sales.reduce((a, b) => a + b, 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              総販売数
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="primary">
                              ¥{salesData[timeRange].revenue.reduce((a, b) => a + b, 0).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              総売上金額
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="primary">
                              ¥{Math.round(salesData[timeRange].revenue.reduce((a, b) => a + b, 0) / salesData[timeRange].sales.reduce((a, b) => a + b, 0)).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              平均販売価格
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}
            
            {/* 比較分析タブ */}
            {activeTab === 1 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>期間</InputLabel>
                    <Select
                      value={timeRange}
                      label="期間"
                      onChange={handleTimeRangeChange}
                      size="small"
                    >
                      <MenuItem value="week">週間</MenuItem>
                      <MenuItem value="month">月間</MenuItem>
                      <MenuItem value="year">年間</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Paper sx={{ p: 2, mb: 3, height: 400 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    同カテゴリ商品との販売数比較
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <Line data={getComparisonChartData()} options={chartOptions} />
                  </Box>
                </Paper>
                
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    比較サマリー
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          カテゴリ内シェア
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {salesData.popularity.percentageOfSales}%
                        </Typography>
                        <Typography variant="body2">
                          カテゴリ内ランキング: {salesData.popularity.categoryRank}位
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          全体ランキング
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {salesData.popularity.rank}位
                        </Typography>
                        <Typography variant="body2">
                          総販売数: {salesData.popularity.totalSold}個
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          顧客評価
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {salesData.popularity.customerRating}/5.0
                        </Typography>
                        <Typography variant="body2">
                          レビュー数: 42件
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            )}
            
            {/* 人気度タブ */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 350 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      よく一緒に注文される商品
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Pie data={getPairingChartData()} options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            ...chartOptions.plugins.legend,
                            position: 'bottom'
                          }
                        }
                      }} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 350 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      人気度指標
                    </Typography>
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">全体ランキング:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold">{salesData.popularity.rank}位</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">カテゴリ内ランキング:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold">{salesData.popularity.categoryRank}位</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">総販売数:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold">{salesData.popularity.totalSold}個</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">総売上金額:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold">¥{salesData.popularity.totalRevenue.toLocaleString()}</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">カテゴリ内シェア:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold">{salesData.popularity.percentageOfSales}%</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">顧客評価:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight="bold">{salesData.popularity.customerRating}/5.0</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      おすすめアクション
                    </Typography>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" paragraph>
                        • このメニュー項目は人気が高く、特に「味噌汁」と一緒に注文されることが多いです。セット販売を検討すると売上増加が見込めます。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • 顧客評価が高いため、おすすめメニューとして前面に押し出すことで、さらなる売上増加が期待できます。
                      </Typography>
                      <Typography variant="body2">
                        • 季節限定メニューとして提供されていますが、人気が高いため、通年メニューへの変更を検討してもよいでしょう。
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuSalesAnalysisDialog;
