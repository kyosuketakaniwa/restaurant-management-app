import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardContent,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { useAttendance } from '../contexts/AttendanceContext';
import { useStaff } from '../contexts/StaffContext';
import ClockInOutPanel from '../components/attendance/ClockInOutPanel';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';

const AttendanceTracking = () => {
  const { staff } = useStaff();
  const { attendanceRecords, approveAttendance } = useAttendance();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [dateRange, setDateRange] = useState({
    start: moment().startOf('month'),
    end: moment().endOf('month')
  });
  
  // 承認待ちの勤怠記録
  const pendingRecords = attendanceRecords.filter(record => 
    record.status === 'pending-approval' && 
    (selectedStaff ? record.staffId === selectedStaff : true)
  );
  
  // タブ切り替え
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // スタッフ選択
  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };
  
  // 日付範囲変更
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 承認処理
  const handleApprove = (recordId) => {
    approveAttendance(recordId);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        勤怠管理
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="勤怠管理タブ"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="打刻" />
          <Tab label="勤怠カレンダー" />
          <Tab label="承認管理" />
          <Tab label="レポート" />
        </Tabs>
      </Box>
      
      {/* 打刻タブ */}
      {activeTab === 0 && (
        <ClockInOutPanel />
      )}
      
      {/* 勤怠カレンダータブ */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="staff-select-label">スタッフ選択</InputLabel>
                <Select
                  labelId="staff-select-label"
                  value={selectedStaff}
                  label="スタッフ選択"
                  onChange={handleStaffChange}
                >
                  <MenuItem value="">すべてのスタッフ</MenuItem>
                  {staff.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <AttendanceCalendar staffId={selectedStaff || null} />
        </Box>
      )}
      
      {/* 承認管理タブ */}
      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              承認待ちの勤怠記録
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="approval-staff-select-label">スタッフ選択</InputLabel>
                  <Select
                    labelId="approval-staff-select-label"
                    value={selectedStaff}
                    label="スタッフ選択"
                    onChange={handleStaffChange}
                    size="small"
                  >
                    <MenuItem value="">すべてのスタッフ</MenuItem>
                    {staff.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {pendingRecords.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                承認待ちの勤怠記録はありません。
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {pendingRecords.map(record => (
                  <Grid item xs={12} md={6} lg={4} key={record.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">
                          {record.staffName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {moment(record.date).format('YYYY年MM月DD日')}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">出勤時間</Typography>
                            <Typography variant="body2">
                              {moment(record.clockInTime).format('HH:mm')}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">退勤時間</Typography>
                            <Typography variant="body2">
                              {record.clockOutTime 
                                ? moment(record.clockOutTime).format('HH:mm') 
                                : '未打刻'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">合計時間</Typography>
                            <Typography variant="body2">
                              {record.totalWorkHours 
                                ? `${record.totalWorkHours.toFixed(2)}時間` 
                                : '-'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">残業時間</Typography>
                            <Typography variant="body2">
                              {record.overtimeHours 
                                ? `${record.overtimeHours.toFixed(2)}時間` 
                                : '-'}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        {record.notes && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">備考</Typography>
                            <Typography variant="body2">{record.notes}</Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            onClick={() => handleApprove(record.id)}
                          >
                            承認
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>
      )}
      
      {/* レポートタブ */}
      {activeTab === 3 && (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              勤怠レポート
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="report-staff-select-label">スタッフ選択</InputLabel>
                  <Select
                    labelId="report-staff-select-label"
                    value={selectedStaff}
                    label="スタッフ選択"
                    onChange={handleStaffChange}
                  >
                    <MenuItem value="">すべてのスタッフ</MenuItem>
                    {staff.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="開始日"
                    value={dateRange.start}
                    onChange={(newValue) => handleDateChange('start', newValue)}
                    format="YYYY/MM/DD"
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="終了日"
                    value={dateRange.end}
                    onChange={(newValue) => handleDateChange('end', newValue)}
                    format="YYYY/MM/DD"
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
              </LocalizationProvider>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button variant="contained">
                レポート生成
              </Button>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              レポートを生成するには上記のフォームを入力して「レポート生成」ボタンをクリックしてください。
            </Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default AttendanceTracking;
