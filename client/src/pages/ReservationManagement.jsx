import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Paper, Box, Button, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Alert, Link, Tooltip, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import ja from 'date-fns/locale/ja';
import { format, parseISO, isToday, isAfter, isBefore, addDays } from 'date-fns';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  TableRestaurant as TableIcon,
  ViewList as ViewListIcon,
  CalendarViewMonth as CalendarViewMonthIcon
} from '@mui/icons-material';
import { useReservation, RESERVATION_STATUS } from '../contexts/ReservationContext';
import { useTable } from '../contexts/TableContext';
import { useNavigate } from 'react-router-dom';
import ReservationCalendar from '../components/reservations/ReservationCalendar';

// 予約ステータスの表示名とカラー定義
const STATUS_CONFIG = {
  [RESERVATION_STATUS.PENDING]: { label: '予約受付', color: 'warning' },
  [RESERVATION_STATUS.CONFIRMED]: { label: '予約確認済', color: 'info' },
  [RESERVATION_STATUS.SEATED]: { label: '着席中', color: 'success' },
  [RESERVATION_STATUS.COMPLETED]: { label: '完了', color: 'default' },
  [RESERVATION_STATUS.CANCELLED]: { label: 'キャンセル', color: 'error' },
  [RESERVATION_STATUS.NO_SHOW]: { label: 'ノーショー', color: 'error' }
};

