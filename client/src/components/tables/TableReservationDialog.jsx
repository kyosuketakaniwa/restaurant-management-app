import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  TextField, 
  Grid, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  IconButton,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
// 代替実装
// import { DatePicker, TimePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import ja from 'date-fns/locale/ja';
import { 
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

/**
 * テーブル予約管理ダイアログ
 * テーブルの予約を作成・管理するためのコンポーネント
 */
const TableReservationDialog = ({ open, onClose, table, onReservationAdd, onReservationUpdate, onReservationDelete }) => {
  // 予約データのモック
  const [reservations, setReservations] = useState([]);
  
  // 新規予約フォームの表示状態
  const [showNewReservationForm, setShowNewReservationForm] = useState(false);
  
  // 新規予約フォームデータ
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    date: new Date(),
    time: new Date(),
    duration: 90,
    partySize: 2,
    notes: ''
  });
  
  // 選択された予約
  const [selectedReservation, setSelectedReservation] = useState(null);
  
  // 編集モード
  const [isEditMode, setIsEditMode] = useState(false);
  
  // バリデーションエラー
  const [errors, setErrors] = useState({});
  
  // テーブルが変更されたときに予約をリセット
  useEffect(() => {
    if (table) {
      // 実際のアプリではAPIから取得
      const mockReservations = [
        {
          id: '1',
          tableId: table.id,
          customerName: '佐藤太郎',
          phone: '090-1234-5678',
          email: 'taro@example.com',
          date: new Date(new Date().setDate(new Date().getDate() + 1)),
          time: new Date(new Date().setHours(18, 0, 0)),
          duration: 120,
          partySize: 4,
          status: 'confirmed',
          notes: 'ウィンドウ席を希望'
        },
        {
          id: '2',
          tableId: table.id,
          customerName: '鈴木花子',
          phone: '080-8765-4321',
          email: 'hanako@example.com',
          date: new Date(new Date().setDate(new Date().getDate() + 2)),
          time: new Date(new Date().setHours(19, 30, 0)),
          duration: 90,
          partySize: 2,
          status: 'pending',
          notes: ''
        }
      ];
      
      setReservations(mockReservations);
      resetForm();
    }
  }, [table]);
  
  // フォームリセット
  const resetForm = () => {
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      date: new Date(),
      time: new Date(),
      duration: 90,
      partySize: 2,
      notes: ''
    });
    setErrors({});
    setIsEditMode(false);
    setSelectedReservation(null);
  };
  
  // 日付のフォーマット
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // 時間のフォーマット
  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 予約状態によるチップの色を取得
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // 予約状態のラベルを取得
  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return '確定';
      case 'pending':
        return '保留';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '不明';
    }
  };
  
  // 新規予約フォームを表示
  const handleShowNewForm = () => {
    resetForm();
    setShowNewReservationForm(true);
  };
  
  // 既存予約の編集を開始
  const handleEditReservation = (reservation) => {
    setFormData({
      customerName: reservation.customerName,
      phone: reservation.phone,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      duration: reservation.duration,
      partySize: reservation.partySize,
      notes: reservation.notes || ''
    });
    setSelectedReservation(reservation);
    setIsEditMode(true);
    setShowNewReservationForm(true);
  };
  
  // フォーム入力の変更を処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // エラーをクリア
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // 日付選択の変更を処理
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
  };
  
  // 時間選択の変更を処理
  const handleTimeChange = (newTime) => {
    setFormData({
      ...formData,
      time: newTime
    });
  };
  
  // フォームの検証
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = '名前を入力してください';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号を入力してください';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.partySize < 1) {
      newErrors.partySize = '人数は1人以上である必要があります';
    }
    
    if (formData.partySize > table.seats) {
      newErrors.partySize = `最大${table.seats}人まで予約可能です`;
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // 予約を保存
  const handleSaveReservation = () => {
    if (!validateForm()) {
      return;
    }
    
    // 日付と時間を結合
    const dateTime = new Date(formData.date);
    const time = new Date(formData.time);
    dateTime.setHours(time.getHours(), time.getMinutes(), 0);
    
    if (isEditMode && selectedReservation) {
      // 既存の予約を更新
      const updatedReservation = {
        ...selectedReservation,
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        partySize: formData.partySize,
        notes: formData.notes
      };
      
      if (onReservationUpdate) {
        onReservationUpdate(updatedReservation);
      }
      
      // 予約リストを更新（モック）
      const updatedReservations = reservations.map(r => 
        r.id === selectedReservation.id ? updatedReservation : r
      );
      setReservations(updatedReservations);
    } else {
      // 新規予約を作成
      const newReservation = {
        id: `new-${Date.now()}`,
        tableId: table.id,
        ...formData,
        status: 'pending'
      };
      
      if (onReservationAdd) {
        onReservationAdd(newReservation);
      }
      
      // 予約リストに追加（モック）
      setReservations([...reservations, newReservation]);
    }
    
    // フォームをリセットして閉じる
    resetForm();
    setShowNewReservationForm(false);
  };
  
  // 予約をキャンセル
  const handleCancelReservation = (reservationId) => {
    if (window.confirm('この予約をキャンセルしますか？')) {
      // 予約のステータスを更新（モック）
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      );
      
      setReservations(updatedReservations);
      
      if (onReservationDelete) {
        const reservation = reservations.find(r => r.id === reservationId);
        if (reservation) {
          onReservationDelete(reservation);
        }
      }
    }
  };
  
  if (!table) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { minHeight: '60vh' } 
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {table.name} の予約管理
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {showNewReservationForm ? (
          <Box sx={{ p: 1 }}>
              <Typography variant="h6" gutterBottom>
                {isEditMode ? '予約の編集' : '新規予約'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="customerName"
                    label="お客様名"
                    fullWidth
                    value={formData.customerName}
                    onChange={handleInputChange}
                    error={!!errors.customerName}
                    helperText={errors.customerName}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phone"
                    label="電話番号"
                    fullWidth
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="email"
                    label="メールアドレス"
                    fullWidth
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    label="予約日"
                    value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    fullWidth
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="time"
                    label="予約時間"
                    value={formData.time instanceof Date ? 
                      `${formData.time.getHours().toString().padStart(2, '0')}:${formData.time.getMinutes().toString().padStart(2, '0')}` : 
                      ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const time = new Date();
                      time.setHours(hours, minutes, 0);
                      handleTimeChange(time);
                    }}
                    fullWidth
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>利用時間（分）</InputLabel>
                    <Select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      label="利用時間（分）"
                    >
                      <MenuItem value={60}>60分</MenuItem>
                      <MenuItem value={90}>90分</MenuItem>
                      <MenuItem value={120}>120分</MenuItem>
                      <MenuItem value={150}>150分</MenuItem>
                      <MenuItem value={180}>180分</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="partySize"
                    label="人数"
                    type="number"
                    fullWidth
                    value={formData.partySize}
                    onChange={handleInputChange}
                    error={!!errors.partySize}
                    helperText={errors.partySize || `最大${table.seats}人まで`}
                    margin="normal"
                    required
                    inputProps={{ min: 1, max: table.seats }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="notes"
                    label="備考"
                    multiline
                    rows={3}
                    fullWidth
                    value={formData.notes}
                    onChange={handleInputChange}
                    margin="normal"
                    placeholder="特別なリクエストがあればこちらに入力してください"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => {
                    resetForm();
                    setShowNewReservationForm(false);
                  }}
                  sx={{ mr: 1 }}
                >
                  キャンセル
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveReservation}
                >
                  {isEditMode ? '更新' : '予約を作成'}
                </Button>
              </Box>
            </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                {table.name} の予約一覧
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleShowNewForm}
              >
                新規予約
              </Button>
            </Box>
            
            {reservations.length > 0 ? (
              <List>
                {reservations.map((reservation) => (
                  <Paper 
                    key={reservation.id} 
                    elevation={1} 
                    sx={{ mb: 2, borderLeft: 3, borderColor: `${getStatusColor(reservation.status)}.main` }}
                  >
                    <ListItem 
                      secondaryAction={
                        <Box>
                          {reservation.status !== 'cancelled' && (
                            <>
                              <IconButton 
                                edge="end" 
                                aria-label="edit"
                                onClick={() => handleEditReservation(reservation)}
                                sx={{ mr: 1 }}
                              >
                                <EventIcon />
                              </IconButton>
                              <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={() => handleCancelReservation(reservation.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ mr: 1 }}>
                              {reservation.customerName}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={getStatusLabel(reservation.status)}
                              color={getStatusColor(reservation.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(reservation.date)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatTime(reservation.time)} ({reservation.duration}分)
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {reservation.partySize}人
                                </Typography>
                              </Box>
                            </Box>
                            {reservation.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {reservation.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  予約がありません
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  「新規予約」ボタンをクリックして予約を追加してください
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableReservationDialog;
