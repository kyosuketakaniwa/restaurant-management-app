import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useShift } from '../../contexts/ShiftContext';
import { useStaff } from '../../contexts/StaffContext';

const STATUS_COLORS = {
  preferred: '#f06292', // ピンク - 希望する
  available: '#81c784', // 緑 - 勤務可能
  unavailable: '#e57373' // 赤 - 勤務不可
};

const STATUS_LABELS = {
  preferred: '希望する',
  available: '勤務可能',
  unavailable: '勤務不可'
};

const ShiftPreferenceForm = ({ staffId }) => {
  const { addShiftPreference, updateShiftPreference, deleteShiftPreference, getPreferencesByStaffId } = useShift();
  const { getStaffById } = useStaff();
  
  const [date, setDate] = useState(moment());
  const [timeFrom, setTimeFrom] = useState('10:00');
  const [timeTo, setTimeTo] = useState('18:00');
  const [status, setStatus] = useState('preferred');
  const [note, setNote] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(moment());
  const [calendarDays, setCalendarDays] = useState([]);
  const [staff, setStaff] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // スタッフ情報を読み込み
  useEffect(() => {
    if (staffId) {
      const staffData = getStaffById(staffId);
      setStaff(staffData);
    }
  }, [staffId, getStaffById]);

  // 希望情報を読み込み
  useEffect(() => {
    if (staffId) {
      const staffPreferences = getPreferencesByStaffId(staffId);
      setPreferences(staffPreferences);
    }
  }, [staffId, getPreferencesByStaffId]);

  // カレンダー日付を生成
  useEffect(() => {
    const startOfMonth = selectedMonth.clone().startOf('month');
    const startOfCalendar = startOfMonth.clone().startOf('week');
    const endOfMonth = selectedMonth.clone().endOf('month');
    const endOfCalendar = endOfMonth.clone().endOf('week');
    
    const days = [];
    let day = startOfCalendar.clone();
    
    while (day.isSameOrBefore(endOfCalendar)) {
      days.push({
        date: day.clone(),
        isCurrentMonth: day.month() === selectedMonth.month(),
        hasPreference: preferences.some(p => moment(p.date).isSame(day, 'day'))
      });
      day.add(1, 'day');
    }
    
    setCalendarDays(days);
  }, [selectedMonth, preferences]);

  // 希望を追加
  const handleAddPreference = () => {
    const preferenceData = {
      staffId,
      date: date.toISOString(),
      timeFrom,
      timeTo,
      status,
      note
    };
    
    const newPreference = addShiftPreference(preferenceData);
    setPreferences([...preferences, newPreference]);
    setSaveSuccess(true);
    
    // フォームをリセット
    resetForm();
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // フォームをリセット
  const resetForm = () => {
    setDate(moment());
    setTimeFrom('10:00');
    setTimeTo('18:00');
    setStatus('preferred');
    setNote('');
  };

  // 希望を削除
  const handleDeletePreference = (preferenceId) => {
    deleteShiftPreference(preferenceId);
    setPreferences(preferences.filter(p => p.id !== preferenceId));
  };

  // カレンダーダイアログを開く
  const openCalendarDialog = () => {
    setShowDialog(true);
  };

  // カレンダーダイアログを閉じる
  const closeCalendarDialog = () => {
    setShowDialog(false);
  };

  // 日付を選択
  const handleSelectDate = (selectedDate) => {
    setDate(selectedDate);
    closeCalendarDialog();
  };

  // 月を変更
  const changeMonth = (amount) => {
    setSelectedMonth(selectedMonth.clone().add(amount, 'month'));
  };

  // 日付の希望状況を取得
  const getDatePreference = (date) => {
    return preferences.find(p => moment(p.date).isSame(date, 'day'));
  };

  // 曜日ヘッダーを生成
  const renderWeekdays = () => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays.map((day, i) => (
      <Grid 
        item 
        xs={1.7} 
        key={i} 
        sx={{ 
          textAlign: 'center', 
          fontWeight: 'bold',
          color: i === 0 ? 'error.main' : i === 6 ? 'primary.main' : 'text.primary'
        }}
      >
        {day}
      </Grid>
    ));
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        シフト希望登録
      </Typography>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          シフト希望を保存しました
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="希望日"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                format="YYYY年MM月DD日"
              />
            </LocalizationProvider>
            <IconButton color="primary" onClick={openCalendarDialog} sx={{ ml: 1 }}>
              <CalendarMonthIcon />
            </IconButton>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="開始時間"
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="終了時間"
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>希望ステータス</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="希望ステータス"
            >
              <MenuItem value="preferred">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FavoriteIcon sx={{ color: STATUS_COLORS.preferred, mr: 1 }} />
                  希望する
                </Box>
              </MenuItem>
              <MenuItem value="available">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ color: STATUS_COLORS.available, mr: 1 }} />
                  勤務可能
                </Box>
              </MenuItem>
              <MenuItem value="unavailable">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CancelIcon sx={{ color: STATUS_COLORS.unavailable, mr: 1 }} />
                  勤務不可
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="メモ（任意）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddPreference}
            sx={{ mt: 2 }}
            fullWidth
          >
            希望を追加
          </Button>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            登録済み希望日
          </Typography>
          
          <Box sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
            {preferences.length > 0 ? (
              preferences.map((pref) => (
                <Paper
                  key={pref.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    borderLeft: `5px solid ${STATUS_COLORS[pref.status]}`,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {moment(pref.date).format('YYYY年MM月DD日')} ({moment(pref.date).format('ddd')})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pref.timeFrom} - {pref.timeTo}
                    </Typography>
                    <Chip 
                      label={STATUS_LABELS[pref.status]} 
                      size="small" 
                      sx={{ 
                        bgcolor: STATUS_COLORS[pref.status], 
                        color: 'white',
                        mt: 1
                      }} 
                    />
                    {pref.note && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {pref.note}
                      </Typography>
                    )}
                  </Box>
                  <IconButton onClick={() => handleDeletePreference(pref.id)} color="error">
                    <CancelIcon />
                  </IconButton>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                登録されている希望日はありません
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
      
      {/* カレンダーダイアログ */}
      <Dialog open={showDialog} onClose={closeCalendarDialog} maxWidth="md">
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={() => changeMonth(-1)}>前月</Button>
            <Typography variant="h6">
              {selectedMonth.format('YYYY年MM月')}
            </Typography>
            <Button onClick={() => changeMonth(1)}>翌月</Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            {renderWeekdays()}
            
            {calendarDays.map((day, i) => {
              const preference = getDatePreference(day.date);
              
              return (
                <Grid 
                  item 
                  xs={1.7} 
                  key={i} 
                  onClick={() => handleSelectDate(day.date)}
                  sx={{
                    textAlign: 'center',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    bgcolor: day.date.isSame(date, 'day') ? 'primary.light' : 'background.paper',
                    color: !day.isCurrentMonth ? 'text.disabled' : 
                           day.date.day() === 0 ? 'error.main' : 
                           day.date.day() === 6 ? 'primary.main' : 'text.primary',
                    border: day.date.isSame(moment(), 'day') ? '2px solid #1976d2' : 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Typography variant="body2">
                    {day.date.date()}
                  </Typography>
                  
                  {preference && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        bgcolor: STATUS_COLORS[preference.status]
                      }}
                    />
                  )}
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCalendarDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ShiftPreferenceForm;
