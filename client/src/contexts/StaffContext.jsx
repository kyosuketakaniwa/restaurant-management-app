import React, { createContext, useState, useContext, useEffect } from 'react';
import { staffApi } from '../services/api';

// スタッフコンテキスト
const StaffContext = createContext();

// スタッフプロバイダー
export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillMatrix, setSkillMatrix] = useState({});

  // スタッフデータの初期化
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      
      try {
        // 実際のAPIが完成するまではモックデータを使用
        // const response = await staffApi.getStaff();
        // setStaff(response);
        
        // モックデータ
        const mockStaff = [
          {
            id: '1',
            name: '山田太郎',
            email: 'yamada@example.com',
            phone: '090-1234-5678',
            position: '店長',
            hourlyRate: 1500,
            employmentType: 'full-time',
            hireDate: '2023-01-15',
            skills: ['接客', '調理', '在庫管理', 'POS操作', 'トレーニング'],
            availability: {
              monday: { available: true, startTime: '09:00', endTime: '18:00' },
              tuesday: { available: true, startTime: '09:00', endTime: '18:00' },
              wednesday: { available: true, startTime: '09:00', endTime: '18:00' },
              thursday: { available: true, startTime: '09:00', endTime: '18:00' },
              friday: { available: true, startTime: '09:00', endTime: '18:00' },
              saturday: { available: false },
              sunday: { available: false }
            }
          },
          {
            id: '2',
            name: '佐藤花子',
            email: 'sato@example.com',
            phone: '090-8765-4321',
            position: 'シェフ',
            hourlyRate: 1800,
            employmentType: 'full-time',
            hireDate: '2023-02-01',
            skills: ['調理', '献立作成', '在庫管理', '食材発注', '衛生管理'],
            availability: {
              monday: { available: true, startTime: '10:00', endTime: '19:00' },
              tuesday: { available: true, startTime: '10:00', endTime: '19:00' },
              wednesday: { available: true, startTime: '10:00', endTime: '19:00' },
              thursday: { available: true, startTime: '10:00', endTime: '19:00' },
              friday: { available: true, startTime: '10:00', endTime: '19:00' },
              saturday: { available: false },
              sunday: { available: false }
            }
          },
          {
            id: '3',
            name: '鈴木一郎',
            email: 'suzuki@example.com',
            phone: '090-2345-6789',
            position: 'ホールスタッフ',
            hourlyRate: 1200,
            employmentType: 'part-time',
            hireDate: '2023-03-15',
            skills: ['接客', 'レジ操作', '清掃'],
            availability: {
              monday: { available: false },
              tuesday: { available: true, startTime: '17:00', endTime: '22:00' },
              wednesday: { available: true, startTime: '17:00', endTime: '22:00' },
              thursday: { available: false },
              friday: { available: true, startTime: '17:00', endTime: '22:00' },
              saturday: { available: true, startTime: '12:00', endTime: '22:00' },
              sunday: { available: true, startTime: '12:00', endTime: '22:00' }
            }
          },
          {
            id: '4',
            name: '田中めぐみ',
            email: 'tanaka@example.com',
            phone: '090-3456-7890',
            position: 'キッチンスタッフ',
            hourlyRate: 1100,
            employmentType: 'part-time',
            hireDate: '2023-04-01',
            skills: ['調理補助', '皿洗い', '清掃'],
            availability: {
              monday: { available: true, startTime: '10:00', endTime: '15:00' },
              tuesday: { available: true, startTime: '10:00', endTime: '15:00' },
              wednesday: { available: false },
              thursday: { available: true, startTime: '10:00', endTime: '15:00' },
              friday: { available: false },
              saturday: { available: true, startTime: '10:00', endTime: '18:00' },
              sunday: { available: true, startTime: '10:00', endTime: '18:00' }
            }
          }
        ];
        
        setStaff(mockStaff);
        
        // スキルマトリクスの初期化
        const skills = ['接客', '調理', '在庫管理', 'POS操作', 'トレーニング', '献立作成', '食材発注', '衛生管理', 'レジ操作', '清掃', '調理補助', '皿洗い'];
        const mockSkillMatrix = {};
        
        mockStaff.forEach(s => {
          mockSkillMatrix[s.id] = {};
          skills.forEach(skill => {
            mockSkillMatrix[s.id][skill] = s.skills.includes(skill) ? getRandomSkillLevel() : 0;
          });
        });
        
        setSkillMatrix(mockSkillMatrix);
      } catch (err) {
        console.error('スタッフデータの取得に失敗しました', err);
        setError('スタッフデータの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaff();
  }, []);
  
  // ランダムなスキルレベル (1-5) を生成するヘルパー関数
  const getRandomSkillLevel = () => {
    return Math.floor(Math.random() * 5) + 1;
  };

  // スタッフを追加
  const addStaff = (staffData) => {
    // 実際のAPIが完成するまではローカルでの追加のみ
    const newStaff = {
      id: Date.now().toString(),
      ...staffData
    };
    
    setStaff([...staff, newStaff]);
    return newStaff;
  };

  // スタッフを更新
  const updateStaff = (staffId, staffData) => {
    const updatedStaff = staff.map(s => 
      s.id === staffId ? { ...s, ...staffData } : s
    );
    
    setStaff(updatedStaff);
  };

  // スタッフを削除
  const deleteStaff = (staffId) => {
    setStaff(staff.filter(s => s.id !== staffId));
  };

  // スキルマトリクスを更新
  const updateSkillMatrix = (staffId, skill, level) => {
    setSkillMatrix(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [skill]: level
      }
    }));
  };

  // 勤務可能時間を更新
  const updateAvailability = (staffId, dayOfWeek, availability) => {
    const updatedStaff = staff.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          availability: {
            ...s.availability,
            [dayOfWeek]: availability
          }
        };
      }
      return s;
    });
    
    setStaff(updatedStaff);
  };

  // コンテキスト値
  const value = {
    staff,
    loading,
    error,
    skillMatrix,
    addStaff,
    updateStaff,
    deleteStaff,
    updateSkillMatrix,
    updateAvailability,
    getStaffById: (id) => staff.find(s => s.id === id)
  };

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
};

// スタッフコンテキストを使用するためのフック
export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};

export default StaffContext;
