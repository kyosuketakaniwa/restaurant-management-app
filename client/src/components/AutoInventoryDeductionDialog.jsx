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
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { menuService, inventoryService } from '../api';

const AutoInventoryDeductionDialog = ({ open, onClose, menuItem }) => {
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [autoDeductEnabled, setAutoDeductEnabled] = useState(false);
  const [quantityInputs, setQuantityInputs] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  useEffect(() => {
    if (open && menuItem) {
      fetchInventoryItems();
      checkAutoDeductStatus();
    }
  }, [open, menuItem]);

  const fetchInventoryItems = async () => {
    if (!menuItem) return;
    
    setLoading(true);
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await menuService.getMenuItemIngredients(menuItem.id);
      const mockData = [
        { id: 1, name: '米', currentQuantity: 25, unit: 'kg', requiredQuantity: 0.1 },
        { id: 2, name: '鶏肉', currentQuantity: 5, unit: 'kg', requiredQuantity: 0.15 },
        { id: 3, name: '玉ねぎ', currentQuantity: 10, unit: 'kg', requiredQuantity: 0.05 },
        { id: 4, name: 'にんじん', currentQuantity: 8, unit: 'kg', requiredQuantity: 0.03 },
      ];
      
      // 入力状態を初期化
      const initialInputs = {};
      mockData.forEach(item => {
        initialInputs[item.id] = item.requiredQuantity;
      });
      
      setInventoryItems(mockData);
      setQuantityInputs(initialInputs);
    } catch (error) {
      console.error('材料データの取得に失敗しました', error);
      setAlert({
        show: true,
        message: '材料データの取得に失敗しました',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAutoDeductStatus = async () => {
    if (!menuItem) return;
    
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await menuService.getAutoDeductStatus(menuItem.id);
      setAutoDeductEnabled(menuItem.autoDeductEnabled || false);
    } catch (error) {
      console.error('自動引き落とし設定の取得に失敗しました', error);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantityInputs(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleToggleAutoDeduct = () => {
    setAutoDeductEnabled(!autoDeductEnabled);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 自動引き落とし設定の保存
      // await menuService.updateAutoDeductSettings(menuItem.id, {
      //   enabled: autoDeductEnabled,
      //   ingredients: Object.keys(quantityInputs).map(itemId => ({
      //     inventoryItemId: parseInt(itemId),
      //     quantity: parseFloat(quantityInputs[itemId])
      //   }))
      // });
      
      setAlert({
        show: true,
        message: '自動引き落とし設定を保存しました',
        severity: 'success'
      });
      
      // 3秒後にダイアログを閉じる
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('自動引き落とし設定の保存に失敗しました', error);
      setAlert({
        show: true,
        message: '自動引き落とし設定の保存に失敗しました',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (currentQuantity, requiredQuantity) => {
    // 10回分の在庫があるかどうかをチェック
    const ratio = currentQuantity / requiredQuantity;
    
    if (ratio < 5) {
      return { status: 'danger', message: '在庫不足', icon: <WarningIcon color="error" /> };
    } else if (ratio < 20) {
      return { status: 'warning', message: '注意', icon: <WarningIcon color="warning" /> };
    } else {
      return { status: 'ok', message: '十分', icon: <CheckCircleIcon color="success" /> };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {menuItem ? `${menuItem.name}の在庫自動引き落とし設定` : '在庫自動引き落とし設定'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {alert.show && (
              <Alert severity={alert.severity} sx={{ mb: 2 }}>
                {alert.message}
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoDeductEnabled}
                    onChange={handleToggleAutoDeduct}
                    color="primary"
                  />
                }
                label="このメニュー項目の販売時に在庫を自動的に引き落とす"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                この機能を有効にすると、POS システムでこのメニュー項目が販売されるたびに、
                設定した量の在庫が自動的に減少します。
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              必要な材料と数量
              <Tooltip title="1つのメニュー項目に必要な各材料の量を設定してください。">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            {inventoryItems.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>材料名</TableCell>
                      <TableCell>現在の在庫</TableCell>
                      <TableCell>必要数量（1個あたり）</TableCell>
                      <TableCell>在庫状況</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItems.map((item) => {
                      const stockStatus = getStockStatus(item.currentQuantity, quantityInputs[item.id] || 0);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.currentQuantity} {item.unit}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={quantityInputs[item.id] || ''}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              InputProps={{
                                endAdornment: item.unit,
                                inputProps: { 
                                  min: 0, 
                                  step: 0.01 
                                }
                              }}
                              disabled={!autoDeductEnabled}
                              sx={{ width: 150 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {stockStatus.icon}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {stockStatus.message}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
                このメニュー項目に関連する材料はありません
              </Typography>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>ヒント:</strong> レシピが関連付けられている場合は、レシピから材料と数量を自動的に取得できます。
                </Typography>
              </Alert>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoInventoryDeductionDialog;
