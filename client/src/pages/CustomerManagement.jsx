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
  Avatar,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

// 顧客管理ページ
const CustomerManagement = () => {
  // マーケティングコンテキストからデータと関数を取得
  const { 
    customers, 
    loading, 
    error, 
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addLoyaltyPoints,
    getCustomerSegmentAnalytics,
    analytics
  } = useMarketing();

  // ローカルステート
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create', 'edit', 'points'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    segment: 'new', // 'new', 'regular', 'loyal'
    preferences: '',
    notes: ''
  });
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [segmentAnalytics, setSegmentAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // 顧客データ取得
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // セグメント分析データ取得
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (tabValue === 1 && !segmentAnalytics) {
        setAnalyticsLoading(true);
        try {
          if (analytics.segments && Object.keys(analytics.segments).length > 0) {
            setSegmentAnalytics(analytics.segments);
          } else {
            const data = await getCustomerSegmentAnalytics();
            setSegmentAnalytics(data);
          }
        } catch (err) {
          console.error('顧客セグメント分析データ取得エラー:', err);
        } finally {
          setAnalyticsLoading(false);
        }
      }
    };
    
    fetchAnalytics();
  }, [tabValue, analytics.segments, getCustomerSegmentAnalytics, segmentAnalytics]);

  // タブ変更ハンドラ
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ダイアログを開く（新規作成）
  const handleCreateDialog = () => {
    setDialogType('create');
    setCustomerForm({
      name: '',
      email: '',
      phone: '',
      birthdate: '',
      address: '',
      segment: 'new',
      preferences: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  // ダイアログを開く（編集）
  const handleEditDialog = (customer) => {
    setDialogType('edit');
    setSelectedCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      birthdate: customer.birthdate || '',
      address: customer.address || '',
      segment: customer.segment || 'new',
      preferences: customer.preferences || '',
      notes: customer.notes || ''
    });
    setOpenDialog(true);
  };

  // ポイント追加ダイアログを開く
  const handlePointsDialog = (customer) => {
    setDialogType('points');
    setSelectedCustomer(customer);
    setPointsToAdd('');
    setPointsReason('');
    setOpenDialog(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
  };

  // フォーム入力変更ハンドラ
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm({
      ...customerForm,
      [name]: value
    });
  };

  // 顧客保存
  const handleSaveCustomer = async () => {
    try {
      if (dialogType === 'create') {
        await createCustomer(customerForm);
      } else if (dialogType === 'edit') {
        await updateCustomer(selectedCustomer.id, customerForm);
      }
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      console.error('顧客情報保存エラー:', err);
    }
  };

  // ポイント追加
  const handleAddPoints = async () => {
    if (!pointsToAdd || parseInt(pointsToAdd) <= 0) {
      return;
    }

    try {
      await addLoyaltyPoints(selectedCustomer.id, parseInt(pointsToAdd), pointsReason);
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      console.error('ポイント追加エラー:', err);
    }
  };

  // 顧客削除
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('この顧客情報を削除してもよろしいですか？')) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        console.error('顧客情報削除エラー:', err);
      }
    }
  };

  // 顧客セグメントの表示名とスタイルを取得
  const getSegmentDetails = (segment) => {
    const segmentMap = {
      'new': { label: '新規', color: 'info' },
      'regular': { label: '常連', color: 'primary' },
      'loyal': { label: 'ロイヤル', color: 'success' }
    };
    return segmentMap[segment] || { label: segment, color: 'default' };
  };

  // ロイヤルティティアの表示名とスタイルを取得
  const getTierDetails = (tier) => {
    const tierMap = {
      'bronze': { label: 'ブロンズ', color: '#CD7F32' },
      'silver': { label: 'シルバー', color: '#C0C0C0' },
      'gold': { label: 'ゴールド', color: '#FFD700' }
    };
    return tierMap[tier] || { label: tier, color: '#000000' };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="顧客管理タブ">
          <Tab label="顧客一覧" />
          <Tab label="セグメント分析" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 顧客一覧タブ */}
      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              顧客管理
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleCreateDialog}
            >
              顧客登録
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>顧客名</TableCell>
                    <TableCell>連絡先</TableCell>
                    <TableCell>セグメント</TableCell>
                    <TableCell>ロイヤルティ</TableCell>
                    <TableCell>来店回数</TableCell>
                    <TableCell>総利用額</TableCell>
                    <TableCell align="right">アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        顧客情報がありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1 }}>
                              <PersonIcon />
                            </Avatar>
                            {customer.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{customer.email}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getSegmentDetails(customer.segment).label}
                            color={getSegmentDetails(customer.segment).color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${getTierDetails(customer.loyaltyTier).label} (${customer.loyaltyPoints}ポイント)`}
                            size="small"
                            sx={{ 
                              bgcolor: getTierDetails(customer.loyaltyTier).color,
                              color: customer.loyaltyTier === 'bronze' ? 'white' : 'black'
                            }}
                          />
                        </TableCell>
                        <TableCell>{customer.totalVisits || 0}</TableCell>
                        <TableCell>
                          {customer.totalSpent ? `¥${customer.totalSpent.toLocaleString()}` : '¥0'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="ポイント追加">
                            <IconButton
                              size="small"
                              onClick={() => handlePointsDialog(customer)}
                              sx={{ mr: 1 }}
                              color="primary"
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="編集">
                            <IconButton
                              size="small"
                              onClick={() => handleEditDialog(customer)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="削除">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCustomer(customer.id)}
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
        </>
      )}

      {/* セグメント分析タブ */}
      {tabValue === 1 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              顧客セグメント分析
            </Typography>
          </Box>

          {analyticsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : segmentAnalytics ? (
            <Grid container spacing={3}>
              {Object.keys(segmentAnalytics).map((segmentKey) => {
                const segment = segmentAnalytics[segmentKey];
                const segmentInfo = getSegmentDetails(segmentKey);
                
                return (
                  <Grid item xs={12} md={4} key={segmentKey}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {segmentInfo.label}顧客
                          <Chip
                            label={segment.count}
                            color={segmentInfo.color}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              平均来店回数:
                            </Typography>
                            <Typography variant="body1">
                              {segment.avgVisits.toFixed(1)}回
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              平均利用額:
                            </Typography>
                            <Typography variant="body1">
                              ¥{segment.avgSpent.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              ロイヤルティ分布:
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 1 }}>
                              <Chip
                                label={`ブロンズ: ${segment.loyaltyDistribution.bronze}`}
                                size="small"
                                sx={{ mr: 1, bgcolor: '#CD7F32', color: 'white' }}
                              />
                              <Chip
                                label={`シルバー: ${segment.loyaltyDistribution.silver}`}
                                size="small"
                                sx={{ mr: 1, bgcolor: '#C0C0C0' }}
                              />
                              <Chip
                                label={`ゴールド: ${segment.loyaltyDistribution.gold}`}
                                size="small"
                                sx={{ bgcolor: '#FFD700' }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>分析データが利用できません</Typography>
            </Box>
          )}
        </>
      )}

      {/* 顧客ダイアログ（新規作成・編集） */}
      {(dialogType === 'create' || dialogType === 'edit') && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {dialogType === 'create' ? '顧客情報の新規登録' : '顧客情報の編集'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="name"
                    label="顧客名"
                    value={customerForm.name}
                    onChange={handleFormChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="メールアドレス"
                    type="email"
                    value={customerForm.email}
                    onChange={handleFormChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="電話番号"
                    value={customerForm.phone}
                    onChange={handleFormChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="birthdate"
                    label="生年月日"
                    type="date"
                    value={customerForm.birthdate}
                    onChange={handleFormChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address"
                    label="住所"
                    value={customerForm.address}
                    onChange={handleFormChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>顧客セグメント</InputLabel>
                    <Select
                      name="segment"
                      value={customerForm.segment}
                      onChange={handleFormChange}
                      label="顧客セグメント"
                    >
                      <MenuItem value="new">新規</MenuItem>
                      <MenuItem value="regular">常連</MenuItem>
                      <MenuItem value="loyal">ロイヤル</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="preferences"
                    label="好み・嗜好"
                    value={customerForm.preferences}
                    onChange={handleFormChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="notes"
                    label="備考"
                    value={customerForm.notes}
                    onChange={handleFormChange}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>キャンセル</Button>
            <Button onClick={handleSaveCustomer} variant="contained" color="primary">
              保存
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ポイント追加ダイアログ */}
      {dialogType === 'points' && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>ポイント追加</DialogTitle>
          <DialogContent>
            {selectedCustomer && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedCustomer.name} 様
                </Typography>
                <Typography variant="body2" gutterBottom>
                  現在のポイント: {selectedCustomer.loyaltyPoints} ポイント
                </Typography>
                <Typography variant="body2" gutterBottom>
                  ティア: {getTierDetails(selectedCustomer.loyaltyTier).label}
                </Typography>
                
                <TextField
                  fullWidth
                  required
                  label="追加ポイント"
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ mt: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="理由"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>キャンセル</Button>
            <Button 
              onClick={handleAddPoints} 
              variant="contained" 
              color="primary"
              disabled={!pointsToAdd || parseInt(pointsToAdd) <= 0}
            >
              ポイント追加
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CustomerManagement;
