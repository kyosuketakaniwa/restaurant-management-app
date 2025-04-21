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
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Stars as StarsIcon,
  EmojiEvents as EmojiEventsIcon,
  CardGiftcard as CardGiftcardIcon
} from '@mui/icons-material';

// ロイヤルティプログラム管理ページ
const LoyaltyProgramManagement = () => {
  // マーケティングコンテキストからデータと関数を取得
  const { 
    loyaltyPrograms, 
    loyaltyTiers,
    loading, 
    error, 
    fetchLoyaltyPrograms,
    createLoyaltyProgram
  } = useMarketing();

  // ローカルステート
  const [openProgramDialog, setOpenProgramDialog] = useState(false);
  const [openTierDialog, setOpenTierDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    pointsPerYen: 1,
    isActive: true,
    rules: ''
  });
  const [tierForm, setTierForm] = useState({
    name: '',
    requiredPoints: 0,
    benefits: '',
    multiplier: 1
  });

  // ロイヤルティプログラムデータ取得
  useEffect(() => {
    fetchLoyaltyPrograms();
  }, [fetchLoyaltyPrograms]);

  // プログラムダイアログを開く（新規作成）
  const handleCreateProgramDialog = () => {
    setSelectedProgram(null);
    setProgramForm({
      name: '',
      description: '',
      pointsPerYen: 1,
      isActive: true,
      rules: ''
    });
    setOpenProgramDialog(true);
  };

  // プログラムダイアログを開く（編集）
  const handleEditProgramDialog = (program) => {
    setSelectedProgram(program);
    setProgramForm({
      name: program.name,
      description: program.description || '',
      pointsPerYen: program.pointsPerYen,
      isActive: program.isActive,
      rules: program.rules || ''
    });
    setOpenProgramDialog(true);
  };

  // ティアダイアログを開く（新規作成）
  const handleCreateTierDialog = () => {
    setSelectedTier(null);
    setTierForm({
      name: '',
      requiredPoints: 0,
      benefits: '',
      multiplier: 1
    });
    setOpenTierDialog(true);
  };

  // ティアダイアログを開く（編集）
  const handleEditTierDialog = (tier) => {
    setSelectedTier(tier);
    setTierForm({
      name: tier.name,
      requiredPoints: tier.requiredPoints,
      benefits: tier.benefits || '',
      multiplier: tier.multiplier || 1
    });
    setOpenTierDialog(true);
  };

  // プログラムダイアログを閉じる
  const handleCloseProgramDialog = () => {
    setOpenProgramDialog(false);
    setSelectedProgram(null);
  };

  // ティアダイアログを閉じる
  const handleCloseTierDialog = () => {
    setOpenTierDialog(false);
    setSelectedTier(null);
  };

  // プログラムフォーム入力変更ハンドラ
  const handleProgramFormChange = (e) => {
    const { name, value, checked } = e.target;
    setProgramForm({
      ...programForm,
      [name]: name === 'isActive' ? checked : value
    });
  };

  // ティアフォーム入力変更ハンドラ
  const handleTierFormChange = (e) => {
    const { name, value } = e.target;
    setTierForm({
      ...tierForm,
      [name]: value
    });
  };

  // プログラム保存
  const handleSaveProgram = async () => {
    try {
      if (selectedProgram) {
        // TODO: 編集機能の実装
        // await updateLoyaltyProgram(selectedProgram.id, programForm);
      } else {
        await createLoyaltyProgram(programForm);
      }
      handleCloseProgramDialog();
      fetchLoyaltyPrograms();
    } catch (err) {
      console.error('ロイヤルティプログラム保存エラー:', err);
    }
  };

  // ティア保存
  const handleSaveTier = async () => {
    try {
      if (selectedTier) {
        // TODO: 編集機能の実装
        // await updateLoyaltyTier(selectedTier.id, tierForm);
      } else {
        // TODO: 作成機能の実装
        // await createLoyaltyTier(tierForm);
      }
      handleCloseTierDialog();
      fetchLoyaltyPrograms();
    } catch (err) {
      console.error('ロイヤルティティア保存エラー:', err);
    }
  };

  // ティア削除
  const handleDeleteTier = async (id) => {
    if (window.confirm('このティアを削除してもよろしいですか？')) {
      try {
        // TODO: 削除機能の実装
        // await deleteLoyaltyTier(id);
        fetchLoyaltyPrograms();
      } catch (err) {
        console.error('ロイヤルティティア削除エラー:', err);
      }
    }
  };

  // ティアの色を取得
  const getTierColor = (tierName) => {
    const colors = {
      'bronze': '#CD7F32',
      'silver': '#C0C0C0',
      'gold': '#FFD700',
      'platinum': '#E5E4E2',
    };
    return colors[tierName.toLowerCase()] || '#000000';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          ロイヤルティプログラム管理
        </Typography>
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
        <Grid container spacing={3}>
          {/* ロイヤルティプログラム */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="ロイヤルティプログラム設定"
                action={
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateProgramDialog}
                    size="small"
                  >
                    新規プログラム
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {loyaltyPrograms.length === 0 ? (
                  <Typography>プログラムが設定されていません</Typography>
                ) : (
                  <List>
                    {loyaltyPrograms.map((program) => (
                      <Paper key={program.id} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">
                            {program.name}
                            <Chip
                              label={program.isActive ? '有効' : '無効'}
                              color={program.isActive ? 'success' : 'default'}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleEditProgramDialog(program)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {program.description}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">基本ルール:</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <StarsIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={`${program.pointsPerYen}ポイント / 1円`} />
                            </ListItem>
                            {program.rules && program.rules.split('\n').map((rule, index) => (
                              <ListItem key={index}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <StarsIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={rule} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ロイヤルティティア */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="ロイヤルティティア設定"
                action={
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateTierDialog}
                    size="small"
                  >
                    新規ティア
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {loyaltyTiers.length === 0 ? (
                  <Typography>ティアが設定されていません</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ティア名</TableCell>
                          <TableCell>必要ポイント</TableCell>
                          <TableCell>ポイント倍率</TableCell>
                          <TableCell align="right">アクション</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...loyaltyTiers].sort((a, b) => a.requiredPoints - b.requiredPoints).map((tier) => (
                          <TableRow key={tier.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmojiEventsIcon 
                                  sx={{ 
                                    color: getTierColor(tier.name),
                                    mr: 1
                                  }} 
                                />
                                {tier.name}
                              </Box>
                            </TableCell>
                            <TableCell>{tier.requiredPoints} ポイント以上</TableCell>
                            <TableCell>{tier.multiplier}倍</TableCell>
                            <TableCell align="right">
                              <Tooltip title="編集">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditTierDialog(tier)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="削除">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteTier(tier.id)}
                                  color="error"
                                  disabled={tier.name.toLowerCase() === 'bronze'} // 基本ティアは削除不可
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    ティア特典例
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CardGiftcardIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="ブロンズ" 
                        secondary="基本ポイント付与率" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CardGiftcardIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="シルバー" 
                        secondary="1.2倍ポイント、誕生日特典" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CardGiftcardIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="ゴールド" 
                        secondary="1.5倍ポイント、誕生日特典、VIP優先予約" 
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* プログラム作成・編集ダイアログ */}
      <Dialog
        open={openProgramDialog}
        onClose={handleCloseProgramDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedProgram ? 'ロイヤルティプログラムの編集' : 'ロイヤルティプログラムの新規作成'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  name="name"
                  label="プログラム名"
                  value={programForm.name}
                  onChange={handleProgramFormChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="description"
                  label="説明"
                  value={programForm.description}
                  onChange={handleProgramFormChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="pointsPerYen"
                  label="付与ポイント率（円当たり）"
                  type="number"
                  value={programForm.pointsPerYen}
                  onChange={handleProgramFormChange}
                  InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={programForm.isActive}
                      onChange={handleProgramFormChange}
                      name="isActive"
                    />
                  }
                  label="有効にする"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="rules"
                  label="プログラムルール（各行に1つのルールを記述）"
                  value={programForm.rules}
                  onChange={handleProgramFormChange}
                  placeholder="例：誕生月は2倍ポイント&#10;季節限定メニューは1.5倍ポイント&#10;など"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProgramDialog}>キャンセル</Button>
          <Button onClick={handleSaveProgram} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* ティア作成・編集ダイアログ */}
      <Dialog
        open={openTierDialog}
        onClose={handleCloseTierDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedTier ? 'ロイヤルティティアの編集' : 'ロイヤルティティアの新規作成'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="name"
                  label="ティア名"
                  value={tierForm.name}
                  onChange={handleTierFormChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="requiredPoints"
                  label="必要ポイント"
                  type="number"
                  value={tierForm.requiredPoints}
                  onChange={handleTierFormChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="multiplier"
                  label="ポイント倍率"
                  type="number"
                  value={tierForm.multiplier}
                  onChange={handleTierFormChange}
                  InputProps={{ inputProps: { min: 1, step: 0.1 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="benefits"
                  label="特典内容"
                  value={tierForm.benefits}
                  onChange={handleTierFormChange}
                  placeholder="例：誕生日特典、VIP予約、限定メニューアクセス、など"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTierDialog}>キャンセル</Button>
          <Button onClick={handleSaveTier} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyProgramManagement;
