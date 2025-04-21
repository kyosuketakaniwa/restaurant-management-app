import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

const PriceHistoryDialog = ({ open, onClose, menuItem }) => {
  const [newPrice, setNewPrice] = useState('');
  const [newReason, setNewReason] = useState('');
  const [priceHistory, setPriceHistory] = useState(menuItem?.priceHistory || []);

  // 価格変更を追加
  const handleAddPriceChange = () => {
    if (!newPrice || isNaN(parseFloat(newPrice))) return;

    const currentPrice = menuItem.price;
    const priceValue = parseFloat(newPrice);
    
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      oldPrice: currentPrice,
      newPrice: priceValue,
      reason: newReason || '価格調整',
      change: priceValue - currentPrice
    };
    
    const updatedHistory = [newEntry, ...priceHistory];
    setPriceHistory(updatedHistory);
    
    // 実際のアプリでは、APIを呼び出して価格履歴を保存
    // await menuApi.updateMenuItemPrice(menuItem.id, priceValue, updatedHistory);
    
    // 入力フィールドをリセット
    setNewPrice('');
    setNewReason('');
  };

  // 価格変動の方向に基づいてアイコンを表示
  const getPriceChangeIcon = (change) => {
    if (change > 0) {
      return <TrendingUpIcon color="error" fontSize="small" />;
    } else if (change < 0) {
      return <TrendingDownIcon color="success" fontSize="small" />;
    } else {
      return <TrendingFlatIcon color="action" fontSize="small" />;
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
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
          <Typography variant="h6">
            価格履歴 - {menuItem?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            現在の価格: ¥{menuItem?.price.toLocaleString()}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
            <TextField
              label="新しい価格"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              }}
              sx={{ mr: 2 }}
            />
            <TextField
              label="変更理由"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              sx={{ mr: 2, flexGrow: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPriceChange}
              disabled={!newPrice || isNaN(parseFloat(newPrice))}
            >
              価格を更新
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {priceHistory.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日付</TableCell>
                  <TableCell align="right">旧価格</TableCell>
                  <TableCell align="right">新価格</TableCell>
                  <TableCell align="right">変動</TableCell>
                  <TableCell>変更理由</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {priceHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell align="right">¥{entry.oldPrice.toLocaleString()}</TableCell>
                    <TableCell align="right">¥{entry.newPrice.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {getPriceChangeIcon(entry.change)}
                        <Typography 
                          variant="body2" 
                          color={entry.change > 0 ? 'error.main' : entry.change < 0 ? 'success.main' : 'text.secondary'}
                          sx={{ ml: 0.5 }}
                        >
                          {entry.change > 0 ? '+' : ''}{entry.change.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{entry.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              価格変更履歴はありません
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PriceHistoryDialog;
