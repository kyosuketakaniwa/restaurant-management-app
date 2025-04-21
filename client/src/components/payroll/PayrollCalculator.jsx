import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import CalculateIcon from '@mui/icons-material/Calculate';
import SaveIcon from '@mui/icons-material/Save';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { usePayroll } from '../../contexts/PayrollContext';
import { useStaff } from '../../contexts/StaffContext';

const PayrollCalculator = () => {
  const { calculatePayroll, savePayroll, processPayment, loading, error } = usePayroll();
  const { staff } = useStaff();
  
  const [selectedStaff, setSelectedStaff] = useState('');
  const [dateRange, setDateRange] = useState({
    start: moment().startOf('month'),
    end: moment().endOf('month')
  });
  const [calculatedPayrolls, setCalculatedPayrolls] = useState([]);
  const [calculationDone, setCalculationDone] = useState(false);
  const [alert, setAlert] = useState({ show: false, severity: 'success', message: '' });

  // 日付範囲変更
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    setCalculationDone(false);
  };

  // スタッフ選択
  const handleStaffChange = (e) => {
    setSelectedStaff(e.target.value);
    setCalculationDone(false);
  };

  // 給与計算実行
  const handleCalculate = async () => {
    try {
      const payrolls = await calculatePayroll(
        dateRange.start.toISOString(),
        dateRange.end.toISOString(),
        selectedStaff || null
      );
      setCalculatedPayrolls(payrolls);
      setCalculationDone(true);
      setAlert({
        show: true,
        severity: 'success',
        message: '給与計算が完了しました'
      });
    } catch (err) {
      console.error('給与計算に失敗しました', err);
      setAlert({
        show: true,
        severity: 'error',
        message: '給与計算に失敗しました：' + (err.message || '不明なエラー')
      });
    }
  };

  // 給与記録保存
  const handleSavePayroll = (payrollData) => {
    try {
      savePayroll(payrollData);
      setAlert({
        show: true,
        severity: 'success',
        message: '給与記録を保存しました'
      });
    } catch (err) {
      console.error('給与記録の保存に失敗しました', err);
      setAlert({
        show: true,
        severity: 'error',
        message: '給与記録の保存に失敗しました：' + (err.message || '不明なエラー')
      });
    }
  };

  // 全て保存
  const handleSaveAll = () => {
    try {
      calculatedPayrolls.forEach(payroll => {
        savePayroll(payroll);
      });
      setAlert({
        show: true,
        severity: 'success',
        message: 'すべての給与記録を保存しました'
      });
    } catch (err) {
      console.error('給与記録の一括保存に失敗しました', err);
      setAlert({
        show: true,
        severity: 'error',
        message: '給与記録の一括保存に失敗しました：' + (err.message || '不明なエラー')
      });
    }
  };

  // 金額のフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        給与計算
      </Typography>
      
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}
      
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="payroll-staff-select-label">スタッフ選択</InputLabel>
              <Select
                labelId="payroll-staff-select-label"
                value={selectedStaff}
                label="スタッフ選択"
                onChange={handleStaffChange}
              >
                <MenuItem value="">すべてのスタッフ</MenuItem>
                {staff.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <DatePicker
              label="期間開始"
              value={dateRange.start}
              onChange={(newValue) => handleDateChange('start', newValue)}
              format="YYYY/MM/DD"
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <DatePicker
              label="期間終了"
              value={dateRange.end}
              onChange={(newValue) => handleDateChange('end', newValue)}
              format="YYYY/MM/DD"
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleCalculate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
          sx={{ px: 4 }}
        >
          給与計算を実行
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {calculationDone && calculatedPayrolls.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              計算結果
            </Typography>
            
            <Box>
              <Button
                variant="contained"
                color="success"
                onClick={handleSaveAll}
                startIcon={<SaveIcon />}
                sx={{ ml: 1 }}
              >
                全て保存
              </Button>
            </Box>
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>スタッフ名</TableCell>
                  <TableCell>役職</TableCell>
                  <TableCell align="center">勤務日数</TableCell>
                  <TableCell align="right">時間数</TableCell>
                  <TableCell align="right">残業時間</TableCell>
                  <TableCell align="right">支給額</TableCell>
                  <TableCell align="right">控除額</TableCell>
                  <TableCell align="right">差引支給額</TableCell>
                  <TableCell align="center">アクション</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calculatedPayrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>{payroll.staffName}</TableCell>
                    <TableCell>{payroll.position}</TableCell>
                    <TableCell align="center">{payroll.workingDays}日</TableCell>
                    <TableCell align="right">{payroll.regularHours.toFixed(1)}時間</TableCell>
                    <TableCell align="right">{payroll.overtimeHours.toFixed(1)}時間</TableCell>
                    <TableCell align="right">{formatCurrency(payroll.grossPay)}</TableCell>
                    <TableCell align="right">{formatCurrency(payroll.totalDeductions)}</TableCell>
                    <TableCell align="right">{formatCurrency(payroll.netPay)}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSavePayroll(payroll)}
                      >
                        保存
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* 詳細な内訳（選択されたスタッフが1名の場合のみ表示） */}
          {calculatedPayrolls.length === 1 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                詳細内訳
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      支給内訳
                    </Typography>
                    
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>基本給（通常時間）</TableCell>
                          <TableCell align="right">{formatCurrency(calculatedPayrolls[0].regularPay)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>残業手当</TableCell>
                          <TableCell align="right">{formatCurrency(calculatedPayrolls[0].overtimePay)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>深夜手当</TableCell>
                          <TableCell align="right">{formatCurrency(calculatedPayrolls[0].nightAllowance)}</TableCell>
                        </TableRow>
                        
                        {calculatedPayrolls[0].otherAllowances.map((allowance, index) => (
                          <TableRow key={`allowance-${index}`}>
                            <TableCell>{allowance.name}</TableCell>
                            <TableCell align="right">{formatCurrency(allowance.amount)}</TableCell>
                          </TableRow>
                        ))}
                        
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>支給合計</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(calculatedPayrolls[0].grossPay)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      控除内訳
                    </Typography>
                    
                    <Table size="small">
                      <TableBody>
                        {calculatedPayrolls[0].deductions.map((deduction, index) => (
                          <TableRow key={`deduction-${index}`}>
                            <TableCell>{deduction.name}</TableCell>
                            <TableCell align="right">{formatCurrency(deduction.amount)}</TableCell>
                          </TableRow>
                        ))}
                        
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>控除合計</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(calculatedPayrolls[0].totalDeductions)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
                    <Grid container alignItems="center">
                      <Grid item xs={6}>
                        <Typography variant="h6">
                          差引支給額
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h5" align="right">
                          {formatCurrency(calculatedPayrolls[0].netPay)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<CloudDownloadIcon />}
                  sx={{ mx: 1 }}
                >
                  給与明細書ダウンロード
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
      
      {calculationDone && calculatedPayrolls.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          選択した期間内に該当するスタッフの勤怠記録がありません。
        </Alert>
      )}
    </Paper>
  );
};

export default PayrollCalculator;
