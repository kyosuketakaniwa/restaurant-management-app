import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Chip, Divider,
  Accordion, AccordionSummary, AccordionDetails, Pagination, Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';

import { 
  getLogs, filterLogs, getUsers, initializeUserData
} from '../../utils/userUtils';

/**
 * システムログと監査コンポーネント
 */
const SystemLogs = () => {
  // 状態管理
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    userId: '',
    type: '',
    startDate: '',
    endDate: ''
  });
  const [users, setUsers] = useState([]);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);
  
  // 1ページあたりのログ数
  const logsPerPage = 15;
  
  // ログタイプのリスト
  const LOG_TYPES = [
    { id: 'USER_LOGIN', name: 'ログイン', icon: <AccountCircleIcon fontSize="small" color="primary" /> },
    { id: 'USER_CREATE', name: 'ユーザー作成', icon: <AccountCircleIcon fontSize="small" color="success" /> },
    { id: 'USER_UPDATE', name: 'ユーザー更新', icon: <AccountCircleIcon fontSize="small" color="info" /> },
    { id: 'USER_STATUS_CHANGE', name: 'ステータス変更', icon: <AccountCircleIcon fontSize="small" color="warning" /> },
    { id: 'PASSWORD_RESET', name: 'パスワードリセット', icon: <LockOpenIcon fontSize="small" color="error" /> },
    { id: 'USER_ROLE_ASSIGN', name: '役割割り当て', icon: <SecurityIcon fontSize="small" color="success" /> },
    { id: 'USER_ROLE_REMOVE', name: '役割削除', icon: <SecurityIcon fontSize="small" color="error" /> },
    { id: 'ROLE_PERMISSIONS_UPDATE', name: '権限更新', icon: <SecurityIcon fontSize="small" color="warning" /> }
  ];
  
  // 初期化
  useEffect(() => {
    // ユーザーデータが初期化されていることを確認
    initializeUserData();
    
    // データのロード
    loadData();
  }, []);
  
  // データのロード
  const loadData = () => {
    const loadedLogs = getLogs();
    const loadedUsers = getUsers();
    
    setLogs(loadedLogs);
    setUsers(loadedUsers);
    
    // 初期状態ではフィルタなしで全件表示（ソート適用）
    applyFiltersAndSort(loadedLogs, filters, sortField, sortDirection);
  };
  
  // フィルターとソートの適用
  const applyFiltersAndSort = (logData, filterValues, field, direction) => {
    // フィルタリング
    let filtered = [...logData];
    
    if (filterValues.userId) {
      filtered = filtered.filter(log => log.userId === filterValues.userId);
    }
    
    if (filterValues.type) {
      filtered = filtered.filter(log => log.type === filterValues.type);
    }
    
    if (filterValues.startDate) {
      const startDate = new Date(filterValues.startDate);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate;
      });
    }
    
    if (filterValues.endDate) {
      const endDate = new Date(filterValues.endDate);
      endDate.setHours(23, 59, 59, 999); // 日の終わりに設定
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate <= endDate;
      });
    }
    
    // ソート
    filtered.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      // 日付の場合はDate型に変換
      if (field === 'timestamp') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredLogs(filtered);
    
    // 最初のページに戻る
    setPage(1);
  };
  
  // フィルター変更ハンドラー
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // フィルターを適用
    applyFiltersAndSort(logs, newFilters, sortField, sortDirection);
  };
  
  // フィルターリセットハンドラー
  const handleResetFilters = () => {
    const newFilters = {
      userId: '',
      type: '',
      startDate: '',
      endDate: ''
    };
    
    setFilters(newFilters);
    
    // フィルターをリセットして全件表示
    applyFiltersAndSort(logs, newFilters, sortField, sortDirection);
  };
  
  // ソート変更ハンドラー
  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // ソートを適用
    applyFiltersAndSort(logs, filters, field, newDirection);
  };
  
  // ページ変更ハンドラー
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // ログアコーディオン展開ハンドラー
  const handleAccordionToggle = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };
  
  // ユーザー名取得
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.lastName} ${user.firstName} (${user.username})` : userId;
  };
  
  // ログタイプの表示名とアイコンを取得
  const getLogTypeInfo = (type) => {
    const logType = LOG_TYPES.find(t => t.id === type);
    return logType || { id: type, name: type, icon: <HistoryIcon fontSize="small" /> };
  };
  
  // 現在のページのログを取得
  const getCurrentPageLogs = () => {
    const startIndex = (page - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  };
  
  // ログの詳細情報をフォーマット
  const formatLogDetails = (log) => {
    if (!log.details) return '詳細情報なし';
    
    switch (log.type) {
      case 'USER_CREATE':
      case 'USER_UPDATE':
        if (log.details.user) {
          return (
            <Box>
              <Typography variant="subtitle2">ユーザー情報:</Typography>
              <Box ml={2}>
                <Typography variant="body2">ユーザー名: {log.details.user.username}</Typography>
                <Typography variant="body2">氏名: {log.details.user.lastName} {log.details.user.firstName}</Typography>
                <Typography variant="body2">メール: {log.details.user.email || '-'}</Typography>
                <Typography variant="body2">役職: {log.details.user.position || '-'}</Typography>
              </Box>
            </Box>
          );
        }
        return '詳細情報なし';
        
      case 'USER_STATUS_CHANGE':
        return (
          <Box>
            <Typography variant="subtitle2">ステータス変更:</Typography>
            <Box ml={2}>
              <Typography variant="body2">
                変更前: {log.details.oldStatus || '-'} → 変更後: {log.details.newStatus || '-'}
              </Typography>
            </Box>
          </Box>
        );
        
      case 'USER_ROLE_ASSIGN':
      case 'USER_ROLE_REMOVE':
        const roleDiffs = [];
        
        if (log.details.oldRoles) {
          roleDiffs.push(`変更前: ${log.details.oldRoles.join(', ') || '-'}`);
        }
        
        if (log.details.newRoles) {
          roleDiffs.push(`変更後: ${log.details.newRoles.join(', ') || '-'}`);
        }
        
        if (log.details.roleId) {
          roleDiffs.push(`対象ロール: ${log.details.roleId}`);
        }
        
        return (
          <Box>
            <Typography variant="subtitle2">役割変更:</Typography>
            <Box ml={2}>
              {roleDiffs.map((diff, index) => (
                <Typography key={index} variant="body2">{diff}</Typography>
              ))}
            </Box>
          </Box>
        );
        
      case 'ROLE_PERMISSIONS_UPDATE':
        return (
          <Box>
            <Typography variant="subtitle2">権限更新:</Typography>
            <Box ml={2}>
              <Typography variant="body2">対象ロール: {log.details.roleId}</Typography>
              {log.details.oldPermissions && (
                <Typography variant="body2">
                  変更前の権限数: {log.details.oldPermissions.length}
                </Typography>
              )}
              {log.details.newPermissions && (
                <Typography variant="body2">
                  変更後の権限数: {log.details.newPermissions.length}
                </Typography>
              )}
            </Box>
          </Box>
        );
        
      default:
        if (typeof log.details === 'object') {
          return (
            <Box>
              <Typography variant="subtitle2">詳細情報:</Typography>
              <Box ml={2}>
                {Object.entries(log.details).map(([key, value]) => (
                  <Typography key={key} variant="body2">
                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                ))}
              </Box>
            </Box>
          );
        }
        return String(log.details);
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        システムログと監査
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          ログフィルター
        </Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>ユーザー</InputLabel>
              <Select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                label="ユーザー"
              >
                <MenuItem value="">すべてのユーザー</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.lastName} {user.firstName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>操作タイプ</InputLabel>
              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="操作タイプ"
              >
                <MenuItem value="">すべての操作</MenuItem>
                {LOG_TYPES.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="startDate"
              label="開始日"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="endDate"
              label="終了日"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              startIcon={<SearchIcon />}
              onClick={() => applyFiltersAndSort(logs, filters, sortField, sortDirection)}
              fullWidth
            >
              検索
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleResetFilters}
              fullWidth
            >
              リセット
            </Button>
          </Grid>
        </Grid>
        
        <Box mt={2}>
          <Typography variant="body2">
            検索結果: {filteredLogs.length} 件のログが見つかりました
          </Typography>
        </Box>
      </Paper>
      
      {filteredLogs.length > 0 ? (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => handleSort('timestamp')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box display="flex" alignItems="center">
                      タイムスタンプ
                      {sortField === 'timestamp' && (
                        sortDirection === 'asc' ? 
                          <ArrowUpwardIcon fontSize="small" /> : 
                          <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>操作タイプ</TableCell>
                  <TableCell>ユーザー</TableCell>
                  <TableCell>詳細</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentPageLogs().map((log) => {
                  const logTypeInfo = getLogTypeInfo(log.type);
                  
                  return (
                    <React.Fragment key={log.id}>
                      <TableRow>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {logTypeInfo.icon}
                            <Typography sx={{ ml: 1 }}>
                              {logTypeInfo.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {log.userId ? getUserName(log.userId) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ExpandMoreIcon />}
                            onClick={() => handleAccordionToggle(log.id)}
                          >
                            詳細表示
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {expandedLogId === log.id && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ p: 0 }}>
                            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                              {formatLogDetails(log)}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination 
              count={Math.ceil(filteredLogs.length / logsPerPage)} 
              page={page} 
              onChange={handlePageChange} 
              color="primary"
            />
          </Box>
        </Box>
      ) : (
        <Alert severity="info">
          条件に一致するログがありません。フィルター条件を変更して再度検索してください。
        </Alert>
      )}
    </Box>
  );
};

export default SystemLogs;
