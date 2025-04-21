import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
// @mui/labが問題を起こしているため、代替のレイアウトを使用
// import { 
//   Timeline,
//   TimelineItem,
//   TimelineSeparator,
//   TimelineConnector,
//   TimelineContent,
//   TimelineDot,
//   TimelineOppositeContent
// } from '@mui/lab';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { inventoryService } from '../api';

const InventoryUsageHistoryDialog = ({ open, onClose, inventoryItem }) => {
  const [usageHistory, setUsageHistory] = useState([]);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [relatedMenuItems, setRelatedMenuItems] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && inventoryItem) {
      fetchUsageHistory();
      fetchRelatedItems();
    }
  }, [open, inventoryItem, timeRange]);

  const fetchUsageHistory = async () => {
    if (!inventoryItem) return;
    
    setLoading(true);
    try {
      const data = await inventoryService.getInventoryUsageHistory(inventoryItem.id, timeRange);
      setUsageHistory(data);
    } catch (error) {
      console.error('在庫使用履歴の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedItems = async () => {
    if (!inventoryItem) return;
    
    try {
      const [recipesData, menuItemsData] = await Promise.all([
        inventoryService.getRelatedRecipes(inventoryItem.id),
        inventoryService.getRelatedMenuItems(inventoryItem.id)
      ]);
      
      setRelatedRecipes(recipesData);
      setRelatedMenuItems(menuItemsData);
    } catch (error) {
      console.error('関連アイテムの取得に失敗しました', error);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getUsageTypeIcon = (type) => {
    switch (type) {
      case 'recipe':
        return <ReceiptIcon color="primary" />;
      case 'menu':
        return <RestaurantIcon color="secondary" />;
      case 'adjustment':
        return <InventoryIcon color="action" />;
      default:
        return <InventoryIcon />;
    }
  };

  const getUsageTypeLabel = (type) => {
    switch (type) {
      case 'recipe':
        return 'レシピ使用';
      case 'menu':
        return 'メニュー販売';
      case 'adjustment_in':
        return '入庫調整';
      case 'adjustment_out':
        return '出庫調整';
      default:
        return '調整';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {inventoryItem ? `${inventoryItem.name}の使用履歴` : '在庫使用履歴'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {inventoryItem && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">
                現在の在庫: <strong>{inventoryItem.quantity} {inventoryItem.unit}</strong>
              </Typography>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>期間</InputLabel>
                <Select
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  label="期間"
                >
                  <MenuItem value="week">過去1週間</MenuItem>
                  <MenuItem value="month">過去1ヶ月</MenuItem>
                  <MenuItem value="quarter">過去3ヶ月</MenuItem>
                  <MenuItem value="year">過去1年</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>使用履歴</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : usageHistory.length > 0 ? (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {usageHistory.map((usage, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 100, textAlign: 'left', mr: 2 }}>
                      <Typography color="text.secondary" variant="body2">
                        {formatDate(usage.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: usage.type.includes('adjustment_in') ? 'success.main' : 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {usage.type.includes('adjustment_in') ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      </Box>
                    </Box>
                    <Paper elevation={3} sx={{ p: 2, flex: 1 }}>
                      <Typography variant="subtitle2" component="span">
                        {getUsageTypeLabel(usage.type)}
                      </Typography>
                      <Typography>
                        {usage.type.includes('adjustment_in') ? '+' : '-'}{usage.quantity} {inventoryItem.unit}
                      </Typography>
                      {usage.reference && (
                        <Typography variant="body2" color="text.secondary">
                          {usage.reference}
                        </Typography>
                      )}
                      {usage.reason && (
                        <Typography variant="body2" color="text.secondary">
                          理由: {usage.reason}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
                この期間の使用履歴はありません
              </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>関連レシピ</Typography>
            {relatedRecipes.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>レシピ名</TableCell>
                      <TableCell>使用量</TableCell>
                      <TableCell>使用頻度</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatedRecipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell>{recipe.name}</TableCell>
                        <TableCell>{recipe.usageAmount} {inventoryItem.unit}/回</TableCell>
                        <TableCell>
                          <Chip 
                            label={recipe.usageFrequency} 
                            size="small"
                            color={
                              recipe.usageFrequency === '高' ? 'error' :
                              recipe.usageFrequency === '中' ? 'warning' : 'success'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', my: 2 }}>
                関連するレシピはありません
              </Typography>
            )}

            <Typography variant="h6" sx={{ mb: 2 }}>関連メニュー</Typography>
            {relatedMenuItems.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>メニュー名</TableCell>
                      <TableCell>カテゴリ</TableCell>
                      <TableCell>使用量</TableCell>
                      <TableCell>販売頻度</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatedMenuItems.map((menuItem) => (
                      <TableRow key={menuItem.id}>
                        <TableCell>{menuItem.name}</TableCell>
                        <TableCell>{menuItem.category}</TableCell>
                        <TableCell>{menuItem.usageAmount} {inventoryItem.unit}/個</TableCell>
                        <TableCell>
                          <Chip 
                            label={menuItem.salesFrequency} 
                            size="small"
                            color={
                              menuItem.salesFrequency === '高' ? 'error' :
                              menuItem.salesFrequency === '中' ? 'warning' : 'success'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', my: 2 }}>
                関連するメニュー項目はありません
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryUsageHistoryDialog;
