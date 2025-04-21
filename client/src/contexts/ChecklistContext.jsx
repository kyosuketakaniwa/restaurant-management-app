import React, { createContext, useContext, useState, useEffect } from 'react';
import { checklistApi } from '../services/api';

// チェックリスト管理コンテキスト
const ChecklistContext = createContext();

// チェックリスト管理プロバイダー
export const ChecklistProvider = ({ children }) => {
  const [checklists, setChecklists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checklistFilter, setChecklistFilter] = useState({
    type: 'all',  // all, opening, closing, cleaning, hygiene
    completed: 'all', // all, completed, incomplete
    assignee: 'all'
  });

  // チェックリスト一覧取得
  const fetchChecklists = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを使用、本番環境ではAPI呼び出しに変更
      const response = await checklistApi.getMockChecklists();
      setChecklists(response.checklists);
    } catch (err) {
      setError('チェックリストの取得に失敗しました');
      console.error('チェックリスト取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // チェックリストテンプレート取得
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はチェックリスト一覧をテンプレートとして使用
      const response = await checklistApi.getMockChecklists();
      
      // 各チェックリストのアイテムから完了状態をリセット
      const templateData = response.checklists.map(checklist => {
        const resetItems = checklist.items.map(item => ({
          ...item,
          completed: false
        }));
        
        return {
          ...checklist,
          id: `template-${checklist.id}`,
          items: resetItems,
          isTemplate: true
        };
      });
      
      setTemplates(templateData);
    } catch (err) {
      setError('テンプレートの取得に失敗しました');
      console.error('テンプレート取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 新規チェックリスト作成
  const createChecklist = async (checklistData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータに追加
      const newChecklist = {
        ...checklistData,
        id: checklists.length > 0 ? Math.max(...checklists.map(c => c.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedBy: null,
        completedAt: null
      };
      
      // 実際のAPIが実装された場合は下記のように変更
      // const newChecklist = await checklistApi.createChecklist(checklistData);
      
      setChecklists([...checklists, newChecklist]);
      return newChecklist;
    } catch (err) {
      setError('チェックリストの作成に失敗しました');
      console.error('チェックリスト作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // テンプレートからチェックリスト作成
  const createChecklistFromTemplate = async (templateId, assigneeId) => {
    setLoading(true);
    setError(null);
    try {
      // テンプレートを検索
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('テンプレートが見つかりません');
      }
      
      // 新規チェックリスト作成
      const newChecklist = {
        title: template.title,
        description: template.description,
        type: template.type,
        items: template.items.map(item => ({
          ...item,
          id: undefined, // APIで新しいIDが割り当てられるよう
          completed: false
        })),
        assigneeId,
        completedBy: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return await createChecklist(newChecklist);
    } catch (err) {
      setError('テンプレートからのチェックリスト作成に失敗しました');
      console.error('チェックリスト作成エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // チェックリスト更新
  const updateChecklist = async (id, checklistData) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const updatedChecklists = checklists.map(checklist => {
        if (checklist.id === id) {
          return { 
            ...checklist, 
            ...checklistData, 
            updatedAt: new Date().toISOString() 
          };
        }
        return checklist;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await checklistApi.updateChecklist(id, checklistData);
      
      setChecklists(updatedChecklists);
      return updatedChecklists.find(checklist => checklist.id === id);
    } catch (err) {
      setError('チェックリストの更新に失敗しました');
      console.error('チェックリスト更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // チェックリスト削除
  const deleteChecklist = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータから削除
      const filteredChecklists = checklists.filter(checklist => checklist.id !== id);
      
      // 実際のAPIが実装された場合は下記のように変更
      // await checklistApi.deleteChecklist(id);
      
      setChecklists(filteredChecklists);
    } catch (err) {
      setError('チェックリストの削除に失敗しました');
      console.error('チェックリスト削除エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // チェックリストアイテムの更新（完了状態の切り替えなど）
  const updateChecklistItem = async (checklistId, itemId, completed) => {
    setLoading(true);
    setError(null);
    try {
      // 開発中はモックデータを更新
      const updatedChecklists = checklists.map(checklist => {
        if (checklist.id === checklistId) {
          const updatedItems = checklist.items.map(item => {
            if (item.id === itemId) {
              return { ...item, completed };
            }
            return item;
          });
          
          // すべてのアイテムが完了しているか確認
          const allCompleted = updatedItems.every(item => item.completed);
          
          // すべて完了していれば、チェックリスト自体も完了扱いにする
          const completedData = allCompleted ? {
            completedBy: 1, // テスト用に固定値、実際には現在のユーザーIDを使用
            completedAt: new Date().toISOString()
          } : {};
          
          return { 
            ...checklist, 
            items: updatedItems,
            ...completedData,
            updatedAt: new Date().toISOString() 
          };
        }
        return checklist;
      });
      
      // 実際のAPIが実装された場合は下記のように変更
      // await checklistApi.updateChecklistItem(checklistId, itemId, { completed });
      
      setChecklists(updatedChecklists);
      return updatedChecklists.find(checklist => checklist.id === checklistId);
    } catch (err) {
      setError('チェックリストアイテムの更新に失敗しました');
      console.error('チェックリストアイテム更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // チェックリスト完了状態の確認
  const isChecklistCompleted = (checklist) => {
    return checklist.items.every(item => item.completed);
  };

  // フィルタリングされたチェックリスト取得
  const getFilteredChecklists = () => {
    return checklists.filter(checklist => {
      // タイプでフィルタリング
      if (checklistFilter.type !== 'all' && checklist.type !== checklistFilter.type) {
        return false;
      }
      
      // 完了状態でフィルタリング
      if (checklistFilter.completed !== 'all') {
        const completed = isChecklistCompleted(checklist);
        if ((checklistFilter.completed === 'completed' && !completed) ||
            (checklistFilter.completed === 'incomplete' && completed)) {
          return false;
        }
      }
      
      // 担当者でフィルタリング
      if (checklistFilter.assignee !== 'all' && 
          checklist.assigneeId !== parseInt(checklistFilter.assignee)) {
        return false;
      }
      
      return true;
    });
  };

  // データロード
  useEffect(() => {
    fetchChecklists();
    fetchTemplates();
  }, []);

  return (
    <ChecklistContext.Provider
      value={{
        checklists,
        templates,
        loading,
        error,
        checklistFilter,
        setChecklistFilter,
        getFilteredChecklists,
        fetchChecklists,
        fetchTemplates,
        createChecklist,
        createChecklistFromTemplate,
        updateChecklist,
        deleteChecklist,
        updateChecklistItem,
        isChecklistCompleted
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};

// フックの作成
export const useChecklist = () => useContext(ChecklistContext);
