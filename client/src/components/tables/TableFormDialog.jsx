import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Box,
  Typography,
  FormHelperText,
  Slider,
  IconButton,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { 
  Close as CloseIcon,
  TableRestaurant as TableIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

/**
 * テーブル追加・編集フォームダイアログ
 * テーブルの新規作成や既存テーブルの編集を行うためのフォーム
 */
const TableFormDialog = ({ open, table, onClose, onSave, isEditMode }) => {
  // フォームのデフォルト値
  const defaultFormData = {
    id: '',
    name: '',
    section: 'A',
    seats: 2,
    status: 'available',
    shape: 'circle',
    position: { x: 100, y: 100 },
    size: { width: 60, height: 60 }
  };
  
  // フォームデータの状態
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  
  // テーブルデータが変更されたら、フォームデータを更新
  useEffect(() => {
    if (table) {
      setFormData(table);
    } else {
      setFormData(defaultFormData);
    }
  }, [table]);
  
  // フォーム送信ハンドラー
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'テーブル名を入力してください';
    }
    
    if (!formData.section.trim()) {
      newErrors.section = 'セクションを入力してください';
    }
    
    if (formData.seats < 1) {
      newErrors.seats = '座席数は1以上である必要があります';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // サイズの調整（形状に応じて）
    let adjustedSize = { ...formData.size };
    if (formData.shape === 'circle') {
      // 円形の場合、幅と高さを同じに
      const diameter = Math.max(formData.size.width, formData.size.height);
      adjustedSize = { width: diameter, height: diameter };
    }
    
    // 保存処理
    onSave({
      ...formData,
      size: adjustedSize
    });
    
    // フォームをリセット
    setFormData(defaultFormData);
    setErrors({});
  };
  
  // 入力変更ハンドラー
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーを消去
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 座席数変更ハンドラー
  const handleSeatsChange = (e, newValue) => {
    setFormData(prev => ({
      ...prev,
      seats: newValue
    }));
  };
  
  // サイズ変更ハンドラー
  const handleSizeChange = (dimension) => (e, newValue) => {
    setFormData(prev => ({
      ...prev,
      size: {
        ...prev.size,
        [dimension]: newValue
      }
    }));
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TableIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              {isEditMode ? 'テーブルを編集' : 'テーブルを追加'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                基本情報
              </Typography>
              
              {/* ID（編集時のみ表示） */}
              {isEditMode && (
                <TextField
                  margin="dense"
                  label="テーブルID"
                  fullWidth
                  value={formData.id}
                  disabled
                  sx={{ mb: 2 }}
                />
              )}
              
              {/* テーブル名 */}
              <TextField
                margin="dense"
                name="name"
                label="テーブル名"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                sx={{ mb: 2 }}
              />
              
              {/* セクション */}
              <TextField
                margin="dense"
                name="section"
                label="セクション"
                fullWidth
                value={formData.section}
                onChange={handleChange}
                error={!!errors.section}
                helperText={errors.section}
                required
                sx={{ mb: 2 }}
              />
              
              {/* 座席数 */}
              <Typography id="seats-slider" gutterBottom>
                座席数: {formData.seats}
              </Typography>
              <Slider
                value={formData.seats}
                onChange={handleSeatsChange}
                aria-labelledby="seats-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={12}
                sx={{ mb: 3 }}
              />
              
              {/* ステータス */}
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel id="status-label">ステータス</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="ステータス"
                >
                  <MenuItem value="available">利用可能</MenuItem>
                  <MenuItem value="occupied">使用中</MenuItem>
                  <MenuItem value="reserved">予約済み</MenuItem>
                  <MenuItem value="maintenance">メンテナンス中</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                レイアウト情報
              </Typography>
              
              {/* 形状 */}
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <Typography gutterBottom>形状</Typography>
                <RadioGroup
                  row
                  name="shape"
                  value={formData.shape}
                  onChange={handleChange}
                >
                  <FormControlLabel value="circle" control={<Radio />} label="円形" />
                  <FormControlLabel value="rectangle" control={<Radio />} label="長方形" />
                </RadioGroup>
              </FormControl>
              
              {/* サイズ設定 */}
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  {formData.shape === 'circle' ? '直径' : '幅'}: {formData.size.width}px
                </Typography>
                <Slider
                  value={formData.size.width}
                  onChange={handleSizeChange('width')}
                  valueLabelDisplay="auto"
                  step={10}
                  min={40}
                  max={200}
                />
              </Box>
              
              {formData.shape === 'rectangle' && (
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    高さ: {formData.size.height}px
                  </Typography>
                  <Slider
                    value={formData.size.height}
                    onChange={handleSizeChange('height')}
                    valueLabelDisplay="auto"
                    step={10}
                    min={40}
                    max={200}
                  />
                </Box>
              )}
              
              {/* 位置情報 */}
              <Typography variant="subtitle2" gutterBottom>
                位置（フロアプラン上の座標）
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    name="position.x"
                    label="X座標"
                    type="number"
                    fullWidth
                    value={formData.position.x}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setFormData(prev => ({
                        ...prev,
                        position: {
                          ...prev.position,
                          x: isNaN(value) ? 0 : value
                        }
                      }));
                    }}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    margin="dense"
                    name="position.y"
                    label="Y座標"
                    type="number"
                    fullWidth
                    value={formData.position.y}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setFormData(prev => ({
                        ...prev,
                        position: {
                          ...prev.position,
                          y: isNaN(value) ? 0 : value
                        }
                      }));
                    }}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                注: フロアプラン上でテーブルをドラッグすることでも位置を調整できます。
              </Typography>
            </Grid>
            
            {/* プレビュー */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                プレビュー
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: 200,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2
                }}
              >
                <Box
                  sx={{
                    width: formData.size.width,
                    height: formData.shape === 'circle' ? formData.size.width : formData.size.height,
                    borderRadius: formData.shape === 'circle' ? '50%' : '4px',
                    bgcolor: 'background.paper',
                    border: 3,
                    borderColor: 
                      formData.status === 'available' ? 'success.main' :
                      formData.status === 'occupied' ? 'error.main' :
                      formData.status === 'reserved' ? 'warning.main' :
                      'grey.500',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 2
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {formData.name || 'テーブル名'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.seats}人席
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            {isEditMode ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TableFormDialog;