// 予約管理画面
const ReservationManagement = () => {
  // ナビゲーション
  const navigate = useNavigate();
  
  // 予約コンテキスト
  const { 
    reservations, 
    loading, 
    error, 
    addReservation, 
    updateReservation, 
    updateReservationStatus, 
    deleteReservation,
    getTodayReservations
  } = useReservation();

  // テーブルコンテキスト
  const { 
    tables, 
    loading: tablesLoading,
    error: tablesError 
  } = useTable();

  // タブ選択状態
  const [selectedTab, setSelectedTab] = useState(0);
  // 表示モード ('list' or 'calendar')
  const [viewMode, setViewMode] = useState('list');
  // 予約編集モードかどうか
  const [isEditMode, setIsEditMode] = useState(false);
  // 予約フォームダイアログの表示状態
  const [openDialog, setOpenDialog] = useState(false);
  // 選択中の予約
  const [selectedReservation, setSelectedReservation] = useState(null);
  // フィルタリング用の日付
  const [filterDate, setFilterDate] = useState(new Date());
  // 確認ダイアログの表示状態
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  // 確認アクション
  const [confirmAction, setConfirmAction] = useState(null);
  // 予約フォーム
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    date: new Date(),
    time: new Date().setHours(18, 0, 0),
    numberOfGuests: 2,
    tableId: '',
    note: ''
  });
  // フォームエラー
  const [formErrors, setFormErrors] = useState({});
  // アラートメッセージ
  const [alertMessage, setAlertMessage] = useState(null);
  // フィルター状態
  const [filteredReservations, setFilteredReservations] = useState([]);

  // 日付でフィルタリングされた予約を更新
  useEffect(() => {
    if (reservations.length > 0) {
      const dateStr = format(filterDate, 'yyyy-MM-dd');
      const filtered = reservations.filter(res => res.date === dateStr);
      setFilteredReservations(filtered);
    }
  }, [reservations, filterDate]);

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    
    // タブに応じて表示日付を変更
    if (newValue === 0) { // 本日
      setFilterDate(new Date());
    } else if (newValue === 1) { // 明日
      setFilterDate(addDays(new Date(), 1));
    } else if (newValue === 2) { // すべて
      // 全ての予約を表示する場合も、とりあえず今日の日付でフィルタリング
      setFilterDate(new Date());
    }
  };

  // 表示モード切り替え
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // 新規予約ダイアログを開く
  const handleOpenNewDialog = () => {
    // 現在の時刻から初期値を設定
    const now = new Date();
    const initialTime = new Date();
    initialTime.setHours(18, 0, 0, 0);
    
    setFormData({
      customerName: '',
      phoneNumber: '',
      email: '',
      date: filterDate,
      time: initialTime,
      numberOfGuests: 2,
      tableId: '',
      note: ''
    });
    setFormErrors({});
    setIsEditMode(false);
    setOpenDialog(true);
  };

  // 予約編集ダイアログを開く
  const handleOpenEditDialog = (reservation) => {
    setSelectedReservation(reservation);
    
    // 時間をパース
    const timeArray = reservation.time.split(':');
    const timeDate = new Date();
    timeDate.setHours(parseInt(timeArray[0], 10), parseInt(timeArray[1], 10), 0, 0);
    
    setFormData({
      customerName: reservation.customerName,
      phoneNumber: reservation.phoneNumber,
      email: reservation.email,
      date: parseISO(reservation.date),
      time: timeDate,
      numberOfGuests: reservation.numberOfGuests,
      tableId: reservation.tableId,
      note: reservation.note || ''
    });
    setFormErrors({});
    setIsEditMode(true);
    setOpenDialog(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReservation(null);
  };

  // フォーム入力変更ハンドラー
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // 日付変更ハンドラー
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
  };

  // 時間変更ハンドラー
  const handleTimeChange = (newTime) => {
    setFormData({
      ...formData,
      time: newTime
    });
  };

  // フォームバリデーション
  const validateForm = () => {
    const errors = {};
    
    if (!formData.customerName.trim()) {
      errors.customerName = '氏名は必須です';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = '電話番号は必須です';
    } else if (!/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = '電話番号の形式が正しくありません';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'メールアドレスの形式が正しくありません';
    }
    
    if (!formData.date) {
      errors.date = '日付は必須です';
    }
    
    if (!formData.time) {
      errors.time = '時間は必須です';
    }
    
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
      errors.numberOfGuests = '人数は1名以上必須です';
    }
    
    return errors;
  };

  // 予約保存ハンドラー
  const handleSaveReservation = () => {
    // フォームバリデーション
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // 日付と時間をフォーマット
      const dateStr = format(formData.date, 'yyyy-MM-dd');
      const timeStr = format(formData.time, 'HH:mm');
      
      const reservationData = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        date: dateStr,
        time: timeStr,
        numberOfGuests: parseInt(formData.numberOfGuests, 10),
        tableId: formData.tableId,
        note: formData.note
      };
      
      if (isEditMode && selectedReservation) {
        // 予約更新
        updateReservation(selectedReservation.id, reservationData);
        setAlertMessage({ type: 'success', text: '予約を更新しました。' });
      } else {
        // 新規予約
        addReservation(reservationData);
        setAlertMessage({ type: 'success', text: '新しい予約を追加しました。' });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('予約保存エラー:', err);
      setAlertMessage({ type: 'error', text: 'エラーが発生しました: ' + err.message });
    }
  };

  // ステータス更新ハンドラー
  const handleUpdateStatus = (id, newStatus) => {
    try {
      updateReservationStatus(id, newStatus);
      setAlertMessage({ type: 'success', text: 'ステータスを更新しました。' });
    } catch (err) {
      console.error('ステータス更新エラー:', err);
      setAlertMessage({ type: 'error', text: 'エラーが発生しました: ' + err.message });
    }
  };

  // 削除確認ダイアログを開く
  const handleOpenConfirmDelete = (reservation) => {
    setSelectedReservation(reservation);
    setConfirmAction('delete');
    setOpenConfirmDialog(true);
  };

  // 確認ダイアログを閉じる
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedReservation(null);
    setConfirmAction(null);
  };

  // 予約削除ハンドラー
  const handleDeleteReservation = () => {
    try {
      if (selectedReservation) {
        deleteReservation(selectedReservation.id);
        setAlertMessage({ type: 'success', text: '予約を削除しました。' });
      }
      handleCloseConfirmDialog();
    } catch (err) {
      console.error('予約削除エラー:', err);
      setAlertMessage({ type: 'error', text: 'エラーが発生しました: ' + err.message });
    }
  };

  // アラートメッセージを閉じる
  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  // 確認ダイアログの処理実行
  const handleConfirmAction = () => {
    if (confirmAction === 'delete') {
      handleDeleteReservation();
    }
    handleCloseConfirmDialog();
  };

  // 日付フィルター変更
  const handleFilterDateChange = (newDate) => {
    setFilterDate(newDate);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        予約管理
      </Typography>

      {/* アラートメッセージ */}
      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          onClose={handleCloseAlert}
          sx={{ mb: 3 }}
        >
          {alertMessage.text}
        </Alert>
      )}

      {/* ヘッダー: タイトルとアクション */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <Typography variant="h5" component="h1" sx={{ mb: { xs: 2, sm: 0 } }}>
          予約管理
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* 表示モード切り替えボタン */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="表示モード"
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="list" aria-label="リスト表示">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="カレンダー表示">
              <CalendarViewMonthIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          
          {viewMode === 'list' && selectedTab === 0 && (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
              <DatePicker
                label="日付で絞り込み"
                value={filterDate}
                onChange={handleFilterDateChange}
                renderInput={(params) => <TextField {...params} size="small" sx={{ mr: 2 }} />}
              />
            </LocalizationProvider>
          )}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenNewDialog}
          >
            新規予約
          </Button>
        </Box>
      </Box>

      {/* リストまたはカレンダー表示を切り替え */}
      {viewMode === 'list' ? (
        /* 予約一覧リスト表示 */
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>氏名</TableCell>
                  <TableCell>日時</TableCell>
                  <TableCell>人数</TableCell>
                  <TableCell>テーブル</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>備考</TableCell>
                  <TableCell>アクション</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">読み込み中...</TableCell>
                  </TableRow>
                ) : filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">予約がありません</TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1">{reservation.customerName}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 14 }} />
                            {reservation.phoneNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                            <Typography variant="body2">
                              {format(parseISO(reservation.date), 'yyyy/MM/dd')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                            <Typography variant="body2">{reservation.time}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <GroupIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography>{reservation.numberOfGuests}名</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {reservation.tableId ? (
                          <Tooltip title="テーブル詳細を表示">
                            <Link 
                              component="button"
                              variant="body2"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tables?tableId=${reservation.tableId}`);
                              }}
                              sx={{ display: 'flex', alignItems: 'center' }}
                            >
                              <TableIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {tables.find(table => table.id === reservation.tableId)?.name || reservation.tableId}
                            </Link>
                          </Tooltip>
                        ) : (
                          '未割当'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={STATUS_CONFIG[reservation.status]?.label || reservation.status} 
                          color={STATUS_CONFIG[reservation.status]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {reservation.note ? (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <CommentIcon fontSize="small" sx={{ mr: 0.5, mt: 0.5 }} />
                            <Typography variant="body2">{reservation.note}</Typography>
                          </Box>
                        ) : (
                          '記載なし'
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditDialog(reservation)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenConfirmDelete(reservation)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          {/* ステータスが予約受付または予約確認済みの場合、着席ボタンを表示 */}
                          {(reservation.status === RESERVATION_STATUS.PENDING || 
                             reservation.status === RESERVATION_STATUS.CONFIRMED) && (
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleUpdateStatus(reservation.id, RESERVATION_STATUS.SEATED)}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        /* カレンダー表示 */
        <ReservationCalendar 
          onEditReservation={handleOpenEditDialog}
          height="calc(100vh - 230px)"
        />
      )}

      {/* 新規/編集予約ダイアログ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? '予約を編集' : '新規予約登録'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="customerName"
                label="氏名"
                fullWidth
                value={formData.customerName}
                onChange={handleFormChange}
                error={!!formErrors.customerName}
                helperText={formErrors.customerName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phoneNumber"
                label="電話番号"
                fullWidth
                value={formData.phoneNumber}
                onChange={handleFormChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="メールアドレス"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <DatePicker
                  label="予約日"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!formErrors.date}
                      helperText={formErrors.date}
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <TimePicker
                  label="予約時間"
                  value={formData.time}
                  onChange={handleTimeChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!formErrors.time}
                      helperText={formErrors.time}
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="numberOfGuests"
                label="人数"
                type="number"
                fullWidth
                value={formData.numberOfGuests}
                onChange={handleFormChange}
                InputProps={{ inputProps: { min: 1 } }}
                error={!!formErrors.numberOfGuests}
                helperText={formErrors.numberOfGuests}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.tableId}>
                <InputLabel id="table-select-label">テーブル番号</InputLabel>
                <Select
                  labelId="table-select-label"
                  name="tableId"
                  value={formData.tableId}
                  onChange={handleFormChange}
                  label="テーブル番号"
                >
                  <MenuItem value="">選択してください</MenuItem>
                  {tables.filter(table => 
                    // 予約可能なテーブルのみ表示 (編集時は現在選択されているテーブルも表示)
                    table.status === 'available' || 
                    (isEditMode && formData.tableId === table.id)
                  ).map((table) => (
                    <MenuItem key={table.id} value={table.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TableIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        {table.name} (座席数: {table.seats}人)
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.tableId && <FormHelperText>{formErrors.tableId}</FormHelperText>}
              </FormControl>
            </Grid>
            {isEditMode && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    name="status"
                    value={selectedReservation?.status || RESERVATION_STATUS.PENDING}
                    onChange={(e) => {
                      if (selectedReservation) {
                        handleUpdateStatus(selectedReservation.id, e.target.value);
                      }
                    }}
                  >
                    {Object.entries(RESERVATION_STATUS).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {STATUS_CONFIG[value]?.label || value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                name="note"
                label="備考"
                multiline
                rows={3}
                fullWidth
                value={formData.note}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSaveReservation} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 確認ダイアログ */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>確認</DialogTitle>
        <DialogContent>
          {confirmAction === 'delete' && (
            <Typography>
              {selectedReservation?.customerName} 様の予約を削除してもよろしいですか？
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>キャンセル</Button>
          <Button onClick={handleConfirmAction} variant="contained" color="error">
            {confirmAction === 'delete' ? '削除' : '確認'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReservationManagement;
