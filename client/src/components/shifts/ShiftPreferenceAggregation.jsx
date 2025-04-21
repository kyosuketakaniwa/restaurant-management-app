import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import moment from 'moment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
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

const STATUS_ICONS = {
  preferred: <FavoriteIcon fontSize="small" sx={{ color: STATUS_COLORS.preferred }} />,
  available: <CheckCircleIcon fontSize="small" sx={{ color: STATUS_COLORS.available }} />,
  unavailable: <CancelIcon fontSize="small" sx={{ color: STATUS_COLORS.unavailable }} />
};

const STATUS_LABELS = {
  preferred: '希望する',
  available: '勤務可能',
  unavailable: '勤務不可'
};

const ShiftPreferenceAggregation = () => {
  const { aggregatePreferencesByDate, getPreferencesByDate } = useShift();
  const { getStaffById } = useStaff();
  
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [datePreferences, setDatePreferences] = useState([]);
  const [filters, setFilters] = useState({
    showPreferred: true,
    showAvailable: true,
    showUnavailable: true
  });

  // 月が変更されたとき、データを集計
  useEffect(() => {
    const startDate = currentMonth.clone().startOf('month');
    const endDate = currentMonth.clone().endOf('month');
    
    const data = aggregatePreferencesByDate(startDate, endDate);
    setAggregatedData(data);
  }, [currentMonth, aggregatePreferencesByDate]);

  // 月を変更
  const changeMonth = (amount) => {
    setCurrentMonth(currentMonth.clone().add(amount, 'month'));
  };

  // 日付を選択して詳細ダイアログを開く
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    const preferences = getPreferencesByDate(date);
    setDatePreferences(preferences);
    setShowDialog(true);
  };

  // ダイアログを閉じる
  const closeDialog = () => {
    setShowDialog(false);
  };

  // スタッフの詳細情報を取得
  const getStaffDetails = (staffId) => {
    return getStaffById(staffId) || { name: '不明なスタッフ' };
  };

  // フィルタリングされたスタッフ希望を取得
  const getFilteredPreferences = () => {
    if (!datePreferences) return [];
    
    return datePreferences.filter(pref => {
      if (pref.status === 'preferred' && filters.showPreferred) return true;
      if (pref.status === 'available' && filters.showAvailable) return true;
      if (pref.status === 'unavailable' && filters.showUnavailable) return true;
      return false;
    });
  };

  // フィルターの切り替え
  const toggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };

  // 曜日の配列
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // カレンダーの日付データを生成
  const getCalendarDays = () => {
    const firstDay = currentMonth.clone().startOf('month');
    const startDay = firstDay.clone().startOf('week');
    const endDay = firstDay.clone().endOf('month').endOf('week');
    
    const days = [];
    let day = startDay.clone();
    
    while (day.isSameOrBefore(endDay, 'day')) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    
    return days;
  };

  // 日付ごとの希望データを取得
  const getDateData = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return aggregatedData.find(d => d.date === dateStr) || {
      date: dateStr,
      preferred: [],
      available: [],
      unavailable: [],
      total: 0
    };
  };

  // カレンダー内の各セルを表示
  const renderCalendarCell = (date) => {
    const dateData = getDateData(date);
    const isCurrentMonth = date.month() === currentMonth.month();
    const isToday = date.isSame(moment(), 'day');
    
    const cellStyle = {
      height: '80px',
      p: 1,
      border: '1px solid #eee',
      borderRadius: '4px',
      opacity: isCurrentMonth ? 1 : 0.3,
      cursor: 'pointer',
      position: 'relative',
      '&:hover': {
        bgcolor: 'action.hover'
      }
    };
    
    if (isToday) {
      cellStyle.border = '2px solid #1976d2';
    }
    
    return (
      <Box 
        sx={cellStyle}
        onClick={() => isCurrentMonth && handleSelectDate(date)}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: isToday ? 'bold' : 'normal',
            color: date.day() === 0 ? 'error.main' : date.day() === 6 ? 'primary.main' : 'text.primary'
          }}
        >
          {date.date()}
        </Typography>
        
        {isCurrentMonth && (
          <Box sx={{ mt: 1 }}>
            {dateData.preferred.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <FavoriteIcon fontSize="small" sx={{ color: STATUS_COLORS.preferred, mr: 0.5 }} />
                <Typography variant="caption">{dateData.preferred.length}</Typography>
              </Box>
            )}
            
            {dateData.available.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <CheckCircleIcon fontSize="small" sx={{ color: STATUS_COLORS.available, mr: 0.5 }} />
                <Typography variant="caption">{dateData.available.length}</Typography>
              </Box>
            )}
            
            {dateData.unavailable.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CancelIcon fontSize="small" sx={{ color: STATUS_COLORS.unavailable, mr: 0.5 }} />
                <Typography variant="caption">{dateData.unavailable.length}</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">シフト希望集計</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => changeMonth(-1)}>
            <NavigateBeforeIcon />
          </IconButton>
          
          <Typography variant="subtitle1" sx={{ mx: 2 }}>
            {currentMonth.format('YYYY年MM月')}
          </Typography>
          
          <IconButton onClick={() => changeMonth(1)}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={1}>
        {/* 曜日ヘッダー */}
        {weekdays.map((day, i) => (
          <Grid item xs={12/7} key={`header-${i}`}>
            <Typography
              variant="subtitle2"
              align="center"
              sx={{
                fontWeight: 'bold',
                color: i === 0 ? 'error.main' : i === 6 ? 'primary.main' : 'text.primary'
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
        
        {/* カレンダーグリッド */}
        {getCalendarDays().map((day, i) => (
          <Grid item xs={12/7} key={`day-${i}`}>
            {renderCalendarCell(day)}
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ mr: 2 }}>凡例:</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <FavoriteIcon fontSize="small" sx={{ color: STATUS_COLORS.preferred, mr: 0.5 }} />
          <Typography variant="body2">希望する</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <CheckCircleIcon fontSize="small" sx={{ color: STATUS_COLORS.available, mr: 0.5 }} />
          <Typography variant="body2">勤務可能</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CancelIcon fontSize="small" sx={{ color: STATUS_COLORS.unavailable, mr: 0.5 }} />
          <Typography variant="body2">勤務不可</Typography>
        </Box>
      </Box>
      
      {/* 日付詳細ダイアログ */}
      <Dialog
        open={showDialog}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedDate && selectedDate.format('YYYY年MM月DD日')} ({selectedDate && weekdays[selectedDate.day()]}) のシフト希望
            </Typography>
            
            <Box sx={{ display: 'flex' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showPreferred}
                    onChange={() => toggleFilter('showPreferred')}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FavoriteIcon fontSize="small" sx={{ color: STATUS_COLORS.preferred, mr: 0.5 }} />
                    <Typography variant="body2">希望</Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showAvailable}
                    onChange={() => toggleFilter('showAvailable')}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: STATUS_COLORS.available, mr: 0.5 }} />
                    <Typography variant="body2">可能</Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showUnavailable}
                    onChange={() => toggleFilter('showUnavailable')}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CancelIcon fontSize="small" sx={{ color: STATUS_COLORS.unavailable, mr: 0.5 }} />
                    <Typography variant="body2">不可</Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {getFilteredPreferences().length > 0 ? (
            <List>
              {getFilteredPreferences().map((pref, index) => {
                const staff = getStaffDetails(pref.staffId);
                
                return (
                  <React.Fragment key={pref.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                              {staff.name}
                            </Typography>
                            <Tooltip title={STATUS_LABELS[pref.status]}>
                              {STATUS_ICONS[pref.status]}
                            </Tooltip>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {pref.timeFrom} - {pref.timeTo}
                            </Typography>
                            {pref.note && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                メモ: {pref.note}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    
                    {index < getFilteredPreferences().length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 4 }}>
              表示できる希望データがありません
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ShiftPreferenceAggregation;
