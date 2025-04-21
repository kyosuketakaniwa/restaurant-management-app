import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  Button,
  IconButton,
  Badge,
  LinearProgress,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Timer as TimerIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  LocalDining as LocalDiningIcon,
  CheckCircle as CheckCircleIcon,
  RestaurantMenu as RestaurantMenuIcon,
  TableRestaurant as TableIcon
} from '@mui/icons-material';

/**
 * 注文カードコンポーネント
 * キッチンディスプレイシステムで各注文情報を表示するためのカード
 */
const OrderCard = ({ order, onView, onStatusChange }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapsedTimeText, setElapsedTimeText] = useState('');
  const [timerColor, setTimerColor] = useState('primary');
  
  // 注文経過時間の計算
  useEffect(() => {
    const calculateElapsedTime = () => {
      const orderTime = new Date(order.createdAt);
      const now = new Date();
      const diffMs = now - orderTime;
      const diffMins = Math.floor(diffMs / 60000);
      
      setElapsedTime(diffMins);
      
      // 時間によって表示と色を変更
      if (diffMins < 5) {
        setElapsedTimeText(`${diffMins}分`);
        setTimerColor('success');
      } else if (diffMins < 10) {
        setElapsedTimeText(`${diffMins}分`);
        setTimerColor('warning');
      } else {
        setElapsedTimeText(`${diffMins}分`);
        setTimerColor('error');
      }
    };
    
    calculateElapsedTime();
    
    // 1分ごとに更新
    const interval = setInterval(calculateElapsedTime, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, [order.createdAt]);
  
  // メニュー開閉ハンドラー
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // ステータスに基づいた色とラベルを取得
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', label: '受付待ち', progress: 5 };
      case 'confirmed':
        return { color: 'info', label: '受付済み', progress: 20 };
      case 'preparing':
        return { color: 'primary', label: '調理中', progress: 60 };
      case 'ready':
        return { color: 'success', label: '提供準備完了', progress: 100 };
      case 'delivered':
        return { color: 'success', label: '提供済み', progress: 100 };
      case 'completed':
        return { color: 'default', label: '完了', progress: 100 };
      case 'cancelled':
        return { color: 'error', label: 'キャンセル', progress: 100 };
      default:
        return { color: 'default', label: '不明', progress: 0 };
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
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const statusInfo = getStatusInfo(order.status);
  const nextStatus = getNextStatus(order.status);
  
  return (
    <Card 
      sx={{ 
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 5,
        borderColor: `${statusInfo.color}.main`
      }}
    >
      {/* 進捗バー */}
      <LinearProgress 
        variant="determinate" 
        value={statusInfo.progress} 
        color={statusInfo.color}
        sx={{ height: 5 }}
      />
      
      <CardContent sx={{ pb: 0, flexGrow: 1 }}>
        {/* ヘッダー: 注文ID、ステータス、経過時間 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            #{order.id.substring(0, 8)}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip 
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimerIcon fontSize="small" color={timerColor} sx={{ mr: 0.5 }} />
            <Typography variant="body2" color={`${timerColor}.main`}>
              {elapsedTimeText}
            </Typography>
          </Box>
        </Box>
        
        {/* テーブル情報 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TableIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {order.tableId || '持ち帰り'}
          </Typography>
        </Box>
        
        {/* 時間情報 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatTime(order.createdAt)}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        {/* 注文アイテム */}
        <Typography variant="subtitle2" gutterBottom>
          注文内容:
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {order.items.map((item, index) => (
            <Box key={index} sx={{ mb: 0.5 }}>
              <Typography variant="body2">
                {item.name} × {item.quantity}
              </Typography>
              {item.options && Object.keys(item.options).length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {Object.entries(item.options)
                    .filter(([key, value]) => key !== 'notes' && value)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
        
        {/* メモ情報 (あれば) */}
        {order.notes && (
          <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              注文メモ: {order.notes}
            </Typography>
          </Box>
        )}
        
        {order.kitchenNote && (
          <Box sx={{ bgcolor: '#e8f4fd', p: 1, borderRadius: 1 }}>
            <Typography variant="caption" color="primary">
              キッチンメモ: {order.kitchenNote}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button 
          size="small" 
          variant="outlined"
          onClick={onView}
        >
          詳細
        </Button>
        
        {nextStatus && (
          <Button
            size="small"
            variant="contained"
            color={statusInfo.color}
            startIcon={nextStatus.icon}
            onClick={() => onStatusChange(nextStatus.value)}
          >
            {nextStatus.label}
          </Button>
        )}
      </CardActions>
      
      {/* アクションメニュー */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          onView();
        }}>
          詳細を表示
        </MenuItem>
        {nextStatus && (
          <MenuItem onClick={() => {
            handleMenuClose();
            onStatusChange(nextStatus.value);
          }}>
            {nextStatus.label}
          </MenuItem>
        )}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <MenuItem onClick={() => {
            // 優先度設定機能（モック）
            handleMenuClose();
            alert('優先度が設定されました');
          }}>
            優先度を上げる
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default OrderCard;
