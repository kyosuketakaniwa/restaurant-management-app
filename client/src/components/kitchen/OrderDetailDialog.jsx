import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Tooltip,
  ButtonGroup
} from '@mui/material';
import { 
  LocalDining as LocalDiningIcon,
  CheckCircle as CheckCircleIcon,
  RestaurantMenu as RestaurantMenuIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  TableRestaurant as TableIcon,
  Print as PrintIcon
} from '@mui/icons-material';

/**
 * 注文詳細ダイアログ
 * 注文の詳細情報を表示し、ステータス変更などの操作を提供する
 */
const OrderDetailDialog = ({ open, order, onClose, onStatusChange, onNoteClick }) => {
  const [loading, setLoading] = useState(false);
  
  // ステータスに基づいた色とラベルを取得
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', label: '受付待ち' };
      case 'confirmed':
        return { color: 'info', label: '受付済み' };
      case 'preparing':
        return { color: 'primary', label: '調理中' };
      case 'ready':
        return { color: 'success', label: '提供準備完了' };
      case 'delivered':
        return { color: 'success', label: '提供済み' };
      case 'completed':
        return { color: 'default', label: '完了' };
      case 'cancelled':
        return { color: 'error', label: 'キャンセル' };
      default:
        return { color: 'default', label: '不明' };
    }
  };
  
  // 次のステータスを取得
  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
      case 'confirmed':
        return { value: 'preparing', label: '調理開始', icon: <LocalDiningIcon /> };
      case 'preparing':
        return { value: 'ready', label: '調理完了', icon: <CheckCircleIcon /> };
      case 'ready':
        return { value: 'delivered', label: '提供済み', icon: <RestaurantMenuIcon /> };
      default:
        return null;
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
  
  // 経過時間の計算
  const calculateElapsedTime = (dateString) => {
    const orderTime = new Date(dateString);
    const now = new Date();
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}分`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}時間${mins}分`;
    }
  };
  
  // 印刷ハンドラー
  const handlePrint = () => {
    // 実際のアプリケーションでは印刷機能を実装
    alert('注文票を印刷しました');
  };
  
  // ステータス更新ハンドラー
  const handleStatusChange = (newStatus) => {
    setLoading(true);
    
    // 実際のアプリケーションではAPIを呼び出してステータスを更新
    setTimeout(() => {
      onStatusChange(newStatus);
      setLoading(false);
    }, 500);
  };
  
  if (!order) {
    return null;
  }
  
  const statusInfo = getStatusInfo(order.status);
  const nextStatus = getNextStatus(order.status);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            注文詳細 #{order.id.substring(0, 8)}
          </Typography>
          <Chip 
            label={statusInfo.label}
            color={statusInfo.color}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            {/* 注文情報 */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {formatDateTime(order.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      経過時間: {calculateElapsedTime(order.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TableIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      テーブル: {order.tableId || '持ち帰り'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  {order.customer && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        顧客: {order.customer.name}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
            
            {/* 注文アイテム */}
            <Typography variant="subtitle1" gutterBottom>
              注文内容
            </Typography>
            <List disablePadding sx={{ mb: 3 }}>
              {order.items.map((item, index) => (
                <Paper 
                  key={index} 
                  variant="outlined"
                  sx={{ mb: 1 }}
                >
                  <ListItem sx={{ py: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {item.name}
                          </Typography>
                          <Typography variant="subtitle2">
                            ×{item.quantity}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          {item.options && Object.entries(item.options).length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              {Object.entries(item.options)
                                .filter(([key, value]) => key !== 'notes' && value)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')}
                            </Typography>
                          )}
                          {item.options?.notes && (
                            <Typography variant="body2" color="text.secondary">
                              メモ: {item.options.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={5}>
            {/* メモエリア */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  メモ
                </Typography>
                <Tooltip title="編集">
                  <IconButton size="small" onClick={onNoteClick}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {order.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    注文メモ:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2">
                      {order.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  キッチンメモ:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#e8f4fd', minHeight: 80 }}>
                  <Typography variant="body2">
                    {order.kitchenNote || 'メモはありません。追加するには編集ボタンをクリックしてください。'}
                  </Typography>
                </Paper>
              </Box>
            </Paper>
            
            {/* ステータス履歴 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ステータス履歴
              </Typography>
              
              <List dense disablePadding>
                {/* 実際のアプリケーションではステータス変更のログを表示 */}
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary="注文受付"
                    secondary={formatDateTime(order.createdAt)} 
                  />
                </ListItem>
                
                {order.status !== 'pending' && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="確認済み"
                      secondary={formatDateTime(new Date(new Date(order.createdAt).getTime() + 2 * 60000))} 
                    />
                  </ListItem>
                )}
                
                {order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' ? (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="調理開始"
                      secondary={formatDateTime(new Date(new Date(order.createdAt).getTime() + 5 * 60000))} 
                    />
                  </ListItem>
                ) : null}
                
                {order.status === 'ready' || order.status === 'delivered' ? (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="調理完了"
                      secondary={formatDateTime(new Date(new Date(order.createdAt).getTime() + 15 * 60000))} 
                    />
                  </ListItem>
                ) : null}
                
                {order.status === 'delivered' && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary="提供済み"
                      secondary={formatDateTime(new Date(new Date(order.createdAt).getTime() + 18 * 60000))} 
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Button 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            印刷
          </Button>
          <Button 
            startIcon={<CommentIcon />}
            onClick={onNoteClick}
          >
            メモ
          </Button>
        </Box>
        <Box>
          <Button onClick={onClose}>
            閉じる
          </Button>
          {nextStatus && (
            <Button 
              variant="contained"
              color={statusInfo.color}
              startIcon={nextStatus.icon}
              onClick={() => handleStatusChange(nextStatus.value)}
              disabled={loading}
            >
              {nextStatus.label}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog;
