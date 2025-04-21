import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PriceHistoryDialog from '../components/PriceHistoryDialog';
import MenuSalesAnalysisDialog from '../components/MenuSalesAnalysisDialog';
import AutoInventoryDeductionDialog from '../components/AutoInventoryDeductionDialog';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { menuService, inventoryService } from '../api';
import { 
  getAllMenuItems, 
  getAllCategories, 
  saveMenuItem, 
  deleteMenuItem, 
  saveCategory 
} from '../utils/menuUtils';
import { getAllRecipes } from '../utils/recipeUtils';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  Analytics as AnalyticsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Event as EventIcon,
  Today as TodayIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

const MenuManagement = () => {
  const navigate = useNavigate();
  
  // 状態管理
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [tables, setTables] = useState([]);
  
  // フィルタリング状態
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [filterMenuType, setFilterMenuType] = useState('');
  
  // 選択状態
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  
  // ダイアログ状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkRecipeDialogOpen, setLinkRecipeDialogOpen] = useState(false);
  const [priceHistoryDialogOpen, setPriceHistoryDialogOpen] = useState(false);
  const [salesAnalysisDialogOpen, setSalesAnalysisDialogOpen] = useState(false);
  const [inventoryDeductionDialogOpen, setInventoryDeductionDialogOpen] = useState(false);
  const [qrCodeGeneratorOpen, setQrCodeGeneratorOpen] = useState(false);
  
  // アラート状態
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // メニューデータとカテゴリの読み込み
  useEffect(() => {
    // menuUtilsからデータを取得
    const loadMenuData = () => {
      try {
        // メニューデータ取得
        const menuData = getAllMenuItems();
        setMenuItems(menuData);
        setFilteredMenuItems(menuData);

        // カテゴリデータ取得
        const categoriesData = getAllCategories();
        setCategories(categoriesData);
        
        // レシピデータ取得
        const recipesData = getAllRecipes();
        setAvailableRecipes(recipesData);

        // テーブルデータのモック（実際はテーブル管理から取得するようにする）
        const mockTables = [
          { id: 'A1', name: 'テーブルA1', seats: 2, status: 'available' },
          { id: 'A2', name: 'テーブルA2', seats: 4, status: 'occupied' },
          { id: 'B1', name: 'テーブルB1', seats: 6, status: 'available' },
          { id: 'B2', name: 'テーブルB2', seats: 4, status: 'reserved' },
          { id: 'C1', name: 'テーブルC1', seats: 1, status: 'available' },
          { id: 'VIP', name: 'VIP席', seats: 8, status: 'available' }
        ];
        setTables(mockTables);

        setAlert({
          open: true,
          message: 'メニューデータを正常に読み込みました',
          severity: 'success'
        });
      } catch (error) {
        console.error('メニューデータの読み込みエラー:', error);
        setAlert({
          open: true,
          message: 'メニューデータの読み込みに失敗しました',
          severity: 'error'
        });
      }
    };

    loadMenuData();

    // ローカルストレージの変更を監視
    const handleStorageChange = (e) => {
      // メニュー関連の変更があった場合のみ再読み込み
      if (e.key === 'menuItems' || e.key === 'menuCategories' || e.key === null) {
        loadMenuData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 検索とフィルタリング
  useEffect(() => {
    let result = [...menuItems];
    
    // 検索語でフィルタリング
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // カテゴリでフィルタリング
    if (filterCategory) {
      result = result.filter(item => item.categoryId === parseInt(filterCategory));
    }
    
    // 提供状況でフィルタリング
    if (filterAvailability) {
      if (filterAvailability === 'available') {
        result = result.filter(item => item.isAvailable);
      } else if (filterAvailability === 'unavailable') {
        result = result.filter(item => !item.isAvailable);
      }
    }
    
    // メニュータイプでフィルタリング
    if (filterMenuType) {
      if (filterMenuType === 'seasonal') {
        result = result.filter(item => item.isSeasonalMenu);
      } else if (filterMenuType === 'daily') {
        result = result.filter(item => item.isDailySpecial);
      } else if (filterMenuType === 'featured') {
        result = result.filter(item => item.isFeatured);
      }
    }
    
    setFilteredMenuItems(result);
  }, [menuItems, searchTerm, filterCategory, filterAvailability, filterMenuType]);

  // 検索語の変更ハンドラ
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // カテゴリフィルタの変更ハンドラ
  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };
  
  // 提供状況フィルタの変更ハンドラ
  const handleAvailabilityFilterChange = (e) => {
    setFilterAvailability(e.target.value);
  };
  
  // フィルタのリセット
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterAvailability('');
    setFilterMenuType('');
  };
  
  // タブ切り替えハンドラ
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  // 現在の曜日から日替わりメニューが利用可能かチェック
  const isDailyMenuAvailableToday = (menuItem) => {
    if (!menuItem.isDailySpecial) return false;
    
    const today = new Date().getDay();
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    
    return menuItem.availableDays && menuItem.availableDays.some(day => dayMap[day] === today);
  };
  
  // 季節メニューが現在の期間内かチェック
  const isSeasonalMenuInSeason = (menuItem) => {
    if (!menuItem.isSeasonalMenu) return false;
    
    const today = new Date();
    const startDate = new Date(menuItem.seasonalPeriod?.start);
    const endDate = new Date(menuItem.seasonalPeriod?.end);
    
    return today >= startDate && today <= endDate;
  };
  
  // メニュー編集ページへの遷移
  const handleEditMenuItem = (menuItemId) => {
    navigate(`/menus/edit/${menuItemId}`);
  };
  
  // レシピ画面への遷移
  const handleViewRecipe = (recipeId) => {
    if (recipeId) {
      navigate(`/recipes/edit/${recipeId}`);
    } else {
      setAlert({
        open: true,
        message: 'レシピが見つかりませんでした',
        severity: 'error'
      });
    }
  };
  
  // メニューアイテムの保存
  const handleSaveMenuItem = (menuItem) => {
    try {
      // menuUtilsの関数を使用して保存
      const savedItem = saveMenuItem(menuItem);
      
      // メニューデータ再取得
      const updatedItems = getAllMenuItems();
      setMenuItems(updatedItems);
      setFilteredMenuItems(updatedItems);
      
      setAlert({
        open: true,
        message: 'メニューアイテムが正常に保存されました',
        severity: 'success'
      });

      // ストレージイベントを発火して他のコンポーネントに通知
      window.dispatchEvent(new Event('storage'));
      return savedItem;
    } catch (error) {
      console.error('メニューアイテムの保存エラー:', error);
      setAlert({
        open: true,
        message: 'メニューアイテムの保存に失敗しました',
        severity: 'error'
      });
      return null;
    }
  };  

  // 削除ダイアログを開く
  const handleDeleteClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setDeleteDialogOpen(true);
  };

  // メニューアイテムの削除
  const handleDeleteMenuItem = (menuItemId) => {
    try {
      // menuUtilsの関数を使用して削除
      deleteMenuItem(menuItemId);
      
      // メニューデータ再取得
      const updatedItems = getAllMenuItems();
      setMenuItems(updatedItems);
      setFilteredMenuItems(updatedItems);
      setDeleteDialogOpen(false);
      
      setAlert({
        open: true,
        message: 'メニューアイテムが正常に削除されました',
        severity: 'success'
      });

      // ストレージイベントを発火して他のコンポーネントに通知
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('メニューアイテムの削除エラー:', error);
      setAlert({
        open: true,
        message: 'メニューアイテムの削除に失敗しました',
        severity: 'error'
      });
    }
  };  

  // 提供状況の切り替え
  const handleAvailabilityToggle = (menuItemId) => {
    const updatedMenuItems = menuItems.map(item => {
      if (item.id === menuItemId) {
        return {
          ...item,
          isAvailable: !item.isAvailable
        };
      }
      return item;
    });
    
    setMenuItems(updatedMenuItems);
  };
  
  // おすすめ状態の切り替え
  const handleFeaturedToggle = (menuItemId) => {
    const updatedMenuItems = menuItems.map(item => {
      if (item.id === menuItemId) {
        return {
          ...item,
          isFeatured: !item.isFeatured
        };
      }
      return item;
    });
    
    setMenuItems(updatedMenuItems);
  };
  
  // レシピリンクダイアログを開く
  const handleLinkRecipeClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setSelectedRecipe(menuItem.recipeId ? menuItem.recipeId.toString() : '');
    setLinkRecipeDialogOpen(true);
  };
  
  // 価格履歴ダイアログを開く
  const handlePriceHistoryClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setPriceHistoryDialogOpen(true);
  };
  
  // 売上分析ダイアログを開く
  const handleSalesAnalysisClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setSalesAnalysisDialogOpen(true);
  };
  
  // 在庫自動引き落とし設定ダイアログを開く
  const handleInventoryDeductionClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setInventoryDeductionDialogOpen(true);
  };
  
  // QRコード生成ダイアログを開く
  const handleQRCodeGeneratorClick = () => {
    setQrCodeGeneratorOpen(true);
  };
  
  // アラートを閉じる
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  
  // アラートを表示
  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };
  
  // カテゴリ名を取得
  const getCategoryName = (categoryId) => {
    // categoryIdが文字列の場合は数値に変換して比較
    const id = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
    const category = categories.find(cat => cat.id === id || cat.id === categoryId);
    return category ? category.name : '未分類';
  };

  return (
    <Container className="content-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          メニュー管理
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<QrCodeIcon />}
            onClick={handleQRCodeGeneratorClick}
            color="secondary"
          >
            QRコード生成
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/menus/new')}
          >
            メニュー項目を追加
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="メニュー項目を検索"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: 250 }}
            />
            <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 150 }}>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={filterCategory}
                onChange={handleCategoryFilterChange}
                label="カテゴリ"
              >
                <MenuItem value="">すべて</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 150 }}>
              <InputLabel>提供状況</InputLabel>
              <Select
                value={filterAvailability}
                onChange={handleAvailabilityFilterChange}
                label="提供状況"
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="available">提供中</MenuItem>
                <MenuItem value="unavailable">提供停止中</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>メニュータイプ</InputLabel>
              <Select
                value={filterMenuType}
                onChange={(e) => setFilterMenuType(e.target.value)}
                label="メニュータイプ"
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="seasonal">季節限定</MenuItem>
                <MenuItem value="daily">日替わり</MenuItem>
                <MenuItem value="featured">おすすめ</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={resetFilters}
            size="small"
          >
            フィルタをリセット
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>メニュー項目</TableCell>
                <TableCell>カテゴリ</TableCell>
                <TableCell align="right">価格</TableCell>
                <TableCell>レシピ</TableCell>
                <TableCell>特別表示</TableCell>
                <TableCell align="center">提供状況</TableCell>
                <TableCell align="center">おすすめ</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMenuItems.map((menuItem) => (
                <TableRow key={menuItem.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 60, height: 60, mr: 2, overflow: 'hidden', borderRadius: 1 }}>
                        <img src={menuItem.image} alt={menuItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1">{menuItem.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {menuItem.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{getCategoryName(menuItem.categoryId)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography>¥{menuItem.price.toLocaleString()}</Typography>
                      {menuItem.priceHistory && menuItem.priceHistory.length > 0 && (
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePriceHistoryClick(menuItem);
                          }}
                          sx={{ ml: 1 }}
                          color="primary"
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {menuItem.recipeName ? (
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => handleViewRecipe(menuItem.recipeId)}
                      >
                        <LinkIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" color="primary">{menuItem.recipeName}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">未設定</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {menuItem.isSeasonalMenu && (
                      <Tooltip title={`提供期間: ${menuItem.seasonalPeriod?.start || ''} ~ ${menuItem.seasonalPeriod?.end || ''}`}>
                        <Box>
                          <Chip 
                            icon={<EventIcon />}
                            label="季節限定"
                            color={isSeasonalMenuInSeason(menuItem) ? "primary" : "default"}
                            variant={isSeasonalMenuInSeason(menuItem) ? "filled" : "outlined"}
                            size="small"
                          />
                        </Box>
                      </Tooltip>
                    )}
                    {menuItem.isDailySpecial && (
                      <Tooltip title={`提供曜日: ${menuItem.availableDays?.map(day => {
                        const days = {
                          monday: '月',
                          tuesday: '火',
                          wednesday: '水',
                          thursday: '木',
                          friday: '金',
                          saturday: '土',
                          sunday: '日'
                        };
                        return days[day];
                      }).join(', ') || ''}`}>
                        <Box sx={{ mt: menuItem.isSeasonalMenu ? 0.5 : 0 }}>
                          <Chip 
                            icon={<TodayIcon />}
                            label="日替わり"
                            color={isDailyMenuAvailableToday(menuItem) ? "secondary" : "default"}
                            variant={isDailyMenuAvailableToday(menuItem) ? "filled" : "outlined"}
                            size="small"
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={menuItem.isAvailable}
                      onChange={() => handleAvailabilityToggle(menuItem.id)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleFeaturedToggle(menuItem.id)}
                      color={menuItem.isFeatured ? "warning" : "default"}
                    >
                      {menuItem.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="編集">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditMenuItem(menuItem.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="レシピをリンク">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLinkRecipeClick(menuItem);
                          }}
                          color="primary"
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="在庫自動引き落とし設定">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInventoryDeductionClick(menuItem);
                          }}
                          color="success"
                        >
                          <InventoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="売上分析">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSalesAnalysisClick(menuItem);
                          }}
                          color="primary"
                          disabled={false}
                        >
                          <AnalyticsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(menuItem)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMenuItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      メニュー項目が見つかりませんでした
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 在庫自動引き落とし設定ダイアログ */}
      <AutoInventoryDeductionDialog
        open={inventoryDeductionDialogOpen}
        onClose={() => setInventoryDeductionDialogOpen(false)}
        menuItem={selectedMenuItem}
      />
      
      {/* QRコード生成ダイアログ */}
      <QRCodeGenerator
        open={qrCodeGeneratorOpen}
        onClose={() => setQrCodeGeneratorOpen(false)}
        menuItems={menuItems}
        tables={tables}
      />
      
      {/* 売上分析ダイアログ */}
      <Dialog
        open={salesAnalysisDialogOpen}
        onClose={() => setSalesAnalysisDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMenuItem ? `${selectedMenuItem.name}の売上分析` : '売上分析'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedMenuItem ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>売上データはまだ実装中です</Typography>
              <Typography variant="body1">
                ここには{selectedMenuItem.name}の売上データ、グラフ、分析情報などが表示されます。
                現在は開発中の機能です。
              </Typography>
            </Box>
          ) : (
            <Typography>メニュー項目が選択されていません</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalesAnalysisDialogOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* レシピリンクダイアログ */}
      <Dialog
        open={linkRecipeDialogOpen}
        onClose={() => setLinkRecipeDialogOpen(false)}
      >
        <DialogTitle>レシピをリンク</DialogTitle>
        <DialogContent>
          {selectedMenuItem && (
            <Box sx={{ minWidth: 400, pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedMenuItem.name}にリンクするレシピを選択してください。
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>レシピ</InputLabel>
                <Select
                  value={selectedRecipe}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  label="レシピ"
                >
                  <MenuItem value="">選択しない</MenuItem>
                  {availableRecipes.map(recipe => (
                    <MenuItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  color="primary"
                  onClick={() => {
                    // 新しいレシピを作成するページに移動
                    setLinkRecipeDialogOpen(false);
                    navigate('/recipes/new', { state: { linkedMenuId: selectedMenuItem.id } });
                  }}
                >
                  新しいレシピを作成
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!selectedRecipe}
                  onClick={() => {
                    // 選択したレシピをメニューにリンク
                    const updatedMenuItem = {
                      ...selectedMenuItem,
                      recipeId: selectedRecipe ? selectedRecipe : null,
                      recipeName: selectedRecipe ? 
                        availableRecipes.find(r => r.id === selectedRecipe)?.name || null : null
                    };
                    
                    handleSaveMenuItem(updatedMenuItem);
                    setLinkRecipeDialogOpen(false);
                  }}
                >
                  リンクする
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 価格履歴ダイアログ */}
      <Dialog
        open={priceHistoryDialogOpen}
        onClose={() => setPriceHistoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>価格履歴</DialogTitle>
        <DialogContent dividers>
          {selectedMenuItem && selectedMenuItem.priceHistory ? (
            <List>
              {selectedMenuItem.priceHistory.map((history, index) => (
                <ListItem key={index} divider={index < selectedMenuItem.priceHistory.length - 1}>
                  <ListItemText
                    primary={`¥${history.price.toLocaleString()}`}
                    secondary={new Date(history.date).toLocaleDateString('ja-JP')}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>価格履歴がありません</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceHistoryDialogOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>メニュー項目の削除</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedMenuItem ? selectedMenuItem.name : ''} を削除しますか？この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="primary"
          >
            キャンセル
          </Button>
          <Button 
            onClick={() => handleDeleteMenuItem(selectedMenuItem.id)} 
            color="error" 
            variant="contained"
            autoFocus
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* アラート */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MenuManagement;
