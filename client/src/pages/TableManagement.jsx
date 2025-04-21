import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Badge,
  Chip,
  Dialog,
  AppBar,
  Toolbar,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Visibility as VisibilityIcon,
  ViewModule as ViewModuleIcon,
  ViewQuilt as ViewQuiltIcon,
  FilterList as FilterListIcon,
  TableRestaurant as TableIcon
} from '@mui/icons-material';
import { useTable } from '../contexts/TableContext';
import { useOrder } from '../contexts/OrderContext';
import FloorPlanView from '../components/tables/FloorPlanView';
import TableListView from '../components/tables/TableListView';
import TableDetailDialog from '../components/tables/TableDetailDialog';
import TableFormDialog from '../components/tables/TableFormDialog';
import TableReservationDialog from '../components/tables/TableReservationDialog';

/**
 * テーブル管理ページ
 * レストランのテーブルレイアウトと各テーブルの状態を管理
 */
const TableManagement = () => {
  // URLクエリパラメータの取得
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tableIdFromQuery = queryParams.get('tableId');
  
  // テーブルコンテキスト
  const { 
    tables,
    loading,
    error,
    reservedTables,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    moveTable: updateTablePosition,
    getTableById
  } = useTable();
  
  // 注文コンテキスト
  const { activeOrders } = useOrder();
  
  // ローカルステート
  const [viewMode, setViewMode] = useState('list'); // 'floor' or 'list'
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetailOpen, setTableDetailOpen] = useState(false);
  const [tableFormOpen, setTableFormOpen] = useState(false);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  
  // URLクエリパラメータからテーブルを表示する処理
  useEffect(() => {
    if (tableIdFromQuery && tables.length > 0) {
      const tableToShow = tables.find(table => table.id === tableIdFromQuery);
      if (tableToShow) {
        // クエリパラメータと一致するテーブルが見つかった場合
        setSelectedTable(tableToShow);
        setTableDetailOpen(true);
        // URLからクエリパラメータをクリア
        navigate('/tables', { replace: true });
      }
    }
  }, [tableIdFromQuery, tables, navigate]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  
  // ステータスによるテーブルの色を取得
  const getTableStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success.main';
      case 'occupied':
        return 'error.main';
      case 'reserved':
        return 'warning.main';
      case 'maintenance':
        return 'grey.500';
      default:
        return 'primary.main';
    }
  };
  
  // テーブルの詳細を表示
  const handleViewTable = (table) => {
    setSelectedTable(table);
    setTableDetailOpen(true);
  };
  
  // 新しいテーブルを追加
  const handleAddTable = () => {
    setSelectedTable(null);
    setIsEditMode(false);
    setTableFormOpen(true);
  };
  
  // テーブルを編集
  const handleEditTable = (table) => {
    setSelectedTable(table);
    setIsEditMode(true);
    setTableFormOpen(true);
  };
  
  // テーブルを保存
  const handleSaveTable = (tableData) => {
    if (isEditMode && selectedTable) {
      // 既存のテーブルを更新
      updateTable({ ...selectedTable, ...tableData });
    } else {
      // 新しいテーブルを追加
      addTable(tableData);
    }
    
    setTableFormOpen(false);
  };
  
  // テーブルを削除
  const handleDeleteTable = (tableId) => {
    deleteTable(tableId);
    setTableDetailOpen(false);
  };
  
  // テーブル状態を更新
  const handleStatusChange = (tableId, newStatus) => {
    updateTableStatus(tableId, newStatus);
    
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable({ ...selectedTable, status: newStatus });
    }
  };
  
  // テーブル位置の更新
  const handleTablePositionChange = (tableId, newPosition) => {
    // TableContextから取得した関数を使用
    updateTablePosition(tableId, newPosition);
  };
  
  // 予約処理
  const handleReservation = (table) => {
    setSelectedTable(table);
    setReservationDialogOpen(true);
  };
  
  // 予約情報を保存
  const handleSaveReservation = (reservationData) => {
    // ここで予約情報を保存する処理を実装
    // 実際のアプリではReservationContextのaddReservation関数などを呼び出す
    console.log('予約情報:', reservationData);
    
    // テーブルのステータスを予約済みに変更
    updateTableStatus(selectedTable.id, 'reserved');
    
    setReservationDialogOpen(false);
  };
  
  // フィルターメニュー開閉
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };
  
  // フィルタリングされたテーブルを取得
  const getFilteredTables = () => {
    return tables.filter(table => {
      // ステータスフィルター
      if (statusFilter !== 'all' && table.status !== statusFilter) {
        return false;
      }
      
      // セクションフィルター
      if (sectionFilter !== 'all' && table.section !== sectionFilter) {
        return false;
      }
      
      return true;
    });
  };
  
  // セクションの一覧を取得
  const getSections = () => {
    const sections = new Set();
    tables.forEach(table => sections.add(table.section));
    return Array.from(sections);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            テーブル管理
          </Typography>
          
          {/* 表示切替ボタン */}
          <Box sx={{ mr: 2 }}>
            <IconButton
              color={viewMode === 'floor' ? 'secondary' : 'inherit'}
              onClick={() => setViewMode('floor')}
            >
              <ViewQuiltIcon />
            </IconButton>
            <IconButton
              color={viewMode === 'list' ? 'secondary' : 'inherit'}
              onClick={() => setViewMode('list')}
            >
              <ViewModuleIcon />
            </IconButton>
          </Box>
          
          {/* フィルターボタン */}
          <IconButton 
            color="inherit"
            onClick={handleFilterMenuOpen}
          >
            <FilterListIcon />
          </IconButton>
          
          {/* テーブル追加ボタン */}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddTable}
            sx={{ ml: 2 }}
          >
            テーブルを追加
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 3, mb: 3 }}>
        {/* ステータス概要 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  総テーブル数
                </Typography>
                <Typography variant="h4">
                  {tables.length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  利用可能
                </Typography>
                <Typography variant="h4" color="success.main">
                  {tables.filter(t => t.status === 'available').length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  使用中
                </Typography>
                <Typography variant="h4" color="error.main">
                  {tables.filter(t => t.status === 'occupied').length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  予約済み
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {tables.filter(t => t.status === 'reserved').length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* メインコンテンツ */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <Typography>読み込み中...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          viewMode === 'floor' ? (
            <FloorPlanView 
              tables={getFilteredTables()} 
              onTableClick={handleViewTable}
              activeOrders={activeOrders}
              onTablePositionChange={handleTablePositionChange}
            />
          ) : (
            <TableListView 
              tables={getFilteredTables()} 
              onView={handleViewTable}
              onEdit={handleEditTable}
              onDelete={handleDeleteTable}
              onStatusChange={handleStatusChange}
              onReservation={handleReservation}
              onStatistics={() => {}} // 将来的に実装
              activeOrders={activeOrders}
              reservedTables={reservedTables || []}
            />
          )
        )}
      </Container>
      
      {/* テーブル詳細ダイアログ */}
      {selectedTable && (
        <TableDetailDialog
          open={tableDetailOpen}
          table={selectedTable}
          onClose={() => setTableDetailOpen(false)}
          onEdit={() => {
            setTableDetailOpen(false);
            handleEditTable(selectedTable);
          }}
          onDelete={() => handleDeleteTable(selectedTable.id)}
          onStatusChange={(newStatus) => handleStatusChange(selectedTable.id, newStatus)}
          activeOrders={activeOrders.filter(order => order.tableId === selectedTable.id)}
        />
      )}
      
      {/* テーブル追加/編集ダイアログ */}
      <TableFormDialog
        open={tableFormOpen}
        table={isEditMode ? selectedTable : null}
        onClose={() => setTableFormOpen(false)}
        onSave={handleSaveTable}
        isEditMode={isEditMode}
      />
      
      {/* テーブル予約ダイアログ */}
      {selectedTable && (
        <TableReservationDialog
          open={reservationDialogOpen}
          table={selectedTable}
          onClose={() => setReservationDialogOpen(false)}
          onReservationAdd={handleSaveReservation}
        />
      )}
      
      {/* フィルターメニュー */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          ステータス
        </Typography>
        <MenuItem 
          selected={statusFilter === 'all'}
          onClick={() => {
            setStatusFilter('all');
            handleFilterMenuClose();
          }}
        >
          すべて
        </MenuItem>
        <MenuItem 
          selected={statusFilter === 'available'}
          onClick={() => {
            setStatusFilter('available');
            handleFilterMenuClose();
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'success.main',
                mr: 1
              }} 
            />
            利用可能
          </Box>
        </MenuItem>
        <MenuItem 
          selected={statusFilter === 'occupied'}
          onClick={() => {
            setStatusFilter('occupied');
            handleFilterMenuClose();
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'error.main',
                mr: 1
              }} 
            />
            使用中
          </Box>
        </MenuItem>
        <MenuItem 
          selected={statusFilter === 'reserved'}
          onClick={() => {
            setStatusFilter('reserved');
            handleFilterMenuClose();
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'warning.main',
                mr: 1
              }} 
            />
            予約済み
          </Box>
        </MenuItem>
        
        <Divider />
        
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          セクション
        </Typography>
        <MenuItem 
          selected={sectionFilter === 'all'}
          onClick={() => {
            setSectionFilter('all');
            handleFilterMenuClose();
          }}
        >
          すべて
        </MenuItem>
        {getSections().map(section => (
          <MenuItem 
            key={section}
            selected={sectionFilter === section}
            onClick={() => {
              setSectionFilter(section);
              handleFilterMenuClose();
            }}
          >
            {section}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TableManagement;
