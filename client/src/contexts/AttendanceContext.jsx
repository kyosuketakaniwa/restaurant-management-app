import React, { createContext, useState, useContext, useEffect } from 'react';
import { attendanceApi } from '../services/api';
import { useStaff } from './StaffContext';

// 勤怠コンテキスト
const AttendanceContext = createContext();

// 勤怠プロバイダー
export const AttendanceProvider = ({ children }) => {
  const { staff } = useStaff();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [currentRecords, setCurrentRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 勤怠データの初期化
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (staff.length === 0) return; // スタッフデータがロードされるまで待機
      
      setLoading(true);
      
      try {
        // 実際のAPIが完成するまではモックデータを使用
        // const response = await attendanceApi.getAttendance();
        // setAttendanceRecords(response);
        
        // 現在の日付を取得
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();
        
        // モック勤怠記録を生成
        const mockAttendanceRecords = [];
        
        // 過去30日分のランダムな勤怠記録を生成
        for (let day = 1; day <= 30; day++) {
          // 未来の日付はスキップ
          if (currentMonth === now.getMonth() && day > currentDate) {
            continue;
          }
          
          const recordDate = new Date(currentYear, currentMonth, day);
          // 土日はスキップ（一般的な店舗は営業しているが、例としてシンプルに）
          const dayOfWeek = recordDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;
          
          // 各スタッフの勤怠記録
          staff.forEach(s => {
            // 70%の確率で出勤記録を作成（休暇などを考慮）
            if (Math.random() < 0.7) {
              // 出勤時間は8:30〜10:00の間でランダム
              const clockInHour = 8 + Math.floor(Math.random() * 2);
              const clockInMinute = Math.floor(Math.random() * 60);
              const clockInTime = new Date(currentYear, currentMonth, day, clockInHour, clockInMinute);
              
              // 勤務時間は7〜9時間でランダム
              const workHours = 7 + Math.floor(Math.random() * 3);
              let clockOutTime = new Date(clockInTime);
              clockOutTime.setHours(clockOutTime.getHours() + workHours);
              
              // 休憩時間を生成（1〜2回）
              const breakTimes = [];
              const breakCount = 1 + Math.floor(Math.random() * 2);
              
              for (let b = 0; b < breakCount; b++) {
                // 休憩開始時間はランダム（出勤後2時間〜退勤1時間前）
                const breakStartHour = clockInTime.getHours() + 2 + Math.floor(Math.random() * (workHours - 3));
                const breakStartMinute = Math.floor(Math.random() * 60);
                const breakStart = new Date(currentYear, currentMonth, day, breakStartHour, breakStartMinute);
                
                // 休憩時間は30〜60分でランダム
                const breakDuration = 30 + Math.floor(Math.random() * 31);
                let breakEnd = new Date(breakStart);
                breakEnd.setMinutes(breakEnd.getMinutes() + breakDuration);
                
                breakTimes.push({
                  id: `break-${s.id}-${currentYear}${currentMonth}${day}-${b}`,
                  startTime: breakStart.toISOString(),
                  endTime: breakEnd.toISOString()
                });
              }
              
              mockAttendanceRecords.push({
                id: `att-${s.id}-${currentYear}${currentMonth}${day}`,
                staffId: s.id,
                staffName: s.name,
                date: recordDate.toISOString().split('T')[0],
                clockInTime: clockInTime.toISOString(),
                clockOutTime: clockOutTime.toISOString(),
                breakTimes: breakTimes,
                location: {
                  // 店舗位置を中心に少しだけずらした位置情報
                  latitude: 35.6812 + (Math.random() - 0.5) * 0.002,
                  longitude: 139.7671 + (Math.random() - 0.5) * 0.002
                },
                status: 'approved',
                notes: '',
                totalWorkHours: workHours - (breakTimes.reduce((total, brk) => {
                  const start = new Date(brk.startTime);
                  const end = new Date(brk.endTime);
                  return total + (end - start) / (1000 * 60 * 60);
                }, 0)),
                overtimeHours: Math.max(0, workHours - 8)
              });
            }
          });
        }
        
        // 今日の勤怠記録（進行中）を追加
        if (Math.random() < 0.5) { // 50%の確率で現在勤務中のスタッフを作成
          const activeStaff = staff[Math.floor(Math.random() * staff.length)];
          
          // 2〜4時間前に出勤した設定
          const hoursAgo = 2 + Math.floor(Math.random() * 3);
          const clockInTime = new Date(now);
          clockInTime.setHours(now.getHours() - hoursAgo);
          
          const currentRecord = {
            id: `att-${activeStaff.id}-${currentYear}${currentMonth}${currentDate}`,
            staffId: activeStaff.id,
            staffName: activeStaff.name,
            date: now.toISOString().split('T')[0],
            clockInTime: clockInTime.toISOString(),
            clockOutTime: null, // まだ退勤していない
            breakTimes: [],
            location: {
              latitude: 35.6812 + (Math.random() - 0.5) * 0.002,
              longitude: 139.7671 + (Math.random() - 0.5) * 0.002
            },
            status: 'in-progress',
            notes: '',
            inBreak: false
          };
          
          // 休憩中かどうかをランダムに設定
          if (Math.random() < 0.3) { // 30%の確率で休憩中
            const breakStartTime = new Date(now);
            breakStartTime.setMinutes(now.getMinutes() - Math.floor(Math.random() * 30)); // 最大30分前に休憩開始
            
            currentRecord.breakTimes.push({
              id: `break-${activeStaff.id}-${currentYear}${currentMonth}${currentDate}-0`,
              startTime: breakStartTime.toISOString(),
              endTime: null // まだ休憩終了していない
            });
            
            currentRecord.inBreak = true;
          }
          
          // 現在の記録を追加
          mockAttendanceRecords.push(currentRecord);
          
          // 現在の記録を別途保存
          setCurrentRecords({
            ...currentRecords,
            [activeStaff.id]: currentRecord
          });
        }
        
        setAttendanceRecords(mockAttendanceRecords);
        
      } catch (err) {
        console.error('勤怠データの取得に失敗しました', err);
        setError('勤怠データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceRecords();
  }, [staff]);

  // 出勤打刻
  const clockIn = (staffId, data = {}) => {
    const now = new Date();
    const staffMember = staff.find(s => s.id === staffId);
    
    if (!staffMember) {
      throw new Error('スタッフが見つかりません');
    }
    
    // 既に出勤済みかチェック
    const existingRecord = Object.values(currentRecords).find(
      record => record.staffId === staffId && !record.clockOutTime
    );
    
    if (existingRecord) {
      throw new Error('既に出勤打刻されています');
    }
    
    // 新しい勤怠記録を作成
    const newRecord = {
      id: `att-${staffId}-${now.getFullYear()}${now.getMonth()}${now.getDate()}`,
      staffId,
      staffName: staffMember.name,
      date: now.toISOString().split('T')[0],
      clockInTime: data.time ? new Date(data.time).toISOString() : now.toISOString(),
      clockOutTime: null,
      breakTimes: [],
      location: data.location || null,
      status: 'in-progress',
      notes: data.notes || '',
      inBreak: false
    };
    
    // 状態を更新
    setAttendanceRecords([...attendanceRecords, newRecord]);
    setCurrentRecords({
      ...currentRecords,
      [staffId]: newRecord
    });
    
    return newRecord;
  };

  // 退勤打刻
  const clockOut = (staffId, data = {}) => {
    const now = new Date();
    
    // 現在の勤怠記録を取得
    const currentRecord = currentRecords[staffId];
    
    if (!currentRecord) {
      throw new Error('出勤記録が見つかりません');
    }
    
    if (currentRecord.clockOutTime) {
      throw new Error('既に退勤打刻されています');
    }
    
    // 休憩中なら休憩を終了
    if (currentRecord.inBreak) {
      const lastBreakIndex = currentRecord.breakTimes.length - 1;
      if (lastBreakIndex >= 0 && !currentRecord.breakTimes[lastBreakIndex].endTime) {
        currentRecord.breakTimes[lastBreakIndex].endTime = now.toISOString();
      }
      currentRecord.inBreak = false;
    }
    
    // 勤務時間を計算
    const clockInTime = new Date(currentRecord.clockInTime);
    const clockOutTime = data.time ? new Date(data.time) : now;
    let totalWorkHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    
    // 休憩時間を差し引く
    const breakHours = currentRecord.breakTimes.reduce((total, brk) => {
      const start = new Date(brk.startTime);
      const end = brk.endTime ? new Date(brk.endTime) : now;
      return total + (end - start) / (1000 * 60 * 60);
    }, 0);
    
    totalWorkHours -= breakHours;
    
    // 残業時間を計算（8時間を超える分）
    const overtimeHours = Math.max(0, totalWorkHours - 8);
    
    // 更新された記録
    const updatedRecord = {
      ...currentRecord,
      clockOutTime: clockOutTime.toISOString(),
      status: 'pending-approval', // 承認待ちステータスに変更
      location: data.location || currentRecord.location,
      notes: data.notes || currentRecord.notes,
      totalWorkHours,
      overtimeHours
    };
    
    // 記録を更新
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    
    // 現在の記録から削除
    const { [staffId]: _, ...restCurrentRecords } = currentRecords;
    setCurrentRecords(restCurrentRecords);
    
    return updatedRecord;
  };

  // 休憩開始
  const startBreak = (staffId) => {
    const now = new Date();
    
    // 現在の勤怠記録を取得
    const currentRecord = currentRecords[staffId];
    
    if (!currentRecord) {
      throw new Error('出勤記録が見つかりません');
    }
    
    if (currentRecord.inBreak) {
      throw new Error('既に休憩中です');
    }
    
    // 新しい休憩を追加
    const newBreak = {
      id: `break-${staffId}-${now.getFullYear()}${now.getMonth()}${now.getDate()}-${currentRecord.breakTimes.length}`,
      startTime: now.toISOString(),
      endTime: null
    };
    
    const updatedRecord = {
      ...currentRecord,
      breakTimes: [...currentRecord.breakTimes, newBreak],
      inBreak: true
    };
    
    // 記録を更新
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    
    setCurrentRecords({
      ...currentRecords,
      [staffId]: updatedRecord
    });
    
    return updatedRecord;
  };

  // 休憩終了
  const endBreak = (staffId) => {
    const now = new Date();
    
    // 現在の勤怠記録を取得
    const currentRecord = currentRecords[staffId];
    
    if (!currentRecord) {
      throw new Error('出勤記録が見つかりません');
    }
    
    if (!currentRecord.inBreak) {
      throw new Error('休憩中ではありません');
    }
    
    // 最後の休憩を終了
    const lastBreakIndex = currentRecord.breakTimes.length - 1;
    
    if (lastBreakIndex < 0 || currentRecord.breakTimes[lastBreakIndex].endTime) {
      throw new Error('終了していない休憩がありません');
    }
    
    const updatedBreakTimes = [...currentRecord.breakTimes];
    updatedBreakTimes[lastBreakIndex] = {
      ...updatedBreakTimes[lastBreakIndex],
      endTime: now.toISOString()
    };
    
    const updatedRecord = {
      ...currentRecord,
      breakTimes: updatedBreakTimes,
      inBreak: false
    };
    
    // 記録を更新
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    
    setCurrentRecords({
      ...currentRecords,
      [staffId]: updatedRecord
    });
    
    return updatedRecord;
  };

  // 勤怠記録を承認
  const approveAttendance = (recordId) => {
    const updatedRecords = attendanceRecords.map(record => {
      if (record.id === recordId) {
        return { ...record, status: 'approved' };
      }
      return record;
    });
    
    setAttendanceRecords(updatedRecords);
  };

  // 勤怠記録を修正
  const editAttendance = (recordId, data) => {
    const updatedRecords = attendanceRecords.map(record => {
      if (record.id === recordId) {
        // 時間の修正がある場合は総労働時間と残業時間を再計算
        let totalWorkHours = record.totalWorkHours;
        let overtimeHours = record.overtimeHours;
        
        if (data.clockInTime || data.clockOutTime) {
          const clockInTime = new Date(data.clockInTime || record.clockInTime);
          const clockOutTime = new Date(data.clockOutTime || record.clockOutTime);
          
          // 総労働時間を計算
          totalWorkHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
          
          // 休憩時間を差し引く
          const breakTimes = data.breakTimes || record.breakTimes;
          const breakHours = breakTimes.reduce((total, brk) => {
            const start = new Date(brk.startTime);
            const end = new Date(brk.endTime);
            return total + (end - start) / (1000 * 60 * 60);
          }, 0);
          
          totalWorkHours -= breakHours;
          
          // 残業時間を計算
          overtimeHours = Math.max(0, totalWorkHours - 8);
        }
        
        return { 
          ...record, 
          ...data,
          totalWorkHours: data.totalWorkHours || totalWorkHours,
          overtimeHours: data.overtimeHours || overtimeHours,
          status: 'pending-approval' // 修正後は再承認が必要
        };
      }
      return record;
    });
    
    setAttendanceRecords(updatedRecords);
  };

  // コンテキスト値
  const value = {
    attendanceRecords,
    currentRecords,
    loading,
    error,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    approveAttendance,
    editAttendance,
    isClockingIn: (staffId) => Boolean(currentRecords[staffId]),
    isInBreak: (staffId) => currentRecords[staffId]?.inBreak || false,
    getAttendanceByStaffId: (staffId) => attendanceRecords.filter(record => record.staffId === staffId),
    getAttendanceByDate: (date) => {
      const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      return attendanceRecords.filter(record => record.date === dateString);
    },
    getAttendanceById: (id) => attendanceRecords.find(record => record.id === id),
    getCurrentRecord: (staffId) => currentRecords[staffId] || null
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

// 勤怠コンテキストを使用するためのフック
export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export default AttendanceContext;
