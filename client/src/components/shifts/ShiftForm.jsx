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
  IconButton,
  Box,
  Typography,
  FormHelperText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import { useShift } from '../../contexts/ShiftContext';
import { useStaff } from '../../contexts/StaffContext';

const ShiftForm = ({ open, onClose, mode = 'create', shiftData = null, staffId = null }) => {
  const { createShift, updateShift } = useShift();
  const { staff } = useStaff();
  
  // フォームの初期値を設定
  const [formData, setFormData] = useState({
    staffId: staffId || '',
    staffName: '',
    date: moment().format('YYYY-MM-DD'),
    startTime: moment().hours(9).minutes(0),
    endTime: moment().hours(17).minutes(0),
    status: 'pending',
    position: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});

  // 編集モードの場合、初期値を設定
  useEffect(() => {
    if (mode === 'edit' && shiftData) {
      setFormData({
        staffId: shiftData.staffId,
        staffName: shiftData.staffName,
        date: moment(shiftData.date).format('YYYY-MM-DD'),
        startTime: moment(shiftData.startTime),
        endTime: moment(shiftData.endTime),
        status: shiftData.status,
        position: shiftData.position,
        notes: shiftData.notes || ''
      });
    } else if (staffId) {
      // 特定のスタッフのシフトを作成する場合
      const selectedStaff = staff.find(s => s.id === staffId);
      if (selectedStaff) {
        setFormData(prev => ({
          ...prev,
          staffId,
          staffName: selectedStaff.name,
          position: selectedStaff.position
        }));
      }
    }
  }, [mode, shiftData, staffId, staff]);

  // スタッフ選択の変更時に役職も更新
  useEffect(() => {
    if (formData.staffId) {
      const selectedStaff = staff.find(s => s.id === formData.staffId);
      if (selectedStaff) {
        setFormData(prev => ({
          ...prev,
          staffName: selectedStaff.name,
          position: selectedStaff.position
        }));
      }
    }
  }, [formData.staffId, staff]);

  // フォームの変更を処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 日時の変更を処理
  const handleDateTimeChange = (name, value) => {
    if (name === 'startTime' || name === 'endTime') {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 保存処理
  const handleSave = () => {
    // バリデーション
    const newErrors = {};
    
    if (!formData.staffId) {
      newErrors.staffId = 'スタッフを選択してください';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = '開始時間は必須です';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = '終了時間は必須です';
    }
    
    if (formData.startTime && formData.endTime && 
        formData.endTime.isBefore(formData.startTime)) {
      newErrors.endTime = '終了時間は開始時間より後である必要があります';
    }
    
    setErrors(newErrors);
    
    // エラーがなければ保存
    if (Object.keys(newErrors).length === 0) {
      // 保存用データを準備
      const shiftToSave = {
        staffId: formData.staffId,
        staffName: formData.staffName,
        date: moment(formData.startTime).format('YYYY-MM-DD'),
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        status: formData.status,
        position: formData.position,
        notes: formData.notes
      };
      
      if (mode === 'edit' && shiftData) {
        // 既存のシフトを更新
        updateShift(shiftData.id, shiftToSave);
      } else {
        // 新しいシフトを作成
        createShift(shiftToSave);
      }
      
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'シフト新規作成' : 'シフト編集'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <span>&times;</span>
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
          <Grid container spacing={3}>
            {/* スタッフ選択 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.staffId}>
                <InputLabel id="staff-select-label">スタッフ</InputLabel>
                <Select
                  labelId="staff-select-label"
                  name="staffId"
                  value={formData.staffId}
                  label="スタッフ"
                  onChange={handleChange}
                  disabled={!!staffId} // 特定のスタッフのシフトを作成する場合は無効化
                >
                  {staff.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} ({s.position})
                    </MenuItem>
                  ))}
                </Select>
                {errors.staffId && <FormHelperText>{errors.staffId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="役職"
                name="position"
                value={formData.position}
                fullWidth
                disabled
              />
            </Grid>
            
            {/* シフト時間 */}
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="開始時間"
                value={formData.startTime}
                onChange={(newValue) => handleDateTimeChange('startTime', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.startTime}
                    helperText={errors.startTime}
                  />
                )}
                ampm={false}
                format="YYYY/MM/DD HH:mm"
              />

            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="終了時間"
                value={formData.endTime}
                onChange={(newValue) => handleDateTimeChange('endTime', newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.endTime}
                    helperText={errors.endTime}
                  />
                )}
                ampm={false}
                format="YYYY/MM/DD HH:mm"
              />
            </Grid>
            
            {/* ステータス選択 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">ステータス</InputLabel>
                <Select
                  labelId="status-select-label"
                  name="status"
                  value={formData.status}
                  label="ステータス"
                  onChange={handleChange}
                >
                  <MenuItem value="pending">未確定</MenuItem>
                  <MenuItem value="confirmed">確定済み</MenuItem>
                </Select>
              </FormControl>
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
            
            {/* シフト情報の表示（スタッフが選択されている場合） */}
            {formData.staffId && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    週間シフト設定状況
                  </Typography>
                  <Grid container spacing={1}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const staffMember = staff.find(s => s.id === formData.staffId);
                      const availability = staffMember?.availability?.[day];
                      
                      return (
                        <Grid item xs={6} sm={4} md={3} lg={true} key={day}>
                          <Box 
                            sx={{ 
                              p: 1, 
                              borderRadius: 1, 
                              bgcolor: availability?.available ? 'success.light' : 'error.light',
                              color: availability?.available ? 'success.contrastText' : 'error.contrastText',
                              textAlign: 'center'
                            }}
                          >
                            <Typography variant="caption" display="block">
                              {day === 'monday' ? '月曜' : 
                               day === 'tuesday' ? '火曜' : 
                               day === 'wednesday' ? '水曜' : 
                               day === 'thursday' ? '木曜' : 
                               day === 'friday' ? '金曜' : 
                               day === 'saturday' ? '土曜' : '日曜'}
                            </Typography>
                            <Typography variant="body2">
                              {availability?.available 
                                ? `${availability.startTime} - ${availability.endTime}` 
                                : '勤務不可'}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    ※ これはスタッフの希望シフト情報です。実際のシフトと異なる場合があります。
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">キャンセル</Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {mode === 'create' ? '作成' : '更新'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShiftForm;
