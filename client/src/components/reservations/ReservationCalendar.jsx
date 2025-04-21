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
  Chip,
  Avatar
} from '@mui/material';
import {
  Info as InfoIcon,
  People as PeopleIcon,
  TableRestaurant as TableIcon,
  Edit as EditIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useReservation, RESERVATION_STATUS } from '../../contexts/ReservationContext';
import { useTable } from '../../contexts/TableContext';

// Moment.jsのローカライザー - 日本語設定
moment.locale('ja');
const localizer = momentLocalizer(moment);

// ステータスと色の設定
const STATUS_COLORS = {
  [RESERVATION_STATUS.PENDING]: '#ff9800', // warning
  [RESERVATION_STATUS.CONFIRMED]: '#2196f3', // info
  [RESERVATION_STATUS.SEATED]: '#4caf50', // success
  [RESERVATION_STATUS.COMPLETED]: '#9e9e9e', // default
  [RESERVATION_STATUS.CANCELLED]: '#f44336', // error
};

/**
 * 予約カレンダーコンポーネント
 * @param {Function} onEditReservation - 予約編集用コールバック関数
 * @param {Function} onViewDetails - 予約詳細表示用コールバック関数
 * @param {string} height - カレンダーの高さ（デフォルト: "700px"）
 */
const ReservationCalendar = ({ onEditReservation, onViewDetails, height = "700px" }) => {
  // 予約コンテキスト
  const { reservations, loading } = useReservation();
  // テーブルコンテキスト
  const { tables } = useTable();
  
  // 選択された予約
  const [selectedReservation, setSelectedReservation] = useState(null);
  // 予約詳細ダイアログの表示状態
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // 予約データをカレンダーイベント形式に変換
  const [events, setEvents] = useState([]);
  
  // 予約データが変更されたときにイベントを更新
  useEffect(() => {
    if (reservations && reservations.length > 0) {
      const formattedEvents = reservations.map(reservation => {
        // 日時の解析
        const [year, month, day] = reservation.date.split('-').map(Number);
        const [hours, minutes] = reservation.time.split(':').map(Number);
        
        // イベントの開始時間と終了時間を設定
        const start = new Date(year, month - 1, day, hours, minutes);
        // 予約は通常1.5時間と仮定
        const end = new Date(year, month - 1, day, hours + 1, minutes + 30);
        
        // テーブル情報を取得
        const tableInfo = tables.find(table => table.id === reservation.tableId);
        
        return {
          id: reservation.id,
          title: `${reservation.customerName} (${reservation.numberOfGuests}名)`,
          start,
          end,
          resource: reservation,
          tableInfo,
          status: reservation.status
        };
      });
      
      setEvents(formattedEvents);
    } else {
      setEvents([]);
    }
  }, [reservations, tables]);
  
  // 予約をクリックした時の処理
  const handleSelectEvent = (event) => {
    setSelectedReservation(event.resource);
    setDetailsOpen(true);
  };
  
  // 詳細ダイアログを閉じる
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  // 編集ボタンを押した時の処理
  const handleEdit = () => {
    if (onEditReservation) {
      onEditReservation(selectedReservation);
      setDetailsOpen(false);
    }
  };
  
  // 詳細表示ボタンを押した時の処理
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(selectedReservation);
      setDetailsOpen(false);
    }
  };
  
  // イベントのスタイルをカスタマイズ
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: STATUS_COLORS[event.status] || '#3174ad',
      color: '#fff',
      borderRadius: '4px',
      border: 'none',
      display: 'block',
      padding: '2px 5px'
    };
    return {
      style
    };
  };
  
  // カレンダーのフォーマットをカスタマイズ
  const formats = {
    dayFormat: 'D(ddd)',
    dayHeaderFormat: 'M月D日(ddd)',
    dayRangeHeaderFormat: ({ start, end }) => 
      `${moment(start).format('YYYY年M月D日')} - ${moment(end).format('M月D日')}`,
    eventTimeRangeFormat: ({ start, end }) =>
      `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
    timeGutterFormat: 'HH:mm',
  };
  
  // カレンダーのメッセージをカスタマイズ
  const messages = {
    today: '今日',
    previous: '前へ',
    next: '次へ',
    month: '月',
    week: '週',
    day: '日',
    agenda: 'リスト',
    date: '日付',
    time: '時間',
    event: '予約',
    allDay: '終日',
    showMore: (total) => `+${total}件表示`,
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          予約カレンダー
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, height, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>読み込み中...</Typography>
          </Box>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            formats={formats}
            messages={messages}
            defaultView="week"
            views={['month', 'week', 'day', 'agenda']}
          />
        )}
      </Box>
      
      {/* 予約詳細ダイアログ */}
      {selectedReservation && (
        <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
          <DialogTitle>
            予約詳細
            <Chip 
              label={
                selectedReservation.status === RESERVATION_STATUS.PENDING ? '予約受付中' :
                selectedReservation.status === RESERVATION_STATUS.CONFIRMED ? '予約確認済' :
                selectedReservation.status === RESERVATION_STATUS.SEATED ? '着席中' :
                selectedReservation.status === RESERVATION_STATUS.COMPLETED ? '完了' :
                selectedReservation.status === RESERVATION_STATUS.CANCELLED ? 'キャンセル' : 
                selectedReservation.status
              }
              color={
                selectedReservation.status === RESERVATION_STATUS.PENDING ? 'warning' :
                selectedReservation.status === RESERVATION_STATUS.CONFIRMED ? 'info' :
                selectedReservation.status === RESERVATION_STATUS.SEATED ? 'success' :
                selectedReservation.status === RESERVATION_STATUS.COMPLETED ? 'default' :
                selectedReservation.status === RESERVATION_STATUS.CANCELLED ? 'error' : 
                'primary'
              }
              size="small"
              sx={{ ml: 2 }}
            />
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedReservation.customerName}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {selectedReservation.phoneNumber}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {selectedReservation.numberOfGuests}名
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TableIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {tables.find(table => table.id === selectedReservation.tableId)?.name || 'テーブル未指定'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">予約日時</Typography>
                <Typography variant="body1">
                  {moment(`${selectedReservation.date} ${selectedReservation.time}`).format('YYYY年M月D日(ddd) HH:mm')}
                </Typography>
              </Grid>
              
              {selectedReservation.note && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">備考</Typography>
                  <Typography variant="body2">
                    {selectedReservation.note}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>閉じる</Button>
            <Button onClick={handleEdit} startIcon={<EditIcon />} color="primary">
              編集
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default ReservationCalendar;
