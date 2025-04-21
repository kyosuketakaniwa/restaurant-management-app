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
  Tooltip,
  Chip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useShift } from '../../contexts/ShiftContext';
import { useStaff } from '../../contexts/StaffContext';
import ShiftForm from './ShiftForm';

// Moment.jsのローカライザー - 日本語設定
moment.locale('ja');
const localizer = momentLocalizer(moment);

const ShiftCalendar = ({ staffId = null, height = "700px" }) => {
  const { shifts, updateShiftStatus } = useShift();
  const { getStaffById } = useStaff();
  
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [filters, setFilters] = useState({
    confirmed: true,
    pending: true,
  });

  // カレンダーイベントの設定
  useEffect(() => {
    // スタッフのフィルタリング
    const filteredShifts = staffId 
      ? shifts.filter(shift => shift.staffId === staffId)
      : shifts;
    
    // カレンダーイベントに変換
    const calendarEvents = filteredShifts.map(shift => {
      // イベントの色を決定
      let backgroundColor = '#4caf50'; // デフォルト：確定済み - 緑
      
      if (shift.status === 'pending') {
        backgroundColor = '#ff9800'; // 承認待ち - オレンジ
      } else if (shift.status === 'day_off') {
        backgroundColor = '#9e9e9e'; // 休日 - グレー
      }

      return {
        id: shift.id,
        title: `${shift.staffName} (${shift.position})`,
        start: new Date(shift.startTime),
        end: new Date(shift.endTime),
        allDay: false,
        resource: shift,
        backgroundColor
      };
    }).filter(event => {
      // フィルターに基づいて表示/非表示
      const status = event.resource.status;
      
      if (status === 'confirmed' && !filters.confirmed) return false;
      if (status === 'pending' && !filters.pending) return false;
      
      return true;
    });
    
    setEvents(calendarEvents);
  }, [shifts, staffId, filters, getStaffById]);

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
    setFormMode('edit');
    setShowForm(true);
  };

  // 新規シフト作成
  const handleCreateShift = () => {
    setSelectedEvent(null);
    setFormMode('create');
    setShowForm(true);
  };

  // シフトステータス変更
  const handleStatusChange = (shiftId, status) => {
    updateShiftStatus(shiftId, status);
    setShowDialog(false);
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
          シフトカレンダー
          {staffId && getStaffById(staffId) && (
            <span> - {getStaffById(staffId).name}</span>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="確定済み">
            <Button 
              variant={filters.confirmed ? "contained" : "outlined"}
              size="small"
              color="success"
              onClick={() => toggleFilter('confirmed')}
              startIcon={<CheckCircleIcon />}
            >
              確定済み
            </Button>
          </Tooltip>
          
          <Tooltip title="未確定">
            <Button 
              variant={filters.pending ? "contained" : "outlined"}
              size="small"
              color="warning"
              onClick={() => toggleFilter('pending')}
              startIcon={<PendingIcon />}
            >
              未確定
            </Button>
          </Tooltip>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateShift}
          >
            シフト追加
          </Button>
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
            noEventsInRange: 'この期間にイベントはありません'
          }}
        />
      </Paper>
      
      {/* シフト詳細ダイアログ */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          シフト詳細
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
                <Typography variant="subtitle2" color="text.secondary">ポジション</Typography>
                <Typography variant="body1">{selectedEvent.position}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">日付</Typography>
                <Typography variant="body1">{moment(selectedEvent.date).format('YYYY年MM月DD日')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">開始時間</Typography>
                <Typography variant="body1">{moment(selectedEvent.startTime).format('HH:mm')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">終了時間</Typography>
                <Typography variant="body1">{moment(selectedEvent.endTime).format('HH:mm')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">ステータス</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {selectedEvent.status === 'confirmed' ? (
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  ) : selectedEvent.status === 'pending' ? (
                    <PendingIcon color="warning" sx={{ mr: 1 }} />
                  ) : (
                    <InfoIcon color="info" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="body1">
                    {selectedEvent.status === 'confirmed' 
                      ? '確定済み' 
                      : selectedEvent.status === 'pending'
                        ? '未確定'
                        : selectedEvent.status === 'day_off'
                          ? '休日'
                          : selectedEvent.status}
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
          {selectedEvent && selectedEvent.status === 'pending' && (
            <Button 
              color="success" 
              variant="contained"
              onClick={() => handleStatusChange(selectedEvent.id, 'confirmed')}
            >
              確定する
            </Button>
          )}
          {selectedEvent && selectedEvent.status === 'confirmed' && (
            <Button 
              color="warning" 
              variant="outlined"
              onClick={() => handleStatusChange(selectedEvent.id, 'pending')}
            >
              未確定に戻す
            </Button>
          )}
          <Button onClick={() => setShowDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
      
      {/* シフト作成/編集フォーム */}
      <ShiftForm
        open={showForm}
        onClose={() => setShowForm(false)}
        mode={formMode}
        shiftData={formMode === 'edit' ? selectedEvent : null}
        staffId={staffId}
      />
    </Box>
  );
};

export default ShiftCalendar;
