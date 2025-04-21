import React, { createContext, useContext, useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import moment from 'moment';

// タスク管理コンテキスト
const TaskContext = createContext();

// タスク管理プロバイダー
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskFilter, setTaskFilter] = useState({
    status: 'all', // all, not_started, in_progress, completed
    priority: 'all', // all, high, medium, low
    assignee: 'all',
    dueDate: 'all' // all, today, week, month
  });

  // タスク一覧取得
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用、本番環境ではAPI呼び出しに変更
      const response = await taskApi.getMockTasks();
      setTasks(response.tasks);
    } catch (err) {
      setError('タスクの取得に失敗しました');
      console.error('タスク取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 定期タスク一覧取得
  const fetchRecurringTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用
      const allTasks = await taskApi.getMockTasks();
      const recurring = allTasks.tasks.filter(task => task.recurring);
      setRecurringTasks(recurring);
    } catch (err) {
      setError('定期タスクの取得に失敗しました');
      console.error('定期タスク取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 新規タスク作成
  const createTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータに追加
      const newTask = {
        ...taskData,
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        status: 'not_started'
      };
      
      // 実際のAPIが実装された場合は下記のように変更
      // const newTask = await taskApi.createTask(taskData);
      
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      setError('タスクの作成に失敗しました');
      console.error('タスク作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 定期タスク作成
  const createRecurringTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = {
        ...taskData,
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        status: 'not_started',
        recurring: true
      };
      
      // 実際のAPIが実装された場合は下記のように変更
      // const newTask = await taskApi.createRecurringTask(taskData);
      
      setTasks([...tasks, newTask]);
      setRecurringTasks([...recurringTasks, newTask]);
      return newTask;
    } catch (err) {
      setError('定期タスクの作成に失敗しました');
      console.error('定期タスク作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // タスク更新
  const updateTask = async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const updatedTasks = tasks.map(task => {
        if (task.id === id) {
          return { ...task, ...taskData, updatedAt: new Date().toISOString() };
        }
        return task;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await taskApi.updateTask(id, taskData);
      
      setTasks(updatedTasks);
      
      // 定期タスクの場合、定期タスク一覧も更新
      if (taskData.recurring !== undefined || taskData.recurringPattern !== undefined) {
        const updatedRecurringTasks = recurringTasks.map(task => {
          if (task.id === id) {
            return { ...task, ...taskData, updatedAt: new Date().toISOString() };
          }
          return task;
        });
        setRecurringTasks(updatedRecurringTasks);
      }
      
      return updatedTasks.find(task => task.id === id);
    } catch (err) {
      setError('タスクの更新に失敗しました');
      console.error('タスク更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // タスク削除
  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータから削除
      const filteredTasks = tasks.filter(task => task.id !== id);
      
      // 実際のAPIが実装された場合は下記のように変更
      // await taskApi.deleteTask(id);
      
      setTasks(filteredTasks);
      
      // 定期タスク一覧からも削除
      const filteredRecurringTasks = recurringTasks.filter(task => task.id !== id);
      setRecurringTasks(filteredRecurringTasks);
    } catch (err) {
      setError('タスクの削除に失敗しました');
      console.error('タスク削除エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // タスク完了
  const completeTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const updatedTasks = tasks.map(task => {
        if (task.id === id) {
          return { 
            ...task, 
            status: 'completed', 
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await taskApi.completeTask(id);
      
      setTasks(updatedTasks);
      return updatedTasks.find(task => task.id === id);
    } catch (err) {
      setError('タスクの完了処理に失敗しました');
      console.error('タスク完了エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // タスクのステータス変更
  const changeTaskStatus = async (id, status) => {
    return updateTask(id, { status });
  };

  // タスクフィルタリング
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // ステータスでフィルタリング
      if (taskFilter.status !== 'all' && task.status !== taskFilter.status) {
        return false;
      }
      
      // 優先度でフィルタリング
      if (taskFilter.priority !== 'all' && task.priority !== taskFilter.priority) {
        return false;
      }
      
      // 担当者でフィルタリング
      if (taskFilter.assignee !== 'all' && task.assigneeId !== parseInt(taskFilter.assignee)) {
        return false;
      }
      
      // 期日でフィルタリング
      if (taskFilter.dueDate !== 'all') {
        const today = moment().startOf('day');
        const dueDate = moment(task.dueDate).startOf('day');
        const daysDiff = dueDate.diff(today, 'days');
        
        if (taskFilter.dueDate === 'today' && daysDiff !== 0) {
          return false;
        } else if (taskFilter.dueDate === 'week' && (daysDiff < 0 || daysDiff > 7)) {
          return false;
        } else if (taskFilter.dueDate === 'month' && (daysDiff < 0 || daysDiff > 30)) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 定期タスクの自動生成
  const generateRecurringTasksForToday = () => {
    const today = moment();
    const dayOfWeek = today.day(); // 0が日曜日、1が月曜日...
    
    recurringTasks.forEach(recurringTask => {
      // パターンチェック
      if (recurringTask.recurringPattern.type === 'daily') {
        // 毎日のタスク
        createTaskFromRecurring(recurringTask);
      } else if (recurringTask.recurringPattern.type === 'weekly' && 
                recurringTask.recurringPattern.days.includes(dayOfWeek)) {
        // 特定の曜日のタスク
        createTaskFromRecurring(recurringTask);
      }
      // 他のパターン（月次など）も必要に応じて追加可能
    });
  };

  // 定期タスクからの新規タスク生成
  const createTaskFromRecurring = (recurringTask) => {
    // すでに今日のタスクが作成されているかチェック
    const today = moment().startOf('day');
    const existingTask = tasks.find(task => {
      return task.title === recurringTask.title && 
             moment(task.dueDate).isSame(today, 'day');
    });
    
    if (!existingTask) {
      const newTaskData = {
        ...recurringTask,
        id: undefined, // APIで新しいIDが割り当てられるよう
        dueDate: today.toISOString(),
        status: 'not_started',
        recurring: false, // 生成されたタスクは定期タスクのフラグを持たない
        recurringPatternId: recurringTask.id // 元の定期タスクIDを参照
      };
      
      createTask(newTaskData);
    }
  };

  // データロード
  useEffect(() => {
    fetchTasks();
    fetchRecurringTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        recurringTasks,
        loading,
        error,
        taskFilter,
        setTaskFilter,
        getFilteredTasks,
        fetchTasks,
        fetchRecurringTasks,
        createTask,
        createRecurringTask,
        updateTask,
        deleteTask,
        completeTask,
        changeTaskStatus,
        generateRecurringTasksForToday
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// フックの作成
export const useTask = () => useContext(TaskContext);
