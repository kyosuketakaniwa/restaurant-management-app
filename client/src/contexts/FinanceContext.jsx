import React, { createContext, useContext, useState, useEffect } from 'react';
import { financeApi } from '../services/api';
import moment from 'moment';

// 財務コンテキスト
const FinanceContext = createContext();

// 財務コンテキストプロバイダー
export const FinanceProvider = ({ children }) => {
  // 状態の初期化
  const [budgets, setBudgets] = useState([]);
  const [actuals, setActuals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [financialReports, setFinancialReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 部門リストの初期化
  useEffect(() => {
    const defaultDepartments = [
      { id: 'food', name: '料理', color: '#4caf50' },
      { id: 'beverage', name: 'ドリンク', color: '#2196f3' },
      { id: 'labor', name: '人件費', color: '#f44336' },
      { id: 'rent', name: '家賃', color: '#ff9800' },
      { id: 'utilities', name: '光熱費', color: '#9c27b0' },
      { id: 'supplies', name: '消耗品', color: '#795548' },
      { id: 'marketing', name: 'マーケティング', color: '#607d8b' },
      { id: 'other', name: 'その他', color: '#9e9e9e' }
    ];
    setDepartments(defaultDepartments);
  }, []);

  // データの取得
  useEffect(() => {
    // 部門データが初期化された後に実行する
    if (departments.length === 0) {
      return; // 部門データがまだ初期化されていない場合は何もしない
    }

    const fetchData = async () => {
      try {
        console.log('財務データの取得を開始します。');
        setLoading(true);
        setError(null);
        
        // モックデータを使用（実際はAPIから取得）
        // 予算データ（バックエンド実装後にAPIコール）
        const mockBudgets = generateMockBudgets();
        setBudgets(mockBudgets);
        console.log('予算データが生成されました:', mockBudgets.length);

        // 実績データ（バックエンド実装後にAPIコール）
        const mockActuals = generateMockActuals();
        setActuals(mockActuals);
        console.log('実績データが生成されました:', mockActuals.length);

        // 財務レポートデータ（バックエンド実装後にAPIコール）
        const mockReports = generateFinancialReports(mockBudgets, mockActuals);
        console.log('財務レポートが生成されました:', mockReports);
        setFinancialReports(mockReports);

        setLoading(false);
      } catch (err) {
        console.error('財務データ取得エラー:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    
    // データが確実に取得されるよう、クリーンアップ関数を返す
    return () => {
      console.log('財務コンテキストがアンマウントされました');
    };
  }, [departments]); // departmentsを依存配列に追加

  // モック予算データ生成
  const generateMockBudgets = () => {
    const currentYear = moment().year();
    const mockBudgets = [];

    // departmentsが初期化されていない場合は空の配列を返す
    if (!departments || departments.length === 0) {
      console.warn('部門データが初期化されていません');
      return [];
    }

    // 12ヶ月分の予算データを生成
    for (let month = 0; month < 12; month++) {
      const date = moment().year(currentYear).month(month).startOf('month');
      
      // 各部門の予算を設定
      departments.forEach(dept => {
        let amount;
        
        switch (dept.id) {
          case 'food':
            amount = 1200000 + Math.random() * 400000;
            break;
          case 'beverage':
            amount = 800000 + Math.random() * 200000;
            break;
          case 'labor':
            amount = 1500000 + Math.random() * 300000;
            break;
          case 'rent':
            amount = 500000;
            break;
          case 'utilities':
            amount = 200000 + (month >= 5 && month <= 8 ? 50000 : 0); // 夏場は光熱費が高い
            break;
          case 'supplies':
            amount = 100000 + Math.random() * 50000;
            break;
          case 'marketing':
            amount = 150000 + (month === 11 ? 100000 : 0); // 12月はマーケティング強化
            break;
          case 'other':
            amount = 80000 + Math.random() * 40000;
            break;
          default:
            amount = 100000;
        }
        
        mockBudgets.push({
          id: `budget-${date.format('YYYY-MM')}-${dept.id}`,
          date: date.format('YYYY-MM-DD'),
          period: 'monthly',
          departmentId: dept.id,
          amount: Math.round(amount),
          createdAt: moment().subtract(3, 'months').toISOString(),
          updatedAt: moment().subtract(1, 'month').toISOString()
        });
      });
    }

    return mockBudgets;
  };

  // モック実績データ生成
  const generateMockActuals = () => {
    const currentYear = moment().year();
    const mockActuals = [];
    const pastMonths = moment().month(); // 今年の経過月数

    // 経過月分の実績データを生成
    for (let month = 0; month <= pastMonths; month++) {
      const date = moment().year(currentYear).month(month).startOf('month');
      
      // 各部門の実績を設定
      departments.forEach(dept => {
        let amount;
        let variance = (Math.random() * 0.3) - 0.1; // -10% ~ +20%の誤差
        
        // 予算に対して誤差を加えた実績を作成
        const budget = budgets.find(b => 
          moment(b.date).month() === month && 
          b.departmentId === dept.id
        );
        
        if (budget) {
          amount = budget.amount * (1 + variance);
        } else {
          switch (dept.id) {
            case 'food':
              amount = 1300000 + Math.random() * 400000;
              break;
            case 'beverage':
              amount = 850000 + Math.random() * 200000;
              break;
            case 'labor':
              amount = 1450000 + Math.random() * 300000;
              break;
            case 'rent':
              amount = 500000;
              break;
            case 'utilities':
              amount = 210000 + (month >= 5 && month <= 8 ? 60000 : 0);
              break;
            case 'supplies':
              amount = 95000 + Math.random() * 50000;
              break;
            case 'marketing':
              amount = 160000 + (month === 11 ? 90000 : 0);
              break;
            case 'other':
              amount = 75000 + Math.random() * 40000;
              break;
            default:
              amount = 100000;
          }
        }
        
        mockActuals.push({
          id: `actual-${date.format('YYYY-MM')}-${dept.id}`,
          date: date.format('YYYY-MM-DD'),
          period: 'monthly',
          departmentId: dept.id,
          amount: Math.round(amount),
          createdAt: moment().subtract(1, 'month').add(5, 'days').toISOString(),
          updatedAt: moment().subtract(5, 'days').toISOString()
        });
      });
    }

    return mockActuals;
  };

  // 財務レポートデータ生成
  const generateFinancialReports = (budgetData, actualData) => {
    const reports = {
      monthly: [],
      quarterly: [],
      yearly: {},
      kpis: {}
    };

    const currentYear = moment().year();
    const pastMonths = moment().month(); // 今年の経過月数

    // 月次レポート
    for (let month = 0; month <= pastMonths; month++) {
      const date = moment().year(currentYear).month(month).startOf('month');
      const monthStr = date.format('YYYY-MM');
      
      const monthlyBudgets = budgetData.filter(b => moment(b.date).format('YYYY-MM') === monthStr);
      const monthlyActuals = actualData.filter(a => moment(a.date).format('YYYY-MM') === monthStr);
      
      // 収入カテゴリー（食品、飲料）
      const revenueBudget = monthlyBudgets
        .filter(b => ['food', 'beverage'].includes(b.departmentId))
        .reduce((sum, item) => sum + item.amount, 0);
        
      const revenueActual = monthlyActuals
        .filter(a => ['food', 'beverage'].includes(a.departmentId))
        .reduce((sum, item) => sum + item.amount, 0);
      
      // 経費カテゴリー（人件費、家賃、光熱費、消耗品、マーケティング、その他）
      const expenseBudget = monthlyBudgets
        .filter(b => !['food', 'beverage'].includes(b.departmentId))
        .reduce((sum, item) => sum + item.amount, 0);
        
      const expenseActual = monthlyActuals
        .filter(a => !['food', 'beverage'].includes(a.departmentId))
        .reduce((sum, item) => sum + item.amount, 0);
      
      // 利益計算
      const profitBudget = revenueBudget - expenseBudget;
      const profitActual = revenueActual - expenseActual;
      
      // 部門別データ
      const departmentData = {};
      departments.forEach(dept => {
        const deptBudget = monthlyBudgets.find(b => b.departmentId === dept.id)?.amount || 0;
        const deptActual = monthlyActuals.find(a => a.departmentId === dept.id)?.amount || 0;
        
        departmentData[dept.id] = {
          budget: deptBudget,
          actual: deptActual,
          variance: deptActual - deptBudget,
          percentVariance: deptBudget ? ((deptActual - deptBudget) / deptBudget) * 100 : 0
        };
      });
      
      reports.monthly.push({
        date: date.format('YYYY-MM-DD'),
        month: date.format('YYYY-MM'),
        displayMonth: date.format('YYYY年M月'),
        revenue: {
          budget: revenueBudget,
          actual: revenueActual,
          variance: revenueActual - revenueBudget,
          percentVariance: revenueBudget ? ((revenueActual - revenueBudget) / revenueBudget) * 100 : 0
        },
        expense: {
          budget: expenseBudget,
          actual: expenseActual,
          variance: expenseActual - expenseBudget,
          percentVariance: expenseBudget ? ((expenseActual - expenseBudget) / expenseBudget) * 100 : 0
        },
        profit: {
          budget: profitBudget,
          actual: profitActual,
          variance: profitActual - profitBudget,
          percentVariance: profitBudget ? ((profitActual - profitBudget) / profitBudget) * 100 : 0
        },
        departments: departmentData
      });
    }

    // 四半期レポート
    for (let quarter = 0; quarter < 4; quarter++) {
      if (quarter * 3 <= pastMonths) {
        const startMonth = quarter * 3;
        const endMonth = Math.min(startMonth + 2, pastMonths);
        
        const quarterMonths = reports.monthly.filter(m => {
          const monthIdx = moment(m.date).month();
          return monthIdx >= startMonth && monthIdx <= endMonth;
        });
        
        if (quarterMonths.length > 0) {
          const startDate = moment().year(currentYear).month(startMonth).startOf('month');
          const quarterName = `Q${quarter + 1}`;
          
          // 四半期の収入・経費・利益を集計
          const quarterRevenueBudget = quarterMonths.reduce((sum, m) => sum + m.revenue.budget, 0);
          const quarterRevenueActual = quarterMonths.reduce((sum, m) => sum + m.revenue.actual, 0);
          const quarterExpenseBudget = quarterMonths.reduce((sum, m) => sum + m.expense.budget, 0);
          const quarterExpenseActual = quarterMonths.reduce((sum, m) => sum + m.expense.actual, 0);
          const quarterProfitBudget = quarterRevenueBudget - quarterExpenseBudget;
          const quarterProfitActual = quarterRevenueActual - quarterExpenseActual;
          
          // 部門別データ集計
          const quarterDepartmentData = {};
          departments.forEach(dept => {
            const deptBudget = quarterMonths.reduce((sum, m) => sum + (m.departments[dept.id]?.budget || 0), 0);
            const deptActual = quarterMonths.reduce((sum, m) => sum + (m.departments[dept.id]?.actual || 0), 0);
            
            quarterDepartmentData[dept.id] = {
              budget: deptBudget,
              actual: deptActual,
              variance: deptActual - deptBudget,
              percentVariance: deptBudget ? ((deptActual - deptBudget) / deptBudget) * 100 : 0
            };
          });
          
          reports.quarterly.push({
            date: startDate.format('YYYY-MM-DD'),
            quarter: quarterName,
            displayQuarter: `${currentYear}年 ${quarterName}`,
            months: quarterMonths.map(m => m.month),
            revenue: {
              budget: quarterRevenueBudget,
              actual: quarterRevenueActual,
              variance: quarterRevenueActual - quarterRevenueBudget,
              percentVariance: quarterRevenueBudget ? ((quarterRevenueActual - quarterRevenueBudget) / quarterRevenueBudget) * 100 : 0
            },
            expense: {
              budget: quarterExpenseBudget,
              actual: quarterExpenseActual,
              variance: quarterExpenseActual - quarterExpenseBudget,
              percentVariance: quarterExpenseBudget ? ((quarterExpenseActual - quarterExpenseBudget) / quarterExpenseBudget) * 100 : 0
            },
            profit: {
              budget: quarterProfitBudget,
              actual: quarterProfitActual,
              variance: quarterProfitActual - quarterProfitBudget,
              percentVariance: quarterProfitBudget ? ((quarterProfitActual - quarterProfitBudget) / quarterProfitBudget) * 100 : 0
            },
            departments: quarterDepartmentData
          });
        }
      }
    }

    // 年次レポート
    if (reports.monthly.length > 0) {
      const yearlyRevenueBudget = reports.monthly.reduce((sum, m) => sum + m.revenue.budget, 0);
      const yearlyRevenueActual = reports.monthly.reduce((sum, m) => sum + m.revenue.actual, 0);
      const yearlyExpenseBudget = reports.monthly.reduce((sum, m) => sum + m.expense.budget, 0);
      const yearlyExpenseActual = reports.monthly.reduce((sum, m) => sum + m.expense.actual, 0);
      const yearlyProfitBudget = yearlyRevenueBudget - yearlyExpenseBudget;
      const yearlyProfitActual = yearlyRevenueActual - yearlyExpenseActual;
      
      // 部門別年間データ
      const yearlyDepartmentData = {};
      departments.forEach(dept => {
        const deptBudget = reports.monthly.reduce((sum, m) => sum + (m.departments[dept.id]?.budget || 0), 0);
        const deptActual = reports.monthly.reduce((sum, m) => sum + (m.departments[dept.id]?.actual || 0), 0);
        
        yearlyDepartmentData[dept.id] = {
          budget: deptBudget,
          actual: deptActual,
          variance: deptActual - deptBudget,
          percentVariance: deptBudget ? ((deptActual - deptBudget) / deptBudget) * 100 : 0
        };
      });
      
      reports.yearly = {
        year: currentYear,
        displayYear: `${currentYear}年`,
        revenue: {
          budget: yearlyRevenueBudget,
          actual: yearlyRevenueActual,
          variance: yearlyRevenueActual - yearlyRevenueBudget,
          percentVariance: yearlyRevenueBudget ? ((yearlyRevenueActual - yearlyRevenueBudget) / yearlyRevenueBudget) * 100 : 0
        },
        expense: {
          budget: yearlyExpenseBudget,
          actual: yearlyExpenseActual,
          variance: yearlyExpenseActual - yearlyExpenseBudget,
          percentVariance: yearlyExpenseBudget ? ((yearlyExpenseActual - yearlyExpenseBudget) / yearlyExpenseBudget) * 100 : 0
        },
        profit: {
          budget: yearlyProfitBudget,
          actual: yearlyProfitActual,
          variance: yearlyProfitActual - yearlyProfitBudget,
          percentVariance: yearlyProfitBudget ? ((yearlyProfitActual - yearlyProfitBudget) / yearlyProfitBudget) * 100 : 0
        },
        departments: yearlyDepartmentData
      };
    }

    // KPI計算
    if (reports.monthly.length > 0) {
      const latestMonth = reports.monthly[reports.monthly.length - 1];
      
      // 売上総利益率（粗利益率）
      const grossProfitMargin = (latestMonth.revenue.actual > 0) 
        ? ((latestMonth.revenue.actual - latestMonth.departments.food.actual - latestMonth.departments.beverage.actual) / latestMonth.revenue.actual) * 100
        : 0;
      
      // 人件費比率
      const laborCostRatio = (latestMonth.revenue.actual > 0)
        ? (latestMonth.departments.labor.actual / latestMonth.revenue.actual) * 100
        : 0;
      
      // 営業利益率
      const operatingMargin = (latestMonth.revenue.actual > 0)
        ? (latestMonth.profit.actual / latestMonth.revenue.actual) * 100
        : 0;
      
      // 客単価（仮定：1日50人の顧客）
      const averageCheck = (latestMonth.revenue.actual / (50 * 30));
      
      // 食材費率（食事売上に対する食材費の割合）
      const foodCostRatio = (latestMonth.revenue.actual > 0)
        ? (latestMonth.departments.food.actual / latestMonth.revenue.actual) * 100
        : 0;
      
      // FL比率（食材費と人件費の合計の売上に対する割合）
      const foodCost = latestMonth.departments.food.actual || 0;
      const beverageCost = latestMonth.departments.beverage.actual || 0; // ドリンクコストも食材費に含める場合
      const laborCost = latestMonth.departments.labor.actual || 0;
      const flRatio = (latestMonth.revenue.actual > 0)
        ? ((foodCost + beverageCost + laborCost) / latestMonth.revenue.actual) * 100
        : 0;
      
      reports.kpis = {
        grossProfitMargin,
        laborCostRatio,
        operatingMargin,
        averageCheck,
        foodCostRatio,
        flRatio
      };
    }

    return reports;
  };

  // 予算の作成
  const createBudget = async (budgetData) => {
    try {
      // 実際の実装ではAPIを呼び出す
      // const response = await financeApi.createBudget(budgetData);
      
      // モックの実装
      const newBudget = {
        id: `budget-${Date.now()}`,
        ...budgetData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setBudgets([...budgets, newBudget]);
      return newBudget;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 予算の更新
  const updateBudget = async (budgetId, budgetData) => {
    try {
      // 実際の実装ではAPIを呼び出す
      // const response = await financeApi.updateBudget(budgetId, budgetData);
      
      // モックの実装
      const updatedBudgets = budgets.map(budget => 
        budget.id === budgetId 
          ? { ...budget, ...budgetData, updatedAt: new Date().toISOString() } 
          : budget
      );
      
      setBudgets(updatedBudgets);
      return updatedBudgets.find(b => b.id === budgetId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 予算の削除
  const deleteBudget = async (budgetId) => {
    try {
      // 実際の実装ではAPIを呼び出す
      // await financeApi.deleteBudget(budgetId);
      
      // モックの実装
      const filteredBudgets = budgets.filter(budget => budget.id !== budgetId);
      setBudgets(filteredBudgets);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 実績の作成
  const createActual = async (actualData) => {
    try {
      // 実際の実装ではAPIを呼び出す
      // const response = await financeApi.createActual(actualData);
      
      // モックの実装
      const newActual = {
        id: `actual-${Date.now()}`,
        ...actualData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setActuals([...actuals, newActual]);
      return newActual;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 実績の更新
  const updateActual = async (actualId, actualData) => {
    try {
      // 実際の実装ではAPIを呼び出す
      // const response = await financeApi.updateActual(actualId, actualData);
      
      // モックの実装
      const updatedActuals = actuals.map(actual => 
        actual.id === actualId 
          ? { ...actual, ...actualData, updatedAt: new Date().toISOString() } 
          : actual
      );
      
      setActuals(updatedActuals);
      return updatedActuals.find(a => a.id === actualId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 実績の削除
  const deleteActual = async (actualId) => {
    try {
      // 実際の実装ではAPIを呼び出す
      // await financeApi.deleteActual(actualId);
      
      // モックの実装
      const filteredActuals = actuals.filter(actual => actual.id !== actualId);
      setActuals(filteredActuals);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 月次予算の取得
  const getMonthlyBudget = (year, month) => {
    const targetDate = moment().year(year).month(month).startOf('month');
    const targetMonth = targetDate.format('YYYY-MM');
    
    return budgets.filter(budget => 
      moment(budget.date).format('YYYY-MM') === targetMonth
    );
  };

  // 月次実績の取得
  const getMonthlyActual = (year, month) => {
    const targetDate = moment().year(year).month(month).startOf('month');
    const targetMonth = targetDate.format('YYYY-MM');
    
    return actuals.filter(actual => 
      moment(actual.date).format('YYYY-MM') === targetMonth
    );
  };

  // 四半期予算の取得
  const getQuarterlyBudget = (year, quarter) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    
    return budgets.filter(budget => {
      const budgetDate = moment(budget.date);
      return budgetDate.year() === year && 
        budgetDate.month() >= startMonth && 
        budgetDate.month() <= endMonth;
    });
  };

  // 四半期実績の取得
  const getQuarterlyActual = (year, quarter) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    
    return actuals.filter(actual => {
      const actualDate = moment(actual.date);
      return actualDate.year() === year && 
        actualDate.month() >= startMonth && 
        actualDate.month() <= endMonth;
    });
  };

  // 年次予算の取得
  const getYearlyBudget = (year) => {
    return budgets.filter(budget => 
      moment(budget.date).year() === year
    );
  };

  // 年次実績の取得
  const getYearlyActual = (year) => {
    return actuals.filter(actual => 
      moment(actual.date).year() === year
    );
  };

  // 財務レポートの更新
  const updateFinancialReports = () => {
    const updatedReports = generateFinancialReports(budgets, actuals);
    setFinancialReports(updatedReports);
    return updatedReports;
  };

  // 実績データの自動集計
  const updateActualsFromSources = async (periodParams) => {
    setLoading(true);
    try {
      // 期間情報の整形
      const period = {
        type: periodParams.type || 'monthly', // 'monthly', 'quarterly', 'yearly'
        year: periodParams.year || moment().year(),
        month: periodParams.month !== undefined ? periodParams.month : moment().month(),
        quarter: periodParams.quarter || Math.ceil((moment().month() + 1) / 3),
        startDate: periodParams.startDate || moment().startOf('month').format('YYYY-MM-DD'),
        endDate: periodParams.endDate || moment().endOf('month').format('YYYY-MM-DD')
      };

      // 各ソースからデータを取得
      const salesData = await financeApi.getSalesData(period);
      const expensesData = await financeApi.getExpensesData(period);
      const payrollData = await financeApi.getPayrollData(period);

      // 実績データを作成
      const date = moment().year(period.year).month(period.type === 'monthly' ? period.month : 0).date(1).format('YYYY-MM-DD');
      
      // 各部門の実績を集計
      const newActuals = [];
      
      // 売上部門
      newActuals.push({
        id: `actual-food-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'food',
        amount: salesData.food || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      newActuals.push({
        id: `actual-beverage-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'beverage',
        amount: salesData.beverage || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      // 経費部門
      newActuals.push({
        id: `actual-labor-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'labor',
        amount: payrollData.totalLabor || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      newActuals.push({
        id: `actual-rent-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'rent',
        amount: expensesData.rent || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      newActuals.push({
        id: `actual-utilities-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'utilities',
        amount: expensesData.utilities || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      newActuals.push({
        id: `actual-supplies-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'supplies',
        amount: expensesData.supplies || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      newActuals.push({
        id: `actual-marketing-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'marketing',
        amount: expensesData.marketing || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      newActuals.push({
        id: `actual-other-${Date.now()}`,
        date,
        period: period.type,
        departmentId: 'other',
        amount: expensesData.other || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'auto-generated'
      });
      
      // 既存の自動生成された実績を削除（同じ期間、同じ部門の場合）
      const filteredActuals = actuals.filter(actual => {
        // 自動生成されたデータのみを削除
        if (actual.source !== 'auto-generated') return true;
        
        // 期間のチェック
        const actualDate = moment(actual.date);
        const matchesDate = period.type === 'monthly' 
          ? actualDate.year() === period.year && actualDate.month() === period.month
          : period.type === 'quarterly'
            ? actualDate.year() === period.year && Math.ceil((actualDate.month() + 1) / 3) === period.quarter
            : actualDate.year() === period.year;
            
        // 同じ期間の自動生成データは除外
        return !matchesDate;
      });
      
      // 新しい実績と手動入力の実績を統合
      const updatedActuals = [...filteredActuals, ...newActuals];
      setActuals(updatedActuals);
      
      // 財務レポートを更新
      updateFinancialReports();
      
      setLoading(false);
      return newActuals;
    } catch (err) {
      console.error('実績データの自動集計に失敗しました:', err);
      setError('実績データの自動集計に失敗しました: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  // コンテキスト値
  const value = {
    budgets,
    actuals,
    departments,
    financialReports,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    createActual,
    updateActual,
    deleteActual,
    getMonthlyBudget,
    getMonthlyActual,
    getQuarterlyBudget,
    getQuarterlyActual,
    getYearlyBudget,
    getYearlyActual,
    updateFinancialReports,
    updateActualsFromSources
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// フックの作成
export const useFinance = () => {
  return useContext(FinanceContext);
};
