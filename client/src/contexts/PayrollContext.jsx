import React, { createContext, useState, useContext, useEffect } from 'react';
import { payrollApi } from '../services/api';
import { useStaff } from './StaffContext';
import { useAttendance } from './AttendanceContext';

// 給与コンテキスト
const PayrollContext = createContext();

// 給与プロバイダー
export const PayrollProvider = ({ children }) => {
  const { staff } = useStaff();
  const { attendanceRecords } = useAttendance();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 給与データの初期化
  useEffect(() => {
    const fetchPayrollRecords = async () => {
      if (staff.length === 0 || attendanceRecords.length === 0) return; // スタッフと勤怠データがロードされるまで待機
      
      setLoading(true);
      
      try {
        // 実際のAPIが完成するまではモックデータを使用
        // const response = await payrollApi.getPayrollHistory();
        // setPayrollRecords(response);
        
        // 現在の日付を取得
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // モック給与記録を生成
        const mockPayrollRecords = [];
        
        // 過去3ヶ月分の給与記録
        for (let month = currentMonth - 2; month <= currentMonth; month++) {
          const year = currentMonth < month ? currentYear - 1 : currentYear;
          const actualMonth = month < 0 ? month + 12 : month;
          
          // 月の開始日と終了日
          const startDate = new Date(year, actualMonth, 1);
          const endDate = new Date(year, actualMonth + 1, 0);
          
          // 締め日が過去の場合のみ生成
          if (endDate < now) {
            // 各スタッフの給与記録
            staff.forEach(s => {
              // この月のスタッフの勤怠記録をフィルタリング
              const staffAttendanceRecords = attendanceRecords.filter(record => {
                const recordDate = new Date(record.date);
                return record.staffId === s.id && 
                       recordDate >= startDate && 
                       recordDate <= endDate &&
                       record.status === 'approved';
              });
              
              if (staffAttendanceRecords.length > 0) {
                // 勤務時間の合計
                const regularHours = staffAttendanceRecords.reduce((total, record) => {
                  return total + Math.min(record.totalWorkHours || 0, 8); // 1日8時間まで通常時間
                }, 0);
                
                // 残業時間の合計
                const overtimeHours = staffAttendanceRecords.reduce((total, record) => {
                  return total + (record.overtimeHours || 0);
                }, 0);
                
                // 深夜時間（22:00-5:00）の合計 - 実際には勤怠記録から計算が必要
                const nightHours = Math.random() * 10; // モックデータのためランダム
                
                // 基本給計算
                const regularPay = regularHours * s.hourlyRate;
                
                // 残業手当（基本給の25%増）
                const overtimePay = overtimeHours * s.hourlyRate * 1.25;
                
                // 深夜手当（基本給の25%増）
                const nightAllowance = nightHours * s.hourlyRate * 1.25;
                
                // その他手当
                const otherAllowances = [
                  { name: '交通費', amount: 10000 },
                  { name: '役職手当', amount: s.position === '店長' ? 30000 : (s.position === 'シェフ' ? 20000 : 0) }
                ].filter(allowance => allowance.amount > 0);
                
                // 控除項目
                const deductions = [
                  { name: '健康保険', amount: Math.round((regularPay + overtimePay) * 0.05) },
                  { name: '厚生年金', amount: Math.round((regularPay + overtimePay) * 0.09) },
                  { name: '雇用保険', amount: Math.round((regularPay + overtimePay) * 0.003) },
                  { name: '所得税', amount: Math.round((regularPay + overtimePay) * 0.1) }
                ];
                
                // 支給合計
                const totalAllowances = otherAllowances.reduce((total, allowance) => total + allowance.amount, 0);
                
                // 控除合計
                const totalDeductions = deductions.reduce((total, deduction) => total + deduction.amount, 0);
                
                // 差引支給額
                const netPay = regularPay + overtimePay + nightAllowance + totalAllowances - totalDeductions;
                
                // 給与記録を作成
                mockPayrollRecords.push({
                  id: `payroll-${s.id}-${year}${(actualMonth + 1).toString().padStart(2, '0')}`,
                  staffId: s.id,
                  staffName: s.name,
                  position: s.position,
                  periodStart: startDate.toISOString(),
                  periodEnd: endDate.toISOString(),
                  paymentDate: new Date(year, actualMonth + 1, 5).toISOString(), // 翌月5日払い
                  workingDays: staffAttendanceRecords.length,
                  regularHours,
                  overtimeHours,
                  nightHours,
                  regularPay,
                  overtimePay,
                  nightAllowance,
                  otherAllowances,
                  totalAllowances,
                  deductions,
                  totalDeductions,
                  grossPay: regularPay + overtimePay + nightAllowance + totalAllowances,
                  netPay,
                  status: 'paid',
                  notes: ''
                });
              }
            });
          }
        }
        
        // 現在の月の給与計算（締め前）
        if (currentMonth > 0) { // 1月でない場合は前月分の給与計算
          const prevMonth = currentMonth - 1;
          const startDate = new Date(currentYear, prevMonth, 1);
          const endDate = new Date(currentYear, prevMonth + 1, 0);
          
          // 各スタッフの暫定給与計算
          staff.forEach(s => {
            // この月のスタッフの勤怠記録をフィルタリング
            const staffAttendanceRecords = attendanceRecords.filter(record => {
              const recordDate = new Date(record.date);
              return record.staffId === s.id && 
                     recordDate >= startDate && 
                     recordDate <= endDate;
            });
            
            if (staffAttendanceRecords.length > 0) {
              // 同様の計算ロジック...
              const regularHours = staffAttendanceRecords.reduce((total, record) => {
                return total + Math.min(record.totalWorkHours || 0, 8);
              }, 0);
              
              const overtimeHours = staffAttendanceRecords.reduce((total, record) => {
                return total + (record.overtimeHours || 0);
              }, 0);
              
              const nightHours = Math.random() * 5;
              
              const regularPay = regularHours * s.hourlyRate;
              const overtimePay = overtimeHours * s.hourlyRate * 1.25;
              const nightAllowance = nightHours * s.hourlyRate * 1.25;
              
              const otherAllowances = [
                { name: '交通費', amount: 10000 },
                { name: '役職手当', amount: s.position === '店長' ? 30000 : (s.position === 'シェフ' ? 20000 : 0) }
              ].filter(allowance => allowance.amount > 0);
              
              const deductions = [
                { name: '健康保険', amount: Math.round((regularPay + overtimePay) * 0.05) },
                { name: '厚生年金', amount: Math.round((regularPay + overtimePay) * 0.09) },
                { name: '雇用保険', amount: Math.round((regularPay + overtimePay) * 0.003) },
                { name: '所得税', amount: Math.round((regularPay + overtimePay) * 0.1) }
              ];
              
              const totalAllowances = otherAllowances.reduce((total, allowance) => total + allowance.amount, 0);
              const totalDeductions = deductions.reduce((total, deduction) => total + deduction.amount, 0);
              const netPay = regularPay + overtimePay + nightAllowance + totalAllowances - totalDeductions;
              
              // 暫定給与記録を作成
              const preliminaryPayroll = {
                id: `payroll-${s.id}-${currentYear}${(prevMonth + 1).toString().padStart(2, '0')}`,
                staffId: s.id,
                staffName: s.name,
                position: s.position,
                periodStart: startDate.toISOString(),
                periodEnd: endDate.toISOString(),
                paymentDate: new Date(currentYear, currentMonth + 1, 5).toISOString(),
                workingDays: staffAttendanceRecords.length,
                regularHours,
                overtimeHours,
                nightHours,
                regularPay,
                overtimePay,
                nightAllowance,
                otherAllowances,
                totalAllowances,
                deductions,
                totalDeductions,
                grossPay: regularPay + overtimePay + nightAllowance + totalAllowances,
                netPay,
                status: 'draft', // 締め前なのでドラフト状態
                notes: '※ 暫定計算です。月末締め後に確定します。'
              };
              
              // 暫定給与記録を追加
              mockPayrollRecords.push(preliminaryPayroll);
              
              // 現在の給与計算として設定
              if (s.id === staff[0].id) { // 例として最初のスタッフを選択
                setCurrentPayroll(preliminaryPayroll);
              }
            }
          });
        }
        
        // 給与記録を日付の降順で並べ替え
        mockPayrollRecords.sort((a, b) => 
          new Date(b.periodEnd) - new Date(a.periodEnd)
        );
        
        setPayrollRecords(mockPayrollRecords);
        
      } catch (err) {
        console.error('給与データの取得に失敗しました', err);
        setError('給与データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayrollRecords();
  }, [staff, attendanceRecords]);

  // 給与計算
  const calculatePayroll = (startDate, endDate, staffId = null) => {
    setLoading(true);
    
    try {
      // 対象期間内の勤怠記録をフィルタリング
      const filteredAttendanceRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return (!staffId || record.staffId === staffId) && 
               recordDate >= new Date(startDate) && 
               recordDate <= new Date(endDate) &&
               record.status === 'approved';
      });
      
      // 対象スタッフ
      const targetStaff = staffId 
        ? [staff.find(s => s.id === staffId)] 
        : staff;
      
      if (!targetStaff.length) {
        throw new Error('対象スタッフが見つかりません');
      }
      
      // 各スタッフの給与計算
      const calculatedPayrolls = targetStaff.map(s => {
        // このスタッフの勤怠記録
        const staffAttendanceRecords = filteredAttendanceRecords.filter(record => 
          record.staffId === s.id
        );
        
        if (staffAttendanceRecords.length === 0) {
          return null; // 勤怠記録がない場合はスキップ
        }
        
        // 勤務時間の合計
        const regularHours = staffAttendanceRecords.reduce((total, record) => {
          return total + Math.min(record.totalWorkHours || 0, 8);
        }, 0);
        
        // 残業時間の合計
        const overtimeHours = staffAttendanceRecords.reduce((total, record) => {
          return total + (record.overtimeHours || 0);
        }, 0);
        
        // 深夜時間の合計（実際には勤怠記録から計算）
        const nightHours = Math.random() * 10; // モック用
        
        // 給与計算
        const regularPay = regularHours * s.hourlyRate;
        const overtimePay = overtimeHours * s.hourlyRate * 1.25;
        const nightAllowance = nightHours * s.hourlyRate * 1.25;
        
        // その他手当
        const otherAllowances = [
          { name: '交通費', amount: 10000 },
          { name: '役職手当', amount: s.position === '店長' ? 30000 : (s.position === 'シェフ' ? 20000 : 0) }
        ].filter(allowance => allowance.amount > 0);
        
        // 控除項目
        const deductions = [
          { name: '健康保険', amount: Math.round((regularPay + overtimePay) * 0.05) },
          { name: '厚生年金', amount: Math.round((regularPay + overtimePay) * 0.09) },
          { name: '雇用保険', amount: Math.round((regularPay + overtimePay) * 0.003) },
          { name: '所得税', amount: Math.round((regularPay + overtimePay) * 0.1) }
        ];
        
        // 支給合計
        const totalAllowances = otherAllowances.reduce((total, allowance) => total + allowance.amount, 0);
        
        // 控除合計
        const totalDeductions = deductions.reduce((total, deduction) => total + deduction.amount, 0);
        
        // 差引支給額
        const netPay = regularPay + overtimePay + nightAllowance + totalAllowances - totalDeductions;
        
        // 給与記録を作成
        return {
          id: `payroll-${s.id}-${new Date(startDate).getFullYear()}${(new Date(startDate).getMonth() + 1).toString().padStart(2, '0')}`,
          staffId: s.id,
          staffName: s.name,
          position: s.position,
          periodStart: new Date(startDate).toISOString(),
          periodEnd: new Date(endDate).toISOString(),
          paymentDate: null, // 支払日はまだ未定
          workingDays: staffAttendanceRecords.length,
          regularHours,
          overtimeHours,
          nightHours,
          regularPay,
          overtimePay,
          nightAllowance,
          otherAllowances,
          totalAllowances,
          deductions,
          totalDeductions,
          grossPay: regularPay + overtimePay + nightAllowance + totalAllowances,
          netPay,
          status: 'calculated', // 計算済み状態
          notes: ''
        };
      }).filter(Boolean); // nullを除外
      
      // 現在の給与計算を更新
      if (calculatedPayrolls.length === 1) {
        setCurrentPayroll(calculatedPayrolls[0]);
      }
      
      setLoading(false);
      return calculatedPayrolls;
      
    } catch (err) {
      console.error('給与計算に失敗しました', err);
      setError('給与計算に失敗しました');
      setLoading(false);
      throw err;
    }
  };

  // 給与記録を保存
  const savePayroll = (payrollData) => {
    // 既存の記録かどうかをチェック
    const existingIndex = payrollRecords.findIndex(record => record.id === payrollData.id);
    
    if (existingIndex >= 0) {
      // 既存の記録を更新
      const updatedRecords = [...payrollRecords];
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        ...payrollData,
        status: 'approved' // ステータスを承認済みに
      };
      
      setPayrollRecords(updatedRecords);
      
      // 現在の給与計算も更新
      if (currentPayroll && currentPayroll.id === payrollData.id) {
        setCurrentPayroll({
          ...currentPayroll,
          ...payrollData,
          status: 'approved'
        });
      }
    } else {
      // 新しい記録を追加
      const newRecord = {
        ...payrollData,
        id: payrollData.id || `payroll-${payrollData.staffId}-${new Date().getTime()}`,
        status: 'approved'
      };
      
      setPayrollRecords([...payrollRecords, newRecord]);
      
      // 必要に応じて現在の給与計算を更新
      if (payrollData.staffId === (currentPayroll?.staffId || '')) {
        setCurrentPayroll(newRecord);
      }
    }
  };

  // 給与支払い
  const processPayment = (payrollId, paymentData) => {
    const updatedRecords = payrollRecords.map(record => {
      if (record.id === payrollId) {
        return {
          ...record,
          ...paymentData,
          paymentDate: paymentData.paymentDate || new Date().toISOString(),
          status: 'paid'
        };
      }
      return record;
    });
    
    setPayrollRecords(updatedRecords);
    
    // 現在の給与計算も更新
    if (currentPayroll && currentPayroll.id === payrollId) {
      setCurrentPayroll({
        ...currentPayroll,
        ...paymentData,
        paymentDate: paymentData.paymentDate || new Date().toISOString(),
        status: 'paid'
      });
    }
  };

  // 給与明細書を生成
  const generatePayslip = (payrollId) => {
    const payroll = payrollRecords.find(record => record.id === payrollId);
    
    if (!payroll) {
      throw new Error('給与記録が見つかりません');
    }
    
    // ここでは単純にデータを返すが、実際のアプリでは
    // PDFや印刷用のフォーマットに変換することができる
    return {
      ...payroll,
      periodStartFormatted: new Date(payroll.periodStart).toLocaleDateString(),
      periodEndFormatted: new Date(payroll.periodEnd).toLocaleDateString(),
      paymentDateFormatted: payroll.paymentDate 
        ? new Date(payroll.paymentDate).toLocaleDateString() 
        : '未定',
      employeeInfo: staff.find(s => s.id === payroll.staffId)
    };
  };

  // コンテキスト値
  const value = {
    payrollRecords,
    currentPayroll,
    loading,
    error,
    calculatePayroll,
    savePayroll,
    processPayment,
    generatePayslip,
    getPayrollById: (id) => payrollRecords.find(record => record.id === id),
    getPayrollByStaffId: (staffId) => payrollRecords.filter(record => record.staffId === staffId),
    getPayrollByPeriod: (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return payrollRecords.filter(record => {
        const recordStart = new Date(record.periodStart);
        const recordEnd = new Date(record.periodEnd);
        return recordStart >= start && recordEnd <= end;
      });
    }
  };

  return (
    <PayrollContext.Provider value={value}>
      {children}
    </PayrollContext.Provider>
  );
};

// 給与コンテキストを使用するためのフック
export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};

export default PayrollContext;
