import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveMenuItem } from '../utils/menuUtils';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  FormControlLabel,
  Switch,
  Chip,
  Card,
  CardMedia,
  Autocomplete,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  Tooltip,
  Checkbox,
  FormGroup,
  FormLabel,
  FormHelperText,
  Collapse
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

const MenuForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 新規追加の場合は必ずfalse、それ以外のIDの場合はtrue
  const isEditMode = id !== 'new' && id !== undefined;
  
  // 状態管理
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: null,
    price: '',
    categoryId: '',
    isAvailable: true,
    isFeatured: false,
    allergies: [],
    calories: '',
    recipeId: null,
    recipeName: null,
    isSeasonalMenu: false,
    seasonalPeriod: {
      start: '',
      end: ''
    },
    isDailySpecial: false,
    availableDays: []
  });
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // 共通のアレルギー項目
  const commonAllergies = [
    '小麦', '乳製品', '卵', '魚介類', 'えび', 'かに', '大豆', '落花生', 
    'そば', '牛肉', '豚肉', '鶏肉', 'りんご', 'バナナ', 'オレンジ', 'キウイ', 'くるみ'
  ];
  
  // カテゴリとレシピデータの取得
  useEffect(() => {
    // 実際のアプリでは、APIからデータを取得
    const mockCategories = [
      { id: 1, name: '前菜', order: 1 },
      { id: 2, name: '主菜', order: 2 },
      { id: 3, name: 'サイドディッシュ', order: 3 },
      { id: 4, name: 'デザート', order: 4 },
      { id: 5, name: 'ドリンク', order: 5 }
    ];
    
    const mockRecipes = [
      { id: 1, name: '海鮮丼', cost: 1200 },
      { id: 2, name: '天ぷら盛り合わせ', cost: 1000 },
      { id: 3, name: '焼き魚定食', cost: 800 },
      { id: 4, name: '味噌汁', cost: 150 },
      { id: 5, name: '茶碗蒸し', cost: 300 },
      { id: 6, name: 'うどん', cost: 400 }
    ];
    
    setCategories(mockCategories);
    setRecipes(mockRecipes);
  }, []);
  
  // メニュー項目データの取得（編集モードの場合）
  useEffect(() => {
    // 新規作成モードの場合は初期状態のフォームを表示
    if (!isEditMode || id === 'new') {
      setLoading(false);
      return;
    }

    // LocalStorageから実際のメニューデータを取得
    try {
      const allMenuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
      
      // IDに一致するメニューを検索
      const menuItem = allMenuItems.find(item => item.id === id);
      
      if (menuItem) {
        // 見つかった場合、フォームのフォーマットに変換
        setFormData({
          name: menuItem.name || '',
          description: menuItem.description || '',
          image: null,
          imagePreview: menuItem.image,
          price: menuItem.price?.toString() || '',
          categoryId: menuItem.category_id || '',
          isAvailable: menuItem.available === false ? false : true,
          isFeatured: menuItem.isFeatured || false,
          allergies: menuItem.allergies || [],
          calories: menuItem.calories?.toString() || '',
          recipeId: menuItem.recipeId || null,
          recipeName: menuItem.recipeName || null,
          isSeasonalMenu: menuItem.isSeasonalMenu || false,
          seasonalPeriod: menuItem.seasonalPeriod || { start: '', end: '' },
          isDailySpecial: menuItem.isDailySpecial || false,
          availableDays: menuItem.availableDays || []
        });
        setError(null);
      } else {
        // メニューが見つからない場合
        setError(`メニュー項目が見つかりません。ID: ${id}`);
      }
    } catch (error) {
      console.error('メニューデータ取得エラー:', error);
      setError('メニューデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode, navigate]);
  
  // フォーム入力の処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // スイッチの処理
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // 画像アップロードの処理
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // アレルギー項目の追加
  const handleAddAllergy = (allergy) => {
    if (allergy && !formData.allergies.includes(allergy)) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergy]
      });
      setNewAllergy('');
    }
  };
  
  // アレルギー項目の削除
  const handleDeleteAllergy = (allergyToDelete) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(allergy => allergy !== allergyToDelete)
    });
  };
  
  // レシピの選択
  const handleRecipeSelect = (e) => {
    const recipeId = e.target.value ? parseInt(e.target.value) : null;
    const selectedRecipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
    
    setFormData({
      ...formData,
      recipeId: recipeId,
      recipeName: selectedRecipe ? selectedRecipe.name : null
    });
  };
  
  // レシピのリンク解除
  const handleUnlinkRecipe = () => {
    setFormData({
      ...formData,
      recipeId: null,
      recipeName: null
    });
  };
  
  // フォーム送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      setAlert({
        open: true,
        message: '必須項目を入力してください',
        severity: 'error'
      });
      return;
    }
    
    try {
      // 実際にメニュー項目を保存
      // ローカルストレージにデータを保存
      const menuItem = {
        ...formData,
        // idがない場合は新規作成として扱う
        id: isEditMode ? id : undefined,
        // 必要なフィールドをフォーマットに合わせて調整
        category_id: formData.categoryId,
        available: formData.isAvailable,
        price: Number(formData.price),
        calories: formData.calories ? Number(formData.calories) : 0
      };
      
      // メニュー項目を保存・更新
      saveMenuItem(menuItem);
      
      // 成功メッセージを表示
      setAlert({
        open: true,
        message: isEditMode ? 'メニュー項目が更新されました' : 'メニュー項目が作成されました',
        severity: 'success'
      });
      
      // 少し待ってからリダイレクト
      setTimeout(() => {
        navigate('/menus');
      }, 1500);
    } catch (error) {
      console.error('メニュー項目の保存エラー:', error);
      setAlert({
        open: true,
        message: isEditMode ? 'メニュー項目の更新に失敗しました' : 'メニュー項目の作成に失敗しました',
        severity: 'error'
      });
    }
  };
  
  // メニュー一覧ページに戻る
  const handleGoBack = () => {
    // 確実にメニュー一覧画面に戻る
    navigate('/menus');
  };
  
  // アラートを閉じる
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };
  
  // 選択したレシピの原価を取得
  const getRecipeCost = () => {
    if (formData.recipeId) {
      const recipe = recipes.find(r => r.id === formData.recipeId);
      return recipe ? recipe.cost : 0;
    }
    return 0;
  };
  
  // 利益率を計算
  const calculateProfitMargin = () => {
    const cost = getRecipeCost();
    const price = parseFloat(formData.price) || 0;
    
    if (cost === 0 || price === 0) return 0;
    
    const profit = price - cost;
    const margin = (profit / price) * 100;
    
    return margin.toFixed(1);
  };
  
  if (loading) {
    return (
      <Container className="content-container">
        <Typography>読み込み中...</Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="content-container">
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          戻る
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="content-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {id === 'new' || !isEditMode ? '新規メニュー項目を追加' : 'メニュー項目を編集'}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          variant="outlined"
        >
          キャンセル
        </Button>
      </Box>
      
      <form onSubmit={handleSubmit}>
        {/* 基本情報 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            基本情報
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="メニュー名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="説明"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="カテゴリ"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="価格"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="カロリー"
                name="calories"
                type="number"
                value={formData.calories}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">kcal</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAvailable}
                      onChange={handleSwitchChange}
                      name="isAvailable"
                      color="primary"
                    />
                  }
                  label="提供可能"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isFeatured}
                      onChange={handleSwitchChange}
                      name="isFeatured"
                      color="warning"
                    />
                  }
                  label="おすすめメニュー"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                sx={{ mt: 1 }}
              >
                メイン画像をアップロード
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
              
              {formData.imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={formData.imagePreview} 
                    alt="メニュー画像プレビュー" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }} 
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        {/* レシピとの連携 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            レシピとの連携
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={formData.recipeId ? 10 : 12}>
              <FormControl fullWidth>
                <InputLabel>レシピ</InputLabel>
                <Select
                  value={formData.recipeId || ''}
                  onChange={handleRecipeSelect}
                  label="レシピ"
                >
                  <MenuItem value="">レシピなし</MenuItem>
                  {recipes.map((recipe) => (
                    <MenuItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {formData.recipeId && (
              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={handleUnlinkRecipe}
                  startIcon={<LinkOffIcon />}
                  sx={{ height: '100%' }}
                >
                  解除
                </Button>
              </Grid>
            )}
            
            {formData.recipeId && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    原価と利益率の計算
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        レシピ原価:
                      </Typography>
                      <Typography variant="body1">
                        ¥{getRecipeCost().toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        販売価格:
                      </Typography>
                      <Typography variant="body1">
                        ¥{(parseFloat(formData.price) || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        利益率:
                      </Typography>
                      <Typography variant="body1">
                        {calculateProfitMargin()}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                レシピをリンクすると、原価計算や在庫管理と連携できます。
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* 季節メニューと日替わりメニュー設定 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            特別メニュー設定
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isSeasonalMenu}
                    onChange={(e) => {
                      const { checked } = e.target;
                      setFormData({
                        ...formData,
                        isSeasonalMenu: checked,
                        seasonalPeriod: checked ? formData.seasonalPeriod : { start: '', end: '' }
                      });
                    }}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                    季節限定メニュー
                  </Box>
                }
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDailySpecial}
                    onChange={(e) => {
                      const { checked } = e.target;
                      setFormData({
                        ...formData,
                        isDailySpecial: checked,
                        availableDays: checked ? formData.availableDays : []
                      });
                    }}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    日替わりメニュー
                  </Box>
                }
              />
            </Grid>
            
            <Grid item xs={12}>
              <Collapse in={formData.isSeasonalMenu}>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    提供期間
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="開始日"
                        type="date"
                        value={formData.seasonalPeriod?.start || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            seasonalPeriod: {
                              ...(formData.seasonalPeriod || {}),
                              start: e.target.value
                            }
                          });
                        }}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="終了日"
                        type="date"
                        value={formData.seasonalPeriod?.end || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            seasonalPeriod: {
                              ...(formData.seasonalPeriod || {}),
                              end: e.target.value
                            }
                          });
                        }}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Collapse>
              
              <Collapse in={formData.isDailySpecial}>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">提供曜日</FormLabel>
                    <FormGroup row>
                      {[
                        { value: 'monday', label: '月' },
                        { value: 'tuesday', label: '火' },
                        { value: 'wednesday', label: '水' },
                        { value: 'thursday', label: '木' },
                        { value: 'friday', label: '金' },
                        { value: 'saturday', label: '土' },
                        { value: 'sunday', label: '日' }
                      ].map((day) => (
                        <FormControlLabel
                          key={day.value}
                          control={
                            <Checkbox
                              checked={formData.availableDays ? formData.availableDays.includes(day.value) : false}
                              onChange={(e) => {
                                const { checked } = e.target;
                                const currentDays = formData.availableDays || [];
                                const updatedDays = checked
                                  ? [...currentDays, day.value]
                                  : currentDays.filter(d => d !== day.value);
                                
                                setFormData({
                                  ...formData,
                                  availableDays: updatedDays
                                });
                              }}
                            />
                          }
                          label={day.label}
                        />
                      ))}
                    </FormGroup>
                    <FormHelperText>提供する曜日を選択してください</FormHelperText>
                  </FormControl>
                </Paper>
              </Collapse>
            </Grid>
          </Grid>
        </Paper>
        
        {/* アレルギー情報 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            アレルギー情報
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={10}>
              <Autocomplete
                freeSolo
                options={commonAllergies.filter(allergy => !formData.allergies.includes(allergy))}
                value={newAllergy}
                onChange={(event, newValue) => {
                  if (newValue) {
                    handleAddAllergy(newValue);
                  }
                }}
                inputValue={newAllergy}
                onInputChange={(event, newInputValue) => {
                  setNewAllergy(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="アレルギー項目"
                    fullWidth
                    placeholder="アレルギー項目を入力または選択"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleAddAllergy(newAllergy)}
                disabled={!newAllergy}
                sx={{ height: '100%' }}
              >
                追加
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.allergies.map((allergy, index) => (
              <Chip
                key={index}
                label={allergy}
                onDelete={() => handleDeleteAllergy(allergy)}
                color="error"
                variant="outlined"
              />
            ))}
            
            {formData.allergies.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                アレルギー項目がまだ追加されていません
              </Typography>
            )}
          </Box>
        </Paper>
        
        {/* 送信ボタン */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/menus')}
          >
            一覧に戻る
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
          >
            {id === 'new' || !isEditMode ? '登録する' : '更新する'}
          </Button>
        </Box>
      </form>
      
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

export default MenuForm;
