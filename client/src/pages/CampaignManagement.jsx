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
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  BarChart as BarChartIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// キャンペーン管理ページ
const CampaignManagement = () => {
  // マーケティングコンテキストからデータと関数を取得
  const { 
    campaigns, 
    loading, 
    error, 
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignAnalytics,
    analytics
  } = useMarketing();

  // ローカルステート
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create' または 'edit'
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'discount', // デフォルト値
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'draft', // デフォルト値
    budget: '',
    targetAudience: '',
    goals: {
      revenue: '',
      newCustomers: ''
    }
  });
  const [openAnalyticsDialog, setOpenAnalyticsDialog] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // キャンペーンデータ取得
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // ダイアログを開く（新規作成）
  const handleCreateDialog = () => {
    setDialogType('create');
    setCampaignForm({
      name: '',
      description: '',
      type: 'discount',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: 'draft',
      budget: '',
      targetAudience: '',
      goals: {
        revenue: '',
        newCustomers: ''
      }
    });
    setOpenDialog(true);
  };

  // ダイアログを開く（編集）
  const handleEditDialog = (campaign) => {
    setDialogType('edit');
    setSelectedCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || '',
      type: campaign.type,
      startDate: new Date(campaign.startDate),
      endDate: new Date(campaign.endDate),
      status: campaign.status,
      budget: campaign.budget,
      targetAudience: campaign.targetAudience || '',
      goals: {
        revenue: campaign.goals?.revenue || '',
        newCustomers: campaign.goals?.newCustomers || ''
      }
    });
    setOpenDialog(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCampaign(null);
  };

  // フォーム入力変更ハンドラ
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('goals.')) {
      const goalField = name.split('.')[1];
      setCampaignForm({
        ...campaignForm,
        goals: {
          ...campaignForm.goals,
          [goalField]: value
        }
      });
    } else {
      setCampaignForm({
        ...campaignForm,
        [name]: value
      });
    }
  };

  // 日付変更ハンドラ
  const handleDateChange = (date, dateType) => {
    setCampaignForm({
      ...campaignForm,
      [dateType]: date
    });
  };

  // キャンペーン保存
  const handleSaveCampaign = async () => {
    try {
      if (dialogType === 'create') {
        await createCampaign(campaignForm);
      } else {
        await updateCampaign(selectedCampaign.id, campaignForm);
      }
      handleCloseDialog();
      fetchCampaigns();
    } catch (err) {
      console.error('キャンペーン保存エラー:', err);
    }
  };

  // キャンペーン削除
  const handleDeleteCampaign = async (id) => {
    if (window.confirm('このキャンペーンを削除してもよろしいですか？')) {
      try {
        await deleteCampaign(id);
        fetchCampaigns();
      } catch (err) {
        console.error('キャンペーン削除エラー:', err);
      }
    }
  };

  // 分析データ表示
  const handleViewAnalytics = async (campaign) => {
    setSelectedCampaign(campaign);
    setAnalyticsLoading(true);
    setOpenAnalyticsDialog(true);
    
    try {
      // キャッシュされた分析データがあれば使用、なければ取得
      let data;
      if (analytics.campaigns[campaign.id]) {
        data = analytics.campaigns[campaign.id];
      } else {
        data = await getCampaignAnalytics(campaign.id);
      }
      setAnalyticsData(data);
    } catch (err) {
      console.error('分析データ取得エラー:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // 分析ダイアログを閉じる
  const handleCloseAnalyticsDialog = () => {
    setOpenAnalyticsDialog(false);
    setSelectedCampaign(null);
    setAnalyticsData(null);
  };

  // キャンペーンタイプの表示名を取得
  const getCampaignTypeLabel = (type) => {
    const typeMap = {
      'discount': '割引',
      'coupon': 'クーポン',
      'point': 'ポイント特典',
      'gift': '景品プレゼント',
      'event': 'イベント'
    };
    return typeMap[type] || type;
  };

  // キャンペーンステータスの表示名とスタイルを取得
  const getStatusDetails = (status) => {
    const statusMap = {
      'draft': { label: '下書き', color: 'default' },
      'scheduled': { label: '予定', color: 'info' },
      'active': { label: '実施中', color: 'success' },
      'ended': { label: '終了', color: 'error' },
      'cancelled': { label: 'キャンセル', color: 'warning' }
    };
    return statusMap[status] || { label: status, color: 'default' };
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          キャンペーン管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateDialog}
        >
          新規キャンペーン
        </Button>
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
                <TableCell>キャンペーン名</TableCell>
                <TableCell>タイプ</TableCell>
                <TableCell>開始日</TableCell>
                <TableCell>終了日</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>予算</TableCell>
                <TableCell align="right">アクション</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    キャンペーンがありません
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{getCampaignTypeLabel(campaign.type)}</TableCell>
                    <TableCell>{formatDate(campaign.startDate)}</TableCell>
                    <TableCell>{formatDate(campaign.endDate)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusDetails(campaign.status).label} 
                        color={getStatusDetails(campaign.status).color} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {campaign.budget ? `¥${campaign.budget.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="詳細を表示">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewAnalytics(campaign)}
                          sx={{ mr: 1 }}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="編集">
                        <IconButton
                          size="small"
                          onClick={() => handleEditDialog(campaign)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCampaign(campaign.id)}
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

      {/* キャンペーン作成・編集ダイアログ */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogType === 'create' ? 'キャンペーンの新規作成' : 'キャンペーンの編集'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  name="name"
                  label="キャンペーン名"
                  value={campaignForm.name}
                  onChange={handleFormChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="description"
                  label="説明"
                  value={campaignForm.description}
                  onChange={handleFormChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>タイプ</InputLabel>
                  <Select
                    name="type"
                    value={campaignForm.type}
                    onChange={handleFormChange}
                    label="タイプ"
                  >
                    <MenuItem value="discount">割引</MenuItem>
                    <MenuItem value="coupon">クーポン</MenuItem>
                    <MenuItem value="point">ポイント特典</MenuItem>
                    <MenuItem value="gift">景品プレゼント</MenuItem>
                    <MenuItem value="event">イベント</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    name="status"
                    value={campaignForm.status}
                    onChange={handleFormChange}
                    label="ステータス"
                  >
                    <MenuItem value="draft">下書き</MenuItem>
                    <MenuItem value="scheduled">予定</MenuItem>
                    <MenuItem value="active">実施中</MenuItem>
                    <MenuItem value="ended">終了</MenuItem>
                    <MenuItem value="cancelled">キャンセル</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="開始日"
                  value={campaignForm.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="終了日"
                  value={campaignForm.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="budget"
                  label="予算（円）"
                  type="number"
                  value={campaignForm.budget}
                  onChange={handleFormChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="targetAudience"
                  label="ターゲット顧客"
                  value={campaignForm.targetAudience}
                  onChange={handleFormChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  目標設定
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="goals.revenue"
                  label="売上目標（円）"
                  type="number"
                  value={campaignForm.goals.revenue}
                  onChange={handleFormChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="goals.newCustomers"
                  label="新規顧客獲得目標（人）"
                  type="number"
                  value={campaignForm.goals.newCustomers}
                  onChange={handleFormChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSaveCampaign} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* キャンペーン分析ダイアログ */}
      <Dialog
        open={openAnalyticsDialog}
        onClose={handleCloseAnalyticsDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedCampaign ? `キャンペーン分析: ${selectedCampaign.name}` : 'キャンペーン分析'}
        </DialogTitle>
        <DialogContent>
          {analyticsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : analyticsData ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader 
                      title="売上" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        ¥{analyticsData.revenue.actual.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        目標: ¥{analyticsData.revenue.target.toLocaleString()} 
                        ({analyticsData.revenue.percentage.toFixed(1)}%)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader 
                      title="新規顧客" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {analyticsData.newCustomers.actual}人
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        目標: {analyticsData.newCustomers.target}人 
                        ({analyticsData.newCustomers.percentage.toFixed(1)}%)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader 
                      title="クーポン利用率" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {analyticsData.coupons.redemptionRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analyticsData.coupons.redeemed} / {analyticsData.coupons.issued}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Divider />
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      キャンペーン詳細
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" component="span" color="text.secondary">
                          タイプ:
                        </Typography>{' '}
                        {getCampaignTypeLabel(selectedCampaign.type)}
                      </Box>
                      <Box>
                        <Typography variant="body2" component="span" color="text.secondary">
                          期間:
                        </Typography>{' '}
                        {formatDate(selectedCampaign.startDate)} 〜 {formatDate(selectedCampaign.endDate)}
                      </Box>
                      <Box>
                        <Typography variant="body2" component="span" color="text.secondary">
                          ターゲット:
                        </Typography>{' '}
                        {selectedCampaign.targetAudience || '指定なし'}
                      </Box>
                      <Box>
                        <Typography variant="body2" component="span" color="text.secondary">
                          予算:
                        </Typography>{' '}
                        {selectedCampaign.budget ? `¥${selectedCampaign.budget.toLocaleString()}` : '指定なし'}
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>データが利用できません</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnalyticsDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignManagement;
