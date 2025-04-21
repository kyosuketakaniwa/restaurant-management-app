import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  RestaurantMenu as DifficultyIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// レシピユーティリティ関数をインポート
import { getAllRecipes, deleteRecipe } from '../utils/recipeUtils';

const RecipeManagement = () => {
  const navigate = useNavigate();
  
  // 状態管理
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // LocalStorage からレシピデータを読み込む
  const loadRecipeData = () => {
    try {
      // recipeUtils からデータを取得
      const recipeData = getAllRecipes();
      setRecipes(recipeData);
      setFilteredRecipes(recipeData);
      
      if (recipeData.length === 0) {
        setAlert({
          open: true,
          message: 'レシピがありません。新しいレシピを追加してください。',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('レシピデータの取得エラー:', error);
      setAlert({
        open: true,
        message: 'レシピデータの取得に失敗しました',
        severity: 'error'
      });
    }
  };

  // コンポーネントマウント時にデータ読み込み
  useEffect(() => {
    loadRecipeData();
    
    // localStorage の変更を監視
    const handleStorageChange = (e) => {
      // レシピ関連のデータが変更された場合に再読み込み
      if (e.key === 'recipes' || e.key === null) {
        loadRecipeData();
      }
    };
    
    // イベントリスナーを追加
    window.addEventListener('storage', handleStorageChange);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 検索とフィルタリング
  useEffect(() => {
    let result = [...recipes];
    
    // 検索語でフィルタリング
    if (searchTerm) {
      result = result.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // 難易度でフィルタリング
    if (filterDifficulty) {
      result = result.filter(recipe => recipe.difficulty === filterDifficulty);
    }
    
    // 調理時間でフィルタリング
    if (filterTime) {
      switch(filterTime) {
        case 'quick':
          result = result.filter(recipe => (recipe.preparationTime + recipe.cookingTime) <= 30);
          break;
        case 'medium':
          result = result.filter(recipe => 
            (recipe.preparationTime + recipe.cookingTime) > 30 && 
            (recipe.preparationTime + recipe.cookingTime) <= 60
          );
          break;
        case 'long':
          result = result.filter(recipe => (recipe.preparationTime + recipe.cookingTime) > 60);
          break;
        default:
          break;
      }
    }
    
    setFilteredRecipes(result);
  }, [recipes, searchTerm, filterDifficulty, filterTime]);

  // 検索語の変更ハンドラ
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 難易度フィルタの変更ハンドラ
  const handleDifficultyFilterChange = (e) => {
    setFilterDifficulty(e.target.value);
  };

  // 時間フィルタの変更ハンドラ
  const handleTimeFilterChange = (e) => {
    setFilterTime(e.target.value);
  };

  // フィルタをリセット
  const resetFilters = () => {
    setSearchTerm('');
    setFilterDifficulty('');
    setFilterTime('');
  };

  // レシピ削除処理
  const handleDeleteRecipe = () => {
    if (selectedRecipe) {
      try {
        // recipeUtils のdeleteRecipe関数を使用してレシピを削除
        const success = deleteRecipe(selectedRecipe.id);
        
        if (success) {
          // UIからも削除
          const updatedRecipes = recipes.filter(recipe => recipe.id !== selectedRecipe.id);
          setRecipes(updatedRecipes);
          setFilteredRecipes(updatedRecipes);
          
          // 成功メッセージ
          setAlert({
            open: true,
            message: `${selectedRecipe.name}を削除しました`,
            severity: 'success'
          });
        } else {
          throw new Error('レシピの削除に失敗しました');
        }
      } catch (error) {
        console.error('レシピ削除エラー:', error);
        setAlert({
          open: true,
          message: 'レシピの削除中にエラーが発生しました',
          severity: 'error'
        });
      } finally {
        // ダイアログを閉じる
        setDeleteDialogOpen(false);
      }
    }
  };

  // アラートを閉じる
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // レシピ詳細ページへの遷移
  const handleViewRecipe = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  // レシピ編集ページへの遷移
  const handleEditRecipe = (recipeId) => {
    if (recipeId === 'new') {
      navigate('/recipes/new');
    } else {
      navigate(`/recipes/edit/${recipeId}`);
    }
  };

  // 削除ダイアログを開く
  const handleDeleteClick = (recipe) => {
    setSelectedRecipe(recipe);
    setDeleteDialogOpen(true);
  };

  // 難易度に基づいて色を決定
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  // 難易度のテキストを取得
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '簡単';
      case 'medium':
        return '普通';
      case 'hard':
        return '難しい';
      default:
        return difficulty;
    }
  };

  // 総調理時間を計算
  const getTotalTime = (prep, cook) => {
    return prep + cook;
  };

  return (
    <Container className="content-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          レシピ管理
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/recipes/new')}
        >
          レシピを追加
        </Button>
      </Box>

      {/* 検索とフィルタリング */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="レシピを検索"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>難易度</InputLabel>
              <Select
                value={filterDifficulty}
                label="難易度"
                onChange={handleDifficultyFilterChange}
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="easy">簡単</MenuItem>
                <MenuItem value="medium">普通</MenuItem>
                <MenuItem value="hard">難しい</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>調理時間</InputLabel>
              <Select
                value={filterTime}
                label="調理時間"
                onChange={handleTimeFilterChange}
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="quick">30分以内</MenuItem>
                <MenuItem value="medium">30分〜1時間</MenuItem>
                <MenuItem value="long">1時間以上</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={resetFilters}
              startIcon={<FilterIcon />}
            >
              リセット
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* レシピ一覧 */}
      <Grid container spacing={3}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={recipe.image}
                  alt={recipe.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {recipe.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {recipe.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {getTotalTime(recipe.preparationTime, recipe.cookingTime)}分
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DifficultyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Chip 
                      label={getDifficultyText(recipe.difficulty)} 
                      color={getDifficultyColor(recipe.difficulty)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {recipe.tags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    詳細
                  </Button>
                  <IconButton 
                    size="small" 
                    onClick={() => navigate(`/recipes/edit/${recipe.id}`)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(recipe)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                レシピが見つかりませんでした。検索条件を変更するか、新しいレシピを追加してください。
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>レシピの削除</DialogTitle>
        <DialogContent>
          {selectedRecipe && (
            <Typography>
              「{selectedRecipe.name}」を削除してもよろしいですか？この操作は元に戻せません。
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteRecipe} color="error">
            削除する
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

export default RecipeManagement;
