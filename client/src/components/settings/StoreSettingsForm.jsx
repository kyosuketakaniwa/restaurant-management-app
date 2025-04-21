import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Divider,
  Snackbar, Alert, CircularProgress, FormControlLabel,
  Switch, Chip, Card, CardContent
} from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';
import { useRole, PERMISSIONS, SECTIONS } from '../../contexts/RoleContext';
import { 
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Store as StoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const StoreSettingsForm = () => {
  console.log('StoreSettingsForm rendering');
  const { settings, updateSettings, loading, error, resetError } = useSettings();
  const { hasPermission } = useRole();
  
  console.log('StoreSettingsForm - settings:', settings);
  
  // 店舗情報の状態
  const [storeInfo, setStoreInfo] = useState(settings?.storeInfo || {
    name: 'デバッグ用デフォルト店舗',
    address: '住所未設定',
    phone: '000-0000-0000',
    email: 'debug@example.com'
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 設定が更新されたら状態を更新
  useEffect(() => {
    console.log('StoreSettingsForm - useEffect called', settings);
    if (settings?.storeInfo) {
      setStoreInfo(settings.storeInfo);
      console.log('StoreSettingsForm - storeInfo updated:', settings.storeInfo);
    }
  }, [settings?.storeInfo]);
  
  // 編集権限チェック - デバッグ用にtrueに設定
  const canEdit = true; // hasPermission(SECTIONS.SETTINGS, PERMISSIONS.EDIT);
  const isAdmin = true; // hasPermission(SECTIONS.SETTINGS, PERMISSIONS.ADMIN);
  
  console.log(`StoreSettingsForm - canEdit=${canEdit}, isAdmin=${isAdmin}`);
  
  // 入力変更ハンドラー
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStoreInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // 保存ハンドラー
  const handleSave = async () => {
    setSaving(true);
    try {
      // 実際のアプリでは、APIを呼び出して保存
      // 今回はコンテキスト関数を使用
      updateSettings('storeInfo', storeInfo);
      
      setSnackbar({
        open: true,
        message: '店舗情報が正常に保存されました',
        severity: 'success'
      });
    } catch (err) {
      console.error('店舗情報の保存中にエラーが発生しました:', err);
      setSnackbar({
        open: true,
        message: '店舗情報の保存中にエラーが発生しました',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // 初期値に戻す
  const handleReset = () => {
    setStoreInfo(settings.storeInfo || {});
  };
  
  if (loading) {
    console.log('StoreSettingsForm - loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          設定読み込み中...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }
  
  console.log('StoreSettingsForm - rendering main content');
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" display="flex" alignItems="center">
          <StoreIcon sx={{ mr: 1 }} />
          店舗情報設定
        </Typography>
        
        {canEdit && (
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              sx={{ mr: 1 }}
              disabled={saving}
            >
              リセット
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {!canEdit && (
        <Alert severity="info" sx={{ mb: 3 }}>
          この情報は表示のみ可能です。編集には管理者権限が必要です。
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* 基本情報 */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                基本情報
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="店舗名"
                    name="name"
                    value={storeInfo.name || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={!canEdit}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="電話番号"
                    name="phone"
                    value={storeInfo.phone || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="住所"
                    name="address"
                    value={storeInfo.address || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="メールアドレス"
                    name="email"
                    type="email"
                    value={storeInfo.email || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="営業時間"
                    name="businessHours"
                    value={storeInfo.businessHours || ''}
                    onChange={handleChange}
                    fullWidth
                    disabled={!canEdit}
                    placeholder="例: 11:00-22:00"
                    helperText="営業時間の範囲を入力してください"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 店舗詳細情報 */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                店舗詳細
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!canEdit}>
                    <InputLabel>店舗タイプ</InputLabel>
                    <Select
                      name="storeType"
                      value={storeInfo.storeType || 'japanese'}
                      onChange={handleChange}
                      label="店舗タイプ"
                    >
                      <MenuItem value="japanese">和食</MenuItem>
                      <MenuItem value="western">洋食</MenuItem>
                      <MenuItem value="chinese">中華</MenuItem>
                      <MenuItem value="italian">イタリアン</MenuItem>
                      <MenuItem value="french">フレンチ</MenuItem>
                      <MenuItem value="cafe">カフェ</MenuItem>
                      <MenuItem value="fastfood">ファストフード</MenuItem>
                      <MenuItem value="other">その他</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="座席数"
                    name="seatingCapacity"
                    type="number"
                    value={storeInfo.seatingCapacity || 0}
                    onChange={handleChange}
                    fullWidth
                    disabled={!canEdit}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                {isAdmin && (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isMainBranch"
                          checked={storeInfo.isMainBranch || false}
                          onChange={handleChange}
                          disabled={!canEdit}
                        />
                      }
                      label="メイン店舗"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 会計設定 */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                会計設定
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="消費税率 (%)"
                    name="taxRate"
                    type="number"
                    value={storeInfo.taxRate || 10}
                    onChange={handleChange}
                    fullWidth
                    disabled={!canEdit}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!canEdit}>
                    <InputLabel>通貨</InputLabel>
                    <Select
                      name="currency"
                      value={storeInfo.currency || 'JPY'}
                      onChange={handleChange}
                      label="通貨"
                    >
                      <MenuItem value="JPY">日本円 (¥)</MenuItem>
                      <MenuItem value="USD">米ドル ($)</MenuItem>
                      <MenuItem value="EUR">ユーロ (€)</MenuItem>
                      <MenuItem value="GBP">英ポンド (£)</MenuItem>
                      <MenuItem value="CNY">中国人民元 (元)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="useReducedTax"
                        checked={storeInfo.useReducedTax || false}
                        onChange={handleChange}
                        disabled={!canEdit}
                      />
                    }
                    label="軽減税率を使用"
                  />
                  {storeInfo.useReducedTax && (
                    <TextField
                      label="軽減税率 (%)"
                      name="reducedTaxRate"
                      type="number"
                      value={storeInfo.reducedTaxRate || 8}
                      onChange={handleChange}
                      fullWidth
                      disabled={!canEdit}
                      sx={{ mt: 1 }}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                    />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* エラー通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* API/コンテキストエラー通知 */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={resetError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={resetError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
};

export default StoreSettingsForm;
