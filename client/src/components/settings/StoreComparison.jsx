import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Grid,
  Card, CardContent, Divider, FormGroup, FormControlLabel, Checkbox, 
  Button, ToggleButtonGroup, ToggleButton, Snackbar, Alert
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

import { getAllStores, getAllStoreGroups } from '../../utils/storeUtils';

// ダミーデータ生成（実際の実装ではAPIから取得）
const generateDummyData = (stores) => {
  const metrics = ['売上', '客数', '客単価', '座席回転率', '在庫コスト'];
  const periods = ['今日', '今週', '今月', '前月', '年間'];
  
  const allData = {};
  
  // 各店舗のデータを生成
  stores.forEach(store => {
    const storeData = {};
    
    metrics.forEach(metric => {
      storeData[metric] = {};
      
      periods.forEach(period => {
        // ランダムなデータを生成（実際の実装ではAPIから取得）
        let baseValue;
        switch(metric) {
          case '売上':
            baseValue = Math.floor(Math.random() * 500000) + 100000;
            break;
          case '客数':
            baseValue = Math.floor(Math.random() * 200) + 50;
            break;
          case '客単価':
            baseValue = Math.floor(Math.random() * 3000) + 1000;
            break;
          case '座席回転率':
            baseValue = (Math.random() * 5 + 1).toFixed(2);
            break;
          case '在庫コスト':
            baseValue = Math.floor(Math.random() * 100000) + 10000;
            break;
          default:
            baseValue = Math.floor(Math.random() * 1000);
        }
        
        storeData[metric][period] = baseValue;
      });
    });
    
    allData[store.id] = storeData;
  });
  
  return allData;
};

// 指標ごとの単位を取得
const getMetricUnit = (metric) => {
  switch(metric) {
    case '売上':
    case '在庫コスト':
      return '円';
    case '客数':
      return '人';
    case '客単価':
      return '円/人';
    case '座席回転率':
      return '回/日';
    default:
      return '';
  }
};

// グラフで使用するカラー配列
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

/**
 * 店舗データ比較コンポーネント
 */
const StoreComparison = () => {
  // 状態管理
  const [stores, setStores] = useState([]);
  const [storeGroups, setStoreGroups] = useState([]);
  const [comparisonData, setComparisonData] = useState({});
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('売上');
  const [selectedPeriod, setSelectedPeriod] = useState('今月');
  const [chartType, setChartType] = useState('bar');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // 表示可能な指標
  const metrics = ['売上', '客数', '客単価', '座席回転率', '在庫コスト'];
  // 期間オプション
  const periods = ['今日', '今週', '今月', '前月', '年間'];

  // 初期データのロード
  useEffect(() => {
    loadData();
  }, []);
  
  // データが更新されたらチャートデータを準備
  useEffect(() => {
    if (stores.length > 0 && selectedStoreIds.length === 0) {
      // デフォルトで最初の3店舗を選択
      const initialStoreIds = stores.slice(0, Math.min(3, stores.length)).map(store => store.id);
      setSelectedStoreIds(initialStoreIds);
    }
  }, [stores]);

  // データのロード
  const loadData = () => {
    const loadedStores = getAllStores();
    const loadedGroups = getAllStoreGroups();
    
    setStores(loadedStores);
    setStoreGroups(loadedGroups);
    
    // ダミーデータを生成（実際の実装ではAPIから取得）
    setComparisonData(generateDummyData(loadedStores));
  };

  // 店舗選択の変更を処理
  const handleStoreSelectionChange = (event) => {
    const { value } = event.target;
    setSelectedStoreIds(value);
  };

  // 指標の変更を処理
  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  // 期間の変更を処理
  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
  };

  // チャートタイプの変更を処理
  const handleChartTypeChange = (event, newType) => {
    if (newType) {
      setChartType(newType);
    }
  };

  // グループの店舗すべてを選択
  const handleSelectGroup = (groupId) => {
    const group = storeGroups.find(g => g.id === groupId);
    if (!group) return;
    
    setSelectedStoreIds(group.storeIds);
    
    setSnackbar({
      open: true,
      message: `「${group.name}」グループの店舗が選択されました`,
      severity: 'info'
    });
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // チャートデータを準備
  const prepareChartData = () => {
    if (selectedStoreIds.length === 0) return [];
    
    const chartData = selectedStoreIds.map(storeId => {
      const store = stores.find(s => s.id === storeId);
      const storeData = comparisonData[storeId];
      
      if (!store || !storeData) return null;
      
      return {
        name: store.name,
        value: storeData[selectedMetric]?.[selectedPeriod] || 0
      };
    }).filter(Boolean);
    
    return chartData;
  };
  
  // 店舗名を取得
  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : '';
  };

  const chartData = prepareChartData();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          店舗データ比較
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="chart type"
          size="small"
        >
          <ToggleButton value="bar" aria-label="bar chart">
            <BarChartIcon />
          </ToggleButton>
          <ToggleButton value="pie" aria-label="pie chart">
            <PieChartIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                分析条件
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>指標を選択</InputLabel>
                <Select
                  value={selectedMetric}
                  onChange={handleMetricChange}
                  label="指標を選択"
                >
                  {metrics.map(metric => (
                    <MenuItem key={metric} value={metric}>{metric}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>期間</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                  label="期間"
                >
                  {periods.map(period => (
                    <MenuItem key={period} value={period}>{period}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                店舗を選択
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>比較する店舗</InputLabel>
                <Select
                  multiple
                  value={selectedStoreIds}
                  onChange={handleStoreSelectionChange}
                  label="比較する店舗"
                  renderValue={(selected) => selected.map(id => getStoreName(id)).join(', ')}
                >
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      <Checkbox checked={selectedStoreIds.indexOf(store.id) > -1} />
                      <Typography>{store.name}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                グループで選択
              </Typography>
              
              {storeGroups.map(group => (
                <Button 
                  key={group.id}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  onClick={() => handleSelectGroup(group.id)}
                >
                  {group.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {`${selectedMetric}の比較 (${selectedPeriod})`}
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
              単位: {getMetricUnit(selectedMetric)}
            </Typography>
            
            {selectedStoreIds.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
                <Typography color="textSecondary">
                  比較する店舗を選択してください。
                </Typography>
              </Box>
            ) : chartData.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
                <Typography color="textSecondary">
                  表示するデータがありません。
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 400, mt: 2 }}>
                {chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value} ${getMetricUnit(selectedMetric)}`} />
                      <Legend />
                      <Bar dataKey="value" name={selectedMetric} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} ${getMetricUnit(selectedMetric)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 通知用スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoreComparison;
