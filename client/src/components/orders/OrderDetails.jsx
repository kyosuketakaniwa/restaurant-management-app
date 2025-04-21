import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Box, Button, Divider, Grid, Chip, List, 
  ListItem, ListItemText, ListItemSecondaryAction, Paper,
  Table, TableHead, TableBody, TableRow, TableCell,
  Card, CardContent, IconButton, TextField, Alert, Select,
  MenuItem, FormControl, InputLabel, TableContainer
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  RestaurantMenu as FoodIcon,
  AttachMoney as PaymentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import PaymentDialog from '../payment/PaymentDialog';

import {
  ORDER_STATUS,
  PAYMENT_METHODS,
  updateOrderStatus,
  updateOrderItemStatus,
  processPayment,
  recalculateOrderTotals
} from '../../utils/orderUtils';

/**
 * 注文詳細コンポーネント
 * @param {Object} props
 * @param {boolean} props.open ダイアログの表示状態
 * @param {Object} props.order 注文データ
 * @param {Function} props.onClose ダイアログを閉じる際のコールバック
 */
const OrderDetails = ({ open, order, onClose }) => {
  // 内部状態
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [error, setError] = useState('');

  // データがない場合は何も表示しない
  if (!order) {
    return null;
  }

  // 編集モードの切り替え
  const handleToggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedOrder({ ...order });
    }
  };

  // 注文ステータスの更新
  const handleUpdateStatus = (newStatus) => {
    updateOrderStatus(order.id, newStatus);
    onClose(true); // 親コンポーネントに更新を通知して閉じる
  };

  // 注文アイテムのステータス更新
  const handleUpdateItemStatus = (itemId, newStatus) => {
    updateOrderItemStatus(order.id, itemId, newStatus);
    onClose(true); // 親コンポーネントに更新を通知して閉じる
  };

  // 支払いダイアログを開く
  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true);
  };

  // 支払い処理が完了したときの処理
  const handlePaymentComplete = (completedOrder) => {
    console.log('支払い処理が完了しました:', completedOrder);
    onClose(true); // 更新フラグを付けて閉じる
  };

  // 日時のフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ステータス表示用の設定
  const getStatusDisplay = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW:
        return { label: '新規注文', color: 'info' };
      case ORDER_STATUS.IN_PROGRESS:
        return { label: '調理中', color: 'warning' };
      case ORDER_STATUS.READY:
        return { label: '提供準備完了', color: 'success' };
      case ORDER_STATUS.DELIVERED:
        return { label: '提供済み', color: 'secondary' };
      case ORDER_STATUS.PAID:
        return { label: '支払済み', color: 'primary' };
      case ORDER_STATUS.CANCELED:
        return { label: 'キャンセル', color: 'error' };
      default:
        return { label: '不明', color: 'default' };
    }
  };

  // 支払い方法の表示
  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case PAYMENT_METHODS.CASH:
        return '現金';
      case PAYMENT_METHODS.CREDIT_CARD:
        return 'クレジットカード';
      case PAYMENT_METHODS.DEBIT_CARD:
        return 'デビットカード';
      case PAYMENT_METHODS.QR_CODE:
        return 'QRコード決済';
      case PAYMENT_METHODS.ELECTRONIC:
        return '電子マネー';
      case PAYMENT_METHODS.INVOICE:
        return '請求書払い';
      default:
        return '未指定';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <ReceiptIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              注文詳細 - {order.orderNumber}
            </Typography>
          </Box>
          <Box>
            <Chip
              label={getStatusDisplay(order.status).label}
              color={getStatusDisplay(order.status).color}
              sx={{ mr: 1 }}
            />
            <IconButton size="small" onClick={() => onClose(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* 注文基本情報 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  基本情報
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      顧客名
                    </Typography>
                    <Typography variant="body1">
                      {order.customerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      テーブル
                    </Typography>
                    <Typography variant="body1">
                      {order.tableId ? order.tableId.replace('table-', 'テーブル ') : '持ち帰り'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      注文日時
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(order.orderDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      完了日時
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(order.completedDate) || '-'}
                    </Typography>
                  </Grid>
                  {order.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        備考
                      </Typography>
                      <Typography variant="body1">
                        {order.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 支払い情報 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  支払い情報
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      支払い状況
                    </Typography>
                    <Typography variant="body1">
                      {order.paid ? (
                        <Chip
                          size="small"
                          icon={<PaymentIcon />}
                          label="支払い済み"
                          color="success"
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="未払い"
                          color="default"
                        />
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      支払い方法
                    </Typography>
                    <Typography variant="body1">
                      {order.paymentMethod ? getPaymentMethodDisplay(order.paymentMethod) : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={8}>
                          <Typography variant="body2">
                            小計
                          </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                          <Typography variant="body2">
                            ¥{order.subtotal.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body2">
                            消費税
                          </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                          <Typography variant="body2">
                            ¥{order.taxAmount.toLocaleString()}
                          </Typography>
                        </Grid>
                        {order.discount > 0 && (
                          <>
                            <Grid item xs={8}>
                              <Typography variant="body2">
                                割引
                              </Typography>
                            </Grid>
                            <Grid item xs={4} textAlign="right">
                              <Typography variant="body2" color="error">
                                -¥{order.discount.toLocaleString()}
                              </Typography>
                            </Grid>
                          </>
                        )}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            合計
                          </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            ¥{order.total.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 注文アイテム一覧 */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  注文アイテム
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>商品名</TableCell>
                        <TableCell>オプション</TableCell>
                        <TableCell align="right">単価</TableCell>
                        <TableCell align="right">数量</TableCell>
                        <TableCell align="right">小計</TableCell>
                        <TableCell>状態</TableCell>
                        <TableCell align="center">アクション</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <FoodIcon fontSize="small" sx={{ mr: 1 }} />
                              {item.name}
                            </Box>
                            {item.notes && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                備考: {item.notes}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.options && item.options.length > 0 ? (
                              item.options.map((option, index) => (
                                <Chip
                                  key={index}
                                  label={option}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            ¥{item.price.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {item.quantity}
                          </TableCell>
                          <TableCell align="right">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusDisplay(item.status).label}
                              color={getStatusDisplay(item.status).color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {order.status !== ORDER_STATUS.CANCELED && 
                             order.status !== ORDER_STATUS.PAID && (
                              <Box>
                                {item.status !== ORDER_STATUS.READY && (
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleUpdateItemStatus(item.id, ORDER_STATUS.READY)}
                                    title="提供準備完了にする"
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                )}
                                {item.status !== ORDER_STATUS.DELIVERED && 
                                 item.status !== ORDER_STATUS.CANCELED && (
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleUpdateItemStatus(item.id, ORDER_STATUS.DELIVERED)}
                                    title="提供済みにする"
                                  >
                                    <ReceiptIcon fontSize="small" />
                                  </IconButton>
                                )}
                                {item.status !== ORDER_STATUS.CANCELED && (
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleUpdateItemStatus(item.id, ORDER_STATUS.CANCELED)}
                                    title="キャンセルにする"
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Button
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ mr: 1 }}
          >
            印刷
          </Button>
          {order.status === ORDER_STATUS.DELIVERED && !order.paid && (
            <Button
              startIcon={<PaymentIcon />}
              variant="contained"
              color="success"
              onClick={handleOpenPaymentDialog}
            >
              支払い処理
            </Button>
          )}
        </Box>
        
        <Box>
          {order.status !== ORDER_STATUS.CANCELED && order.status !== ORDER_STATUS.PAID && (
            <>
              {order.status !== ORDER_STATUS.READY && (
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => handleUpdateStatus(ORDER_STATUS.READY)}
                  sx={{ mr: 1 }}
                >
                  提供準備完了にする
                </Button>
              )}
              {order.status !== ORDER_STATUS.DELIVERED && (
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => handleUpdateStatus(ORDER_STATUS.DELIVERED)}
                  sx={{ mr: 1 }}
                >
                  提供済みにする
                </Button>
              )}
              <Button
                color="error"
                variant="outlined"
                onClick={() => handleUpdateStatus(ORDER_STATUS.CANCELED)}
              >
                キャンセル
              </Button>
            </>
          )}
        </Box>
      </DialogActions>

      {/* 支払い処理ダイアログ */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        orderId={order.id}
        orderTotal={order.total}
        orderDiscount={order.discount || 0}
        onPaymentComplete={handlePaymentComplete}
      />
    </Dialog>
  );
};

export default OrderDetails;
