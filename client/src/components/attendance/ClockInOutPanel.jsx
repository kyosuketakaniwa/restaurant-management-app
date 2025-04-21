import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Alert,
  TextField,
  Divider,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LogoutIcon from '@mui/icons-material/Logout';
import moment from 'moment';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useStaff } from '../../contexts/StaffContext';

const ClockInOutPanel = ({ staffId = null }) => {
  const { staff, getStaffById } = useStaff();
  const { 
    clockIn, 
    clockOut, 
    startBreak, 
    endBreak, 
    isClockingIn, 
    isInBreak,
    currentRecords,
    getCurrentRecord
  } = useAttendance();
  
  const [selectedStaff, setSelectedStaff] = useState(staffId ? getStaffById(staffId) : null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // スタッフが選択された場合の現在の記録
  const currentRecord = selectedStaff ? getCurrentRecord(selectedStaff.id) : null;
  
  // 時刻を更新するインターバル
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // スタッフIDが渡された場合、そのスタッフを選択状態にする
  useEffect(() => {
    if (staffId) {
      const staff = getStaffById(staffId);
      if (staff) {
        setSelectedStaff(staff);
      }
    }
  }, [staffId, getStaffById]);

  // スタッフ選択の処理
  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setError(null);
    setSuccess(null);
  };

  // 確認ダイアログを表示
  const showConfirmDialog = (action) => {
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  // 確認ダイアログのアクションを実行
  const executeConfirmedAction = () => {
    setConfirmDialogOpen(false);
    
    try {
      switch (confirmAction) {
        case 'clockIn':
          clockIn(selectedStaff.id, { notes });
          setSuccess(`${selectedStaff.name}さん、打刻しました`);
          break;
        case 'clockOut':
          clockOut(selectedStaff.id, { notes });
          setSuccess(`${selectedStaff.name}さん、お疲れ様でした`);
          break;
        case 'startBreak':
          startBreak(selectedStaff.id);
          setSuccess(`${selectedStaff.name}さん、休憩開始しました`);
          break;
        case 'endBreak':
          endBreak(selectedStaff.id);
          setSuccess(`${selectedStaff.name}さん、休憩終了しました`);
          break;
        default:
          break;
      }
      
      setNotes('');
    } catch (err) {
      console.error('打刻操作でエラーが発生しました', err);
      setError(err.message || 'エラーが発生しました');
    }
  };

  // 勤務状態に基づいた現在のステータスチップを表示
  const renderStatusChip = () => {
    if (!selectedStaff) return null;
    
    const isWorking = isClockingIn(selectedStaff.id);
    const inBreak = isInBreak(selectedStaff.id);
    
    if (inBreak) {
      return (
        <Chip 
          icon={<FreeBreakfastIcon />} 
          label="休憩中" 
          color="secondary" 
          variant="filled" 
        />
      );
    } else if (isWorking) {
      return (
        <Chip 
          icon={<AccessTimeFilledIcon />} 
          label="勤務中" 
          color="primary" 
          variant="filled" 
        />
      );
    } else {
      return (
        <Chip 
          icon={<AccessTimeIcon />} 
          label="未出勤" 
          color="default" 
          variant="outlined" 
        />
      );
    }
  };

  // 勤務開始・終了・休憩ボタンのレンダリング
  const renderActionButtons = () => {
    if (!selectedStaff) return null;
    
    const isWorking = isClockingIn(selectedStaff.id);
    const inBreak = isInBreak(selectedStaff.id);
    
    return (
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!isWorking && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<TimerIcon />}
            onClick={() => showConfirmDialog('clockIn')}
            sx={{ height: 56 }}
          >
            出勤打刻
          </Button>
        )}
        
        {isWorking && !inBreak && (
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              startIcon={<RestaurantIcon />}
              onClick={() => showConfirmDialog('startBreak')}
              sx={{ flex: 1, height: 56 }}
            >
              休憩開始
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={() => showConfirmDialog('clockOut')}
              sx={{ flex: 1, height: 56 }}
            >
              退勤打刻
            </Button>
          </Box>
        )}
        
        {isWorking && inBreak && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<ExitToAppIcon />}
            onClick={() => showConfirmDialog('endBreak')}
            sx={{ height: 56 }}
          >
            休憩終了
          </Button>
        )}
      </Box>
    );
  };

  // 現在の勤務情報カードをレンダリング
  const renderCurrentWorkInfo = () => {
    if (!currentRecord) return null;
    
    const clockInTime = moment(currentRecord.clockInTime);
    const now = moment();
    const duration = moment.duration(now.diff(clockInTime));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;
    
    // 休憩時間を計算
    let breakTime = 0;
    if (currentRecord.breakTimes && currentRecord.breakTimes.length > 0) {
      breakTime = currentRecord.breakTimes.reduce((total, breakItem) => {
        const start = moment(breakItem.startTime);
        const end = breakItem.endTime ? moment(breakItem.endTime) : (currentRecord.inBreak ? now : null);
        
        if (end) {
          return total + moment.duration(end.diff(start)).asMinutes();
        }
        return total;
      }, 0);
    }
    
    return (
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            現在の勤務情報
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">出勤時間</Typography>
              <Typography variant="body1">
                {clockInTime.format('HH:mm')}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">経過時間</Typography>
              <Typography variant="body1">
                {hours}時間{minutes}分
              </Typography>
            </Grid>
            
            {breakTime > 0 && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">休憩合計</Typography>
                <Typography variant="body1">
                  {Math.floor(breakTime / 60)}時間{Math.floor(breakTime % 60)}分
                </Typography>
              </Grid>
            )}
            
            {currentRecord.inBreak && currentRecord.breakTimes.length > 0 && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">現在の休憩</Typography>
                <Typography variant="body1">
                  {moment(currentRecord.breakTimes[currentRecord.breakTimes.length - 1].startTime).format('HH:mm')}〜
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* タイトルと時計 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            勤怠打刻
          </Typography>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {moment(currentTime).format('YYYY年MM月DD日')}
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
              {moment(currentTime).format('HH:mm:ss')}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* エラー・成功メッセージ */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {/* メインコンテンツ */}
        <Grid container spacing={3}>
          {/* スタッフ選択部分（単一スタッフモードでは非表示） */}
          {!staffId && (
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" gutterBottom>
                スタッフを選択してください
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2, 
                maxHeight: '300px', 
                overflowY: 'auto',
                p: 1
              }}>
                {staff.map((staffMember) => (
                  <Card 
                    key={staffMember.id} 
                    sx={{ 
                      width: 160, 
                      cursor: 'pointer',
                      bgcolor: selectedStaff?.id === staffMember.id ? 'primary.light' : 'background.paper',
                      color: selectedStaff?.id === staffMember.id ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => handleStaffSelect(staffMember)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Avatar 
                        sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
                      >
                        {staffMember.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle1" noWrap>
                        {staffMember.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {staffMember.position}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {isClockingIn(staffMember.id) ? (
                          isInBreak(staffMember.id) ? (
                            <Chip 
                              size="small" 
                              label="休憩中" 
                              color="secondary" 
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="勤務中" 
                              color="primary" 
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )
                        ) : (
                          <Chip 
                            size="small" 
                            label="未出勤" 
                            variant="outlined" 
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>
          )}
          
          {/* 打刻パネル */}
          <Grid item xs={12} md={staffId ? 12 : 4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              {selectedStaff ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {selectedStaff.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedStaff.position}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      {renderStatusChip()}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <TextField
                    label="備考（任意）"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    variant="outlined"
                    placeholder="遅刻理由や早退理由などがあれば記入してください"
                  />
                  
                  {renderActionButtons()}
                  {renderCurrentWorkInfo()}
                </>
              ) : (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <PersonIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    スタッフを選択してください
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 確認ダイアログ */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          {confirmAction === 'clockIn' && '出勤打刻の確認'}
          {confirmAction === 'clockOut' && '退勤打刻の確認'}
          {confirmAction === 'startBreak' && '休憩開始の確認'}
          {confirmAction === 'endBreak' && '休憩終了の確認'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmAction === 'clockIn' && `${selectedStaff?.name}さんの出勤を記録しますか？`}
            {confirmAction === 'clockOut' && `${selectedStaff?.name}さんの退勤を記録しますか？`}
            {confirmAction === 'startBreak' && `${selectedStaff?.name}さんの休憩開始を記録しますか？`}
            {confirmAction === 'endBreak' && `${selectedStaff?.name}さんの休憩終了を記録しますか？`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            キャンセル
          </Button>
          <Button onClick={executeConfirmedAction} color="primary" variant="contained">
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClockInOutPanel;
