import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import GetAppIcon from '@mui/icons-material/GetApp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import moment from 'moment';
import { useFinance } from '../contexts/FinanceContext';

const FinancialReports = () => {
  const { 
    financialReports, 
    departments, 
    loading,
    updateFinancialReports
  } = useFinance();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((moment().month() + 1) / 3));
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [reportData, setReportData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // タブの切り替え
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 年の選択
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // 四半期の選択
  const handleQuarterChange = (event) => {
    setSelectedQuarter(event.target.value);
  };

  // 月の選択
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // レポートデータの取得
  useEffect(() => {
    setIsLoading(true);
    console.log('財務レポートデータ取得開始', { financialReports, activeTab, selectedYear, selectedMonth, selectedQuarter });
    
    try {
      // 財務レポートデータが存在するか確認
      if (!financialReports || !financialReports.monthly) {
        console.warn('財務レポートデータがまだ利用できません');
        setIsLoading(false);
        return;
      }
      
      let selectedReport = null;
      console.log('月次データ数:', financialReports.monthly.length);
      
      switch (activeTab) {
        case 0: // P/L
          if (financialReports.monthly && financialReports.monthly.length > 0) {
            // 選択した月のデータを取得
            selectedReport = financialReports.monthly.find(m => {
              const reportYear = moment(m.date).year();
              const reportMonth = moment(m.date).month();
              const match = reportYear === selectedYear && reportMonth === selectedMonth;
              return match;
            });
            
            if (!selectedReport && financialReports.monthly.length > 0) {
              // 一致するデータがない場合は、最新のデータを使用
              console.log('選択月のデータが見つからないため、最新データを使用します');
              selectedReport = financialReports.monthly[financialReports.monthly.length - 1];
            }
          } else if (financialReports.quarterly && financialReports.quarterly.length > 0) {
            // 月次データがない場合、四半期データを代替使用
            selectedReport = financialReports.quarterly[financialReports.quarterly.length - 1];
          } else if (financialReports.yearly) {
            // 月次と四半期データがない場合、年次データを使用
            selectedReport = financialReports.yearly;
          }
          
          if (selectedReport) {
            console.log('選択されたレポート:', selectedReport);
            
            // チャートデータの準備
            const chartData = departments.map(dept => {
              // 部門データが存在するか確認
              const deptData = selectedReport && selectedReport.departments && selectedReport.departments[dept.id] 
                ? selectedReport.departments[dept.id] 
                : { actual: 0, budget: 0, variance: 0, percentVariance: 0 };
              
              return {
                name: dept.name,
                予算: deptData.budget,
                実績: deptData.actual,
                差異: deptData.variance,
                departmentColor: dept.color
              };
            });
            
            setChartData(chartData);
          }
          break;
        case 1: // KPI
          if (financialReports && financialReports.kpis) {
            setKpiData(financialReports.kpis);
          } else {
            console.warn('KPIデータが存在しません');
            setKpiData(null);
          }
          break;
        default:
          break;
      }
      
      setReportData(selectedReport);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setErrorMessage('データ取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedYear, selectedQuarter, selectedMonth, financialReports, departments]);

  // 財務レポート更新
  const handleUpdateReports = () => {
    setIsLoading(true);
    console.log('財務レポートの更新を開始します');

    updateFinancialReports()
      .then(() => {
        console.log('財務レポートが正常に更新されました');
        setIsLoading(false);
      })
      .catch(err => {
        console.error('レポート更新エラー:', err);
        setErrorMessage('レポートの更新に失敗しました');
        setIsLoading(false);
      });
  };

  // 金額のフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  // パーセントのフォーマット
  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // KPI値のフォーマット
  const formatKpiValue = (kpi, value) => {
    switch (kpi) {
      case 'grossProfitMargin':
      case 'laborCostRatio':
      case 'foodCostRatio':
      case 'flRatio':
      case 'operatingMargin':
        return `${value.toFixed(1)}%`;
      case 'averageCheck':
        return formatCurrency(value);
      default:
        return value;
    }
  };

  // KPIの目標値（仮）
  const getKpiTarget = (kpi) => {
    switch (kpi) {
      case 'grossProfitMargin':
        return 70;
      case 'laborCostRatio':
        return 30;
      case 'foodCostRatio':
        return 30;
      case 'flRatio':
        return 60; // 食材費と人件費の合計は60%以下が目標
      case 'operatingMargin':
        return 15;
      case 'averageCheck':
        return 2500;
      default:
        return 0;
    }
  };

  // KPIの評価
  const evaluateKpi = (kpi, value) => {
    const target = getKpiTarget(kpi);
    
    switch (kpi) {
      case 'grossProfitMargin':
      case 'operatingMargin':
        return value >= target ? 'good' : 'bad';
      case 'laborCostRatio':
      case 'foodCostRatio':
      case 'flRatio':
        return value <= target ? 'good' : 'bad';
      case 'averageCheck':
        return value >= target ? 'good' : 'bad';
      default:
        return 'neutral';
    }
  };

  // KPI名の取得
  const getKpiName = (kpi) => {
    switch (kpi) {
      case 'grossProfitMargin':
        return '売上総利益率';
      case 'laborCostRatio':
        return '人件費率';
      case 'foodCostRatio':
        return '食材費率';
      case 'flRatio':
        return 'FL比率';
      case 'operatingMargin':
        return '営業利益率';
      case 'averageCheck':
        return '客単価';
      default:
        return kpi;
    }
  };

  // KPI説明の取得
  const getKpiDescription = (kpi) => {
    switch (kpi) {
      case 'grossProfitMargin':
        return '売上に対する原価を差し引いた粗利益の割合';
      case 'laborCostRatio':
        return '売上に対する人件費の割合';
      case 'foodCostRatio':
        return '売上に対する食材費の割合';
      case 'flRatio':
        return '売上に対する食材費と人件費の合計割合';
      case 'operatingMargin':
        return '売上に対する営業利益の割合';
      case 'averageCheck':
        return '1人あたりの平均消費額';
      default:
        return '';
    }
  };

  // 予算と実績の比較用のプログレスバー表示
  const renderComparisonBar = (actual, budget) => {
    const percentage = budget > 0 ? (actual / budget) * 100 : 0;
    const color = actual >= budget ? 'success.main' : 'error.main';
    
    return (
      <Box sx={{ width: '100%', mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">達成率: {percentage.toFixed(1)}%</Typography>
          <Typography variant="body2">
            {formatCurrency(actual)} / {formatCurrency(budget)}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(percentage, 100)} 
          color={actual >= budget ? 'success' : 'error'}
          sx={{ height: 8, borderRadius: 5 }}
        />
      </Box>
    );
  };

  // PLレポートの表示
  const renderPLReport = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!reportData) {
      return (
        <Alert severity="info">
          選択した期間のレポートデータがありません。
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table aria-label="profit loss table">
              <TableHead>
                <TableRow>
                  <TableCell>項目</TableCell>
                  <TableCell align="right">予算</TableCell>
                  <TableCell align="right">実績</TableCell>
                  <TableCell align="right">差異</TableCell>
                  <TableCell align="right">達成率</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* 収入 */}
                <TableRow sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
                  <TableCell component="th" scope="row">
                    <Typography fontWeight="bold">売上高</Typography>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(reportData.revenue.budget)}</TableCell>
                  <TableCell align="right">{formatCurrency(reportData.revenue.actual)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={reportData.revenue.variance >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {reportData.revenue.variance >= 0 ? '+' : ''}{formatCurrency(reportData.revenue.variance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={reportData.revenue.percentVariance >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {formatPercent(reportData.revenue.percentVariance)}
                    </Typography>
                  </TableCell>
                </TableRow>
                
                {/* 料理・ドリンク詳細 */}
                {['food', 'beverage'].map(deptId => {
                  const dept = departments.find(d => d.id === deptId);
                  const deptData = reportData.departments[deptId];
                  if (!dept || !deptData) return null;
                  
                  return (
                    <TableRow key={deptId}>
                      <TableCell component="th" scope="row" sx={{ pl: 4 }}>
                        {dept.name}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(deptData.budget)}</TableCell>
                      <TableCell align="right">{formatCurrency(deptData.actual)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          color={deptData.variance >= 0 ? 'success.main' : 'error.main'}
                          fontSize="0.875rem"
                        >
                          {deptData.variance >= 0 ? '+' : ''}{formatCurrency(deptData.variance)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={deptData.percentVariance >= 0 ? 'success.main' : 'error.main'}
                          fontSize="0.875rem"
                        >
                          {formatPercent(deptData.percentVariance)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {/* 経費 */}
                <TableRow sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
                  <TableCell component="th" scope="row">
                    <Typography fontWeight="bold">経費合計</Typography>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(reportData.expense.budget)}</TableCell>
                  <TableCell align="right">{formatCurrency(reportData.expense.actual)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={reportData.expense.variance <= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {reportData.expense.variance >= 0 ? '+' : ''}{formatCurrency(reportData.expense.variance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={reportData.expense.percentVariance <= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {formatPercent(reportData.expense.percentVariance)}
                    </Typography>
                  </TableCell>
                </TableRow>
                
                {/* 経費内訳 */}
                {['labor', 'rent', 'utilities', 'supplies', 'marketing', 'other'].map(deptId => {
                  const dept = departments.find(d => d.id === deptId);
                  const deptData = reportData.departments[deptId];
                  if (!dept || !deptData) return null;
                  
                  return (
                    <TableRow key={deptId}>
                      <TableCell component="th" scope="row" sx={{ pl: 4 }}>
                        {dept.name}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(deptData.budget)}</TableCell>
                      <TableCell align="right">{formatCurrency(deptData.actual)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          color={deptData.variance <= 0 ? 'success.main' : 'error.main'}
                          fontSize="0.875rem"
                        >
                          {deptData.variance >= 0 ? '+' : ''}{formatCurrency(deptData.variance)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={deptData.percentVariance <= 0 ? 'success.main' : 'error.main'}
                          fontSize="0.875rem"
                        >
                          {formatPercent(deptData.percentVariance)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {/* 営業利益 */}
                <TableRow sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                  <TableCell component="th" scope="row">
                    <Typography fontWeight="bold">営業利益</Typography>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(reportData.profit.budget)}</TableCell>
                  <TableCell align="right">{formatCurrency(reportData.profit.actual)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={reportData.profit.variance >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {reportData.profit.variance >= 0 ? '+' : ''}{formatCurrency(reportData.profit.variance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={reportData.profit.percentVariance >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {formatPercent(reportData.profit.percentVariance)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, boxShadow: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              予算vs実績比較
            </Typography>
            
            <TableContainer>
              <Table aria-label="budget vs actual comparison">
                <TableHead>
                  <TableRow>
                    <TableCell>項目</TableCell>
                    <TableCell align="right">達成状況</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chartData.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell component="th" scope="row">
                        {item.name}
                      </TableCell>
                      <TableCell align="right">
                        {renderComparisonBar(item.実績, item.予算)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // FL比率の詳細分析表示
  const renderFLAnalysis = () => {
    if (!kpiData || !kpiData.flRatio) {
      return null;
    }
    
    const flRatio = kpiData.flRatio;
    const foodCostRatio = kpiData.foodCostRatio;
    const laborCostRatio = kpiData.laborCostRatio;
    const flTarget = getKpiTarget('flRatio');
    
    return (
      <Paper sx={{ p: 3, mt: 3, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          FL比率詳細分析
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  現在のFL比率: {flRatio.toFixed(1)}%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      目標: {flTarget}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((flRatio / flTarget) * 100, 100)}
                      color={flRatio <= flTarget ? 'success' : 'error'}
                      sx={{ height: 10, mt: 1 }}
                    />
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    {flRatio <= flTarget ? 
                      <CheckCircleIcon color="success" /> : 
                      <WarningIcon color="error" />
                    }
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1">内訳:</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography>
                    食材費率: {foodCostRatio.toFixed(1)}%
                  </Typography>
                  <Typography>
                    人件費率: {laborCostRatio.toFixed(1)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  FL比率について
                </Typography>
                <List>
                  {flRatio > flTarget && (
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="FL比率が目標値を超えています" 
                        secondary="収益性向上のため、食材費または人件費の見直しを検討してください"
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="FL比率とは" 
                      secondary="売上に対する食材費と人件費の合計割合"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="改善策" 
                      secondary="メニューの見直し、履歴データに基づく発注量の最適化、勤務シフトの効率化を検討しましょう"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // KPIレポートの表示
  const renderKpiReport = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!kpiData) {
      return (
        <Alert severity="info">
          KPIデータがありません。
        </Alert>
      );
    }
    
    const kpiKeys = ['grossProfitMargin', 'laborCostRatio', 'foodCostRatio', 'flRatio', 'operatingMargin', 'averageCheck'];
    
    return (
      <Grid container spacing={3}>
        {kpiKeys.map(kpi => {
          const value = kpiData[kpi] || 0;
          const target = getKpiTarget(kpi);
          const evaluation = evaluateKpi(kpi, value);
          
          return (
            <Grid item xs={12} sm={6} md={3} key={kpi}>
              <Card sx={{ boxShadow: 3 }}>
                <CardHeader
                  title={getKpiName(kpi)}
                  titleTypographyProps={{ variant: 'h6' }}
                  action={
                    <IconButton aria-label="chart">
                      <ShowChartIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="div" fontWeight="bold" color={evaluation === 'good' ? 'success.main' : evaluation === 'bad' ? 'error.main' : 'text.primary'}>
                      {formatKpiValue(kpi, value)}
                    </Typography>
                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                      {evaluation === 'good' ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    目標: {formatKpiValue(kpi, target)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {getKpiDescription(kpi)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom>
              KPI推移
            </Typography>
            <TableContainer>
              <Table aria-label="kpi trends table">
                <TableHead>
                  <TableRow>
                    <TableCell>日付</TableCell>
                    <TableCell align="center">売上総利益率</TableCell>
                    <TableCell align="center">人件費率</TableCell>
                    <TableCell align="center">営業利益率</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* ダミーデータ表示（APIから取得する実際のデータで置き換える） */}
                  {[
                    { date: '2025/01', grossProfitMargin: 72.5, laborCostRatio: 28.3, operatingMargin: 16.8 },
                    { date: '2025/02', grossProfitMargin: 71.2, laborCostRatio: 29.1, operatingMargin: 15.5 },
                    { date: '2025/03', grossProfitMargin: 73.8, laborCostRatio: 27.5, operatingMargin: 17.2 }
                  ].map((row) => (
                    <TableRow key={row.date}>
                      <TableCell component="th" scope="row">
                        {row.date}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                          <Typography variant="body2" fontWeight="bold" color={row.grossProfitMargin >= 70 ? 'success.main' : 'error.main'}>
                            {row.grossProfitMargin}%
                          </Typography>
                          {row.grossProfitMargin >= 70 ? 
                            <TrendingUpIcon fontSize="small" color="success" /> : 
                            <TrendingDownIcon fontSize="small" color="error" />}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                          <Typography variant="body2" fontWeight="bold" color={row.laborCostRatio <= 30 ? 'success.main' : 'error.main'}>
                            {row.laborCostRatio}%
                          </Typography>
                          {row.laborCostRatio <= 30 ? 
                            <TrendingUpIcon fontSize="small" color="success" /> : 
                            <TrendingDownIcon fontSize="small" color="error" />}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                          <Typography variant="body2" fontWeight="bold" color={row.operatingMargin >= 15 ? 'success.main' : 'error.main'}>
                            {row.operatingMargin}%
                          </Typography>
                          {row.operatingMargin >= 15 ? 
                            <TrendingUpIcon fontSize="small" color="success" /> : 
                            <TrendingDownIcon fontSize="small" color="error" />}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          財務レポート
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            sx={{ mr: 1 }}
            disabled
          >
            PDF出力
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocalPrintshopIcon />}
            sx={{ mr: 1 }}
            disabled
          >
            印刷
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            disabled
          >
            Excelエクスポート
          </Button>
        </Box>
      </Box>
      
      {/* レポートタイプタブ */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
        >
          <Tab icon={<SsidChartIcon />} label="P/L分析" />
          <Tab icon={<TimelineIcon />} label="KPI分析" />
        </Tabs>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>年</InputLabel>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                label="年"
              >
                {[...Array(5)].map((_, i) => {
                  const year = moment().year() - 2 + i;
                  return (
                    <MenuItem key={year} value={year}>{year}年</MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            
            {activeTab === 0 && (
              <>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>月</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    label="月"
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i} value={i}>{i + 1}月</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
          
          <Button
            variant="contained"
            onClick={handleUpdateReports}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'レポート更新'}
          </Button>
        </Box>
      </Paper>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      
      {/* レポート内容 */}
      {activeTab === 0 ? renderPLReport() : renderKpiReport()}
    </Container>
  );
};

export default FinancialReports;
