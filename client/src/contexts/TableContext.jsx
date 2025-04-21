import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOrder } from './OrderContext';
import { useReservation } from './ReservationContext';

// テーブルコンテキスト
const TableContext = createContext();

// テーブルコンテキストプロバイダー
export const TableProvider = ({ children }) => {
  // 注文コンテキスト
  const { activeOrders } = useOrder();
  // 予約コンテキスト
  const { reservations } = useReservation() || { reservations: [] };
  
  // テーブル関連の状態
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 予約テーブル情報
  const [reservedTables, setReservedTables] = useState([]);
  
  // テーブルデータの初期化
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      
      try {
        // TODO: 実際のAPIからデータを取得
        // const response = await tableApi.getTables();
        // setTables(response.data);
        
        // モックデータ（APIが実装されるまで）
        const mockTables = [
          { 
            id: 'A1', 
            name: 'テーブルA1', 
            section: 'A', 
            seats: 2, 
            status: 'available',
            position: { x: 100, y: 100 },
            shape: 'circle',
            size: { width: 60, height: 60 }
          },
          { 
            id: 'A2', 
            name: 'テーブルA2', 
            section: 'A', 
            seats: 2, 
            status: 'occupied',
            position: { x: 200, y: 100 },
            shape: 'circle',
            size: { width: 60, height: 60 }
          },
          { 
            id: 'A3', 
            name: 'テーブルA3', 
            section: 'A', 
            seats: 4, 
            status: 'available',
            position: { x: 300, y: 100 },
            shape: 'circle',
            size: { width: 80, height: 80 }
          },
          { 
            id: 'B1', 
            name: 'テーブルB1', 
            section: 'B', 
            seats: 4, 
            status: 'available',
            position: { x: 100, y: 200 },
            shape: 'circle',
            size: { width: 80, height: 80 }
          },
          { 
            id: 'B2', 
            name: 'テーブルB2', 
            section: 'B', 
            seats: 4, 
            status: 'reserved',
            position: { x: 200, y: 200 },
            shape: 'circle',
            size: { width: 80, height: 80 }
          },
          { 
            id: 'C1', 
            name: 'テーブルC1', 
            section: 'C', 
            seats: 6, 
            status: 'available',
            position: { x: 100, y: 300 },
            shape: 'rectangle',
            size: { width: 120, height: 80 }
          },
          { 
            id: 'VIP', 
            name: 'VIPルーム', 
            section: 'VIP', 
            seats: 8, 
            status: 'reserved',
            position: { x: 300, y: 300 },
            shape: 'rectangle',
            size: { width: 150, height: 100 }
          }
        ];
        
        setTables(mockTables);
      } catch (err) {
        console.error('テーブルデータの取得に失敗しました', err);
        setError('テーブルデータの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, []);
  
  // 注文データに基づいてテーブル状態を更新
  useEffect(() => {
    if (tables.length === 0 || !activeOrders.length) return;
    
    // テーブルの状態を更新
    const updatedTables = tables.map(table => {
      // そのテーブルに関連する注文を検索
      const tableOrders = activeOrders.filter(order => order.tableId === table.id);
      
      if (tableOrders.length > 0) {
        // 注文があれば使用中に設定
        return { ...table, status: 'occupied', orders: tableOrders };
      } else if (table.status === 'occupied' && !table.isReserved) {
        // 注文がなくなり、かつ使用中だった場合は空席に変更
        // 予約されている場合は除外
        return { ...table, status: 'available', orders: [] };
      }
      
      // それ以外はそのまま
      return table;
    });
    
    setTables(updatedTables);
  }, [activeOrders, tables]);
  
  // 予約データに基づいてテーブル状態を更新
  useEffect(() => {
    if (tables.length === 0 || !reservations || reservations.length === 0) return;
    
    // 今日の日付を取得
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 本日の予約を抽出
    const todayReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate.getTime() === today.getTime() && 
             (reservation.status === 'confirmed' || reservation.status === 'pending');
    });
    
    // 予約情報があるテーブルIDのリストを作成
    const reservedTableIds = todayReservations
      .filter(reservation => reservation.tableId) // tableIdが設定されている予約のみを抽出
      .map(reservation => ({
        tableId: reservation.tableId,
        time: reservation.time,
        status: reservation.status,
        customerName: reservation.name,
        people: reservation.people
      }));
    
    setReservedTables(reservedTableIds);
    
    // テーブル状態を更新
    const updatedTables = tables.map(table => {
      // そのテーブルに関連する予約を検索
      const tableReservations = reservedTableIds.filter(r => r.tableId === table.id);
      
      if (tableReservations.length > 0) {
        // 予約があれば予約済みに設定
        return { 
          ...table, 
          status: table.status === 'occupied' ? 'occupied' : 'reserved', 
          isReserved: true,
          reservations: tableReservations 
        };
      } else if (table.isReserved && table.status !== 'occupied') {
        // 予約がなくなり、使用中でない場合は空席に変更
        return { ...table, status: 'available', isReserved: false, reservations: [] };
      }
      
      // それ以外はそのまま
      return table;
    });
    
    setTables(updatedTables);
  }, [reservations, tables]);
  
  // テーブルを追加
  const addTable = (newTable) => {
    // IDが未設定の場合、自動生成
    if (!newTable.id) {
      newTable.id = `T${tables.length + 1}`;
    }
    
    setTables([...tables, newTable]);
  };
  
  // テーブルを更新
  const updateTable = (updatedTable) => {
    const tableIndex = tables.findIndex(table => table.id === updatedTable.id);
    
    if (tableIndex >= 0) {
      const newTables = [...tables];
      newTables[tableIndex] = updatedTable;
      setTables(newTables);
    }
  };
  
  // テーブルを削除
  const deleteTable = (tableId) => {
    setTables(tables.filter(table => table.id !== tableId));
  };
  
  // テーブル状態を変更
  const updateTableStatus = (tableId, status) => {
    const tableIndex = tables.findIndex(table => table.id === tableId);
    
    if (tableIndex >= 0) {
      const newTables = [...tables];
      newTables[tableIndex] = { ...newTables[tableIndex], status };
      setTables(newTables);
    }
  };
  
  // テーブルの位置を更新
  const updateTablePosition = (tableId, position) => {
    const tableIndex = tables.findIndex(table => table.id === tableId);
    
    if (tableIndex >= 0) {
      const newTables = [...tables];
      newTables[tableIndex] = { ...newTables[tableIndex], position };
      setTables(newTables);
    }
  };
  
  // セクション別テーブルの取得
  const getTablesBySection = (section) => {
    return tables.filter(table => table.section === section);
  };
  
  // ステータス別テーブルの取得
  const getTablesByStatus = (status) => {
    return tables.filter(table => table.status === status);
  };
  
  // コンテキスト値
  const value = {
    tables,
    loading,
    error,
    reservedTables,  // 予約情報を追加
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    updateTablePosition,
    getTablesBySection,
    getTablesByStatus
  };
  
  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};

// テーブルコンテキストを使用するためのフック
export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};

export default TableContext;
