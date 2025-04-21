import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 予約コンテキスト
const ReservationContext = createContext();

// 予約ステータス
export const RESERVATION_STATUS = {
  PENDING: 'pending',     // 予約受付済み
  CONFIRMED: 'confirmed', // 予約確認済み
  SEATED: 'seated',       // 着席済み
  COMPLETED: 'completed', // 完了
  CANCELLED: 'cancelled', // キャンセル
  NO_SHOW: 'no_show'      // ノーショー
};

// ローカルストレージから予約データを取得
const getLocalReservations = () => {
  try {
    const reservations = localStorage.getItem('reservations');
    return reservations ? JSON.parse(reservations) : [];
  } catch (error) {
    console.error('予約データの取得エラー:', error);
    return [];
  }
};

// ローカルストレージに予約データを保存
const saveLocalReservations = (reservations) => {
  try {
    localStorage.setItem('reservations', JSON.stringify(reservations));
  } catch (error) {
    console.error('予約データの保存エラー:', error);
  }
};

// デフォルトの予約データ（開発用）
const DEFAULT_RESERVATIONS = [
  {
    id: '1',
    customerName: '鈴木 一郎',
    phoneNumber: '090-1234-5678',
    email: 'suzuki@example.com',
    date: '2025-04-18',
    time: '18:00',
    numberOfGuests: 4,
    tableId: 'T03',
    status: RESERVATION_STATUS.CONFIRMED,
    note: '窓側の席希望',
    createdAt: '2025-04-15T10:30:00+09:00',
    updatedAt: '2025-04-15T10:30:00+09:00'
  },
  {
    id: '2',
    customerName: '田中 花子',
    phoneNumber: '090-8765-4321',
    email: 'tanaka@example.com',
    date: '2025-04-18',
    time: '19:30',
    numberOfGuests: 2,
    tableId: 'T05',
    status: RESERVATION_STATUS.CONFIRMED,
    note: 'アレルギー：海老',
    createdAt: '2025-04-16T14:20:00+09:00',
    updatedAt: '2025-04-16T14:20:00+09:00'
  },
  {
    id: '3',
    customerName: '佐藤 健太',
    phoneNumber: '080-1111-2222',
    email: 'sato@example.com',
    date: '2025-04-18',
    time: '20:00',
    numberOfGuests: 6,
    tableId: 'T08',
    status: RESERVATION_STATUS.PENDING,
    note: '誕生日のお祝い',
    createdAt: '2025-04-17T09:45:00+09:00',
    updatedAt: '2025-04-17T09:45:00+09:00'
  },
  {
    id: '4',
    customerName: '山田 優',
    phoneNumber: '070-3333-4444',
    email: 'yamada@example.com',
    date: '2025-04-18',
    time: '18:30',
    numberOfGuests: 3,
    tableId: 'T02',
    status: RESERVATION_STATUS.CONFIRMED,
    note: '',
    createdAt: '2025-04-17T16:10:00+09:00',
    updatedAt: '2025-04-17T16:10:00+09:00'
  },
  {
    id: '5',
    customerName: '高橋 誠',
    phoneNumber: '090-5555-6666',
    email: 'takahashi@example.com',
    date: '2025-04-19',
    time: '19:00',
    numberOfGuests: 5,
    tableId: 'T07',
    status: RESERVATION_STATUS.CONFIRMED,
    note: '接待',
    createdAt: '2025-04-17T11:30:00+09:00',
    updatedAt: '2025-04-17T11:30:00+09:00'
  }
];

