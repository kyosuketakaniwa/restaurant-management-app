import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Alert,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip as MuiTooltip,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';

// ダッシュボード用コンポーネントのインポート
import SalesSummary from '../components/dashboard/SalesSummary';
import BudgetActualChart from '../components/dashboard/BudgetActualChart';
import ReservationSummary from '../components/dashboard/ReservationSummary';
import TaskShiftSummary from '../components/dashboard/TaskShiftSummary';
import InventoryAlert from '../components/dashboard/InventoryAlert';

// ユーティリティのインポート
import moment from 'moment/moment';
import 'moment/locale/ja'; // 日本語ロケール

// アイコンのインポート
import { 
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  EventAvailable as EventAvailableIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
  BarChart as BarChartIcon,
  CompareArrows as CompareArrowsIcon,
  AccountBalance as AccountBalanceIcon,
  Restaurant as RestaurantIcon,
  Business as BusinessIcon,
  LocalDining as LocalDiningIcon,
  WbSunny as WbSunnyIcon,
  Cloud as CloudIcon,
  Opacity as OpacityIcon
} from '@mui/icons-material';

// コンテキストのインポート
import { useFinance } from '../contexts/FinanceContext';

const Dashboard = () => {
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetPeriod, setTargetPeriod] = useState('today');
  
  // 各データの状態
  const [salesData, setSalesData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [shiftData, setShiftData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState({
    condition: 'sunny',
    temperature: 23,
    humidity: 45,
    description: '晴れ',
    windSpeed: 2.5,
    city: '東京',
    icon: '01d',
    date: new Date()
  });
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [previousYearData, setPreviousYearData] = useState({
    today: {
      sales: 85000, // 前年の同日の売上
      percentChange: 12.5 // 前年同日比（パーセント）
    },
    month: {
      sales: 2450000, // 前年の同月の売上
      percentChange: 8.7 // 前年同月比（パーセント）
    },
    year: {
      sales: 28500000, // 前年の同時点の年間売上
      percentChange: 5.2 // 前年同時点比（パーセント）
    }
  });
  const [storeComparisonData, setStoreComparisonData] = useState({
    current: { name: '本店', sales: 320000, customers: 85 },
    stores: [
      { id: 1, name: '渋谷店', sales: 280000, customers: 72, diff: -12.5 },
      { id: 2, name: '新宿店', sales: 350000, customers: 90, diff: 9.4 },
      { id: 3, name: '池袋店', sales: 310000, customers: 78, diff: -3.1 },
      { id: 4, name: '横浜店', sales: 290000, customers: 75, diff: -9.4 },
    ]
  });

  // コンテキストからデータを取得
  const { 
    budgets, 
    actuals, 
    financialReports, 
    loading: financeLoading,
    error: financeError
  } = useFinance();

  // 期間変更ハンドラー
  const handlePeriodChange = (event) => {
    setTargetPeriod(event.target.value);
  };

  // 天気情報取得関数
  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true);
      
      // 実装されるまではモックデータを使用
      setTimeout(() => {
        // モック天気データ
        const mockWeather = {
          condition: Math.random() > 0.7 ? 'cloudy' : Math.random() > 0.5 ? 'rainy' : 'sunny',
          temperature: Math.floor(Math.random() * 10) + 18, // 18-28度
          humidity: Math.floor(Math.random() * 20) + 40, // 40-60%
          description: Math.random() > 0.7 ? '曇り' : Math.random() > 0.5 ? '雨' : '晴れ',
          windSpeed: (Math.random() * 4 + 1).toFixed(1),
          city: '東京',
          icon: '01d',
          date: new Date()
        };

        setWeatherInfo(mockWeather);
        setWeatherLoading(false);
      }, 1000);
    } catch (error) {
      console.error('天気情報取得エラー:', error);
      setWeatherError('天気情報の取得に失敗しました');
      setWeatherLoading(false);
    }
  };

  // メニューページへのナビゲーション関数
  const navigateToPage = (path) => {
    window.location.href = path;
  };

  // データの初期化と更新
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 売上データの初期化（実際はAPIから取得）
        const mockSalesData = {
          todaySales: 458000,
          monthlySales: 12850000,
          weeklySales: [
            { label: '月', value: 350000 },
            { label: '火', value: 420000 },
            { label: '水', value: 380000 },
            { label: '木', value: 410000 },
            { label: '金', value: 520000 },
            { label: '土', value: 680000 },
            { label: '日', value: 458000 },
          ],
          comparisonData: {
            yesterday: { sales: 520000, change: -12 },
            lastWeek: { sales: 420000, change: 9 },
            lastMonth: { sales: 11750000, change: 9.4 }
          }
        };
        setSalesData(mockSalesData);

        // 予算実績データの処理
        if (financialReports && financialReports.budgetActual) {
          const { budgetActual } = financialReports;
          const budgetChartData = {
            categories: budgetActual.categories || [],
            monthly: {
              budget: budgetActual.month?.budget || 0,
              actual: budgetActual.month?.actual || 0,
              achievementRate: Math.round((budgetActual.month?.actual / budgetActual.month?.budget) * 100) || 0
            }
          };
          setBudgetData(budgetChartData);
        } else {
          // テストデータの生成
          const mockBudgetData = {
            categories: [
              { name: '料理', budget: 1200000, actual: 1350000 },
              { name: 'ドリンク', budget: 700000, actual: 620000 },
              { name: '人件費', budget: 900000, actual: 880000 },
              { name: '家賃', budget: 300000, actual: 300000 },
              { name: '光熱費', budget: 150000, actual: 170000 },
              { name: '消耗品', budget: 80000, actual: 110000 }
            ],
            monthly: {
              budget: 3330000,
              actual: 3430000,
              achievementRate: 103
            }
          };
          setBudgetData(mockBudgetData);
        }

        // 予約データの初期化（実際はAPIから取得）
        const mockReservationData = {
          totalReservations: 15,
          totalGuests: 42,
          upcomingReservations: [
            { id: 1, customerName: '田中様', time: '17:30', guestCount: 4, tableInfo: 'テーブル3', course: 'おまかせコース' },
            { id: 2, customerName: '佐藤様', time: '18:00', guestCount: 2, tableInfo: 'カウンター1-2', course: '季節のコース' },
            { id: 3, customerName: '鈴木様', time: '19:00', guestCount: 6, tableInfo: '個室1', course: 'プレミアムコース' },
            { id: 4, customerName: '伊藤様', time: '19:30', guestCount: 3, tableInfo: 'テーブル5' }
          ]
        };
        setReservationData(mockReservationData);

        // タスクデータの初期化（実際はAPIから取得）
        const mockTaskData = {
          totalTasks: 12,
          completedTasks: 8,
          completionRate: 67,
          upcomingTasks: [
            { id: 1, title: '食材発注', completed: true, assignee: '山田', dueTime: '13:00' },
            { id: 2, title: 'ワイン入荷確認', completed: false, assignee: '佐々木', dueTime: '15:00' },
            { id: 3, title: '特別メニュー準備', completed: false, assignee: '高橋', dueTime: '16:00' },
            { id: 4, title: 'スタッフミーティング', completed: false, dueTime: '17:00' }
          ]
        };
        setTaskData(mockTaskData);

        // シフトデータの初期化（実際はAPIから取得）
        const mockShiftData = {
          currentStaff: [
            { id: 1, name: '山田', role: 'シェフ' },
            { id: 2, name: '佐々木', role: 'サービス' },
            { id: 3, name: '高橋', role: 'バーテンダー' },
            { id: 4, name: '田中', role: 'サービス' }
          ],
          nextShift: {
            time: '17:00 - 22:00',
            staff: [
              { id: 5, name: '鈴木', role: 'サービス' },
              { id: 6, name: '伊藤', role: 'シェフ' },
              { id: 7, name: '渡辺', role: 'キッチン' }
            ]
          }
        };
        setShiftData(mockShiftData);
        
        // 在庫アラートデータの初期化（実際はAPIから取得）
        const mockInventoryData = {
          lowStockItems: [
            { 
              id: 1, 
              name: '和牛ヒレ肉', 
              currentStock: 2.5, 
              minimumStock: 5, 
              unit: 'kg', 
              priority: 'high', 
              category: '食材',
              supplier: '山田食品'
            },
            { 
              id: 2, 
              name: '白ワイン', 
              currentStock: 6, 
              minimumStock: 10, 
              unit: '本', 
              priority: 'medium', 
              category: 'ドリンク',
              supplier: '鈴木酒店'
            },
            { 
              id: 3, 
              name: '常陸米', 
              currentStock: 15, 
              minimumStock: 20, 
              unit: 'kg', 
              priority: 'low', 
              category: '食材',
              supplier: '伊藤米店'
            },
            { 
              id: 4, 
              name: '大葉ニンニク', 
              currentStock: 0.2, 
              minimumStock: 0.5, 
              unit: 'kg', 
              priority: 'high', 
              category: '食材'
            },
            { 
              id: 5, 
              name: 'クラフトビール', 
              currentStock: 5, 
              minimumStock: 12, 
              unit: '本', 
              priority: 'medium', 
              category: 'ドリンク', 
              supplier: '横浜ビール工房'
            }
          ]
        };
        setInventoryData(mockInventoryData);

        setIsLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('データの取得中にエラーが発生しました。');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [financialReports]);

  // ローディング表示
  if (isLoading || financeLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>データを読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  // エラー表示
  if (error || financeError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || financeError || 'エラーが発生しました。再読み込みをお試しください。'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ヘッダー部分 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ダッシュボード
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="period-select-label">期間</InputLabel>
          <Select
            labelId="period-select-label"
            id="period-select"
            value={targetPeriod}
            label="期間"
            onChange={handlePeriodChange}
            size="small"
          >
            <MenuItem value="today">本日</MenuItem>
            <MenuItem value="week">今週</MenuItem>
            <MenuItem value="month">今月</MenuItem>
            <MenuItem value="year">今年</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* 天気と日付情報 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" fontWeight="medium">
                  {weatherInfo.date.getFullYear()}年{weatherInfo.date.getMonth() + 1}月{weatherInfo.date.getDate()}日 
                  {['日', '月', '火', '水', '木', '金', '土'][weatherInfo.date.getDay()]}曜日
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MuiTooltip title="本店地域の天気">
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'primary.light', 
                    color: 'white', 
                    px: 2, 
                    py: 1, 
                    borderRadius: 2 
                  }}>
                    {weatherLoading ? (
                      <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                    ) : (
                      <>
                        {weatherInfo.condition === 'sunny' && <WbSunnyIcon sx={{ mr: 1 }} />}
                        {weatherInfo.condition === 'cloudy' && <CloudIcon sx={{ mr: 1 }} />}
                        {weatherInfo.condition === 'rainy' && <OpacityIcon sx={{ mr: 1 }} />}
                      </>
                    )}
                    <Typography variant="body1" fontWeight="medium">
                      {weatherInfo.city && `${weatherInfo.city} - `}
                      {weatherInfo.description && `${weatherInfo.description} - `}
                      {weatherInfo.temperature}°C / 湿度 {weatherInfo.humidity}%
                    </Typography>
                  </Box>
                </MuiTooltip>
                <Button 
                  onClick={fetchWeatherData} 
                  color="primary" 
                  size="small" 
                  disabled={weatherLoading}
                  sx={{ ml: 1, minWidth: 0, p: 1 }}
                >
                  <RefreshIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* メインコンテンツ */}
      <Grid container spacing={3}>
        {/* 売上概要 */}
        <Grid item xs={12} md={6}>
          <SalesSummary salesData={salesData} isLoading={isLoading} />
        </Grid>

        {/* 予算実績比較 */}
        <Grid item xs={12} md={6}>
          <BudgetActualChart budgetData={budgetData} isLoading={isLoading} />
        </Grid>

        {/* 予約情報 */}
        <Grid item xs={12} md={6}>
          <ReservationSummary reservationData={reservationData} isLoading={isLoading} />
        </Grid>

        {/* タスク・シフト情報 */}
        <Grid item xs={12} md={6}>
          <TaskShiftSummary taskData={taskData} shiftData={shiftData} isLoading={isLoading} />
        </Grid>
        
        {/* 在庫アラート */}
        <Grid item xs={12}>
          <InventoryAlert inventoryData={inventoryData} isLoading={isLoading} />
        </Grid>


      </Grid>

      {/* フッターノート */}
      <Box sx={{ mt: 6, mb: 2, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body2" color="textSecondary">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
