import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import { usePayroll } from '../../contexts/PayrollContext';
import { useStaff } from '../../contexts/StaffContext';

const PayrollHistory = () => {
  const { payrollRecords, processPayment, generatePayslip } = usePayroll();
  const { staff } = useStaff();
  
  const [selectedStaff, setSelectedStaff] = useState('');
  const [dateRange, setDateRange] = useState({
    start: moment().subtract(3, 'months').startOf('month'),
    end: moment().endOf('month')
  });
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // view, payment, email
  const [paymentData, setPaymentData] = useState({
    paymentDate: moment(),
    method: 'bank_transfer',
    notes: ''
  });
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '給与明細送付のお知らせ',
    message: ''
  });
  
  // スタッフIDでフィルタリングされた給与記録
  const filteredPayrolls = payrollRecords.filter(record => {
    const periodStart = moment(record.periodStart);
    return (
      (!selectedStaff || record.staffId === selectedStaff) &&
      periodStart >= dateRange.start &&
      periodStart <= dateRange.end
    );
  });
  
  // 日付範囲変更
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // スタッフ選択
  const handleStaffChange = (e) => {
    setSelectedStaff(e.target.value);
    
    // メールダイアログ用のデフォルトメールアドレスを設定
    if (e.target.value) {
      const selectedStaffData = staff.find(s => s.id === e.target.value);
      if (selectedStaffData && selectedStaffData.email) {
        setEmailData(prev => ({ ...prev, email: selectedStaffData.email }));
      }
    }
  };

  // 給与レコードの表示
  const handleViewPayroll = (payroll) => {
    setSelectedPayroll(payroll);
    setDialogMode('view');
    setShowDialog(true);
  };

  // 支払い処理ダイアログ表示
  const handlePaymentDialog = (payroll) => {
    setSelectedPayroll(payroll);
    setDialogMode('payment');
    setPaymentData({
      paymentDate: moment(),
      method: 'bank_transfer',
      notes: ''
    });
    setShowDialog(true);
  };

  // メール送信ダイアログ表示
  const handleEmailDialog = (payroll) => {
    setSelectedPayroll(payroll);
    setDialogMode('email');
    
    // スタッフのメールアドレスを設定
    const selectedStaffData = staff.find(s => s.id === payroll.staffId);
    setEmailData({
      email: selectedStaffData?.email || '',
      subject: `${moment(payroll.periodStart).format('YYYY年MM月')}分 給与明細送付のお知らせ`,
      message: `${selectedStaffData?.name || ''}様\n\n${moment(payroll.periodStart).format('YYYY年MM月')}分の給与明細書を送付いたします。\nご確認ください。\n\n以上`
    });
    
    setShowDialog(true);
  };

  // 支払い処理実行
  const handleProcessPayment = () => {
    processPayment(selectedPayroll.id, {
      paymentDate: paymentData.paymentDate.toISOString(),
      method: paymentData.method,
      notes: paymentData.notes
    });
    setShowDialog(false);
  };

  // メール送信処理
  const handleSendEmail = () => {
    // 実際のアプリケーションでは、ここでメール送信APIを呼び出す
    console.log('給与明細メール送信', {
      payrollId: selectedPayroll.id,
      email: emailData.email,
      subject: emailData.subject,
      message: emailData.message
    });
    setShowDialog(false);
  };

  // 金額のフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  // ステータスチップのレンダリング
  const renderStatusChip = (status) => {
    switch(status) {
      case 'paid':
        return <Chip label="支払済" color="success" size="small" />;
      case 'approved':
        return <Chip label="承認済" color="primary" size="small" />;
      case 'calculated':
        return <Chip label="計算済" color="info" size="small" />;
      case 'draft':
        return <Chip label="下書き" color="warning" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        給与履歴
      </Typography>
      
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="history-staff-select-label">スタッフ選択</InputLabel>
              <Select
                labelId="history-staff-select-label"
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
      
      {filteredPayrolls.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>支払期間</TableCell>
                <TableCell>スタッフ名</TableCell>
                <TableCell>役職</TableCell>
                <TableCell align="right">支給額</TableCell>
                <TableCell align="right">控除額</TableCell>
                <TableCell align="right">差引支給額</TableCell>
                <TableCell align="center">支払日</TableCell>
                <TableCell align="center">ステータス</TableCell>
                <TableCell align="center">アクション</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell>
                    {moment(payroll.periodStart).format('YYYY/MM/DD')} - 
                    {moment(payroll.periodEnd).format('MM/DD')}
                  </TableCell>
                  <TableCell>{payroll.staffName}</TableCell>
                  <TableCell>{payroll.position}</TableCell>
                  <TableCell align="right">{formatCurrency(payroll.grossPay)}</TableCell>
                  <TableCell align="right">{formatCurrency(payroll.totalDeductions)}</TableCell>
                  <TableCell align="right">{formatCurrency(payroll.netPay)}</TableCell>
                  <TableCell align="center">
                    {payroll.paymentDate 
                      ? moment(payroll.paymentDate).format('YYYY/MM/DD')
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {renderStatusChip(payroll.status)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewPayroll(payroll)}
                        title="詳細表示"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      
                      {/* 支払い処理ボタン（支払い済みでない場合のみ表示） */}
                      {payroll.status !== 'paid' && (
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handlePaymentDialog(payroll)}
                          title="支払い処理"
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {/* メール送信ボタン */}
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => handleEmailDialog(payroll)}
                        title="メール送信"
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                      
                      {/* PDF出力ボタン */}
                      <IconButton 
                        size="small"
                        title="PDF出力"
                      >
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          該当する給与記録がありません
        </Typography>
      )}
      
      {/* 給与詳細/支払い処理/メール送信ダイアログ */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'view' && '給与詳細'}
          {dialogMode === 'payment' && '支払い処理'}
          {dialogMode === 'email' && '給与明細メール送信'}
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedPayroll && dialogMode === 'view' && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">スタッフ名</Typography>
                <Typography variant="body1">{selectedPayroll.staffName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">役職</Typography>
                <Typography variant="body1">{selectedPayroll.position}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">支払期間</Typography>
                <Typography variant="body1">
                  {moment(selectedPayroll.periodStart).format('YYYY/MM/DD')} - 
                  {moment(selectedPayroll.periodEnd).format('YYYY/MM/DD')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">支払日</Typography>
                <Typography variant="body1">
                  {selectedPayroll.paymentDate 
                    ? moment(selectedPayroll.paymentDate).format('YYYY/MM/DD')
                    : '未支払い'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom>勤務情報</Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">勤務日数</Typography>
                <Typography variant="body1">{selectedPayroll.workingDays}日</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">通常時間</Typography>
                <Typography variant="body1">{selectedPayroll.regularHours.toFixed(1)}時間</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">残業時間</Typography>
                <Typography variant="body1">{selectedPayroll.overtimeHours.toFixed(1)}時間</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom>支給内訳</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>項目</TableCell>
                        <TableCell align="right">金額</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>基本給（通常時間）</TableCell>
                        <TableCell align="right">{formatCurrency(selectedPayroll.regularPay)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>残業手当</TableCell>
                        <TableCell align="right">{formatCurrency(selectedPayroll.overtimePay)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>深夜手当</TableCell>
                        <TableCell align="right">{formatCurrency(selectedPayroll.nightAllowance)}</TableCell>
                      </TableRow>
                      {selectedPayroll.otherAllowances.map((allowance, index) => (
                        <TableRow key={`allowance-${index}`}>
                          <TableCell>{allowance.name}</TableCell>
                          <TableCell align="right">{formatCurrency(allowance.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>支給合計</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedPayroll.grossPay)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom>控除内訳</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>項目</TableCell>
                        <TableCell align="right">金額</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPayroll.deductions.map((deduction, index) => (
                        <TableRow key={`deduction-${index}`}>
                          <TableCell>{deduction.name}</TableCell>
                          <TableCell align="right">{formatCurrency(deduction.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>控除合計</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedPayroll.totalDeductions)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mt: 2 }}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <Typography variant="h6">差引支給額</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h5" align="right">
                        {formatCurrency(selectedPayroll.netPay)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              {selectedPayroll.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">備考</Typography>
                  <Typography variant="body2">{selectedPayroll.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
          
          {selectedPayroll && dialogMode === 'payment' && (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedPayroll.staffName}さんへの給与支払い処理
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    支払期間: {moment(selectedPayroll.periodStart).format('YYYY/MM/DD')} - 
                    {moment(selectedPayroll.periodEnd).format('YYYY/MM/DD')}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    支給額: {formatCurrency(selectedPayroll.netPay)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="支払日"
                    value={paymentData.paymentDate}
                    onChange={(newValue) => setPaymentData(prev => ({ ...prev, paymentDate: newValue }))}
                    format="YYYY/MM/DD"
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="payment-method-label">支払方法</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      value={paymentData.method}
                      label="支払方法"
                      onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                    >
                      <MenuItem value="bank_transfer">銀行振込</MenuItem>
                      <MenuItem value="cash">現金支給</MenuItem>
                      <MenuItem value="check">小切手</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="備考"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          )}
          
          {selectedPayroll && dialogMode === 'email' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedPayroll.staffName}さんへ給与明細を送信
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  期間: {moment(selectedPayroll.periodStart).format('YYYY/MM/DD')} - 
                  {moment(selectedPayroll.periodEnd).format('YYYY/MM/DD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="送信先メールアドレス"
                  value={emailData.email}
                  onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                  fullWidth
                  required
                  type="email"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="件名"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="メッセージ"
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  multiline
                  rows={5}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  ※ 給与明細書のPDFが自動的に添付されます
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="inherit">
            {dialogMode === 'view' ? '閉じる' : 'キャンセル'}
          </Button>
          
          {dialogMode === 'payment' && (
            <Button 
              onClick={handleProcessPayment} 
              color="success" 
              variant="contained"
              startIcon={<SendIcon />}
            >
              支払い処理を実行
            </Button>
          )}
          
          {dialogMode === 'email' && (
            <Button
              onClick={handleSendEmail}
              color="primary"
              variant="contained"
              startIcon={<EmailIcon />}
              disabled={!emailData.email}
            >
              メール送信
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PayrollHistory;
