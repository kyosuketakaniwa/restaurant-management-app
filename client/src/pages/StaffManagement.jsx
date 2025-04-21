import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useStaff } from '../contexts/StaffContext';

const StaffManagement = () => {
  const { staff, addStaff, updateStaff, deleteStaff } = useStaff();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    hourlyRate: '',
    hireDate: '',
    skills: [],
    availability: {
      monday: { available: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
      thursday: { available: false, startTime: '09:00', endTime: '17:00' },
      friday: { available: false, startTime: '09:00', endTime: '17:00' },
      saturday: { available: false, startTime: '09:00', endTime: '17:00' },
      sunday: { available: false, startTime: '09:00', endTime: '17:00' }
    }
  });
  
  // タブ切り替え
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // ダイアログを開く
  const handleOpenDialog = (type, staff = null) => {
    setDialogType(type);
    
    if (type === 'edit' && staff) {
      setSelectedStaff(staff);
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        position: staff.position || '',
        hourlyRate: staff.hourlyRate || '',
        hireDate: staff.hireDate || '',
        skills: staff.skills || [],
        availability: staff.availability || {
          monday: { available: false, startTime: '09:00', endTime: '17:00' },
          tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
          wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
          thursday: { available: false, startTime: '09:00', endTime: '17:00' },
          friday: { available: false, startTime: '09:00', endTime: '17:00' },
          saturday: { available: false, startTime: '09:00', endTime: '17:00' },
          sunday: { available: false, startTime: '09:00', endTime: '17:00' }
        }
      });
    } else {
      // 新規追加の場合はフォームをリセット
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        hourlyRate: '',
        hireDate: '',
        skills: [],
        availability: {
          monday: { available: false, startTime: '09:00', endTime: '17:00' },
          tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
          wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
          thursday: { available: false, startTime: '09:00', endTime: '17:00' },
          friday: { available: false, startTime: '09:00', endTime: '17:00' },
          saturday: { available: false, startTime: '09:00', endTime: '17:00' },
          sunday: { available: false, startTime: '09:00', endTime: '17:00' }
        }
      });
    }
    
    setOpenDialog(true);
  };
  
  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };
  
  // フォームの入力変更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // スキルの追加/削除
  const handleSkillChange = (e) => {
    setFormData({ ...formData, skills: e.target.value });
  };
  
  // 勤務可能日の変更
  const handleAvailabilityChange = (day, field, value) => {
    const newAvailability = { ...formData.availability };
    
    if (field === 'available') {
      newAvailability[day].available = value;
    } else {
      newAvailability[day][field] = value;
    }
    
    setFormData({ ...formData, availability: newAvailability });
  };
  
  // スタッフの保存
  const handleSaveStaff = () => {
    if (dialogType === 'add') {
      addStaff({
        ...formData,
        id: `staff-${Date.now()}`, // 一時的なID
        hourlyRate: parseFloat(formData.hourlyRate) || 0
      });
    } else {
      updateStaff(selectedStaff.id, {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 0
      });
    }
    
    handleCloseDialog();
  };
  
  // スタッフの削除
  const handleDeleteStaff = (staffId) => {
    deleteStaff(staffId);
  };
  
  // 使用可能なスキルのリスト
  const availableSkills = [
    'ホール', 'キッチン', 'バー', 'レジ', '予約管理', '接客', '料理', 'ワイン', 'カクテル',
    '日本料理', '洋食', '中華料理', 'イタリアン', 'フレンチ'
  ];
  
  // 役職のリスト
  const positions = [
    '店長', 'チーフ', 'ホールマネージャー', 'キッチンマネージャー', 'シェフ', 'バーテンダー',
    'ホールスタッフ', 'キッチンスタッフ', 'バースタッフ', 'レジスタッフ', 'アルバイト'
  ];
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        スタッフ管理
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="スタッフ管理タブ"
        >
          <Tab label="スタッフ一覧" />
          <Tab label="スキルマトリクス" />
          <Tab label="勤務可能時間" />
        </Tabs>
      </Box>
      
      {/* スタッフ一覧タブ */}
      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
            >
              スタッフを追加
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {staff.map((s) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={s.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {s.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {s.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {s.position}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          メール
                        </Typography>
                        <Typography variant="body2" noWrap>
                          {s.email || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          電話番号
                        </Typography>
                        <Typography variant="body2">
                          {s.phone || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          時給
                        </Typography>
                        <Typography variant="body2">
                          {s.hourlyRate ? `¥${s.hourlyRate.toLocaleString()}` : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          入社日
                        </Typography>
                        <Typography variant="body2">
                          {s.hireDate || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {s.skills && s.skills.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          スキル
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {s.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog('edit', s)}
                    >
                      編集
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteStaff(s.id)}
                    >
                      削除
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            
            {staff.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    スタッフが登録されていません。「スタッフを追加」ボタンから登録してください。
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
      
      {/* スキルマトリクスタブ */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            スキルマトリクス
          </Typography>
          
          {staff.length > 0 ? (
            <Box sx={{ minWidth: 800 }}>
              <Grid container>
                {/* ヘッダー行 */}
                <Grid item xs={3}>
                  <Typography sx={{ fontWeight: 'bold', p: 1 }}>スタッフ名</Typography>
                </Grid>
                {availableSkills.map((skill, index) => (
                  <Grid item xs key={index}>
                    <Typography 
                      sx={{ 
                        fontWeight: 'bold', 
                        p: 1, 
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {skill}
                    </Typography>
                  </Grid>
                ))}
                
                {/* スタッフごとの行 */}
                {staff.map((s) => (
                  <React.Fragment key={s.id}>
                    <Grid item xs={3}>
                      <Box sx={{ p: 1, borderTop: '1px solid #eee' }}>
                        <Typography>{s.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {s.position}
                        </Typography>
                      </Box>
                    </Grid>
                    {availableSkills.map((skill, index) => (
                      <Grid item xs key={index}>
                        <Box 
                          sx={{ 
                            p: 1, 
                            textAlign: 'center', 
                            borderTop: '1px solid #eee',
                            bgcolor: s.skills && s.skills.includes(skill) ? 'success.light' : 'transparent'
                          }}
                        >
                          {s.skills && s.skills.includes(skill) ? '✓' : '-'}
                        </Box>
                      </Grid>
                    ))}
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              スタッフが登録されていません。「スタッフ一覧」タブから登録してください。
            </Typography>
          )}
        </Paper>
      )}
      
      {/* 勤務可能時間タブ */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            勤務可能時間
          </Typography>
          
          {staff.length > 0 ? (
            <Box sx={{ minWidth: 800 }}>
              <Grid container>
                {/* ヘッダー行 */}
                <Grid item xs={3}>
                  <Typography sx={{ fontWeight: 'bold', p: 1 }}>スタッフ名</Typography>
                </Grid>
                {['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'].map((day, index) => (
                  <Grid item xs key={index}>
                    <Typography 
                      sx={{ 
                        fontWeight: 'bold', 
                        p: 1, 
                        textAlign: 'center'
                      }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
                
                {/* スタッフごとの行 */}
                {staff.map((s) => {
                  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  
                  return (
                    <React.Fragment key={s.id}>
                      <Grid item xs={3}>
                        <Box sx={{ p: 1, borderTop: '1px solid #eee' }}>
                          <Typography>{s.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {s.position}
                          </Typography>
                        </Box>
                      </Grid>
                      {days.map((day, index) => (
                        <Grid item xs key={index}>
                          <Box 
                            sx={{ 
                              p: 1, 
                              textAlign: 'center', 
                              borderTop: '1px solid #eee',
                              bgcolor: s.availability && s.availability[day]?.available ? 'success.light' : 'error.light',
                              color: 'white'
                            }}
                          >
                            {s.availability && s.availability[day]?.available 
                              ? `${s.availability[day].startTime} - ${s.availability[day].endTime}`
                              : '不可'}
                          </Box>
                        </Grid>
                      ))}
                    </React.Fragment>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              スタッフが登録されていません。「スタッフ一覧」タブから登録してください。
            </Typography>
          )}
        </Paper>
      )}
      
      {/* スタッフ追加/編集ダイアログ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'スタッフを追加' : 'スタッフを編集'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="氏名"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="position-label">役職</InputLabel>
                <Select
                  labelId="position-label"
                  name="position"
                  value={formData.position}
                  label="役職"
                  onChange={handleInputChange}
                >
                  {positions.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="電話番号"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="hourlyRate"
                label="時給（円）"
                type="number"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="hireDate"
                label="入社日"
                type="date"
                value={formData.hireDate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="skills-label">スキル</InputLabel>
                <Select
                  labelId="skills-label"
                  multiple
                  value={formData.skills}
                  onChange={handleSkillChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                勤務可能時間
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries({
                  monday: '月曜',
                  tuesday: '火曜',
                  wednesday: '水曜',
                  thursday: '木曜',
                  friday: '金曜',
                  saturday: '土曜',
                  sunday: '日曜'
                }).map(([day, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={day}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">{label}</Typography>
                        <FormControl sx={{ ml: 'auto' }}>
                          <Select
                            value={formData.availability[day].available}
                            onChange={(e) => handleAvailabilityChange(day, 'available', e.target.value)}
                            size="small"
                          >
                            <MenuItem value={true}>勤務可</MenuItem>
                            <MenuItem value={false}>勤務不可</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      
                      {formData.availability[day].available && (
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <TextField
                              label="開始時間"
                              type="time"
                              value={formData.availability[day].startTime}
                              onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label="終了時間"
                              type="time"
                              value={formData.availability[day].endTime}
                              onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveStaff} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffManagement;
