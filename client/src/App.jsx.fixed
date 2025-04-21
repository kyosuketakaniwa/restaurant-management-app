import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';

// レイアウトコンポーネント
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// 認証ページ
import Login from './pages/Login';
import Register from './pages/Register';

// アプリケーションページ
import Dashboard from './pages/Dashboard';
import POSDashboard from './pages/POSDashboard';
import SalesManagement from './pages/SalesManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import InventoryManagement from './pages/InventoryManagement';
import RecipeManagement from './pages/RecipeManagement';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import MenuManagement from './pages/MenuManagement';
import MenuForm from './pages/MenuForm';
import OrderManagement from './pages/OrderManagement';

// 勤怠・給与管理
import StaffManagement from './pages/StaffManagement';
import ShiftManagement from './pages/ShiftManagement';
import AttendanceTracking from './pages/AttendanceTracking';
import PayrollManagement from './pages/PayrollManagement';
import ReservationManagement from './pages/ReservationManagement';

// 財務管理（PL・予実管理）
import BudgetManagement from './pages/BudgetManagement';
import ActualsManagement from './pages/ActualsManagement';
import FinancialReports from './pages/FinancialReports';

// タスク・チェックリスト管理
import TaskManagement from './pages/TaskManagement';
import ChecklistManagement from './pages/ChecklistManagement';

// マニュアル管理
import ManualManagement from './pages/ManualManagement';

// 設定管理
import SettingsPage from './pages/SettingsPage';
import SettingsPageBasic from './pages/SettingsPageBasic';
import StaticSettings from './pages/StaticSettings';

// マーケティング管理
import CampaignManagement from './pages/CampaignManagement';
import CouponManagement from './pages/CouponManagement';
import CustomerManagement from './pages/CustomerManagement';
import LoyaltyProgramManagement from './pages/LoyaltyProgramManagement';

// 顧客向けデジタルメニュー
import CustomerMenu from './pages/CustomerMenu';
import OrderConfirmation from './pages/OrderConfirmation';

// POSレジ機能
import POSRegister from './pages/POSRegister';
import POSOrders from './pages/POSOrders';
import KitchenDisplay from './pages/KitchenDisplay';
import TableManagement from './pages/TableManagement';

// コンテキスト
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { TableProvider } from './contexts/TableContext';
import { StaffProvider } from './contexts/StaffContext';
import { ShiftProvider } from './contexts/ShiftContext';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { PayrollProvider } from './contexts/PayrollContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { TaskProvider } from './contexts/TaskContext';
import { ChecklistProvider } from './contexts/ChecklistContext';
import { MarketingProvider } from './contexts/MarketingContext';
import { SalesProvider } from './contexts/SalesContext';
import { ManualProvider } from './contexts/ManualContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { RoleProvider } from './contexts/RoleContext';
import { ReservationProvider } from './contexts/ReservationContext';

// テーマの定義
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6da7',
    },
    secondary: {
      main: '#e57373',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// 認証状態に基づいてルートを保護するコンポーネント
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// メインアプリケーション
const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ja}>
          <CssBaseline />
          {/* アプリ全体の状態管理プロバイダー */}
          <AuthProvider>
            <OrderProvider>
              {/* 重要：ReservationProviderはTableProviderより前に配置する必要がある */}
              <ReservationProvider>
                <TableProvider>
                  <SalesProvider>
                    <StaffProvider>
                      <ShiftProvider>
                        <AttendanceProvider>
                          <PayrollProvider>
                            <FinanceProvider>
                              <TaskProvider>
                                <ChecklistProvider>
                                  <MarketingProvider>
                                    <ManualProvider>
                                      <SettingsProvider>
                                        <RoleProvider>
                                          <Routes>
                                            {/* 認証ページ */}
                                            <Route element={<AuthLayout />}>
                                              <Route path="/login" element={<Login />} />
                                              <Route path="/register" element={<Register />} />
                                            </Route>
                                            
                                            {/* アプリケーションページ - 認証保護あり */}
                                            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                                              {/* ダッシュボード */}
                                              <Route path="/" element={<Dashboard />} />
                                              <Route path="/pos-dashboard" element={<POSDashboard />} />
                                              
                                              {/* 売上・経費・在庫管理 */}
                                              <Route path="/sales" element={<SalesManagement />} />
                                              <Route path="/expenses" element={<ExpenseManagement />} />
                                              <Route path="/inventory" element={<InventoryManagement />} />
                                              
                                              {/* レシピ・メニュー管理 */}
                                              <Route path="/recipes" element={<RecipeManagement />} />
                                              <Route path="/recipes/:id" element={<RecipeDetail />} />
                                              <Route path="/recipes/new" element={<RecipeForm />} />
                                              <Route path="/recipes/edit/:id" element={<RecipeForm />} />
                                              <Route path="/menus" element={<MenuManagement />} />
                                              <Route path="/menus/new" element={<MenuForm />} />
                                              <Route path="/menus/edit/:id" element={<MenuForm />} />
                                              
                                              {/* 注文管理 */}
                                              <Route path="/orders" element={<OrderManagement />} />
                                              
                                              {/* 勤怠・給与管理 */}
                                              <Route path="/staff" element={<StaffManagement />} />
                                              <Route path="/shifts" element={<ShiftManagement />} />
                                              <Route path="/attendance" element={<AttendanceTracking />} />
                                              <Route path="/payroll" element={<PayrollManagement />} />
                                              <Route path="/reservations" element={<ReservationManagement />} />
                                              
                                              {/* 財務管理 */}
                                              <Route path="/budget" element={<BudgetManagement />} />
                                              <Route path="/actuals" element={<ActualsManagement />} />
                                              <Route path="/financial-reports" element={<FinancialReports />} />
                                              
                                              {/* タスク・チェックリスト管理 */}
                                              <Route path="/tasks" element={<TaskManagement />} />
                                              <Route path="/checklists" element={<ChecklistManagement />} />
                                              
                                              {/* マニュアル管理 */}
                                              <Route path="/manuals" element={<ManualManagement />} />
                                              
                                              {/* マーケティング管理 */}
                                              <Route path="/campaigns" element={<CampaignManagement />} />
                                              <Route path="/coupons" element={<CouponManagement />} />
                                              <Route path="/customers" element={<CustomerManagement />} />
                                              <Route path="/loyalty" element={<LoyaltyProgramManagement />} />
                                              
                                              {/* POSレジ機能 */}
                                              <Route path="/pos" element={<POSRegister />} />
                                              <Route path="/pos/orders" element={<POSOrders />} />
                                              <Route path="/kitchen-display" element={<KitchenDisplay />} />
                                              <Route path="/tables" element={<TableManagement />} />
                                              
                                              {/* 設定ページ */}
                                              <Route path="/settings" element={<SettingsPage />} />
                                              <Route path="/settings/basic" element={<SettingsPageBasic />} />
                                              <Route path="/settings/static" element={<StaticSettings />} />
                                            </Route>
                                            
                                            {/* 顧客向けデジタルメニュー - 認証不要 */}
                                            <Route path="/menu/:tableId" element={<CustomerMenu />} />
                                            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                                            
                                            {/* デフォルトリダイレクト */}
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                          </Routes>
                                        </RoleProvider>
                                      </SettingsProvider>
                                    </ManualProvider>
                                  </MarketingProvider>
                                </ChecklistProvider>
                              </TaskProvider>
                            </FinanceProvider>
                          </PayrollProvider>
                        </AttendanceProvider>
                      </ShiftProvider>
                    </StaffProvider>
                  </SalesProvider>
                </TableProvider>
              </ReservationProvider>
            </OrderProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
