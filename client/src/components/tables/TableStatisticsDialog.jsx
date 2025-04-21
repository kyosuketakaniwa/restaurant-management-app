import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Divider,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  LinearProgress,
  useTheme
} from '@mui/material';
import { 
  Close as CloseIcon,
  ShowChart as ShowChartIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

/**
 * テーブル利用統計ダイアログ
 * テーブルの利用統計データを表示するコンポーネント
 */

// 数値フォーマット用ヘルパー関数
const formatNumber = (value, type) => {
  if (type === 'percent') {
    return `${(value * 100).toFixed(1)}%`;
  }
  return value.toFixed(1);
};

const TableStatisticsDialog = ({ open, onClose, table, reservations }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  
  // モック統計データ
  const [statistics, setStatistics] = useState(null);
  
  // 統計データを時間範囲に基づいて取得
  useEffect(() => {
    if (!open || !table) return;
    
    setLoading(true);
    
    // 実際のアプリではここでAPIを呼び出し
    setTimeout(() => {
      // モックデータ生成
      const mockData = generateMockStatistics(table, timeRange);
      setStatistics(mockData);
      setLoading(false);
    }, 800);
  }, [open, table, timeRange]);
  
  // モック統計データを生成
  const generateMockStatistics = (table, range) => {
    // 日付範囲の作成
    const dates = [];
    const now = new Date();
    let startDate;
    
    switch (range) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        for (let i = 0; i < 24; i++) {
          const date = new Date(startDate);
          date.setHours(i);
          dates.push(date);
        }
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          dates.push(date);
        }
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 0; i < daysInMonth; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          dates.push(date);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          dates.push(date);
        }
    }
    
    // 利用データの生成
    const usageData = dates.map(date => {
      // 日付に基づくランダムなデータ
      const seed = date.getDate() + date.getMonth() * 10;
      
      // 使用回数 (1日あたり0〜8回)
      const usageCount = Math.floor(Math.random() * 8);
      
      // 平均使用時間 (60〜120分)
      const avgUsageTime = 60 + Math.floor(Math.random() * 60);
      
      // 平均客数 (1〜テーブルの座席数)
      const avgCustomers = 1 + Math.floor(Math.random() * table.seats);
      
      // 売上 (客数 × 1500〜3000円)
      const sales = avgCustomers * (1500 + Math.floor(Math.random() * 1500));
      
      // 回転率 (1日当たりの使用回数 / 営業時間中の最大可能利用回数)
      // 営業時間を10時間、平均利用時間を90分と仮定
      const maxPossibleUsage = (10 * 60) / 90;
      const turnoverRate = usageCount / maxPossibleUsage;
      
      return {
        date: date,
        formattedDate: range === 'day' 
          ? date.toLocaleTimeString('ja-JP', { hour: '2-digit' }) + '時'
          : date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        usageCount: usageCount,
        avgUsageTime: avgUsageTime,
        avgCustomers: avgCustomers,
        sales: sales,
        turnoverRate: turnoverRate
      };
    });
    
    // 稼働率の計算（使用時間の合計 / 営業時間）
    const totalUsageTime = usageData.reduce((total, day) => total + (day.usageCount * day.avgUsageTime), 0);
    const totalOperatingHours = range === 'day' ? 24 * 60 : (range === 'week' ? 7 * 10 * 60 : 30 * 10 * 60);
    const occupancyRate = Math.min(1, totalUsageTime / totalOperatingHours);
    
    // 平均値の計算
    const totalUsageCount = usageData.reduce((total, day) => total + day.usageCount, 0);
    const avgUsageTimeAll = usageData.reduce((total, day) => total + (day.usageCount * day.avgUsageTime), 0) / 
                        Math.max(1, totalUsageCount);
    const avgCustomersAll = usageData.reduce((total, day) => total + (day.usageCount * day.avgCustomers), 0) / 
                        Math.max(1, totalUsageCount);
    const totalSales = usageData.reduce((total, day) => total + day.sales, 0);
    const avgTurnoverRate = usageData.reduce((total, day) => total + day.turnoverRate, 0) / usageData.length;
    
    // 時間帯別の利用状況
    const timeDistribution = [
      { time: '朝（6-11時）', count: Math.floor(Math.random() * 10) },
      { time: '昼（11-14時）', count: Math.floor(Math.random() * 20) + 10 },
      { time: '午後（14-17時）', count: Math.floor(Math.random() * 10) + 5 },
      { time: '夕方（17-20時）', count: Math.floor(Math.random() * 15) + 10 },
      { time: '夜（20-23時）', count: Math.floor(Math.random() * 10) + 5 }
    ];
    
    // 曜日別の利用状況
    const dayOfWeekDistribution = [
      { day: '月', count: Math.floor(Math.random() * 10) + 2 },
      { day: '火', count: Math.floor(Math.random() * 10) + 2 },
      { day: '水', count: Math.floor(Math.random() * 10) + 5 },
      { day: '木', count: Math.floor(Math.random() * 10) + 5 },
      { day: '金', count: Math.floor(Math.random() * 15) + 10 },
      { day: '土', count: Math.floor(Math.random() * 20) + 15 },
      { day: '日', count: Math.floor(Math.random() * 15) + 10 }
    ];
    
    return {
      usageData,
      summary: {
        totalUsageCount,
        avgUsageTimeAll,
        avgCustomersAll,
        totalSales,
        avgTurnoverRate,
        occupancyRate
      },
      timeDistribution,
      dayOfWeekDistribution
    };
  };
  
  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 時間範囲変更ハンドラー
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // 数値のフォーマット
  const formatNumber = (value, type) => {
    switch (type) {
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'time':
        return `${value.toFixed(0)}分`;
      case 'money':
        return `${value.toLocaleString()}円`;
      case 'decimal':
        return value.toFixed(2);
      default:
        return value.toLocaleString();
    }
  };
  
  if (!table || !open) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShowChartIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {table.name} の利用統計
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel id="time-range-label">期間</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="期間"
              >
                <MenuItem value="day">今日</MenuItem>
                <MenuItem value="week">先週</MenuItem>
                <MenuItem value="month">今月</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 4 }}>
            <Typography align="center" gutterBottom>データを読み込んでいます...</Typography>
            <LinearProgress />
          </Box>
        ) : statistics ? (
          <Box>
            {/* 概要カード */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      稼働率
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                      <Typography variant="h4" component="div" color="primary">
                        {formatNumber(statistics.summary.occupancyRate, 'percent')}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={statistics.summary.occupancyRate * 100}
                      sx={{ mt: 1, mb: 0.5, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      利用可能時間に対する稼働時間の割合
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      回転率
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                      <Typography variant="h4" component="div" color="success.main">
                        {formatNumber(statistics.summary.avgTurnoverRate, 'decimal')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        回/日
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, statistics.summary.avgTurnoverRate * 50)}
                      color="success"
                      sx={{ mt: 1, mb: 0.5, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      1日当たりの平均利用回数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      平均利用時間
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                      <Typography variant="h4" component="div" color="info.main">
                        {formatNumber(statistics.summary.avgUsageTimeAll, 'time')}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (statistics.summary.avgUsageTimeAll / 180) * 100)}
                      color="info"
                      sx={{ mt: 1, mb: 0.5, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      1回あたりの平均滞在時間
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      売上貢献
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                      <Typography variant="h4" component="div" color="error.main">
                        {formatNumber(statistics.summary.totalSales, 'money')}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={100}
                      color="error"
                      sx={{ mt: 1, mb: 0.5, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      期間内の総売上
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* タブ */}
            <Box sx={{ mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="利用推移" icon={<TrendingUpIcon />} iconPosition="start" />
                <Tab label="時間帯別" icon={<AccessTimeIcon />} iconPosition="start" />
                <Tab label="曜日別" icon={<CalendarIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* 利用推移 - 簡素な表示に置き換え */}
            {tabValue === 0 && (
              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    利用回数と回転率
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      期間内の利用データ
                    </Typography>
                    
                    {/* 簡素な表形式のデータ表示 */}
                    <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center" fontWeight="bold">日付</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center" fontWeight="bold">利用回数</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center" fontWeight="bold">回転率</Typography>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      {statistics.usageData.map((item, index) => (
                        <Box key={index}>
                          <Grid container spacing={1} sx={{ py: 1 }}>
                            <Grid item xs={4}>
                              <Typography variant="body2" align="center">{item.formattedDate}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" align="center">{item.usageCount}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" align="center" 
                                color={item.turnoverRate > 0.5 ? 'success.main' : 'text.primary'}
                              >
                                {formatNumber(item.turnoverRate, 'percent')}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Divider sx={{ my: 0.5 }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
                
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    平均利用時間と顧客数
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      各日の利用時間と顧客数
                    </Typography>
                    
                    <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center" fontWeight="bold">日付</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center" fontWeight="bold">平均利用時間</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" align="center" fontWeight="bold">平均顧客数</Typography>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      {statistics.usageData.map((item, index) => (
                        <Box key={index}>
                          <Grid container spacing={1} sx={{ py: 1 }}>
                            <Grid item xs={4}>
                              <Typography variant="body2" align="center">{item.formattedDate}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" align="center">{item.avgUsageTime}分</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" align="center">{item.avgCustomers}人</Typography>
                            </Grid>
                          </Grid>
                          <Divider sx={{ my: 0.5 }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
            
            {/* 時間帯別 - 簡素な表示に置き換え */}
            {tabValue === 1 && (
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    時間帯別の利用状況
                  </Typography>
                  
                  {/* 簡素な表形式の時間帯データ */}
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Grid container spacing={2}>
                      {statistics.timeDistribution.map((item, index) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" sx={{ minWidth: 150 }}>
                              {item.time}
                            </Typography>
                            <Box sx={{ flexGrow: 1, mr: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(100, (item.count / 20) * 100)}
                                sx={{ height: 10, borderRadius: 5 }}
                                color="primary"
                              />
                            </Box>
                            <Typography variant="body2">
                              {item.count}回
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    このデータを活用して、特定の時間帯のプロモーション、価格設定、または人員配置に役立てることができます。
                  </Typography>
                </Paper>
              </Box>
            )}
            
            {/* 曜日別 - 簡素な表示に置き換え */}
            {tabValue === 2 && (
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    曜日別の利用状況
                  </Typography>
                  
                  {/* 簡素な表形式の曜日別データ */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <Grid container spacing={2} sx={{ maxWidth: 500 }}>
                      {statistics.dayOfWeekDistribution.map((item, index) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" sx={{ width: 50, fontWeight: 'bold' }}>
                              {item.day}曜
                            </Typography>
                            <Box sx={{ flexGrow: 1, mx: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(100, (item.count / Math.max(...statistics.dayOfWeekDistribution.map(d => d.count))) * 100)}
                                sx={{ height: 12, borderRadius: 6 }}
                                color={index === 5 || index === 6 ? "error" : "success"} // 土日は別色
                              />
                            </Box>
                            <Typography variant="body2" sx={{ width: 50, textAlign: 'right' }}>
                              {item.count}回
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="subtitle1" color="primary">
                      最も利用が多いのは <b>{statistics.dayOfWeekDistribution.reduce((max, item) => 
                        max.count > item.count ? max : item, { count: 0 }).day}曜日</b>
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    曜日別の利用パターンに基づいて、人員配置や在庫管理、特別イベントを計画することで、効率性を向上させることができます。
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">
              データの読み込みに失敗しました。もう一度お試しください。
            </Typography>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={() => setLoading(true)}
              sx={{ mt: 2 }}
            >
              再読み込み
            </Button>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableStatisticsDialog;
