import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  LocalAtm as CashIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MobileIcon
} from '@mui/icons-material';
import { useOrder } from '../../contexts/OrderContext';
import { PAYMENT_METHODS } from '../../utils/orderUtils';

/**
 * 支払い処理ダイアログ
 * 注文の支払い処理を行うための再利用可能なコンポーネント
 */
const PaymentDialog = ({ 
  open, 
  onClose, 
  orderId, 
  orderTotal = 0,
  orderDiscount = 0,
  onPaymentComplete
}) => {
  const { completeOrder } = useOrder();
  
  // 支払い関連の状態
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 注文合計金額（税込）
  const [total, setTotal] = useState(orderTotal);
  
  // 合計金額が変更されたら受領金額をリセット
  useEffect(() => {
    setTotal(orderTotal);
    setReceivedAmount(orderTotal.toString());
  }, [orderTotal]);
  
  // 受領金額が変更されたらお釣りを計算
  useEffect(() => {
    const received = parseFloat(receivedAmount) || 0;
    const change = received - total;
    setChangeAmount(change > 0 ? change : 0);
  }, [receivedAmount, total]);
  
  // 支払い方法を選択
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  
  // 支払い処理を実行
  const handleProcessPayment = async () => {
    if (!orderId) {
      setError('注文IDが無効です');
      return;
    }
    
    if (paymentMethod === PAYMENT_METHODS.CASH && parseFloat(receivedAmount) < total) {
      setError('受領金額が不足しています');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 支払い情報を作成
      const paymentDetails = {
        method: paymentMethod,
        amount: parseFloat(receivedAmount) || total,
        change: changeAmount,
        discount: orderDiscount
      };
      
      // OrderContextの支払い処理関数を呼び出し
      const result = await completeOrder(orderId, paymentDetails);
      
      if (result) {
        // 完了イベントを発火
        if (onPaymentComplete && typeof onPaymentComplete === 'function') {
          onPaymentComplete(result);
        }
        
        // ダイアログを閉じる
        onClose();
      } else {
        throw new Error('支払い処理に失敗しました');
      }
    } catch (err) {
      console.error('支払い処理エラー:', err);
      setError(err.message || '支払い処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  // キャンセル処理
  const handleCancel = () => {
    // 入力をリセット
    setPaymentMethod(PAYMENT_METHODS.CASH);
    setReceivedAmount('');
    setChangeAmount(0);
    setError(null);
    
    // ダイアログを閉じる
    onClose();
  };
  
  // 支払い方法のアイコンを取得
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case PAYMENT_METHODS.CREDIT_CARD:
        return <CreditCardIcon />;
      case PAYMENT_METHODS.CASH:
        return <CashIcon />;
      case PAYMENT_METHODS.ELECTRONIC:
        return <MobileIcon />;
      case PAYMENT_METHODS.INVOICE:
        return <BankIcon />;
      default:
        return <PaymentIcon />;
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? null : handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <PaymentIcon sx={{ mr: 1 }} />
          注文の支払い処理
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* 支払い情報 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              注文情報
            </Typography>
            
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                注文ID: {orderId}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                支払金額: {total.toLocaleString()}円（税込）
              </Typography>
              {orderDiscount > 0 && (
                <Typography variant="body2" color="primary">
                  割引: {orderDiscount.toLocaleString()}円
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* 支払い方法 */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="payment-method-label">支払い方法</InputLabel>
              <Select
                labelId="payment-method-label"
                id="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                label="支払い方法"
                disabled={loading}
              >
                <MenuItem value={PAYMENT_METHODS.CASH}>
                  <Box display="flex" alignItems="center">
                    <CashIcon sx={{ mr: 1 }} />
                    現金
                  </Box>
                </MenuItem>
                <MenuItem value={PAYMENT_METHODS.CREDIT_CARD}>
                  <Box display="flex" alignItems="center">
                    <CreditCardIcon sx={{ mr: 1 }} />
                    クレジットカード
                  </Box>
                </MenuItem>
                <MenuItem value={PAYMENT_METHODS.ELECTRONIC}>
                  <Box display="flex" alignItems="center">
                    <MobileIcon sx={{ mr: 1 }} />
                    電子マネー/QR決済
                  </Box>
                </MenuItem>
                <MenuItem value={PAYMENT_METHODS.INVOICE}>
                  <Box display="flex" alignItems="center">
                    <BankIcon sx={{ mr: 1 }} />
                    請求書払い
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* 現金支払いの場合の追加フィールド */}
          {paymentMethod === PAYMENT_METHODS.CASH && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="受領金額"
                  type="number"
                  fullWidth
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  InputProps={{ endAdornment: '円' }}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'action.hover'
                  }}
                >
                  <Typography variant="body2">お釣り</Typography>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                    {changeAmount.toLocaleString()}円
                  </Typography>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleCancel}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : getPaymentMethodIcon(paymentMethod)}
          onClick={handleProcessPayment}
          disabled={loading}
          color="primary"
        >
          支払い処理
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
