import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useShift } from '../contexts/ShiftContext';
import { useStaff } from '../contexts/StaffContext';
import { useAuth } from '../contexts/AuthContext';
import ShiftCalendar from '../components/shifts/ShiftCalendar';
import ShiftRequestManager from '../components/shifts/ShiftRequestManager';
import ShiftForm from '../components/shifts/ShiftForm';
import ShiftPreferenceForm from '../components/shifts/ShiftPreferenceForm';
import ShiftPreferenceAggregation from '../components/shifts/ShiftPreferenceAggregation';

const ShiftManagement = () => {
  const { shifts } = useShift();
  const { staff } = useStaff();
  const { currentUser, isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [preferenceTab, setPreferenceTab] = useState(0);
  
  // タブ切り替え
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // スタッフ選択
  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };

  // シフト希望タブ切り替え
  const handlePreferenceTabChange = (event, newValue) => {
    setPreferenceTab(newValue);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          シフト管理
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowShiftForm(true)}
        >
          新規シフト作成
        </Button>
      </Box>
      
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          scrollButtons="auto"
          variant="scrollable"
        >
          <Tab icon={<CalendarMonthIcon />} label="シフトカレンダー" />
          <Tab icon={<AssignmentIcon />} label="シフト申請管理" />
          <Tab icon={<FavoriteIcon />} label="シフト希望" />
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        {/* シフトカレンダー */}
        {activeTab === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>スタッフ絞り込み</InputLabel>
                <Select
                  value={selectedStaff}
                  onChange={handleStaffChange}
                  label="スタッフ絞り込み"
                >
                  <MenuItem value="">全スタッフ</MenuItem>
                  {staff.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowShiftForm(true)}
              >
                シフト追加
              </Button>
            </Box>
            
            <ShiftCalendar staffId={selectedStaff || null} />
            
            {/* シフト追加フォーム */}
            {showShiftForm && (
              <ShiftForm
                open={showShiftForm}
                onClose={() => setShowShiftForm(false)}
                staffId={selectedStaff || null}
              />
            )}
          </>
        )}
        
        {/* シフト申請管理 */}
        {activeTab === 1 && (
          <ShiftRequestManager />
        )}

        {/* シフト希望管理 */}
        {activeTab === 2 && (
          <>
            {isAdmin ? (
              <>
                <Box sx={{ width: '100%', mb: 3 }}>
                  <Tabs 
                    value={preferenceTab} 
                    onChange={handlePreferenceTabChange}
                    centered
                  >
                    <Tab icon={<BarChartIcon />} label="希望集計" />
                    <Tab icon={<FavoriteIcon />} label="希望登録" />
                  </Tabs>
                </Box>

                {preferenceTab === 0 ? (
                  <ShiftPreferenceAggregation />
                ) : (
                  <>
                    <FormControl sx={{ minWidth: 200, mb: 2 }}>
                      <InputLabel>スタッフ選択</InputLabel>
                      <Select
                        value={selectedStaff}
                        onChange={handleStaffChange}
                        label="スタッフ選択"
                      >
                        <MenuItem value="">選択してください</MenuItem>
                        {staff.map(s => (
                          <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {selectedStaff && <ShiftPreferenceForm staffId={selectedStaff} />}
                  </>
                )}
              </>
            ) : (
              // 一般スタッフ向け：自分のシフト希望のみ登録可能
              <ShiftPreferenceForm staffId={currentUser?.id} />
            )}
          </>
        )}
      </Box>

      {/* シフト作成フォーム（ページ右上のボタン用） */}
      {showShiftForm && (
        <ShiftForm
          open={showShiftForm}
          onClose={() => setShowShiftForm(false)}
          mode="create"
          staffId={selectedStaff || null}
        />
      )}
    </Container>
  );
};

export default ShiftManagement;