// 予約コンテキストプロバイダー
export const ReservationProvider = ({ children }) => {
  // 予約一覧
  const [reservations, setReservations] = useState([]);
  // ローディング状態
  const [loading, setLoading] = useState(true);
  // エラー状態
  const [error, setError] = useState(null);

  // 初期化時にローカルストレージから予約データを読み込む
  useEffect(() => {
    const initReservations = () => {
      try {
        let storedReservations = getLocalReservations();
        
        // ローカルストレージに予約データがない場合はデフォルトデータを使用
        if (storedReservations.length === 0) {
          storedReservations = DEFAULT_RESERVATIONS;
          saveLocalReservations(storedReservations);
        }
        
        setReservations(storedReservations);
      } catch (err) {
        console.error('予約データの初期化エラー:', err);
        setError('予約データの読み込み中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    
    initReservations();
    
    // ストレージ変更イベントリスナーを追加
    const handleStorageChange = (e) => {
      if (e.key === 'reservations' || !e.key) {
        initReservations();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 予約の追加
  const addReservation = (reservationData) => {
    try {
      const newReservation = {
        id: uuidv4(),
        ...reservationData,
        status: RESERVATION_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedReservations = [...reservations, newReservation];
      setReservations(updatedReservations);
      saveLocalReservations(updatedReservations);
      
      // ストレージ変更イベントを発行
      window.dispatchEvent(new Event('storage'));
      
      return newReservation;
    } catch (err) {
      console.error('予約追加エラー:', err);
      throw new Error('予約の追加中にエラーが発生しました。');
    }
  };

  // 予約の更新
  const updateReservation = (id, updatedData) => {
    try {
      const reservationIndex = reservations.findIndex(reservation => reservation.id === id);
      
      if (reservationIndex === -1) {
        throw new Error('予約が見つかりません。');
      }
      
      const updatedReservations = [...reservations];
      updatedReservations[reservationIndex] = {
        ...updatedReservations[reservationIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      setReservations(updatedReservations);
      saveLocalReservations(updatedReservations);
      
      // ストレージ変更イベントを発行
      window.dispatchEvent(new Event('storage'));
      
      return updatedReservations[reservationIndex];
    } catch (err) {
      console.error('予約更新エラー:', err);
      throw new Error('予約の更新中にエラーが発生しました。');
    }
  };

  // 予約のステータス変更
  const updateReservationStatus = (id, status) => {
    return updateReservation(id, { status });
  };

  // 予約の削除
  const deleteReservation = (id) => {
    try {
      const updatedReservations = reservations.filter(reservation => reservation.id !== id);
      
      setReservations(updatedReservations);
      saveLocalReservations(updatedReservations);
      
      // ストレージ変更イベントを発行
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (err) {
      console.error('予約削除エラー:', err);
      throw new Error('予約の削除中にエラーが発生しました。');
    }
  };

  // 日付で予約をフィルタリング
  const getReservationsByDate = (date) => {
    return reservations.filter(reservation => reservation.date === date);
  };

  // 本日の予約を取得
  const getTodayReservations = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
    return getReservationsByDate(today);
  };

  // 本日の予約集計データ
  const getTodayReservationStats = () => {
    const todayReservations = getTodayReservations();
    
    // 予約総数
    const totalReservations = todayReservations.length;
    
    // ステータスが確認済み、または保留中の予約（これから来店する予約）
    const pendingReservations = todayReservations.filter(
      res => res.status === RESERVATION_STATUS.CONFIRMED || res.status === RESERVATION_STATUS.PENDING
    );
    
    // 予約人数合計
    const totalGuests = todayReservations.reduce((sum, res) => sum + res.numberOfGuests, 0);
    
    // 時間帯別の予約数を集計
    const reservationsByHour = {};
    todayReservations.forEach(res => {
      const hour = res.time.split(':')[0];
      reservationsByHour[hour] = (reservationsByHour[hour] || 0) + 1;
    });
    
    // ピーク時間帯（最も予約が多い時間帯）
    let peakHour = null;
    let maxReservations = 0;
    
    Object.keys(reservationsByHour).forEach(hour => {
      if (reservationsByHour[hour] > maxReservations) {
        maxReservations = reservationsByHour[hour];
        peakHour = hour;
      }
    });
    
    return {
      totalReservations,
      pendingReservations: pendingReservations.length,
      totalGuests,
      peakHour: peakHour ? `${peakHour}:00` : '予約なし',
      reservationsByHour
    };
  };

  // コンテキスト値
  const value = {
    reservations,
    loading,
    error,
    addReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation,
    getReservationsByDate,
    getTodayReservations,
    getTodayReservationStats
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

// 予約コンテキストを使用するためのカスタムフック
export const useReservation = () => {
  const context = useContext(ReservationContext);
  
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  
  return context;
};
