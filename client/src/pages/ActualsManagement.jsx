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
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SyncIcon from '@mui/icons-material/Sync';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import moment from 'moment';
import { useFinance } from '../contexts/FinanceContext';

const ActualsManagement = () => {
  const { 
    budgets, 
    actuals, 
    departments, 
    createActual, 
    updateActual, 
    deleteActual, 
    loading,
    updateActualsFromSources
  } = useFinance();

  const [activePeriod, setActivePeriod] = useState(0);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((moment().month() + 1) / 3));
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [currentActuals, setCurrentActuals] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 期間タブの切り替え
  const handlePeriodChange = (event, newValue) => {
    setActivePeriod(newValue);
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

  // 実績データの取得
  useEffect(() => {
    let filteredActuals = [];
    let filteredBudgets = [];
    
    switch (activePeriod) {
      case 0: // 月次
        filteredActuals = actuals.filter(actual => {
          const actualDate = moment(actual.date);
          return actualDate.year() === selectedYear && actualDate.month() === selectedMonth;
        });
        
        filteredBudgets = budgets.filter(budget => {
          const budgetDate = moment(budget.date);
          return budgetDate.year() === selectedYear && budgetDate.month() === selectedMonth;
        });
        break;
      case 1: // 四半期
        const startMonth = (selectedQuarter - 1) * 3;
        const endMonth = startMonth + 2;
        
        filteredActuals = actuals.filter(actual => {
          const actualDate = moment(actual.date);
          return actualDate.year() === selectedYear && 
                 actualDate.month() >= startMonth && 
                 actualDate.month() <= endMonth;
        });
        
        filteredBudgets = budgets.filter(budget => {
          const budgetDate = moment(budget.date);
          return budgetDate.year() === selectedYear && 
                 budgetDate.month() >= startMonth && 
                 budgetDate.month() <= endMonth;
        });
        break;
      case 2: // 年次
        filteredActuals = actuals.filter(actual => {
          return moment(actual.date).year() === selectedYear;
        });
        
        filteredBudgets = budgets.filter(budget => {
          return moment(budget.date).year() === selectedYear;
        });
        break;
      default:
        break;
    }
    
    // 部門ごとの実績データを整形
    const deptActuals = departments.map(dept => {
      // 部門別の実績集計
      let totalAmount = 0;
      let actualItems = [];
      
      if (activePeriod === 0) { // 月次
        actualItems = filteredActuals.filter(a => 
          a.departmentId === dept.id && 
          moment(a.date).month() === selectedMonth
        );
        
        totalAmount = actualItems.reduce((sum, item) => sum + item.amount, 0);
      } else if (activePeriod === 1) { // 四半期
        const startMonth = (selectedQuarter - 1) * 3;
        const endMonth = startMonth + 2;
        
        actualItems = filteredActuals.filter(a => {
          const aDate = moment(a.date);
          return a.departmentId === dept.id && 
                 aDate.month() >= startMonth && 
                 aDate.month() <= endMonth;
        });
        
        totalAmount = actualItems.reduce((sum, item) => sum + item.amount, 0);
      } else { // 年次
        actualItems = filteredActuals.filter(a => 
          a.departmentId === dept.id && 
          moment(a.date).year() === selectedYear
        );
        
        totalAmount = actualItems.reduce((sum, item) => sum + item.amount, 0);
      }
      
      // 予算データの取得
      let budgetAmount = 0;
      
      if (activePeriod === 0) { // 月次
        const budgetItem = filteredBudgets.find(b => 
          b.departmentId === dept.id && 
          moment(b.date).month() === selectedMonth
        );
        
        budgetAmount = budgetItem ? budgetItem.amount : 0;
      } else if (activePeriod === 1) { // 四半期
        const startMonth = (selectedQuarter - 1) * 3;
        const endMonth = startMonth + 2;
        
        const budgetItems = filteredBudgets.filter(b => {
          const bDate = moment(b.date);
          return b.departmentId === dept.id && 
                 bDate.month() >= startMonth && 
                 bDate.month() <= endMonth;
        });
        
        budgetAmount = budgetItems.reduce((sum, item) => sum + item.amount, 0);
      } else { // 年次
        const budgetItems = filteredBudgets.filter(b => 
          b.departmentId === dept.id && 
          moment(b.date).year() === selectedYear
        );
        
        budgetAmount = budgetItems.reduce((sum, item) => sum + item.amount, 0);
      }
      
      // 差異計算
      const variance = totalAmount - budgetAmount;
      const percentVariance = budgetAmount !== 0 ? (variance / budgetAmount) * 100 : 0;
      
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        departmentColor: dept.color,
        amount: totalAmount,
        originalAmount: totalAmount,
        isEdited: false,
        items: actualItems,
        budgetAmount,
        variance,
        percentVariance
      };
    });
    
    setCurrentActuals(deptActuals);
  }, [activePeriod, selectedYear, selectedQuarter, selectedMonth, actuals, budgets, departments]);

  // 金額の変更を処理
  const handleAmountChange = (deptId, value) => {
    const numValue = value === '' ? 0 : Number(value);
    const updatedActuals = currentActuals.map(a => {
      if (a.departmentId === deptId) {
        const variance = numValue - a.budgetAmount;
        const percentVariance = a.budgetAmount !== 0 ? (variance / a.budgetAmount) * 100 : 0;
        
        return {
          ...a,
          amount: numValue,
          isEdited: numValue !== a.originalAmount,
          variance,
          percentVariance
        };
      }
      return a;
    });
    
    setCurrentActuals(updatedActuals);
  };

  // 編集モードの切り替え
  const toggleEditMode = () => {
    if (editMode) {
      // 編集モードを終了する際に変更をリセット
      const resetActuals = currentActuals.map(a => {
        const variance = a.originalAmount - a.budgetAmount;
        const percentVariance = a.budgetAmount !== 0 ? (variance / a.budgetAmount) * 100 : 0;
        
        return {
          ...a,
          amount: a.originalAmount,
          isEdited: false,
          variance,
          percentVariance
        };
      });
      setCurrentActuals(resetActuals);
    }
    setEditMode(!editMode);
  };

  // 実績データの保存
  const saveActuals = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // 変更された実績のみを更新
      const editedActuals = currentActuals.filter(a => a.isEdited);
      
      for (const actual of editedActuals) {
        let targetDate;
        
        if (activePeriod === 0) { // 月次
          targetDate = moment().year(selectedYear).month(selectedMonth).date(1).format('YYYY-MM-DD');
        } else if (activePeriod === 1) { // 四半期
          const startMonth = (selectedQuarter - 1) * 3;
          targetDate = moment().year(selectedYear).month(startMonth).date(1).format('YYYY-MM-DD');
        } else { // 年次
          targetDate = moment().year(selectedYear).month(0).date(1).format('YYYY-MM-DD');
        }
        
        const actualData = {
          date: targetDate,
          departmentId: actual.departmentId,
          period: activePeriod === 0 ? 'monthly' : activePeriod === 1 ? 'quarterly' : 'yearly',
          amount: actual.amount
        };
        
        // この実装では新規作成のみとする（更新は複雑になるため）
        await createActual(actualData);
      }
      
      setSuccessMessage('実績データが保存されました');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('実績データの保存中にエラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 実績データの自動集計
  const handleAutoGenerateActuals = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // 期間パラメータの生成
      let periodParams = {};
      
      if (activePeriod === 0) { // 月次
        const startOfMonth = moment().year(selectedYear).month(selectedMonth).startOf('month');
        const endOfMonth = moment().year(selectedYear).month(selectedMonth).endOf('month');
        
        periodParams = {
          type: 'monthly',
          year: selectedYear,
          month: selectedMonth,
          startDate: startOfMonth.format('YYYY-MM-DD'),
          endDate: endOfMonth.format('YYYY-MM-DD')
        };
      } else if (activePeriod === 1) { // 四半期
        const startMonth = (selectedQuarter - 1) * 3;
        const startOfQuarter = moment().year(selectedYear).month(startMonth).startOf('month');
        const endOfQuarter = moment().year(selectedYear).month(startMonth + 2).endOf('month');
        
        periodParams = {
          type: 'quarterly',
          year: selectedYear,
          quarter: selectedQuarter,
          startDate: startOfQuarter.format('YYYY-MM-DD'),
          endDate: endOfQuarter.format('YYYY-MM-DD')
        };
      } else { // 年次
        const startOfYear = moment().year(selectedYear).startOf('year');
        const endOfYear = moment().year(selectedYear).endOf('year');
        
        periodParams = {
          type: 'yearly',
          year: selectedYear,
          startDate: startOfYear.format('YYYY-MM-DD'),
          endDate: endOfYear.format('YYYY-MM-DD')
        };
      }
      
      // 自動集計機能を呼び出す
      await updateActualsFromSources(periodParams);
      
      setSuccessMessage('実績データが自動集計されました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('実績データの自動集計中にエラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 実績の削除
  const deleteActualItem = async (actualId) => {
    if (!actualId) return;
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      await deleteActual(actualId);
      
      setSuccessMessage('実績データが削除されました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('実績データの削除中にエラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 合計の計算
  const calculateTotal = (property = 'amount') => {
    return currentActuals.reduce((sum, actual) => sum + actual[property], 0);
  };

  // 金額のフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  // パーセントのフォーマット
  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // 差異に基づく色を取得
  const getVarianceColor = (variance, isPercent = false) => {
    if (isPercent) {
      if (variance > 5) return 'success.main';
      if (variance < -5) return 'error.main';
      return 'text.secondary';
    } else {
      if (variance > 0) return 'success.main';
      if (variance < 0) return 'error.main';
      return 'text.secondary';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        実績管理
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ mr: 2, mb: 1 }}>
              <Tabs value={activePeriod} onChange={handlePeriodChange}>
                <Tab label="月次" />
                <Tab label="四半期" />
                <Tab label="年次" />
              </Tabs>
            </Box>
            
            {activePeriod === 0 ? (
              <Box sx={{ display: 'flex', mb: 1 }}>
                <FormControl sx={{ minWidth: 120, mr: 2 }}>
                  <InputLabel>年</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={handleYearChange}
                    label="年"
                    size="small"
                  >
                    {Array.from({ length: 5 }, (_, i) => moment().year() - 2 + i).map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>月</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    label="月"
                    size="small"
                  >
                    {Array.from({ length: 12 }, (_, i) => i).map(month => (
                      <MenuItem key={month} value={month}>{month + 1}月</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : activePeriod === 1 ? (
              <Box sx={{ display: 'flex', mb: 1 }}>
                <FormControl sx={{ minWidth: 120, mr: 2 }}>
                  <InputLabel>年</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={handleYearChange}
                    label="年"
                    size="small"
                  >
                    {Array.from({ length: 5 }, (_, i) => moment().year() - 2 + i).map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>四半期</InputLabel>
                  <Select
                    value={selectedQuarter}
                    onChange={handleQuarterChange}
                    label="四半期"
                    size="small"
                  >
                    {[1, 2, 3, 4].map(quarter => (
                      <MenuItem key={quarter} value={quarter}>Q{quarter}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <FormControl sx={{ minWidth: 120, mb: 1 }}>
                <InputLabel>年</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  label="年"
                  size="small"
                >
                  {Array.from({ length: 5 }, (_, i) => moment().year() - 2 + i).map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<CompareArrowsIcon />}
              onClick={() => setShowComparison(!showComparison)}
              sx={{ mr: 1, mb: 1 }}
            >
              {showComparison ? '比較を非表示' : '比較を表示'}
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AutorenewIcon />}
              onClick={handleAutoGenerateActuals}
              sx={{ mr: 1, mb: 1 }}
              disabled={isSubmitting}
            >
              自動集計
            </Button>
            
            <Button
              variant="outlined"
              color={editMode ? 'warning' : 'primary'}
              startIcon={editMode ? <CheckCircleIcon /> : <EditIcon />}
              onClick={toggleEditMode}
              sx={{ mr: 1, mb: 1 }}
              disabled={isSubmitting}
            >
              {editMode ? '編集を終了' : '編集する'}
            </Button>
            
            {editMode && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveActuals}
                sx={{ mb: 1 }}
                disabled={isSubmitting || !currentActuals.some(a => a.isEdited)}
              >
                保存
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="actuals table">
            <TableHead>
              <TableRow>
                <TableCell>部門</TableCell>
                <TableCell align="right">実績額</TableCell>
                {showComparison && (
                  <>
                    <TableCell align="right">予算額</TableCell>
                    <TableCell align="right">差異</TableCell>
                    <TableCell align="right">達成率</TableCell>
                  </>
                )}
                {editMode && <TableCell align="center" width={100}>操作</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentActuals.map((actual) => (
                <TableRow
                  key={actual.departmentId}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    borderLeft: `5px solid ${actual.departmentColor}`,
                    bgcolor: actual.isEdited ? 'rgba(255, 235, 59, 0.1)' : 'inherit'
                  }}
                >
                  <TableCell component="th" scope="row">
                    {actual.departmentName}
                  </TableCell>
                  <TableCell align="right">
                    {editMode ? (
                      <TextField
                        value={actual.amount}
                        onChange={(e) => handleAmountChange(actual.departmentId, e.target.value)}
                        type="number"
                        variant="outlined"
                        size="small"
                        InputProps={{
                          endAdornment: '円',
                          inputProps: { min: 0 }
                        }}
                        fullWidth
                      />
                    ) : (
                      formatCurrency(actual.amount)
                    )}
                  </TableCell>
                  {showComparison && (
                    <>
                      <TableCell align="right">
                        {formatCurrency(actual.budgetAmount)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={getVarianceColor(actual.variance)}
                          fontWeight="bold"
                        >
                          {actual.variance >= 0 ? '+' : ''}{formatCurrency(actual.variance)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={formatPercent(actual.percentVariance)}
                          size="small"
                          sx={{ 
                            bgcolor: actual.percentVariance >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: getVarianceColor(actual.percentVariance, true),
                            fontWeight: 'bold'
                          }}
                          icon={actual.percentVariance >= 0 ? <CheckCircleIcon fontSize="small" /> : <WarningIcon fontSize="small" />}
                        />
                      </TableCell>
                    </>
                  )}
                  {editMode && (
                    <TableCell align="center">
                      {actual.items.length > 0 && (
                        <Tooltip title="削除">
                          <IconButton
                            color="error"
                            onClick={() => deleteActualItem(actual.items[0].id)}
                            disabled={isSubmitting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle1" fontWeight="bold">合計</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatCurrency(calculateTotal('amount'))}
                  </Typography>
                </TableCell>
                {showComparison && (
                  <>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(calculateTotal('budgetAmount'))}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color={getVarianceColor(calculateTotal('variance'))}
                      >
                        {calculateTotal('variance') >= 0 ? '+' : ''}{formatCurrency(calculateTotal('variance'))}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {calculateTotal('budgetAmount') > 0 && (
                        <Chip
                          label={formatPercent((calculateTotal('amount') / calculateTotal('budgetAmount') - 1) * 100)}
                          size="small"
                          sx={{ 
                            bgcolor: calculateTotal('variance') >= 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: getVarianceColor(calculateTotal('variance') >= 0 ? 5 : -5, true),
                            fontWeight: 'bold'
                          }}
                          icon={calculateTotal('variance') >= 0 ? <CheckCircleIcon fontSize="small" /> : <WarningIcon fontSize="small" />}
                        />
                      )}
                    </TableCell>
                  </>
                )}
                {editMode && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled
          >
            CSV/Excelインポート
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ActualsManagement;
