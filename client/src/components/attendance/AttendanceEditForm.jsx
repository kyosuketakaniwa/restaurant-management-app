import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAttendance } from '../../contexts/AttendanceContext';

const AttendanceEditForm = ({ open, onClose, attendanceRecord }) => {
  const { editAttendance, approveAttendance } = useAttendance();
  
  // フォームの初期値を設定
  const [formData, setFormData] = useState({
    staffId: attendanceRecord.staffId,
    staffName: attendanceRecord.staffName,
    date: moment(attendanceRecord.date).format('YYYY-MM-DD'),
    clockInTime: moment(attendanceRecord.clockInTime),
    clockOutTime: attendanceRecord.clockOutTime ? moment(attendanceRecord.clockOutTime) : null,
    breakTimes: attendanceRecord.breakTimes.map(breakTime => ({
      id: breakTime.id,
      startTime: moment(breakTime.startTime),
      endTime: breakTime.endTime ? moment(breakTime.endTime) : null
    })),
    status: attendanceRecord.status,
    notes: attendanceRecord.notes || '',
    location: attendanceRecord.location || null,
  });
  
  const [errors, setErrors] = useState({});

  // フォームの変更を処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 日時の変更を処理
  const handleDateTimeChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 休憩時間の変更を処理
  const handleBreakChange = (index, field, value) => {
    const updatedBreakTimes = [...formData.breakTimes];
    updatedBreakTimes[index] = {
      ...updatedBreakTimes[index],
      [field]: value
    };
    
    setFormData(prev => ({ ...prev, breakTimes: updatedBreakTimes }));
  };

  // 休憩時間の追加
  const addBreakTime = () => {
    // 出勤時間と退勤時間の間に新しい休憩時間を追加
    const clockIn = formData.clockInTime;
    const clockOut = formData.clockOutTime || moment();
    
    // 休憩時間は出勤から2時間後、または出勤と退勤の中間点に設定
    const breakStartTime = moment(clockIn).add(2, 'hours');
    if (breakStartTime.isAfter(clockOut)) {
      breakStartTime = moment(clockIn).add(
        moment.duration(clockOut.diff(clockIn)).asMinutes() / 2,
        'minutes'
      );
    }
    
    // 休憩時間は30分間と仮定
    const breakEndTime = moment(breakStartTime).add(30, 'minutes');
    
    const newBreak = {
      id: `break-${formData.staffId}-${Date.now()}`,
      startTime: breakStartTime,
      endTime: breakEndTime
    };
    
    setFormData(prev => ({
      ...prev,
      breakTimes: [...prev.breakTimes, newBreak]
    }));
  };

  // 休憩時間の削除
  const removeBreakTime = (index) => {
    const updatedBreakTimes = formData.breakTimes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, breakTimes: updatedBreakTimes }));
  };

  // 保存処理
  const handleSave = () => {
    // バリデーション
    const newErrors = {};
    
    if (!formData.clockInTime) {
      newErrors.clockInTime = '出勤時間は必須です';
    }
    
    if (formData.clockOutTime && formData.clockInTime && 
        formData.clockOutTime.isBefore(formData.clockInTime)) {
      newErrors.clockOutTime = '退勤時間は出勤時間より後である必要があります';
    }
    
    // 休憩時間のバリデーション
    formData.breakTimes.forEach((breakTime, index) => {
      if (!breakTime.startTime) {
        newErrors[`breakStartTime-${index}`] = '休憩開始時間は必須です';
      }
      
      if (breakTime.endTime && breakTime.startTime && 
          breakTime.endTime.isBefore(breakTime.startTime)) {
        newErrors[`breakEndTime-${index}`] = '休憩終了時間は開始時間より後である必要があります';
      }
      
      // 休憩時間が勤務時間内かチェック
      if (breakTime.startTime && formData.clockInTime && 
          breakTime.startTime.isBefore(formData.clockInTime)) {
        newErrors[`breakStartTime-${index}`] = '休憩開始時間は出勤時間以降である必要があります';
      }
      
      if (breakTime.endTime && formData.clockOutTime && 
          breakTime.endTime.isAfter(formData.clockOutTime)) {
        newErrors[`breakEndTime-${index}`] = '休憩終了時間は退勤時間以前である必要があります';
      }
    });
    
    setErrors(newErrors);
    
    // エラーがなければ保存
    if (Object.keys(newErrors).length === 0) {
      // 更新用データを準備
      const updateData = {
        clockInTime: formData.clockInTime.toISOString(),
        clockOutTime: formData.clockOutTime ? formData.clockOutTime.toISOString() : null,
        breakTimes: formData.breakTimes.map(breakTime => ({
          id: breakTime.id,
          startTime: breakTime.startTime.toISOString(),
          endTime: breakTime.endTime ? breakTime.endTime.toISOString() : null
        })),
        notes: formData.notes,
        status: 'pending-approval', // 編集したので承認待ちに戻す
      };
      
      // 勤怠記録を更新
      editAttendance(attendanceRecord.id, updateData);
      onClose();
    }
  };

  // 承認処理
  const handleApprove = () => {
    approveAttendance(attendanceRecord.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        勤怠記録の編集
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <span>&times;</span>
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Grid container spacing={3}>
            {/* スタッフ情報 */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="スタッフ名"
                name="staffName"
                value={formData.staffName}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="日付"
                name="date"
                value={formData.date}
                fullWidth
                disabled
              />
            </Grid>
            
            {/* 出退勤時間 */}
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="出勤時間"
                value={formData.clockInTime}
                onChange={(newValue) => handleDateTimeChange('clockInTime', newValue)}
                ampm={false}
                format="YYYY/MM/DD HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.clockInTime,
                    helperText: errors.clockInTime
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="退勤時間"
                value={formData.clockOutTime}
                onChange={(newValue) => handleDateTimeChange('clockOutTime', newValue)}
                ampm={false}
                format="YYYY/MM/DD HH:mm"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.clockOutTime,
                    helperText: errors.clockOutTime
                  }
                }}
              />
            </Grid>
            
            {/* 休憩時間 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">休憩時間</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addBreakTime}
                  variant="outlined"
                  size="small"
                >
                  休憩を追加
                </Button>
              </Box>
              
              {formData.breakTimes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  記録された休憩時間はありません
                </Typography>
              ) : (
                formData.breakTimes.map((breakTime, index) => (
                  <Box key={breakTime.id || index} sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={5}>
                        <DateTimePicker
                          label="休憩開始"
                          value={breakTime.startTime}
                          onChange={(newValue) => handleBreakChange(index, 'startTime', newValue)}
                          ampm={false}
                          format="YYYY/MM/DD HH:mm"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: !!errors[`breakStartTime-${index}`],
                              helperText: errors[`breakStartTime-${index}`]
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <DateTimePicker
                          label="休憩終了"
                          value={breakTime.endTime}
                          onChange={(newValue) => handleBreakChange(index, 'endTime', newValue)}
                          ampm={false}
                          format="YYYY/MM/DD HH:mm"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: !!errors[`breakEndTime-${index}`],
                              helperText: errors[`breakEndTime-${index}`]
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton 
                          color="error" 
                          onClick={() => removeBreakTime(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))
              )}
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* 備考欄 */}
            <Grid item xs={12}>
              <TextField
                label="備考"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            
            {/* ステータス表示 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>ステータス</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="ステータス"
                  disabled
                >
                  <MenuItem value="approved">承認済み</MenuItem>
                  <MenuItem value="pending-approval">承認待ち</MenuItem>
                  <MenuItem value="in-progress">進行中</MenuItem>
                </Select>
                <FormHelperText>
                  ステータスは編集すると自動的に承認待ちになります
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">キャンセル</Button>
        {attendanceRecord.status === 'pending-approval' && (
          <Button onClick={handleApprove} color="success">承認</Button>
        )}
        <Button onClick={handleSave} color="primary" variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceEditForm;
