import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import BudgetActualComparison from '../components/dashboard/BudgetActualComparison';
import ReservationInfo from '../components/dashboard/ReservationInfo';
import ShiftAndTaskInfo from '../components/dashboard/ShiftAndTaskInfo';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [todaySales, setTodaySales] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [yearlySales, setYearlySales] = useState(0);
  const [targetPeriod, setTargetPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [weeklySales, setWeeklySales] = useState([]);
  const [settings, setSettings] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [budgetActual, setBudgetActual] = useState(null);
  const [reservationStats, setReservationStats] = useState({
    totalReservations: 0,
    completedReservations: 0,
    pendingReservations: 0,
    cancelledReservations: 0,
    reservationsByHour: {}
  });

  // モックデータ - 実際のシステムではAPIから取得
  const todayShifts = [
    { id: 1, staffName: '山田 太郎', position: 'キッチンスタッフ', time: '10:00 - 18:00' },
    { id: 2, staffName: '佐藤 花子', position: 'ホールスタッフ', time: '17:00 - 22:00' },
    { id: 3, staffName: '鈴木 一郎', position: 'マネージャー', time: '9:00 - 18:00' }
  ];

  const tasksForToday = [
    { id: 1, title: '仕入れ発注確認', assignee: '鈴木 一郎', status: 'completed', priority: 'high' },
    { id: 2, title: '新メニュー試作', assignee: '山田 太郎', status: 'inProgress', priority: 'medium' },
    { id: 3, title: 'テーブル配置変更', assignee: '佐藤 花子', status: 'pending', priority: 'low' }
  ];

  const inventoryAlerts = [
    { id: 1, name: '米', quantity: 5, unit: 'kg', threshold: 10 },
    { id: 2, name: '牛肉', quantity: 2, unit: 'kg', threshold: 3 },
    { id: 3, name: 'ビール', quantity: 12, unit: '本', threshold: 20 }
  ];

  // ダッシュボードデータの取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 実際のシステムではAPIからデータを取得
        // 以下はモックデータ
        const mockData = {
          todaySales: 154200,
          monthlySales: 3650000,
          yearlySales: 42800000,
          monthlyBudget: 4000000,
          yearlyBudget: 45000000,
          lastYearSameDaySales: 142500,
          lastMonthSamePeriodSales: 3450000,
          lastYearSamePeriodSales: 40200000,
          weeklySales: [128000, 145000, 132000, 148000, 154200, 0, 0]
        };

        // カテゴリー別の予算と実績データ
        const mockBudgetActual = {
          month: {
            budget: 4000000,
            actual: 3650000,
            lastYear: 3450000
          },
          year: {
            budget: 45000000,
            actual: 42800000,
            lastYear: 40200000
          },
          categories: [
            { name: '食事', budget: 2200000, actual: 1980000 },
            { name: 'ドリンク', budget: 1000000, actual: 1120000 },
            { name: 'デザート', budget: 500000, actual: 385000 },
            { name: 'テイクアウト', budget: 300000, actual: 165000 }
          ]
        };
        
        setSummaryData(mockData);
        setTodaySales(mockData.todaySales);
        setMonthlySales(mockData.monthlySales);
        setYearlySales(mockData.yearlySales);
        setWeeklySales(mockData.weeklySales);
        setBudgetActual(mockBudgetActual);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReservationData = async () => {
      try {
        // モック予約データ
        const mockReservationStats = {
          totalReservations: 18,
          completedReservations: 5,
          pendingReservations: 12,
          cancelledReservations: 1,
          reservationsByHour: {
            '12': 3,
            '13': 4,
            '18': 6,
            '19': 4,
            '20': 1
          }
        };
        
        setReservationStats(mockReservationStats);
      } catch (error) {
        console.error("Failed to fetch reservation data:", error);
      }
    };
    
    fetchDashboardData();
    fetchReservationData();
  }, []);
  
  // 設定の取得
  useEffect(() => {
    // モック設定データ
    const mockSettings = {
      storeInfo: {
        name: '和食レストラン 匠',
        address: '東京都新宿区新宿1-1-1',
        phone: '03-1234-5678',
      }
    };
    
    setSettings(mockSettings);
  }, []);
  
  // 天気情報の取得
  const fetchWeatherData = async () => {
    try {
      // 実際のシステムでは天気APIを使用
      // モックデータ
      const mockWeatherData = {
        current: {
          temp: 22,
          humidity: 65,
          condition: '晴れ時々曇り'
        }
      };
      
      setWeather(mockWeatherData);
      setWeatherIcon('☀️');
      
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }
  };
  
  // 設定が読み込まれたら天気情報を取得
  useEffect(() => {
    if (settings?.storeInfo?.address) {
      fetchWeatherData();
    }
  }, [settings]);

  // 優先度による色を取得
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'success.main';
      default:
        return 'grey.500';
    }
  };
  
  // ステータスによる色を取得(タスクや注文など共通で使用)
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'inProgress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // ステータスのテキスト表示を取得
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'inProgress':
        return '進行中';
      case 'pending':
        return '未着手';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '不明';
    }
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          データを読み込んでいます...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        管理システムダッシュボード
      </Typography>
      
      {/* 概要カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              本日の売上
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              ¥{todaySales.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Typography 
                variant="body2" 
                color={(todaySales - summaryData.lastYearSameDaySales) > 0 ? 'success.main' : 'error.main'}
              >
                前年比: {((todaySales / summaryData.lastYearSameDaySales) * 100 - 100).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              当月累計売上
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              ¥{monthlySales.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Typography 
                variant="body2" 
                color={(monthlySales - summaryData.monthlyBudget) > 0 ? 'success.main' : 'error.main'}
              >
                目標: {((monthlySales / summaryData.monthlyBudget) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              年間累計売上
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              ¥{yearlySales.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Typography 
                variant="body2" 
                color={(yearlySales - summaryData.yearlyBudget) > 0 ? 'success.main' : 'error.main'}
              >
                目標: {((yearlySales / summaryData.yearlyBudget) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              本日の天気
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {weather ? (
                <>
                  <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                    {weatherIcon}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {weather.current.temp}°C
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {weather.current.condition}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  天気情報を取得中...
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 売上グラフ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 0, 
              overflow: 'hidden', 
              borderRadius: 2 
            }}
          >
            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: (theme) => theme.shape.borderRadius * 2,
              borderTopRightRadius: (theme) => theme.shape.borderRadius * 2
            }}>
              <Typography variant="h6" fontWeight="medium">
                売上・予実分析
              </Typography>
              <FormControl size="small" variant="outlined" sx={{ minWidth: 120, bgcolor: 'white', borderRadius: 1 }}>
                <Select
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value)}
                  sx={{ color: 'primary.main', height: 32 }}
                >
                  <MenuItem value="today">本日</MenuItem>
                  <MenuItem value="week">今週</MenuItem>
                  <MenuItem value="month">今月</MenuItem>
                  <MenuItem value="year">今年</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* 本日の売上 */}
                <Grid item xs={12} md={4}>
                  <Card elevation={2} sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 3, bgcolor: 'rgba(173,216,230,0.08)' }}>
                    <CardHeader
                      title="本日の売上"
                      titleTypographyProps={{ variant: 'subtitle1', color: 'primary' }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                        ¥{todaySales.toLocaleString()}
                      </Typography>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          前年同日比:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ fontWeight: 'medium' }}
                          color={(todaySales - summaryData.lastYearSameDaySales) > 0 ? 'success.main' : 'error.main'}
                        >
                          {(todaySales - summaryData.lastYearSameDaySales) > 0 ? '+' : ''}
                          {((todaySales / summaryData.lastYearSameDaySales) * 100 - 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">
                          前日比:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ fontWeight: 'medium' }}
                          color="success.main"
                        >
                          +5.2%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 月間累計売上 */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 182, 193, 0.1)' }}>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                      当月累計売上
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        ¥{monthlySales.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          bgcolor: 'error.light', 
                          color: 'white', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        目標まで: ¥{(summaryData.monthlyBudget - monthlySales).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="body2" 
                        color={(monthlySales - summaryData.lastMonthSamePeriodSales) > 0 ? 'success.main' : 'error.main'}
                      >
                        前月同期比: {((monthlySales / summaryData.lastMonthSamePeriodSales) * 100 - 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    {budgetActual?.month && (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" color="textSecondary">
                            当月目標達成率:
                          </Typography>
                          <Typography variant="body2">
                            {Math.round((budgetActual.month.actual / budgetActual.month.budget) * 100)}%
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                          <Box 
                            sx={{ 
                              width: `${Math.min(100, Math.round((budgetActual.month.actual / budgetActual.month.budget) * 100))}%`, 
                              bgcolor: budgetActual.month.actual >= budgetActual.month.budget ? 'success.main' : 'primary.main',
                              height: 8,
                              borderRadius: 4
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        予算:
                      </Typography>
                      <Typography variant="body2">
                        ¥{summaryData.monthlyBudget.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* 年間累計売上 */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(144, 238, 144, 0.1)' }}>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                      年間累計売上
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        ¥{yearlySales.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          bgcolor: 'warning.light', 
                          color: 'white', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        進捗率: {Math.round((yearlySales / summaryData.yearlyBudget) * 100)}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="body2" 
                        color={(yearlySales - summaryData.lastYearSamePeriodSales) > 0 ? 'success.main' : 'error.main'}
                      >
                        前年同期比: {((yearlySales / summaryData.lastYearSamePeriodSales) * 100 - 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    {budgetActual?.year && (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" color="textSecondary">
                            年間目標達成率:
                          </Typography>
                          <Typography variant="body2">
                            {Math.round((budgetActual.year.actual / budgetActual.year.budget) * 100)}%
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                          <Box 
                            sx={{ 
                              width: `${Math.min(100, Math.round((budgetActual.year.actual / budgetActual.year.budget) * 100))}%`, 
                              bgcolor: 'primary.main',
                              height: 8,
                              borderRadius: 4
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        年間予算:
                      </Typography>
                      <Typography variant="body2">
                        ¥{summaryData.yearlyBudget.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* 予算実績比較コンポーネント */}
                <BudgetActualComparison budgetActual={budgetActual} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 予約情報 */}
      <ReservationInfo reservationStats={reservationStats} />
      
      {/* シフトとタスク情報 */}
      <ShiftAndTaskInfo 
        todayShifts={todayShifts}
        tasksForToday={tasksForToday}
        inventoryAlerts={inventoryAlerts}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        getPriorityColor={getPriorityColor}
      />
    </Container>
  );
};

export default Dashboard;
