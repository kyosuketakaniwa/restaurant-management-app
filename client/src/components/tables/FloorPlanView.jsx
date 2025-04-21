import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  ButtonGroup, 
  Button,
  IconButton,
  Tooltip,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  TableRestaurant as TableIcon,
  LocalDining as DiningIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTable } from '../../contexts/TableContext';

/**
 * フロアプランビュー
 * レストランのテーブルレイアウトを視覚的に表示するコンポーネント
 */
const FloorPlanView = ({ tables, onTableClick, activeOrders, onTablePositionChange }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const floorPlanRef = useRef(null);
  
  // テーブルのドラッグ状態
  const [draggingTable, setDraggingTable] = useState(null);
  const [tableOriginalPosition, setTableOriginalPosition] = useState(null);
  const [tableIsDragging, setTableIsDragging] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // ズームイン
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };
  
  // ズームアウト
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // フロアプランのドラッグ開始
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // 左クリックのみ
    if (draggingTable) return; // テーブルをドラッグ中は無効化
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // テーブルのドラッグ開始
  const handleTableDragStart = (e, table) => {
    if (!editMode) return; // 編集モードでない場合は無効
    e.stopPropagation(); // フロアプランのドラッグを防止
    
    // ドラッグ・ドロップ用にテーブルのコピーを作成
    const tableClone = {...table};
    setDraggingTable(tableClone);
    setTableOriginalPosition(table.position);
    setTableIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(false); // フロア全体のドラッグをキャンセル
  };
  
  // ドラッグ中
  const handleMouseMove = (e) => {
    // テーブルのドラッグが優先
    if (tableIsDragging && draggingTable) {
      e.preventDefault();
      e.stopPropagation();
      
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      
      // ドラッグ中のテーブルの位置を更新
      const updatedPosition = {
        x: draggingTable.position.x + dx,
        y: draggingTable.position.y + dy
      };
      
      // ドラッグ中テーブルの状態を更新
      setDraggingTable(prev => ({
        ...prev,
        position: updatedPosition
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
      return; // テーブルドラッグ中はフロア全体のドラッグを行わない
    }
    
    // フロアプランのドラッグ
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  // ドラッグ終了
  const handleMouseUp = (e) => {
    // テーブルドラッグの終了処理が優先
    if (tableIsDragging && draggingTable) {
      e.stopPropagation();
      
      // 親コンポーネントに位置の変更を通知
      if (onTablePositionChange) {
        onTablePositionChange(draggingTable.id, draggingTable.position);
      }
      
      setTableIsDragging(false);
      setDraggingTable(null);
      return; // テーブルドラッグ処理後は他の処理を行わない
    }
    
    // フロアプラン全体のドラッグ終了
    setIsDragging(false);
  };
  
  // マウス離れた時
  const handleMouseLeave = (e) => {
    // テーブルドラッグの終了処理が優先
    if (tableIsDragging && draggingTable) {
      // ドラッグ終了時は位置を確定
      if (onTablePositionChange) {
        onTablePositionChange(draggingTable.id, draggingTable.position);
      }
      
      setTableIsDragging(false);
      setDraggingTable(null);
      return; // テーブルドラッグ処理後は他の処理を行わない
    }
    
    // フロアプラン全体のドラッグ終了
    if (isDragging) {
      setIsDragging(false);
    }
  };
  
  // 編集モードの切り替え
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  // テーブル描画用のスタイル
  const getTableStyle = (table) => {
    let color;
    switch (table.status) {
      case 'available':
        color = 'success.main';
        break;
      case 'occupied':
        color = 'error.main';
        break;
      case 'reserved':
        color = 'warning.main';
        break;
      case 'maintenance':
        color = 'grey.500';
        break;
      default:
        color = 'primary.main';
    }
    
    // テーブルの形に基づくスタイル
    let shape = {};
    if (table.shape === 'circle') {
      shape = {
        borderRadius: '50%',
      };
    } else if (table.shape === 'rectangle') {
      shape = {
        borderRadius: '4px',
      };
    }
    
    return {
      position: 'absolute',
      left: `${table.position.x}px`,
      top: `${table.position.y}px`,
      width: `${table.size.width}px`,
      height: `${table.size.height}px`,
      backgroundColor: 'background.paper',
      border: 3,
      borderColor: color,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: 3,
        transform: 'scale(1.05)',
      },
      ...shape
    };
  };
  
  // テーブルのアクティブな注文数を取得
  const getTableOrderCount = (tableId) => {
    return activeOrders.filter(order => order.tableId === tableId).length;
  };
  
  // マウントされたときにイベントリスナーを追加
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging]);
  
    // 編集モード通知
  const [showEditModeNotice, setShowEditModeNotice] = useState(false);
  
  // 編集モードが変更されたときに通知を表示
  useEffect(() => {
    if (editMode) {
      setShowEditModeNotice(true);
    }
  }, [editMode]);
  
  return (
    <Paper 
      sx={{ 
        p: 2, 
        position: 'relative', 
        height: 'calc(100vh - 250px)',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : (editMode ? 'crosshair' : 'grab')
      }}
      ref={floorPlanRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* ズームコントロール */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <ButtonGroup orientation="vertical" size="small" sx={{ mb: 2 }}>
          <Button onClick={handleZoomIn}>
            <ZoomInIcon />
          </Button>
          <Button onClick={handleZoomOut}>
            <ZoomOutIcon />
          </Button>
        </ButtonGroup>
        
        <Tooltip title={editMode ? "編集モードを終了" : "テーブル位置を編集"}>
          <Button 
            variant={editMode ? "contained" : "outlined"}
            color={editMode ? "secondary" : "primary"}
            onClick={toggleEditMode}
            size="small"
          >
            {editMode ? "完了" : "配置編集"}
          </Button>
        </Tooltip>
      </Box>
      
      {/* フロアプラン */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: '0 0',
        }}
      >
        {/* セクション表示（簡易） */}
        {Array.from(new Set(tables.map(table => table.section))).map(section => (
          <Box
            key={section}
            sx={{
              position: 'absolute',
              left: `${Math.min(...tables.filter(t => t.section === section).map(t => t.position.x)) - 20}px`,
              top: `${Math.min(...tables.filter(t => t.section === section).map(t => t.position.y)) - 30}px`,
              padding: '2px 8px',
              backgroundColor: 'primary.light',
              color: 'white',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              pointerEvents: 'none',
            }}
          >
            セクション {section}
          </Box>
        ))}
        
        {/* テーブル */}
        {tables.map(table => {
          const orderCount = getTableOrderCount(table.id);
          
          // ドラッグ中のテーブルは別途表示
          if (draggingTable && table.id === draggingTable.id) {
            return null;
          }
          
          return (
            <Box
              key={table.id}
              sx={{
                ...getTableStyle(table),
                cursor: editMode ? 'move' : 'pointer',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'scale(1.05)',
                }
              }}
              onClick={(e) => {
                if (!editMode) {
                  e.stopPropagation();
                  onTableClick(table);
                }
              }}
              onMouseDown={(e) => handleTableDragStart(e, table)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {table.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {table.seats}人席
              </Typography>
              
              {/* アクティブな注文がある場合はバッジを表示 */}
              {orderCount > 0 && (
                <Badge
                  badgeContent={orderCount}
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                  }}
                >
                  <DiningIcon color="action" />
                </Badge>
              )}
            </Box>
          );
        })}
        
        {/* ドラッグ中のテーブル（最前面に表示） */}
        {draggingTable && tableIsDragging && (
          <Box
            sx={{
              ...getTableStyle(draggingTable),
              position: 'absolute',
              left: `${draggingTable.position.x}px`,
              top: `${draggingTable.position.y}px`,
              cursor: 'move',
              opacity: 0.8,
              boxShadow: 5,
              border: '2px dashed',
              zIndex: 1000,
              pointerEvents: 'none' // ドラッグ中はポインタイベントを無視
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {draggingTable.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {draggingTable.seats}人席
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* フロアプランが空の場合 */}
      {tables.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <TableIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            テーブルが登録されていません
          </Typography>
          <Typography variant="body2" color="text.secondary">
            右上の「テーブルを追加」ボタンからテーブルを追加してください
          </Typography>
        </Box>
      )}
      
      {/* スケール表示 */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          color: 'text.secondary',
        }}
      >
        ズーム: {Math.round(scale * 100)}%
      </Typography>
      
      {/* 編集モード通知 */}
      <Snackbar
        open={showEditModeNotice}
        autoHideDuration={6000}
        onClose={() => setShowEditModeNotice(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowEditModeNotice(false)} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {editMode ? 
            'テーブル配置編集モードです。テーブルをドラッグして配置を変更できます。' : 
            'テーブル配置を保存しました。'}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FloorPlanView;
