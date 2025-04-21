import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Divider, 
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Kitchen as KitchenIcon,
  Room as RoomIcon,
  AccessTime as AccessTimeIcon,
  HomeWork as HomeWorkIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useOrder } from '../contexts/OrderContext';

/**
 * 注文確認ページ
 * 顧客がデジタルメニューから注文した後に表示される画面
 */
const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { activeOrders, completedOrders } = useOrder();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(15); // 分単位

  // 注文情報の取得
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // アクティブな注文から検索
        let foundOrder = activeOrders.find(o => o.id === orderId);
        
        // アクティブな注文になければ完了済み注文から検索
        if (!foundOrder) {
          foundOrder = completedOrders.find(o => o.id === orderId);
        }
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          // 実際のAPIを使う場合
          // const response = await orderApi.getOrderById(orderId);
          // setOrder(response.data);
          
          // モックデータ
          setOrder({
            id: orderId,
            items: [
              {
                id: 1,
                name: 'シーザーサラダ',
                price: 980,
                quantity: 1,
                options: { ドレッシング: 'シーザー', サイズ: 'M', notes: '多めのドレッシングでお願いします' },
                subtotal: 980
              },
              {
                id: 2,
                name: '牛フィレステーキ',
                price: 3200,
                quantity: 2,
                options: { '焼き加減': 'ミディアムレア', 'サイドディッシュ': 'マッシュポテト' },
                subtotal: 6400
              }
            ],
            tableId: 'A5',
            status: 'preparing',
            createdAt: new Date().toISOString(),
            total: 7380,
            estimatedCompletionTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
          });
        }
      } catch (err) {
        console.error('注文の取得に失敗しました', err);
        setError('注文情報の取得に失敗しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, activeOrders, completedOrders]);

  // 注文ステータスに基づいてステップを設定
  const getActiveStep = () => {
    if (!order) return 0;
    
    switch (order.status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'delivered':
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  // 時間のフォーマット
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 合計金額の計算
  const calculateTotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // 消費税の計算
  const calculateTax = () => {
    return Math.floor(calculateTotal() * 0.1);
  };

  // 最終合計の計算（税込）
  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  // メニューに戻る
  const handleBackToMenu = () => {
    navigate('/customer/menu');
  };

  // 注文をシェア
  const handleShareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'レストラン注文詳細',
          text: `注文番号: ${order.id} - テーブル: ${order.tableId}\n合計: ¥${calculateGrandTotal().toLocaleString()}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('共有に失敗しました', err);
      }
    } else {
      alert('お使いのブラウザはWeb Share APIをサポートしていません');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            エラーが発生しました
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            注文が見つかりません
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleBackToMenu}
            sx={{ mt: 2 }}
          >
            メニューに戻る
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 注文ステータスカード */}
      <Card sx={{ mb: 4, overflow: 'visible', position: 'relative' }}>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -24, 
            left: 24, 
            bgcolor: 'primary.main',
            color: 'white',
            py: 1,
            px: 3,
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            注文番号: {order.id.substring(0, 8)}
          </Typography>
        </Box>
        <CardContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ mt: 1 }}>
              ご注文ありがとうございます
            </Typography>
            <Box>
              <Chip 
                icon={<RoomIcon />} 
                label={`テーブル ${order.tableId}`} 
                color="secondary" 
                sx={{ mr: 1 }}
              />
              <IconButton onClick={handleShareOrder} color="primary">
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    注文時間
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(order.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                  <HomeWorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    お召し上がり提供予定時間
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(order.estimatedCompletionTime)}
                    <Chip 
                      label={`約${estimatedTime}分`} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Stepper activeStep={getActiveStep()} alternativeLabel sx={{ mb: 3 }}>
            <Step>
              <StepLabel>注文受付</StepLabel>
            </Step>
            <Step>
              <StepLabel>確認済み</StepLabel>
            </Step>
            <Step>
              <StepLabel>調理中</StepLabel>
            </Step>
            <Step>
              <StepLabel>準備完了</StepLabel>
            </Step>
            <Step>
              <StepLabel>提供済み</StepLabel>
            </Step>
          </Stepper>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              調理の進捗状況を随時更新しています。このページを更新して最新状況をご確認ください。
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* 注文内容 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          ご注文内容
        </Typography>
        
        <List disablePadding>
          {order.items.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        {item.name} × {item.quantity}
                      </Typography>
                      <Typography variant="subtitle1">
                        ¥{item.subtotal.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {Object.entries(item.options).length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {Object.entries(item.options)
                            .filter(([key, value]) => key !== 'notes' && value)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </Typography>
                      )}
                      {item.options.notes && (
                        <Typography variant="body2" color="text.secondary">
                          メモ: {item.options.notes}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < order.items.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>小計</Typography>
            <Typography>¥{calculateTotal().toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>消費税（10%）</Typography>
            <Typography>¥{calculateTax().toLocaleString()}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              合計
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              ¥{calculateGrandTotal().toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* アクション */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          startIcon={<RestaurantMenuIcon />}
          onClick={handleBackToMenu}
        >
          メニューに戻る
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<CheckCircleIcon />}
          onClick={() => alert('テーブルでのお会計をお願いします。')}
        >
          お会計をリクエスト
        </Button>
      </Box>
    </Container>
  );
};

export default OrderConfirmation;
