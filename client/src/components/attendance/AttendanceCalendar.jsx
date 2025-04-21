import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ja';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EditIcon from '@mui/icons-material/Edit';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useStaff } from '../../contexts/StaffContext';
import AttendanceEditForm from './AttendanceEditForm';

// Moment.jsのローカライザー - 日本語設定
moment.locale('ja');
const localizer = momentLocalizer(moment);

const AttendanceCalendar = ({ staffId = null, height = "700px" }) => {
  const { attendanceRecords, getAttendanceByStaffId, getAttendanceById } = useAttendance();
  const { getStaffById } = useStaff();
  
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [filters, setFilters] = useState({
    approved: true,
    pending: true,
    dayOff: true
  });

  // カレンダーイベントの設定
  useEffect(() => {
    // スタッフのフィルタリング
    const filteredRecords = staffId 
      ? getAttendanceByStaffId(staffId)
      : attendanceRecords;
    
    // カレンダーイベントに変換
    const calendarEvents = filteredRecords.map(record => {
      // イベントの色を決定
      let backgroundColor = '#4caf50'; // デフォルト：承認済み - 緑
      
      if (record.status === 'pending-approval') {
        backgroundColor = '#ff9800'; // 承認待ち - オレンジ
      } else if (record.status === 'in-progress') {
        backgroundColor = '#2196f3'; // 進行中 - 青
      } else if (record.inBreak) {
        backgroundColor = '#9c27b0'; // 休憩中 - 紫
      }

      return {
        id: record.id,
        title: `${record.staffName}`,
        start: new Date(record.clockInTime),
        end: record.clockOutTime ? new Date(record.clockOutTime) : null,
        allDay: false,
        resource: record,
        backgroundColor
      };
    }).filter(event => {
      // フィルターに基づいて表示/非表示
      const status = event.resource.status;
      
      if (status === 'approved' && !filters.approved) return false;
      if (status === 'pending-approval' && !filters.pending) return false;
      if (status === 'day_off' && !filters.dayOff) return false;
      
      return true;
    });
    
    setEvents(calendarEvents);
  }, [attendanceRecords, staffId, filters, getAttendanceByStaffId]);

  // イベントをクリックした時の処理
  const handleEventClick = (event) => {
    setSelectedEvent(event.resource);
    setShowDialog(true);
  };

  // フィルター切り替え
  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // 編集モードの開始
  const handleEdit = () => {
    setShowDialog(false);
    setShowEditForm(true);
  };

  // イベントのスタイル
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Box sx={{ height: height, display: 'flex', flexDirection: 'column', mb: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          勤怠カレンダー
          {staffId && getStaffById(staffId) && (
            <span> - {getStaffById(staffId).name}</span>
          )}
        </Typography>
        
        <Box>
          <Tooltip title="承認済み">
            <Button 
              variant={filters.approved ? "contained" : "outlined"}
              size="small"
              color="success"
              onClick={() => toggleFilter('approved')}
              sx={{ mr: 1 }}
              startIcon={<CheckCircleIcon />}
            >
              承認済み
            </Button>
          </Tooltip>
          
          <Tooltip title="承認待ち">
            <Button 
              variant={filters.pending ? "contained" : "outlined"}
              size="small"
              color="warning"
              onClick={() => toggleFilter('pending')}
              sx={{ mr: 1 }}
              startIcon={<PendingIcon />}
            >
              承認待ち
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper sx={{ flex: 1, p: 2 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) => {
              return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
            },
            monthHeaderFormat: 'YYYY年M月',
            dayHeaderFormat: 'M月D日(ddd)',
            dayRangeHeaderFormat: ({ start, end }) => {
              return `${moment(start).format('YYYY年M月D日')} - ${moment(end).format('M月D日')}`;
            },
            weekdayFormat: 'ddd'
          }}
          messages={{
            today: '今日',
            previous: '前へ',
            next: '次へ',
            month: '月',
            week: '週',
            day: '日',
            agenda: 'リスト',
            date: '日付',
            time: '時間',
            event: 'イベント',
            allDay: '終日',
            noEventsInRange: 'この期間に記録はありません'
          }}
        />
      </Paper>
      
      {/* 勤怠詳細ダイアログ */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          勤怠記録詳細
          <IconButton
            aria-label="edit"
            onClick={handleEdit}
            sx={{ position: 'absolute', right: 48, top: 8 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={() => setShowDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <span>&times;</span>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">スタッフ名</Typography>
                <Typography variant="body1">{selectedEvent.staffName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">日付</Typography>
                <Typography variant="body1">{moment(selectedEvent.date).format('YYYY年MM月DD日')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">出勤時間</Typography>
                <Typography variant="body1">{moment(selectedEvent.clockInTime).format('HH:mm')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">退勤時間</Typography>
                <Typography variant="body1">
                  {selectedEvent.clockOutTime 
                    ? moment(selectedEvent.clockOutTime).format('HH:mm')
                    : '進行中'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">合計勤務時間</Typography>
                <Typography variant="body1">
                  {selectedEvent.totalWorkHours 
                    ? `${selectedEvent.totalWorkHours.toFixed(2)}時間`
                    : '進行中'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">残業時間</Typography>
                <Typography variant="body1">
                  {selectedEvent.overtimeHours 
                    ? `${selectedEvent.overtimeHours.toFixed(2)}時間`
                    : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">休憩時間</Typography>
                {selectedEvent.breakTimes && selectedEvent.breakTimes.length > 0 ? (
                  selectedEvent.breakTimes.map((breakTime, index) => (
                    <Typography key={index} variant="body1">
                      {moment(breakTime.startTime).format('HH:mm')} - {
                        breakTime.endTime 
                          ? moment(breakTime.endTime).format('HH:mm')
                          : '進行中'
                      }
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body1">記録なし</Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">ステータス</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {selectedEvent.status === 'approved' ? (
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  ) : selectedEvent.status === 'pending-approval' ? (
                    <PendingIcon color="warning" sx={{ mr: 1 }} />
                  ) : (
                    <InfoIcon color="info" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="body1">
                    {selectedEvent.status === 'approved' 
                      ? '承認済み' 
                      : selectedEvent.status === 'pending-approval'
                        ? '承認待ち'
                        : '進行中'}
                  </Typography>
                </Box>
              </Grid>
              {selectedEvent.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">備考</Typography>
                  <Typography variant="body1">{selectedEvent.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
      
      {/* 勤怠編集フォーム */}
      {showEditForm && selectedEvent && (
        <AttendanceEditForm
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          attendanceRecord={selectedEvent}
        />
      )}
    </Box>
  );
};

export default AttendanceCalendar;
