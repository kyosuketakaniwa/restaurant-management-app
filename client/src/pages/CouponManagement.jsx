import React, { useState, useEffect } from 'react';
import { useMarketing } from '../contexts/MarketingContext';
import {
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

// クーポン管理ページ
const CouponManagement = () => {
  // マーケティングコンテキストからデータと関数を取得
  const { 
    coupons, 
    campaigns,
    loading, 
    error, 
    fetchCoupons,
    fetchCampaigns,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
  } = useMarketing();

  // ローカルステート
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create' または 'edit'
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage', // 'percentage' または 'fixed'
    discountValue: '',
    campaignId: '',
    minPurchase: '',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'active',
    limit: 100,
    usageRestriction: 'once' // 'once', 'multiple', 'firstTimeOnly'
  });
  const [validateOpen, setValidateOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [validating, setValidating] = useState(false);

  // クーポンとキャンペーンデータ取得
  useEffect(() => {
    fetchCoupons();
    fetchCampaigns();
  }, [fetchCoupons, fetchCampaigns]);

  // ダイアログを開く（新規作成）
  const handleCreateDialog = () => {
    setDialogType('create');
    setCouponForm({
      code: generateCouponCode(),
      description: '',
      discountType: 'percentage',
      discountValue: '',
      campaignId: '',
      minPurchase: '',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: 'active',
      limit: 100,
      usageRestriction: 'once'
    });
    setOpenDialog(true);
  };

  // ダイアログを開く（編集）
  const handleEditDialog = (coupon) => {
    setDialogType('edit');
    setSelectedCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      campaignId: coupon.campaignId || '',
      minPurchase: coupon.minPurchase || '',
      startDate: new Date(coupon.startDate),
      endDate: new Date(coupon.endDate),
      status: coupon.status,
      limit: coupon.limit,
      usageRestriction: coupon.usageRestriction || 'once'
    });
    setOpenDialog(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCoupon(null);
  };

  // フォーム入力変更ハンドラ
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCouponForm({
      ...couponForm,
      [name]: value
    });
  };

  // 日付変更ハンドラ
  const handleDateChange = (date, dateType) => {
    setCouponForm({
      ...couponForm,
      [dateType]: date
    });
  };

  // クーポンコード生成
  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // クーポン保存
  const handleSaveCoupon = async () => {
    try {
      if (dialogType === 'create') {
        await createCoupon(couponForm);
      } else {
        await updateCoupon(selectedCoupon.id, couponForm);
      }
      handleCloseDialog();
      fetchCoupons();
    } catch (err) {
      console.error('クーポン保存エラー:', err);
    }
  };

  // クーポン削除
  const handleDeleteCoupon = async (id) => {
    if (window.confirm('このクーポンを削除してもよろしいですか？')) {
      try {
        await deleteCoupon(id);
        fetchCoupons();
      } catch (err) {
        console.error('クーポン削除エラー:', err);
      }
    }
  };

  // クーポンコード検証ダイアログを開く
  const handleOpenValidateDialog = () => {
    setCouponCode('');
    setValidationResult(null);
    setValidationError('');
    setValidateOpen(true);
  };

  // クーポンコード検証ダイアログを閉じる
  const handleCloseValidateDialog = () => {
    setValidateOpen(false);
  };

  // クーポンコード検証
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setValidationError('クーポンコードを入力してください');
      return;
    }

    setValidating(true);
    setValidationError('');
    setValidationResult(null);

    try {
      const result = await validateCoupon(couponCode.trim());
      setValidationResult(result);
    } catch (err) {
      setValidationError(err.message || 'クーポンの検証に失敗しました');
    } finally {
      setValidating(false);
    }
  };

  // クーポンコードのコピー
  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert('クーポンコードをクリップボードにコピーしました');
      })
      .catch((err) => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };

  // 割引タイプの表示名を取得
  const getDiscountTypeLabel = (type, value) => {
    if (type === 'percentage') {
      return `${value}% 割引`;
    } else if (type === 'fixed') {
      return `¥${value.toLocaleString()} 割引`;
    }
    return '';
  };

  // クーポンステータスの表示名とスタイルを取得
  const getStatusDetails = (status) => {
    const statusMap = {
      'active': { label: '有効', color: 'success' },
      'inactive': { label: '無効', color: 'error' },
      'expired': { label: '期限切れ', color: 'warning' }
    };
    return statusMap[status] || { label: status, color: 'default' };
  };

  // 使用制限の表示名を取得
  const getUsageRestrictionLabel = (restriction) => {
    const restrictionMap = {
      'once': '1回限り',
      'multiple': '複数回使用可',
      'firstTimeOnly': '初回限定'
    };
    return restrictionMap[restriction] || restriction;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          クーポン管理
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleOpenValidateDialog}
            sx={{ mr: 1 }}
          >
            クーポン検証
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDialog}
          >
            新規クーポン
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>クーポンコード</TableCell>
                <TableCell>説明</TableCell>
                <TableCell>割引</TableCell>
                <TableCell>期間</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>使用制限</TableCell>
                <TableCell>使用回数</TableCell>
                <TableCell align="right">アクション</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    クーポンがありません
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {coupon.code}
                        <IconButton
                          size="small"
                          onClick={() => handleCopyCouponCode(coupon.code)}
                          sx={{ ml: 1 }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{coupon.description}</TableCell>
                    <TableCell>
                      {getDiscountTypeLabel(coupon.discountType, coupon.discountValue)}
                    </TableCell>
                    <TableCell>
                      {formatDate(coupon.startDate)} ~ {formatDate(coupon.endDate)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDetails(coupon.status).label}
                        color={getStatusDetails(coupon.status).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {getUsageRestrictionLabel(coupon.usageRestriction)}
                    </TableCell>
                    <TableCell>
                      {coupon.usageCount} / {coupon.limit}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="編集">
                        <IconButton
                          size="small"
                          onClick={() => handleEditDialog(coupon)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* クーポン作成・編集ダイアログ */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogType === 'create' ? 'クーポンの新規作成' : 'クーポンの編集'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="code"
                  label="クーポンコード"
                  value={couponForm.code}
                  onChange={handleFormChange}
                  InputProps={dialogType === 'create' ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          size="small" 
                          onClick={() => setCouponForm({...couponForm, code: generateCouponCode()})}
                        >
                          再生成
                        </Button>
                      </InputAdornment>
                    )
                  } : undefined}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>関連キャンペーン</InputLabel>
                  <Select
                    name="campaignId"
                    value={couponForm.campaignId}
                    onChange={handleFormChange}
                    label="関連キャンペーン"
                  >
                    <MenuItem value="">なし</MenuItem>
                    {campaigns.map((campaign) => (
                      <MenuItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="説明"
                  value={couponForm.description}
                  onChange={handleFormChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>割引タイプ</InputLabel>
                  <Select
                    name="discountType"
                    value={couponForm.discountType}
                    onChange={handleFormChange}
                    label="割引タイプ"
                  >
                    <MenuItem value="percentage">パーセント割引</MenuItem>
                    <MenuItem value="fixed">金額割引</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="discountValue"
                  label={couponForm.discountType === 'percentage' ? '割引率 (%)' : '割引金額 (円)'}
                  type="number"
                  value={couponForm.discountValue}
                  onChange={handleFormChange}
                  InputProps={{ 
                    inputProps: { min: 0, max: couponForm.discountType === 'percentage' ? 100 : undefined },
                    endAdornment: (
                      <InputAdornment position="end">
                        {couponForm.discountType === 'percentage' ? '%' : '円'}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="minPurchase"
                  label="最低購入金額（円）"
                  type="number"
                  value={couponForm.minPurchase}
                  onChange={handleFormChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  helperText="0または空欄の場合、制限なし"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>使用制限</InputLabel>
                  <Select
                    name="usageRestriction"
                    value={couponForm.usageRestriction}
                    onChange={handleFormChange}
                    label="使用制限"
                  >
                    <MenuItem value="once">1回限り</MenuItem>
                    <MenuItem value="multiple">複数回使用可</MenuItem>
                    <MenuItem value="firstTimeOnly">初回限定</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="開始日"
                  value={couponForm.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="終了日"
                  value={couponForm.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    name="status"
                    value={couponForm.status}
                    onChange={handleFormChange}
                    label="ステータス"
                  >
                    <MenuItem value="active">有効</MenuItem>
                    <MenuItem value="inactive">無効</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="limit"
                  label="発行上限数"
                  type="number"
                  value={couponForm.limit}
                  onChange={handleFormChange}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSaveCoupon} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* クーポン検証ダイアログ */}
      <Dialog 
        open={validateOpen} 
        onClose={handleCloseValidateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>クーポンコード検証</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="クーポンコード"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              error={!!validationError}
              helperText={validationError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      onClick={handleValidateCoupon}
                      disabled={validating}
                      variant="contained" 
                      color="primary"
                      size="small"
                    >
                      {validating ? <CircularProgress size={24} /> : '検証'}
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            {validationResult && (
              <Box sx={{ mt: 3 }}>
                <Alert 
                  icon={<CheckIcon fontSize="inherit" />} 
                  severity="success"
                  sx={{ mb: 2 }}
                >
                  クーポンは有効です
                </Alert>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {validationResult.description || 'クーポン詳細'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          割引:
                        </Typography>
                        <Typography variant="body1">
                          {getDiscountTypeLabel(
                            validationResult.discountType, 
                            validationResult.discountValue
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          最低購入金額:
                        </Typography>
                        <Typography variant="body1">
                          {validationResult.minPurchase 
                            ? `¥${validationResult.minPurchase.toLocaleString()}` 
                            : '制限なし'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          有効期間:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(validationResult.startDate)} 〜 {formatDate(validationResult.endDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          使用制限:
                        </Typography>
                        <Typography variant="body1">
                          {getUsageRestrictionLabel(validationResult.usageRestriction)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValidateDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponManagement;
