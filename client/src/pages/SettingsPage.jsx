import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Tabs, Tab, 
  Divider, Alert, Card, CardContent, Grid, TextField,
  Button, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Store as StoreIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CurrencyYen as CurrencyIcon,
  Compare as CompareIcon,
  CloudUpload as CloudUploadIcon,
  FormatListNumbered as ListIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  CloudDownload as CloudDownloadIcon,
  Brush as BrushIcon,
  ColorLens as ColorLensIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';

// シンプルなタブパネル
function TabPanel(props) {
  const { children, value, index } = props;
  
  if (value !== index) return null;
  
  return (
    <Box sx={{ py: 3 }}>
      {children}
    </Box>
  );
}

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // 他店舗ダイアログのstate
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [editBranchIndex, setEditBranchIndex] = useState(-1);
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    phone: '',
    isMainBranch: false
  });
  
  // ハードコードされたデモデータ
  const demoSettings = {
    storeInfo: {
      name: '和食レストラン 匠',
      address: '東京都中央区銀座1-1-1',
      phone: '03-1234-5678',
      email: 'info@washoku-takumi.jp',
      businessHours: '11:00-22:00',
      taxRate: 10,
      currency: 'JPY',
      seatingCapacity: 50
    },
    branches: [
      {
        id: 'main',
        name: '銀座本店',
        address: '東京都中央区銀座1-1-1',
        phone: '03-1234-5678',
        isMainBranch: true
      },
      {
        id: 'branch1',
        name: '新宿店',
        address: '東京都新宿区新宿3-1-1',
        phone: '03-2345-6789',
        isMainBranch: false
      },
      {
        id: 'branch2',
        name: '渋谷店',
        address: '東京都渋谷区渋谷2-1-1',
        phone: '03-3456-7890',
        isMainBranch: false
      }
    ],
    taxSettings: {
      taxRate: 10,
      includeTaxInPrice: true,
      applyTaxToAllItems: true,
      taxExemptCategories: ['テイクアウト', '配達']
    },
    comparisonSettings: {
      enableComparison: true,
      comparisonPeriod: 'monthly',
      comparisonMetrics: ['sales', 'customers', 'averageSale'],
      showCompetitorData: true
    },
    permissionSettings: {
      roles: [
        { id: 'owner', name: 'オーナー', canAccessAll: true },
        { id: 'manager', name: '店長', canManageStaff: true, canViewReports: true },
        { id: 'staff', name: 'スタッフ', canTakeOrders: true, canViewOwnShifts: true }
      ]
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const { settings, updateSettings } = useSettings();
  // 設定の読み込みが完了しているか
  const [isLoaded, setIsLoaded] = useState(false);

  // コンテキストからの設定値が読み込まれたらフラグを更新
  useEffect(() => {
    if (settings) {
      setIsLoaded(true);
    }
  }, [settings]);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 2 }} />
          システム設定
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          店舗情報やシステム設定を管理できます。
        </Alert>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<StoreIcon />} label="店舗情報" iconPosition="start" />
            <Tab icon={<BusinessIcon />} label="他店舗管理" iconPosition="start" />
            <Tab icon={<CurrencyIcon />} label="税設定" iconPosition="start" />
            <Tab icon={<CompareIcon />} label="比較機能" iconPosition="start" />
            <Tab icon={<SecurityIcon />} label="権限管理" iconPosition="start" />
            <Tab icon={<NotificationsIcon />} label="通知設定" iconPosition="start" />
            <Tab icon={<BackupIcon />} label="バックアップ・復元" iconPosition="start" />
            <Tab icon={<PaletteIcon />} label="デザイン設定" iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* 店舗情報タブ */}
        <TabPanel value={tabValue} index={0}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                店舗情報
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box>
                <Typography variant="body1"><strong>店舗名:</strong> {demoSettings.storeInfo.name}</Typography>
                <Typography variant="body1"><strong>住所:</strong> {demoSettings.storeInfo.address}</Typography>
                <Typography variant="body1"><strong>電話番号:</strong> {demoSettings.storeInfo.phone}</Typography>
                <Typography variant="body1"><strong>メール:</strong> {demoSettings.storeInfo.email}</Typography>
                <Typography variant="body1"><strong>営業時間:</strong> {demoSettings.storeInfo.businessHours}</Typography>
                <Typography variant="body1"><strong>座席数:</strong> {demoSettings.storeInfo.seatingCapacity}</Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* 他店舗管理タブ */}
        <TabPanel value={tabValue} index={1}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  他店舗管理
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditBranchIndex(-1);
                    setBranchForm({
                      name: '',
                      address: '',
                      phone: '',
                      isMainBranch: false
                    });
                    setBranchDialogOpen(true);
                  }}
                >
                  新規店舗追加
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {demoSettings.branches.map((branch, index) => (
                  <React.Fragment key={branch.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => {
                              setEditBranchIndex(index);
                              setBranchForm({
                                name: branch.name,
                                address: branch.address,
                                phone: branch.phone,
                                isMainBranch: branch.isMainBranch
                              });
                              setBranchDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          {!branch.isMainBranch && (
                            <IconButton edge="end" aria-label="delete">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{branch.name}</Typography>
                            {branch.isMainBranch && (
                              <Chip 
                                label="本店" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {branch.address} | {branch.phone}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < demoSettings.branches.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
          
          {/* 店舗編集ダイアログ */}
          <Dialog open={branchDialogOpen} onClose={() => setBranchDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>
              {editBranchIndex === -1 ? '新規店舗追加' : '店舗情報編集'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="店舗名"
                      fullWidth
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({...branchForm, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="住所"
                      fullWidth
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({...branchForm, address: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="電話番号"
                      fullWidth
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm({...branchForm, phone: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={branchForm.isMainBranch}
                          onChange={(e) => setBranchForm({...branchForm, isMainBranch: e.target.checked})}
                          disabled={editBranchIndex !== -1 && demoSettings.branches[editBranchIndex]?.isMainBranch}
                        />
                      }
                      label="この店舗を本店として設定する"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBranchDialogOpen(false)}>キャンセル</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  // 実装時はコンテキストのupdateSettingsを使用
                  console.log(branchForm);
                  setBranchDialogOpen(false);
                }}
              >
                保存
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
        
        {/* 税設定タブ */}
        <TabPanel value={tabValue} index={2}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                税設定
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="消費税率 (%)"
                    type="number"
                    value={demoSettings.taxSettings.taxRate}
                    InputProps={{
                      endAdornment: <Typography variant="body2">%</Typography>,
                    }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={demoSettings.taxSettings.includeTaxInPrice} />}
                    label="価格に消費税を含む"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={demoSettings.taxSettings.applyTaxToAllItems} />}
                    label="すべての商品に消費税を適用する"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>消費税非課税カテゴリ</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {demoSettings.taxSettings.taxExemptCategories.map((category, index) => (
                      <Chip 
                        key={index} 
                        label={category} 
                        onDelete={() => {}} 
                      />
                    ))}
                    <Chip 
                      icon={<AddIcon />} 
                      label="追加" 
                      onClick={() => {}} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* 比較機能タブ */}
        <TabPanel value={tabValue} index={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                比較機能設定
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={demoSettings.comparisonSettings.enableComparison} />}
                    label="他店舗との比較機能を有効化"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>比較期間</InputLabel>
                    <Select
                      value={demoSettings.comparisonSettings.comparisonPeriod}
                      label="比較期間"
                    >
                      <MenuItem value="daily">日次</MenuItem>
                      <MenuItem value="weekly">週次</MenuItem>
                      <MenuItem value="monthly">月次</MenuItem>
                      <MenuItem value="yearly">年次</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>比較指標</Typography>
                  <FormControlLabel
                    control={<Switch checked={demoSettings.comparisonSettings.comparisonMetrics.includes('sales')} />}
                    label="売上"
                  />
                  <FormControlLabel
                    control={<Switch checked={demoSettings.comparisonSettings.comparisonMetrics.includes('customers')} />}
                    label="客数"
                  />
                  <FormControlLabel
                    control={<Switch checked={demoSettings.comparisonSettings.comparisonMetrics.includes('averageSale')} />}
                    label="客単価"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch checked={demoSettings.comparisonSettings.showCompetitorData} />}
                    label="競合店データの表示を許可する"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* 権限管理タブ */}
        <TabPanel value={tabValue} index={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ユーザー権限
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>権限役割</TableCell>
                      <TableCell>アクセス権限</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {demoSettings.permissionSettings.roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>
                          {role.canAccessAll && <Typography variant="body2">すべてのアクセス権限</Typography>}
                          {role.canManageStaff && <Typography variant="body2">スタッフ管理</Typography>}
                          {role.canViewReports && <Typography variant="body2">レポート閲覧</Typography>}
                          {role.canTakeOrders && <Typography variant="body2">注文受付</Typography>}
                          {role.canViewOwnShifts && <Typography variant="body2">自分のシフト閲覧</Typography>}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {role.id !== 'owner' && (
                            <IconButton size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
              >
                新規権限役割追加
              </Button>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* 通知設定タブ */}
        <TabPanel value={tabValue} index={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                通知設定
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="在庫アラート通知" 
                    secondary="在庫が設定したレベルを下回るときに通知を受け取る" 
                  />
                  <Switch checked={true} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="予約リマインダー" 
                    secondary="予約の確認リマインダーを受け取る" 
                  />
                  <Switch checked={true} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="売上レポート" 
                    secondary="定期的な売上レポートを受け取る" 
                  />
                  <Switch checked={true} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="システム更新通知" 
                    secondary="システムの更新がある場合に通知を受け取る" 
                  />
                  <Switch checked={true} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* バックアップ・復元タブ */}
        <TabPanel value={tabValue} index={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                データバックアップと復元
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BackupIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">バックアップ</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        システムとデータのバックアップを作成します。定期的なバックアップをお定めします。
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>バックアップ間隔</InputLabel>
                        <Select
                          value="daily"
                          label="バックアップ間隔"
                        >
                          <MenuItem value="hourly">毎時</MenuItem>
                          <MenuItem value="daily">毎日</MenuItem>
                          <MenuItem value="weekly">毎週</MenuItem>
                          <MenuItem value="monthly">毎月</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                      >
                        今すぐバックアップを作成
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <RestoreIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">データ復元</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        以前のバックアップからシステムとデータを復元します。
                      </Typography>
                      
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          最終バックアップ： 2025年4月20日 01:30
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          利用可能なバックアップ: 7
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<CloudDownloadIcon />}
                        fullWidth
                      >
                        バックアップから復元
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>バックアップ履歴</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>日時</TableCell>
                          <TableCell>サイズ</TableCell>
                          <TableCell>種類</TableCell>
                          <TableCell>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { date: '2025/04/20 01:30', size: '42.5 MB', type: '自動' },
                          { date: '2025/04/19 01:30', size: '42.3 MB', type: '自動' },
                          { date: '2025/04/18 01:30', size: '42.1 MB', type: '自動' },
                          { date: '2025/04/17 14:45', size: '41.9 MB', type: '手動' },
                        ].map((backup, index) => (
                          <TableRow key={index}>
                            <TableCell>{backup.date}</TableCell>
                            <TableCell>{backup.size}</TableCell>
                            <TableCell>{backup.type}</TableCell>
                            <TableCell>
                              <Button size="small" startIcon={<CloudDownloadIcon />}>
                                復元
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* デザイン設定タブ */}
        <TabPanel value={tabValue} index={7}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                デザイン設定
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>カラーテーマ</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" gutterBottom>プライマリーカラー</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {['#4a6da7', '#ff5722', '#9c27b0', '#2e7d32', '#e91e63'].map((color) => (
                            <Box
                              key={color}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: color,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                border: color === '#4a6da7' ? '2px solid black' : 'none',
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" gutterBottom>セカンダリーカラー</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {['#e57373', '#66bb6a', '#42a5f5', '#ffb74d', '#ba68c8'].map((color) => (
                            <Box
                              key={color}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: color,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                border: color === '#e57373' ? '2px solid black' : 'none',
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Typography variant="subtitle1" gutterBottom>ダークモード</Typography>
                  <FormControlLabel
                    control={<Switch />}
                    label="ダークモードを有効化"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>言語設定</Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>言語</InputLabel>
                    <Select
                      value="ja"
                      label="言語"
                    >
                      <MenuItem value="ja">日本語</MenuItem>
                      <MenuItem value="en">英語</MenuItem>
                      <MenuItem value="zh">中国語 (簡体字)</MenuItem>
                      <MenuItem value="ko">韓国語</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="subtitle1" gutterBottom>日付形式</Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>日付形式</InputLabel>
                    <Select
                      value="yyyy/MM/dd"
                      label="日付形式"
                    >
                      <MenuItem value="yyyy/MM/dd">YYYY/MM/DD</MenuItem>
                      <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="subtitle1" gutterBottom>時間形式</Typography>
                  <FormControl fullWidth>
                    <InputLabel>時間形式</InputLabel>
                    <Select
                      value="HH:mm"
                      label="時間形式"
                    >
                      <MenuItem value="HH:mm">24時間形式 (14:30)</MenuItem>
                      <MenuItem value="hh:mm a">12時間形式 (02:30 PM)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="contained" color="primary">
                      設定を保存
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
