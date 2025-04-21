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
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalculateIcon from '@mui/icons-material/Calculate';
import moment from 'moment';
import { useFinance } from '../contexts/FinanceContext';

const BudgetManagement = () => {
  const { 
    budgets, 
    departments, 
    createBudget, 
    updateBudget, 
    deleteBudget, 
    loading 
  } = useFinance();

  const [activePeriod, setActivePeriod] = useState(0);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((moment().month() + 1) / 3));
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [currentBudgets, setCurrentBudgets] = useState([]);
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

  // 予算データの取得
  useEffect(() => {
    let filteredBudgets = [];
    
    switch (activePeriod) {
      case 0: // 月次
        filteredBudgets = budgets.filter(budget => {
          const budgetDate = moment(budget.date);
          return budgetDate.year() === selectedYear && budgetDate.month() === selectedMonth;
        });
        break;
      case 1: // 四半期
        const startMonth = (selectedQuarter - 1) * 3;
        const endMonth = startMonth + 2;
        filteredBudgets = budgets.filter(budget => {
          const budgetDate = moment(budget.date);
          return budgetDate.year() === selectedYear && 
                 budgetDate.month() >= startMonth && 
                 budgetDate.month() <= endMonth;
        });
        break;
      case 2: // 年次
        filteredBudgets = budgets.filter(budget => {
          return moment(budget.date).year() === selectedYear;
        });
        break;
      default:
        break;
    }
    
    // 部門ごとの予算データを整形
    const deptBudgets = departments.map(dept => {
      let existingBudget = {};
      
      if (activePeriod === 0) { // 月次
        existingBudget = filteredBudgets.find(b => 
          b.departmentId === dept.id && 
          moment(b.date).month() === selectedMonth
        ) || {};
      } else {
        // 四半期や年次は合計値を計算（今回はUIのみ考慮）
        // 実際はバックエンドでこの計算を行う
      }
      
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        departmentColor: dept.color,
        budgetId: existingBudget.id || null,
        amount: existingBudget.amount || 0,
        originalAmount: existingBudget.amount || 0,
        isEdited: false
      };
    });
    
    setCurrentBudgets(deptBudgets);
  }, [activePeriod, selectedYear, selectedQuarter, selectedMonth, budgets, departments]);

  // 金額の変更を処理
  const handleAmountChange = (deptId, value) => {
    const numValue = value === '' ? 0 : Number(value);
    const updatedBudgets = currentBudgets.map(b => {
      if (b.departmentId === deptId) {
        return {
          ...b,
          amount: numValue,
          isEdited: numValue !== b.originalAmount
        };
      }
      return b;
    });
    
    setCurrentBudgets(updatedBudgets);
  };

  // 編集モードの切り替え
  const toggleEditMode = () => {
    if (editMode) {
      // 編集モードを終了する際に変更をリセット
      const resetBudgets = currentBudgets.map(b => ({
        ...b,
        amount: b.originalAmount,
        isEdited: false
      }));
      setCurrentBudgets(resetBudgets);
    }
    setEditMode(!editMode);
  };

  // 予算の保存
  const saveBudgets = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // 変更された予算のみを更新
      const editedBudgets = currentBudgets.filter(b => b.isEdited);
      
      for (const budget of editedBudgets) {
        let targetDate;
        
        if (activePeriod === 0) { // 月次
          targetDate = moment().year(selectedYear).month(selectedMonth).date(1).format('YYYY-MM-DD');
        } else if (activePeriod === 1) { // 四半期
          const startMonth = (selectedQuarter - 1) * 3;
          targetDate = moment().year(selectedYear).month(startMonth).date(1).format('YYYY-MM-DD');
        } else { // 年次
          targetDate = moment().year(selectedYear).month(0).date(1).format('YYYY-MM-DD');
        }
        
        const budgetData = {
          date: targetDate,
          departmentId: budget.departmentId,
          period: activePeriod === 0 ? 'monthly' : activePeriod === 1 ? 'quarterly' : 'yearly',
          amount: budget.amount
        };
        
        if (budget.budgetId) {
          // 既存の予算を更新
          await updateBudget(budget.budgetId, budgetData);
        } else {
          // 新しい予算を作成
          await createBudget(budgetData);
        }
      }
      
      setSuccessMessage('予算が保存されました');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('予算の保存中にエラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 予算の削除
  const deleteBudgetItem = async (budgetId) => {
    if (!budgetId) return;
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      await deleteBudget(budgetId);
      
      // 削除後のUI更新
      const updatedBudgets = currentBudgets.map(b => {
        if (b.budgetId === budgetId) {
          return {
            ...b,
            budgetId: null,
            amount: 0,
            originalAmount: 0,
            isEdited: false
          };
        }
        return b;
      });
      
      setCurrentBudgets(updatedBudgets);
      setSuccessMessage('予算が削除されました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('予算の削除中にエラーが発生しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 合計の計算
  const calculateTotal = () => {
    return currentBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  };

  // 金額のフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        予算管理
      </Typography>
      
      {/* 期間選択タブ */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activePeriod}
          onChange={handlePeriodChange}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="月次" />
          <Tab label="四半期" />
          <Tab label="年次" />
        </Tabs>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
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
          
          {activePeriod === 1 && (
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>四半期</InputLabel>
              <Select
                value={selectedQuarter}
                onChange={handleQuarterChange}
                label="四半期"
              >
                <MenuItem value={1}>第1四半期</MenuItem>
                <MenuItem value={2}>第2四半期</MenuItem>
                <MenuItem value={3}>第3四半期</MenuItem>
                <MenuItem value={4}>第4四半期</MenuItem>
              </Select>
            </FormControl>
          )}
          
          {activePeriod === 0 && (
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
          )}
        </Box>
      </Paper>
      
      {/* 予算設定テーブル */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {activePeriod === 0 
              ? `${selectedYear}年${selectedMonth + 1}月 予算` 
              : activePeriod === 1 
                ? `${selectedYear}年 第${selectedQuarter}四半期 予算` 
                : `${selectedYear}年 年間予算`}
          </Typography>
          
          <Box>
            <Button
              variant={editMode ? 'outlined' : 'contained'}
              color={editMode ? 'error' : 'primary'}
              onClick={toggleEditMode}
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
              disabled={isSubmitting}
            >
              {editMode ? '編集キャンセル' : '編集'}
            </Button>
            
            {editMode && (
              <Button
                variant="contained"
                color="success"
                startIcon={isSubmitting ? <CircularProgress size={24} /> : <SaveIcon />}
                onClick={saveBudgets}
                disabled={isSubmitting}
              >
                保存
              </Button>
            )}
          </Box>
        </Box>
        
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
        
        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="budget table">
            <TableHead>
              <TableRow>
                <TableCell>部門</TableCell>
                <TableCell align="right">予算額</TableCell>
                {editMode && <TableCell align="center" width={100}>操作</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentBudgets.map((budget) => (
                <TableRow
                  key={budget.departmentId}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    borderLeft: `5px solid ${budget.departmentColor}`,
                    bgcolor: budget.isEdited ? 'rgba(255, 235, 59, 0.1)' : 'inherit'
                  }}
                >
                  <TableCell component="th" scope="row">
                    {budget.departmentName}
                  </TableCell>
                  <TableCell align="right">
                    {editMode ? (
                      <TextField
                        value={budget.amount}
                        onChange={(e) => handleAmountChange(budget.departmentId, e.target.value)}
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
                      formatCurrency(budget.amount)
                    )}
                  </TableCell>
                  {editMode && (
                    <TableCell align="center">
                      {budget.budgetId && (
                        <Tooltip title="削除">
                          <IconButton
                            color="error"
                            onClick={() => deleteBudgetItem(budget.budgetId)}
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
                    {formatCurrency(calculateTotal())}
                  </Typography>
                </TableCell>
                {editMode && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default BudgetManagement;
