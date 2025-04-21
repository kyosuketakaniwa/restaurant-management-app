import React, { useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import TableReservationDialog from './TableReservationDialog';
import TableStatisticsDialog from './TableStatisticsDialog';
import PaymentDialog from '../payment/PaymentDialog';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  Grid,
  IconButton,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { 
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TableRestaurant as TableIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  DataUsage as DataUsageIcon,
  LocalDining as LocalDiningIcon,
  QrCode as QrCodeIcon,
  CalendarMonth as CalendarIcon,
  ShowChart as ShowChartIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

/**
 * テーブル詳細ダイアログ
 * 選択したテーブルの詳細情報を表示するダイアログ
 */
const TableDetailDialog = ({ 
  open, 
  table, 
  onClose, 
  onEdit, 
  onDelete, 
  onStatusChange,
  activeOrders = []
}) => {
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [statisticsDialogOpen, setStatisticsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderTotal, setSelectedOrderTotal] = useState(0);
  
  // ステータスに基づいた色とラベルを取得
  const getStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return { color: 'success', label: '利用可能' };
      case 'occupied':
        return { color: 'error', label: '使用中' };
      case 'reserved':
        return { color: 'warning', label: '予約済み' };
      case 'maintenance':
        return { color: 'default', label: 'メンテナンス中' };
      default:
        return { color: 'primary', label: '不明' };
    }
  };
  
  // 日時のフォーマット
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!table) return null;
  
  const statusInfo = getStatusInfo(table.status);
  
  // 支払いダイアログを開く
  const handleOpenPayment = (order) => {
    setSelectedOrderId(order.id);
    setSelectedOrderTotal(order.total || 0);
    setPaymentDialogOpen(true);
  };
  
  // 支払い完了時の処理
  const handlePaymentComplete = (completedOrder) => {
    console.log('テーブルからの支払い処理が完了しました:', completedOrder);
    // 支払い完了時に最新の注文情報を取得するために更新イベントを送る
    if (onClose) {
      onClose(true);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TableIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              {table.name}
            </Typography>
          </Box>
          <Box>
            <Chip 
              label={statusInfo.label}
              color={statusInfo.color}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {/* テーブル基本情報 */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                基本情報
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    ID
                  </Typography>
                  <Typography variant="body1">
                    {table.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    セクション
                  </Typography>
                  <Typography variant="body1">
                    {table.section}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    座席数
                  </Typography>
                  <Typography variant="body1">
                    {table.seats}人席
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    形状
                  </Typography>
                  <Typography variant="body1">
                    {table.shape === 'circle' ? '円形' : '長方形'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* 状態変更 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                状態変更
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <ButtonGroup fullWidth>
                <Tooltip title="利用可能に変更">
                  <Button
                    startIcon={<CheckCircleIcon />}
                    color="success"
                    variant={table.status === 'available' ? 'contained' : 'outlined'}
                    onClick={() => onStatusChange(table.id, 'available')}
                    disabled={table.status === 'available'}
                  >
                    利用可能
                  </Button>
                </Tooltip>
                
                <Tooltip title="使用中に変更">
                  <Button
                    startIcon={<DataUsageIcon />}
                    color="error"
                    variant={table.status === 'occupied' ? 'contained' : 'outlined'}
                    onClick={() => onStatusChange(table.id, 'occupied')}
                    disabled={table.status === 'occupied'}
                  >
                    使用中
                  </Button>
                </Tooltip>
                
                <Tooltip title="予約済みに変更">
                  <Button
                    startIcon={<EventIcon />}
                    color="warning"
                    variant={table.status === 'reserved' ? 'contained' : 'outlined'}
                    onClick={() => onStatusChange(table.id, 'reserved')}
                    disabled={table.status === 'reserved'}
                  >
                    予約済み
                  </Button>
                </Tooltip>
                
                <Tooltip title="メンテナンス中に変更">
                  <Button
                    startIcon={<CancelIcon />}
                    color="inherit"
                    variant={table.status === 'maintenance' ? 'contained' : 'outlined'}
                    onClick={() => onStatusChange(table.id, 'maintenance')}
                    disabled={table.status === 'maintenance'}
                  >
                    メンテナンス
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* アクティブな注文 */}
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  現在の注文
                </Typography>
                {activeOrders.length > 0 && (
                  <Chip
                    label={`${activeOrders.length}件`}
                    color="error"
                    size="small"
                  />
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {activeOrders.length > 0 ? (
                <List disablePadding>
                  {activeOrders.map(order => (
                    <Paper 
                      key={order.id} 
                      variant="outlined" 
                      sx={{ mb: 2 }}
                    >
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">
                                注文 #{order.id.substring(0, 8)}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={
                                  order.status === 'preparing' ? '調理中' :
                                  order.status === 'ready' ? '準備完了' :
                                  order.status === 'delivered' ? '提供済み' :
                                  '受付済み'
                                }
                                color={
                                  order.status === 'preparing' ? 'primary' :
                                  order.status === 'ready' ? 'success' :
                                  order.status === 'delivered' ? 'secondary' :
                                  'warning'
                                }
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2">
                                注文時間: {formatDateTime(order.createdAt)}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {order.items.map((item, index) => (
                                  <Typography key={index} variant="body2" color="text.secondary">
                                    {item.name} × {item.quantity}
                                  </Typography>
                                ))}
                                
                                {!order.paid && (
                                  <Box sx={{ mt: 1, textAlign: 'right' }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      合計: ¥{order.total ? order.total.toLocaleString() : '計算中...'}
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<PaymentIcon />}
                                      onClick={() => handleOpenPayment(order)}
                                      sx={{ mt: 1 }}
                                    >
                                      会計処理
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100% - 50px)',
                    py: 3
                  }}
                >
                  <LocalDiningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    現在の注文はありません
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      {/* 通常のDialogActionsの代わりにDialogContent内にBoxで機能ボタンを追加 */}
      <DialogContent sx={{ p: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          テーブル操作
        </Typography>
        
        {/* 機能ボタン */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<QrCodeIcon />}
              onClick={() => setQrCodeOpen(true)}
              sx={{ py: 1.5 }}
            >
              QRコード
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="info"
              size="large"
              startIcon={<CalendarIcon />}
              onClick={() => setReservationDialogOpen(true)}
              sx={{ py: 1.5 }}
            >
              予約管理
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<ShowChartIcon />}
              onClick={() => setStatisticsDialogOpen(true)}
              sx={{ py: 1.5 }}
            >
              統計情報
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      
      {/* アクションボタンは通常のDialogActionsに配置 */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          startIcon={<DeleteIcon />}
          color="error"
          variant="outlined"
          onClick={() => onDelete(table.id)}
        >
          削除
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} sx={{ mr: 1 }}>
          閉じる
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          編集
        </Button>
      </DialogActions>
      
      {/* QRコード生成ダイアログ */}
      <QRCodeGenerator 
        open={qrCodeOpen} 
        onClose={() => setQrCodeOpen(false)} 
        tableName={table.name}
      />
      
      <TableReservationDialog 
        open={reservationDialogOpen}
        onClose={() => setReservationDialogOpen(false)}
        tableId={table.id}
      />
      
      <TableStatisticsDialog
        open={statisticsDialogOpen}
        onClose={() => setStatisticsDialogOpen(false)}
        tableId={table.id}
      />
      
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        orderId={selectedOrderId}
        orderTotal={selectedOrderTotal}
        orderDiscount={0}
        onPaymentComplete={handlePaymentComplete}
      />
    </Dialog>
  );
};

export default TableDetailDialog;
