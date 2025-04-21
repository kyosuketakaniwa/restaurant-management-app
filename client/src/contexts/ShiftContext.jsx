import React, { createContext, useState, useContext, useEffect } from 'react';
import { shiftApi } from '../services/api';
import { useStaff } from './StaffContext';
import moment from 'moment';

// シフトコンテキスト
const ShiftContext = createContext();

// シフトプロバイダー
export const ShiftProvider = ({ children }) => {
  const { staff } = useStaff();
  const [shifts, setShifts] = useState([]);
  const [shiftRequests, setShiftRequests] = useState([]);
  const [shiftPreferences, setShiftPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // シフトデータの初期化
  useEffect(() => {
    const fetchShifts = async () => {
      if (staff.length === 0) return; // スタッフデータがロードされるまで待機
      
      setLoading(true);
      
      try {
        // 実際のAPIが完成するまではモックデータを使用
        // const response = await shiftApi.getShifts();
        // setShifts(response);
        
        // 現在の日付を取得
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // モックシフトデータを生成（今月分）
        const mockShifts = [];
        const shiftStatuses = ['confirmed', 'pending', 'confirmed', 'confirmed']; // 大部分を確定済みに
        
        // 今月の日数を計算
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // スタッフごとにシフトを生成
        staff.forEach(s => {
          // 各スタッフの勤務可能日に基づいてシフトを生成
          for (let day = 1; day <= daysInMonth; day++) {
            const shiftDate = new Date(currentYear, currentMonth, day);
            const dayOfWeek = shiftDate.getDay(); // 0=日曜, 1=月曜, ...
            
            // 曜日の名前を取得
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[dayOfWeek];
            
            // この曜日が勤務可能かチェック
            if (s.availability && s.availability[dayName] && s.availability[dayName].available) {
              // 70%の確率でシフトを作成（実際のシフトはすべての勤務可能日には入らないため）
              if (Math.random() < 0.7) {
                // ランダムなシフトステータスを選択
                const statusIdx = Math.floor(Math.random() * shiftStatuses.length);
                
                mockShifts.push({
                  id: `shift-${s.id}-${currentYear}${(currentMonth + 1).toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`,
                  staffId: s.id,
                  staffName: s.name,
                  date: shiftDate.toISOString().split('T')[0],
                  startTime: new Date(currentYear, currentMonth, day, 
                    parseInt(s.availability[dayName].startTime.split(':')[0]), 
                    parseInt(s.availability[dayName].startTime.split(':')[1])
                  ).toISOString(),
                  endTime: new Date(currentYear, currentMonth, day, 
                    parseInt(s.availability[dayName].endTime.split(':')[0]), 
                    parseInt(s.availability[dayName].endTime.split(':')[1])
                  ).toISOString(),
                  status: shiftStatuses[statusIdx],
                  position: s.position,
                  notes: ''
                });
              }
            }
          }
        });
        
        setShifts(mockShifts);
        
        // モックシフト交代リクエストを生成
        const mockShiftRequests = [];
        const requestTypes = ['swap', 'time_change', 'day_off'];
        const requestStatuses = ['pending', 'approved', 'rejected'];
        
        // いくつかのランダムなリクエストを生成
        for (let i = 0; i < 5; i++) {
          const randomShift = mockShifts[Math.floor(Math.random() * mockShifts.length)];
          if (randomShift) {
            const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
            const requestStatus = i < 3 ? 'pending' : requestStatuses[Math.floor(Math.random() * requestStatuses.length)];
            
            mockShiftRequests.push({
              id: `req-${i+1}`,
              shiftId: randomShift.id,
              staffId: randomShift.staffId,
              staffName: randomShift.staffName,
              requestType: requestType,
              requestDate: new Date().toISOString(),
              requestStatus: requestStatus,
              reason: '体調不良のため' + (i + 1),
              notes: '',
              originalShift: { ...randomShift },
              proposedChanges: requestType === 'swap' 
                ? { targetStaffId: staff[Math.floor(Math.random() * staff.length)].id }
                : requestType === 'time_change'
                  ? { 
                      newStartTime: new Date(new Date(randomShift.startTime).getTime() + (Math.random() > 0.5 ? 1 : -1) * 60 * 60 * 1000).toISOString(),
                      newEndTime: new Date(new Date(randomShift.endTime).getTime() + (Math.random() > 0.5 ? 1 : -1) * 60 * 60 * 1000).toISOString()
                    }
                  : {}
            });
          }
        }
        
        setShiftRequests(mockShiftRequests);
        
      } catch (err) {
        console.error('シフトデータの取得に失敗しました', err);
        setError('シフトデータの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShifts();
  }, [staff]);

  // シフトを作成
  const createShift = (shiftData) => {
    // 実際のAPIが完成するまではローカルでの追加のみ
    const newShift = {
      id: `shift-${Date.now()}`,
      ...shiftData,
      status: 'pending' // 新規作成は保留状態から
    };
    
    setShifts([...shifts, newShift]);
    return newShift;
  };

  // シフトを更新
  const updateShift = (shiftId, shiftData) => {
    const updatedShifts = shifts.map(shift => 
      shift.id === shiftId ? { ...shift, ...shiftData } : shift
    );
    
    setShifts(updatedShifts);
  };

  // シフトを削除
  const deleteShift = (shiftId) => {
    setShifts(shifts.filter(shift => shift.id !== shiftId));
  };

  // シフトステータスを更新
  const updateShiftStatus = (shiftId, status) => {
    const updatedShifts = shifts.map(shift => {
      if (shift.id === shiftId) {
        return { ...shift, status };
      }
      return shift;
    });
    
    setShifts(updatedShifts);
  };

  // シフト交代リクエストを作成
  const createShiftRequest = (requestData) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      requestDate: new Date().toISOString(),
      requestStatus: 'pending',
      ...requestData
    };
    
    setShiftRequests([...shiftRequests, newRequest]);
    return newRequest;
  };

  // シフト交代リクエストを承認
  const approveShiftRequest = (requestId) => {
    const request = shiftRequests.find(req => req.id === requestId);
    if (!request) return null;
    
    // リクエストステータスを更新
    const updatedRequests = shiftRequests.map(req => {
      if (req.id === requestId) {
        return { ...req, requestStatus: 'approved' };
      }
      return req;
    });
    
    setShiftRequests(updatedRequests);
    
    // リクエストタイプに応じてシフトを更新
    if (request.requestType === 'time_change') {
      updateShift(request.shiftId, {
        startTime: request.proposedChanges.newStartTime,
        endTime: request.proposedChanges.newEndTime
      });
    } else if (request.requestType === 'day_off') {
      // 休暇リクエストはシフトを削除または特殊ステータスに
      updateShiftStatus(request.shiftId, 'day_off');
    } else if (request.requestType === 'swap') {
      // シフト交換はあまりにも複雑なため、実際のアプリ実装では更に詳細なロジックが必要
      console.log('シフト交換リクエストが承認されました', request);
    }
    
    return request;
  };

  // シフト交代リクエストを拒否
  const rejectShiftRequest = (requestId) => {
    const updatedRequests = shiftRequests.map(req => {
      if (req.id === requestId) {
        return { ...req, requestStatus: 'rejected' };
      }
      return req;
    });
    
    setShiftRequests(updatedRequests);
  };

  // シフト希望を追加
  const addShiftPreference = (preferenceData) => {
    const newPreference = {
      id: `pref-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...preferenceData
    };
    
    setShiftPreferences([...shiftPreferences, newPreference]);
    return newPreference;
  };

  // シフト希望を更新
  const updateShiftPreference = (preferenceId, preferenceData) => {
    const updatedPreferences = shiftPreferences.map(pref => 
      pref.id === preferenceId ? { ...pref, ...preferenceData } : pref
    );
    
    setShiftPreferences(updatedPreferences);
  };

  // シフト希望を削除
  const deleteShiftPreference = (preferenceId) => {
    setShiftPreferences(shiftPreferences.filter(pref => pref.id !== preferenceId));
  };

  // 日付ごとの希望者数を集計
  const aggregatePreferencesByDate = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const result = {};
    
    // 日付の範囲を生成
    for (let date = start.clone(); date.isSameOrBefore(end); date.add(1, 'days')) {
      const dateKey = date.format('YYYY-MM-DD');
      result[dateKey] = {
        date: dateKey,
        available: [],
        unavailable: [],
        preferred: [],
        total: 0
      };
    }
    
    // 各スタッフの希望を集計
    shiftPreferences.forEach(pref => {
      const prefDate = moment(pref.date).format('YYYY-MM-DD');
      
      if (result[prefDate]) {
        if (pref.status === 'preferred') {
          result[prefDate].preferred.push(pref.staffId);
        } else if (pref.status === 'available') {
          result[prefDate].available.push(pref.staffId);
        } else if (pref.status === 'unavailable') {
          result[prefDate].unavailable.push(pref.staffId);
        }
        
        result[prefDate].total += 1;
      }
    });
    
    return Object.values(result);
  };

  // 特定の日のスタッフ希望を取得
  const getPreferencesByDate = (date) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    return shiftPreferences.filter(pref => moment(pref.date).format('YYYY-MM-DD') === dateStr);
  };
  
  // 特定のスタッフの希望を取得
  const getPreferencesByStaffId = (staffId) => {
    return shiftPreferences.filter(pref => pref.staffId === staffId);
  };

  // コンテキスト値
  const value = {
    shifts,
    shiftRequests,
    shiftPreferences,
    loading,
    error,
    createShift,
    updateShift,
    deleteShift,
    updateShiftStatus,
    createShiftRequest,
    approveShiftRequest,
    rejectShiftRequest,
    addShiftPreference,
    updateShiftPreference,
    deleteShiftPreference,
    aggregatePreferencesByDate,
    getPreferencesByDate,
    getPreferencesByStaffId,
    getShiftById: (id) => shifts.find(shift => shift.id === id),
    getShiftsByStaffId: (staffId) => shifts.filter(shift => shift.staffId === staffId),
    getShiftsByDate: (date) => shifts.filter(shift => shift.date === date),
    getRequestsByStaffId: (staffId) => shiftRequests.filter(req => req.staffId === staffId)
  };

  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
};

// シフトコンテキストを使用するためのフック
export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};

export default ShiftContext;
