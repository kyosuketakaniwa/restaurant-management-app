import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Tooltip,
  CssBaseline,
  ListSubheader
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  PointOfSale as POSIcon,
  Restaurant as MenuIcon2,
  TableBar as TableIcon,
  EventNote as ReservationIcon,
  People as CustomerIcon,
  Inventory as InventoryIcon,
  Group as StaffIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as ExpenseIcon,
  MenuBook as RecipeIcon,
  CalendarMonth as ShiftIcon,
  AccessTime as AttendanceIcon,
  Payments as PayrollIcon,
  AccountBalance as BudgetIcon,
  BarChart as ActualsIcon,
  PieChart as FinancialReportsIcon,
  Task as TaskIcon,
  PlaylistAddCheck as ChecklistIcon,
  Campaign as CampaignIcon,
  LocalOffer as CouponIcon,
  Group as CustomerManagementIcon,
  CardMembership as LoyaltyIcon,
  AssignmentTurnedIn as ManualIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// サイドバーの幅
const drawerWidth = 240;

const MainLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 店舗情報の状態
  const [storeInfo, setStoreInfo] = useState({
    name: '和食レストラン 匠'
  });
  
  // ドロワーの状態
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // ユーザーメニューの状態
  const [anchorEl, setAnchorEl] = useState(null);
  
  // LocalStorageから店舗情報を取得
  useEffect(() => {
    const loadStoreInfo = () => {
      try {
        const storedInfo = localStorage.getItem('storeInfo');
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo);
          setStoreInfo(parsedInfo);
        }
      } catch (error) {
        console.error('店舗情報の読み込みエラー:', error);
      }
    };
    
    loadStoreInfo();
    
    // LocalStorageの変更を監視するイベントリスナー
    const handleStorageChange = (e) => {
      if (e.key === 'storeInfo') {
        loadStoreInfo();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // ドロワーの開閉を切り替える
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // ユーザーメニューを開く
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // ユーザーメニューを閉じる
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };
  
  // カテゴリ別メニュー構造
  // メインカテゴリとその中のメニュー項目
  const menuCategories = [
    {
      categoryName: '基本情報',
      items: [
        { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/' },
        { text: '設定', icon: <SettingsIcon />, path: '/settings' }
      ]
    },
    {
      categoryName: 'POSシステム',
      items: [
        { text: 'POSダッシュボード', icon: <DashboardIcon />, path: '/pos-dashboard' },
        { text: 'POSレジ', icon: <POSIcon />, path: '/pos' },
        { text: '注文管理', icon: <ReceiptIcon />, path: '/orders' },
        { text: 'テーブル管理', icon: <TableIcon />, path: '/tables' },
        { text: '予約管理', icon: <ReservationIcon />, path: '/reservations' },
        { text: '売上管理', icon: <TrendingUpIcon />, path: '/sales' },
        { text: '売上レポート', icon: <ReportIcon />, path: '/reports' },
      ]
    },
    {
      categoryName: '財務管理',
      items: [
        { text: '経費管理', icon: <ExpenseIcon />, path: '/expenses' },
        { text: '予算管理', icon: <BudgetIcon />, path: '/budget' },
        { text: '実績管理', icon: <ActualsIcon />, path: '/actuals' },
        { text: '財務レポート', icon: <FinancialReportsIcon />, path: '/financial-reports' },
      ]
    },
    {
      categoryName: '商品・在庫',
      items: [
        { text: 'メニュー管理', icon: <MenuIcon2 />, path: '/menus' },
        { text: 'レシピ管理', icon: <RecipeIcon />, path: '/recipes' },
        { text: '在庫管理', icon: <InventoryIcon />, path: '/inventory' },
      ]
    },
    {
      categoryName: '店舗オペレーション',
      items: [
        { text: 'タスク管理', icon: <TaskIcon />, path: '/tasks' },
        { text: 'チェックリスト', icon: <ChecklistIcon />, path: '/checklists' },
        { text: 'マニュアル管理', icon: <ManualIcon />, path: '/manuals' },
      ]
    },
    {
      categoryName: '人事・労務',
      items: [
        { text: 'スタッフ管理', icon: <StaffIcon />, path: '/staff' },
        { text: 'シフト管理', icon: <ShiftIcon />, path: '/shifts' },
        { text: '勤怠管理', icon: <AttendanceIcon />, path: '/attendance' },
        { text: '給与管理', icon: <PayrollIcon />, path: '/payroll' },
      ]
    },
    {
      categoryName: '顧客管理',
      items: [
        { text: '顧客情報', icon: <CustomerIcon />, path: '/customers' },
        /* DatePicker問題のため無効化中
        { text: 'キャンペーン管理', icon: <CampaignIcon />, path: '/marketing/campaigns' },
        { text: 'クーポン管理', icon: <CouponIcon />, path: '/marketing/coupons' },
        { text: '顧客管理（マーケティング）', icon: <CustomerManagementIcon />, path: '/marketing/customers' },
        { text: 'ロイヤルティプログラム', icon: <LoyaltyIcon />, path: '/marketing/loyalty' },
        */
      ]
    },
  ];
  
  // フラットなメニューリスト（後方互換性のため）
  const menuItems = menuCategories.flatMap(category => category.items);
  
  // ドロワーの内容
  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        py: 2
      }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 1
          }}
        >
          {storeInfo.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          レストラン管理システム
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
        {menuCategories.map((category, index) => (
          <React.Fragment key={category.categoryName}>
            {index > 0 && <Divider sx={{ my: 1 }} />}
            <List
              subheader={
                <ListSubheader component="div" id={`category-${index}`} sx={{ bgcolor: 'background.paper', fontWeight: 'bold' }}>
                  {category.categoryName}
                </ListSubheader>
              }
            >
              {category.items.map((item) => (
                <ListItem 
                  button 
                  key={item.text} 
                  component={Link} 
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    py: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'primary.contrastText',
                        fontWeight: 'bold',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </React.Fragment>
        ))}
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* アプリバー */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'ダッシュボード'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="アカウント設定">
              <IconButton
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {currentUser?.name?.charAt(0) || <AccountIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
            >
              <MenuItem onClick={() => navigate('/settings')}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>設定</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>ログアウト</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* サイドバー */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* モバイル用ドロワー */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // モバイルでのパフォーマンス向上のため
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* デスクトップ用ドロワー */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
