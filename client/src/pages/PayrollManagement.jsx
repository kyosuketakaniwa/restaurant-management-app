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
  Alert
} from '@mui/material';
import { usePayroll } from '../contexts/PayrollContext';
import PayrollCalculator from '../components/payroll/PayrollCalculator';
import PayrollHistory from '../components/payroll/PayrollHistory';

const PayrollManagement = () => {
  const { error } = usePayroll();
  const [activeTab, setActiveTab] = useState(0);
  
  // タブ切り替え
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        給与管理
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="給与管理タブ"
        >
          <Tab label="給与計算" />
          <Tab label="給与履歴" />
          <Tab label="設定" />
        </Tabs>
      </Box>
      
      {/* 給与計算タブ */}
      {activeTab === 0 && (
        <PayrollCalculator />
      )}
      
      {/* 給与履歴タブ */}
      {activeTab === 1 && (
        <PayrollHistory />
      )}
      
      {/* 設定タブ */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            給与設定
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  基本設定
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  給与計算の基本設定を行います。締め日、支払日、残業計算方法などを設定できます。
                </Typography>
                <Button variant="outlined" disabled>
                  基本設定を編集
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  控除項目設定
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  給与から控除する項目（税金、社会保険など）の設定を行います。
                </Typography>
                <Button variant="outlined" disabled>
                  控除項目を編集
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  手当設定
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  各種手当（通勤手当、役職手当など）の設定を行います。
                </Typography>
                <Button variant="outlined" disabled>
                  手当を編集
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  給与明細書テンプレート
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  給与明細書のデザインやフォーマットを設定します。
                </Typography>
                <Button variant="outlined" disabled>
                  テンプレートを編集
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info">
                これらの設定機能は現在開発中です。将来のアップデートで実装される予定です。
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default PayrollManagement;
