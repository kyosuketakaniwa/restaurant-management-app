import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, IconButton,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert,
  Card, CardContent, Tooltip, InputAdornment, Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  SaveAlt as SaveIcon
} from '@mui/icons-material';
// カラーピッカーのためのカスタムコンポーネント

import {
  getTaxSettings,
  saveTaxSettings,
  getCurrencySettings,
  saveCurrencySettings,
  getTaxCategories,
  saveTaxCategory,
  deleteTaxCategory,
  setDefaultTaxCategory,
  DEFAULT_TAX_SETTINGS,
  DEFAULT_CURRENCY_SETTINGS
} from '../../utils/taxUtils';

/**
 * 税率と通貨設定コンポーネント
 */
const TaxCurrencySettings = () => {
  // 状態管理
  const [taxSettings, setTaxSettings] = useState({...DEFAULT_TAX_SETTINGS});
  const [currencySettings, setCurrencySettings] = useState({...DEFAULT_CURRENCY_SETTINGS});
  const [taxCategories, setTaxCategories] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // サンプル通貨表示用の金額
  const sampleAmount = 1234567.89;

  // 初期データのロード
  useEffect(() => {
    loadSettings();
  }, []);

  // 設定のロード
  const loadSettings = () => {
    const loadedTaxSettings = getTaxSettings();
    const loadedCurrencySettings = getCurrencySettings();
    const loadedTaxCategories = getTaxCategories();
    
    setTaxSettings(loadedTaxSettings);
    setCurrencySettings(loadedCurrencySettings);
    setTaxCategories(loadedTaxCategories);
  };

  // 税率設定の変更を処理
  const handleTaxSettingChange = (e) => {
    const { name, value } = e.target;
    setTaxSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 税率設定のトグル変更を処理
  const handleTaxSystemToggle = (e) => {
    const { checked } = e.target;
    setTaxSettings(prev => ({
      ...prev,
      activeTaxSystem: checked ? 'multiple' : 'single'
    }));
  };

  // 通貨設定の変更を処理
  const handleCurrencySettingChange = (e) => {
    const { name, value } = e.target;
    setCurrencySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 数値設定の変更を処理
  const handleNumberSettingChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (name.includes('Rate')) {
      setTaxSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setCurrencySettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  // 税設定を保存
  const handleSaveTaxSettings = () => {
    saveTaxSettings(taxSettings);
    
    setSnackbar({
      open: true,
      message: '税率設定が保存されました',
      severity: 'success'
    });
  };

  // 通貨設定を保存
  const handleSaveCurrencySettings = () => {
    saveCurrencySettings(currencySettings);
    
    setSnackbar({
      open: true,
      message: '通貨設定が保存されました',
      severity: 'success'
    });
  };

  // カラーピッカーを開く
  const handleOpenColorPicker = (color) => {
    setSelectedColor(color);
    setShowColorPicker(true);
  };

  // カラーピッカーを閉じる
  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
  };

  // 色の変更を処理
  const handleColorChange = (e) => {
    const { value } = e.target;
    setSelectedColor(value);
    setEditingCategory(prev => ({
      ...prev,
      color: value
    }));
  };

  // 新規カテゴリダイアログを開く
  const handleOpenNewCategoryDialog = () => {
    const newCategory = {
      id: `category-${Date.now()}`,
      name: '',
      rate: taxSettings.standardRate,
      description: '',
      isDefault: false,
      color: '#9e9e9e'
    };
    
    setEditingCategory(newCategory);
    setIsNewCategory(true);
    setCategoryDialogOpen(true);
  };

  // カテゴリ編集ダイアログを開く
  const handleOpenEditCategoryDialog = (category) => {
    setEditingCategory({...category});
    setIsNewCategory(false);
    setCategoryDialogOpen(true);
  };

  // カテゴリ削除確認ダイアログを開く
  const handleOpenDeleteDialog = (category) => {
    setEditingCategory(category);
    setDeleteDialogOpen(true);
  };

  // カテゴリ入力の変更を処理
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // カテゴリ数値入力の変更を処理
  const handleCategoryNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setEditingCategory(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // カテゴリを保存
  const handleSaveCategory = () => {
    // バリデーション
    if (!editingCategory.name) {
      setSnackbar({
        open: true,
        message: 'カテゴリ名は必須です',
        severity: 'error'
      });
      return;
    }

    if (isNaN(editingCategory.rate) || editingCategory.rate < 0 || editingCategory.rate > 100) {
      setSnackbar({
        open: true,
        message: '税率は0～100の範囲で入力してください',
        severity: 'error'
      });
      return;
    }

    // 保存
    saveTaxCategory(editingCategory);
    
    // 画面の状態を更新
    loadSettings();
    setCategoryDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: isNewCategory ? '新しい税区分が追加されました' : '税区分が更新されました',
      severity: 'success'
    });
  };

  // カテゴリを削除
  const handleDeleteCategory = () => {
    if (['standard', 'reduced', 'exempt'].includes(editingCategory.id)) {
      setSnackbar({
        open: true,
        message: '標準的な税区分は削除できません',
        severity: 'error'
      });
      setDeleteDialogOpen(false);
      return;
    }
    
    const result = deleteTaxCategory(editingCategory.id);
    if (result) {
      loadSettings();
      setDeleteDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: '税区分が削除されました',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: '税区分の削除に失敗しました',
        severity: 'error'
      });
    }
  };

  // デフォルトカテゴリを設定
  const handleSetDefaultCategory = (categoryId) => {
    setDefaultTaxCategory(categoryId);
    loadSettings();
    
    setSnackbar({
      open: true,
      message: 'デフォルトの税区分が変更されました',
      severity: 'success'
    });
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // サンプル通貨表示を生成
  const getSampleCurrencyDisplay = () => {
    const formatter = new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: currencySettings.decimalPlaces,
      maximumFractionDigits: currencySettings.decimalPlaces,
      useGrouping: !!currencySettings.thousandsSeparator
    });
    
    const formattedAmount = formatter.format(sampleAmount);
    
    return currencySettings.position === 'before' 
      ? `${currencySettings.symbol}${formattedAmount}` 
      : `${formattedAmount}${currencySettings.symbol}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        税率・通貨設定
      </Typography>
      
      <Grid container spacing={3}>
        {/* 税率設定 */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  消費税設定
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveTaxSettings}
                >
                  設定を保存
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={taxSettings.activeTaxSystem === 'multiple'}
                        onChange={handleTaxSystemToggle}
                        name="multipleRates"
                      />
                    }
                    label="軽減税率を適用する"
                  />
                  <Tooltip title="軽減税率制度を適用する場合はオンにしてください">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="標準税率 (%)"
                    name="standardRate"
                    type="number"
                    value={taxSettings.standardRate}
                    onChange={handleNumberSettingChange}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 100, step: 0.1 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="軽減税率 (%)"
                    name="reducedRate"
                    type="number"
                    value={taxSettings.reducedRate}
                    onChange={handleNumberSettingChange}
                    fullWidth
                    disabled={taxSettings.activeTaxSystem !== 'multiple'}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 100, step: 0.1 }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 通貨設定 */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  通貨設定
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveCurrencySettings}
                >
                  設定を保存
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="通貨コード"
                    name="code"
                    value={currencySettings.code}
                    onChange={handleCurrencySettingChange}
                    fullWidth
                    placeholder="例: JPY"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="通貨記号"
                    name="symbol"
                    value={currencySettings.symbol}
                    onChange={handleCurrencySettingChange}
                    fullWidth
                    placeholder="例: ¥"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>記号の位置</InputLabel>
                    <Select
                      name="position"
                      value={currencySettings.position}
                      onChange={handleCurrencySettingChange}
                      label="記号の位置"
                    >
                      <MenuItem value="before">前（例: ¥100）</MenuItem>
                      <MenuItem value="after">後（例: 100¥）</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="小数点以下の桁数"
                    name="decimalPlaces"
                    type="number"
                    value={currencySettings.decimalPlaces}
                    onChange={handleNumberSettingChange}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 0, max: 4 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="千単位の区切り文字"
                    name="thousandsSeparator"
                    value={currencySettings.thousandsSeparator}
                    onChange={handleCurrencySettingChange}
                    fullWidth
                    placeholder="例: ,"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="小数点の文字"
                    name="decimalSeparator"
                    value={currencySettings.decimalSeparator}
                    onChange={handleCurrencySettingChange}
                    fullWidth
                    placeholder="例: ."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>丸め方</InputLabel>
                    <Select
                      name="roundingMethod"
                      value={currencySettings.roundingMethod}
                      onChange={handleCurrencySettingChange}
                      label="丸め方"
                    >
                      <MenuItem value="nearest">四捨五入</MenuItem>
                      <MenuItem value="up">切り上げ</MenuItem>
                      <MenuItem value="down">切り捨て</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="textSecondary">
                      表示サンプル
                    </Typography>
                    <Typography variant="h5" align="center" sx={{ mt: 1 }}>
                      {getSampleCurrencyDisplay()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 税区分管理 */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  税区分管理
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenNewCategoryDialog}
                >
                  新規税区分
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>税区分</TableCell>
                      <TableCell>税率 (%)</TableCell>
                      <TableCell>説明</TableCell>
                      <TableCell>色</TableCell>
                      <TableCell>デフォルト</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taxCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.name}
                          {['standard', 'reduced', 'exempt'].includes(category.id) && (
                            <Chip 
                              size="small" 
                              label="標準" 
                              variant="outlined" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{category.rate}%</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: category.color,
                              borderRadius: 1,
                              border: 1,
                              borderColor: 'divider'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {category.isDefault ? (
                            <CheckIcon color="primary" />
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => handleSetDefaultCategory(category.id)}
                              title="デフォルトに設定"
                            >
                              <CheckIcon fontSize="small" color="action" />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditCategoryDialog(category)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          
                          {/* 標準的な税区分は削除不可 */}
                          {!['standard', 'reduced', 'exempt'].includes(category.id) && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(category)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {taxCategories.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    税区分が登録されていません
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* 税区分編集ダイアログ */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isNewCategory ? '新規税区分の追加' : '税区分の編集'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="税区分名"
                name="name"
                value={editingCategory?.name || ''}
                onChange={handleCategoryInputChange}
                fullWidth
                margin="normal"
                required
                disabled={['standard', 'reduced', 'exempt'].includes(editingCategory?.id)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="税率 (%)"
                name="rate"
                type="number"
                value={editingCategory?.rate || 0}
                onChange={handleCategoryNumberChange}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="説明"
                name="description"
                value={editingCategory?.description || ''}
                onChange={handleCategoryInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    表示色:
                  </Typography>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: editingCategory?.color || '#000000',
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                      mr: 2
                    }}
                  />
                  <TextField
                    type="color"
                    value={editingCategory?.color || '#000000'}
                    onChange={handleColorChange}
                    sx={{ width: '100px' }}
                    inputProps={{
                      sx: { cursor: 'pointer', height: '36px' }
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', 
                    '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'].map(color => (
                    <Box 
                      key={color}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: color,
                        borderRadius: 1,
                        border: 1,
                        borderColor: editingCategory?.color === color ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => {
                        setSelectedColor(color);
                        setEditingCategory(prev => ({
                          ...prev,
                          color: color
                        }));
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleSaveCategory}
            color="primary"
            variant="contained"
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 税区分削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>税区分の削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{editingCategory?.name}」を削除してもよろしいですか？この操作は元に戻せません。
          </Typography>
          {editingCategory?.isDefault && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography color="warning.main">
                これはデフォルトの税区分です。削除する前に別の税区分をデフォルトに設定してください。
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteCategory}
            color="error"
            variant="contained"
            disabled={editingCategory?.isDefault || ['standard', 'reduced', 'exempt'].includes(editingCategory?.id)}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 通知用スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaxCurrencySettings;
