import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Chip,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon
} from '@mui/icons-material';

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 新規作成モードを正しく判定
  const isEditMode = id !== 'new' && id !== undefined && id !== 'undefined';
  
  // 状態管理
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: null,
    preparationTime: '',
    cookingTime: '',
    difficulty: 'medium',
    servings: 2,
    ingredients: [],
    steps: [],
    tags: [],
    notes: '',
    sellingPrice: ''
  });
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
    cost: ''
  });
  const [newStep, setNewStep] = useState({
    description: '',
    image: null,
    imagePreview: null,
    time: ''
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // レシピデータの取得（編集モードの場合）
  useEffect(() => {
    // IDがnull, undefinedまたは'new'の場合は新規作成として処理
    if (!id || id === 'new' || id === 'undefined' || id === undefined) {
      // 新規作成モードとして初期フォームを表示
      setLoading(false);
      setError(null);
      return;
    }

    // 編集モードの場合、レシピデータ取得
    try {
      // ローカルストレージからレシピを取得
      const allRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      const recipe = allRecipes.find(r => r.id === id);
      
      if (recipe) {
        // レシピが見つかった場合
        setFormData({
          ...recipe,
          imagePreview: recipe.image,
          ingredients: recipe.ingredients || [],
          steps: recipe.steps || [],
          tags: recipe.tags || []
        });
        setError(null);
      } else {
        // レシピが見つからない場合、新規作成モードに切り替え
        console.warn(`レシピID: ${id} が見つかりません。新規作成モードで開きます。`);
        navigate('/recipes/new');
      }
    } catch (error) {
      console.error('レシピデータの取得エラー:', error);
      setError('レシピデータの読み込みに失敗しました');
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
  
  // 新しい材料の入力処理
  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient({
      ...newIngredient,
      [name]: value
    });
  };
  
  // 材料の追加
  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && newIngredient.unit) {
      const newIngredientWithId = {
        ...newIngredient,
        id: Date.now(), // 一時的なID
        cost: newIngredient.cost ? parseFloat(newIngredient.cost) : 0,
        quantity: parseFloat(newIngredient.quantity)
      };
      
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredientWithId]
      });
      
      // 入力フィールドをリセット
      setNewIngredient({
        name: '',
        quantity: '',
        unit: '',
        cost: ''
      });
    }
  };
  
  // 材料の削除
  const handleDeleteIngredient = (id) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ingredient => ingredient.id !== id)
    });
  };
  
  // 新しい手順の入力処理
  const handleStepChange = (e) => {
    const { name, value } = e.target;
    setNewStep({
      ...newStep,
      [name]: value
    });
  };
  
  // 手順の画像アップロード処理
  const handleStepImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStep({
          ...newStep,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 手順の追加
  const handleAddStep = () => {
    if (newStep.description) {
      const newStepWithId = {
        ...newStep,
        id: formData.steps.length + 1,
        time: newStep.time ? parseInt(newStep.time) : null
      };
      
      setFormData({
        ...formData,
        steps: [...formData.steps, newStepWithId]
      });
      
      // 入力フィールドをリセット
      setNewStep({
        description: '',
        image: null,
        imagePreview: null,
        time: ''
      });
    }
  };
  
  // 手順の削除
  const handleDeleteStep = (id) => {
    const updatedSteps = formData.steps
      .filter(step => step.id !== id)
      .map((step, index) => ({
        ...step,
        id: index + 1
      }));
    
    setFormData({
      ...formData,
      steps: updatedSteps
    });
  };
  
  // タグの入力処理
  const handleTagChange = (e) => {
    setNewTag(e.target.value);
  };
  
  // タグの追加
  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      });
      setNewTag('');
    }
  };
  
  // タグの削除
  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToDelete)
    });
  };
  
  // フォーム送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション - 名前と説明のみを必須にする
    if (!formData.name || !formData.description) {
      setAlert({
        open: true,
        message: 'レシピ名と説明は必須項目です',
        severity: 'error'
      });
      return;
    }
    
    try {
      // ローカルストレージにレシピを保存
      const allRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      
      // 現在の日時を取得
      const now = new Date().toISOString();
      let savedRecipe;
      
      if (isEditMode) {
        // 編集モード: 既存レシピの更新
        const recipeIndex = allRecipes.findIndex(r => r.id === id);
        
        if (recipeIndex >= 0) {
          // 更新情報を追加
          const updatedRecipe = {
            ...formData,
            updated_at: now
          };
          
          allRecipes[recipeIndex] = updatedRecipe;
          savedRecipe = updatedRecipe;
        }
      } else {
        // 新規作成モード: 新しいレシピを作成
        const newRecipe = {
          ...formData,
          id: `recipe-${Date.now()}`,
          created_at: now,
          updated_at: now
        };
        
        allRecipes.push(newRecipe);
        savedRecipe = newRecipe;
      }
      
      // ローカルストレージに保存
      localStorage.setItem('recipes', JSON.stringify(allRecipes));
      
      // 成功メッセージを表示
      setAlert({
        open: true,
        message: isEditMode ? 'レシピが更新されました' : 'レシピが作成されました',
        severity: 'success'
      });
      
      // 少し待ってからリダイレクト
      setTimeout(() => {
        navigate('/recipes');
      }, 1500);
    } catch (error) {
      setAlert({
        open: true,
        message: isEditMode ? 'レシピの更新に失敗しました' : 'レシピの作成に失敗しました',
        severity: 'error'
      });
    }
  };
  
  // 前のページに戻る
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // アラートを閉じる
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };
  
  // 材料の総コストを計算
  const calculateTotalCost = () => {
    return formData.ingredients.reduce((total, ingredient) => total + (ingredient.cost || 0), 0);
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
          {id === 'new' || !isEditMode ? '新しいレシピ' : 'レシピを編集'}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
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
                label="レシピ名"
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
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="下準備時間（分）"
                name="preparationTime"
                type="number"
                value={formData.preparationTime}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">分</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="調理時間（分）"
                name="cookingTime"
                type="number"
                value={formData.cookingTime}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">分</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>難易度</InputLabel>
                <Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  label="難易度"
                >
                  <MenuItem value="easy">簡単</MenuItem>
                  <MenuItem value="medium">普通</MenuItem>
                  <MenuItem value="hard">難しい</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="人数"
                name="servings"
                type="number"
                value={formData.servings}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">人前</InputAdornment>,
                }}
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="販売価格"
                name="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
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
                    alt="レシピ画像プレビュー" 
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
        
        {/* 材料 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            材料 ({formData.servings}人前)
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="材料名"
                name="name"
                value={newIngredient.name}
                onChange={handleIngredientChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={6} sm={2}>
              <TextField
                label="数量"
                name="quantity"
                type="number"
                value={newIngredient.quantity}
                onChange={handleIngredientChange}
                fullWidth
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={6} sm={2}>
              <TextField
                label="単位"
                name="unit"
                value={newIngredient.unit}
                onChange={handleIngredientChange}
                fullWidth
                placeholder="g, 個, ml等"
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                label="コスト"
                name="cost"
                type="number"
                value={newIngredient.cost}
                onChange={handleIngredientChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddIngredient}
                disabled={!newIngredient.name || !newIngredient.quantity || !newIngredient.unit}
                sx={{ height: '100%' }}
              >
                追加
              </Button>
            </Grid>
          </Grid>
          
          <List>
            {formData.ingredients.map((ingredient, index) => (
              <div key={ingredient.id}>
                <ListItem>
                  <ListItemText
                    primary={ingredient.name}
                    secondary={`${ingredient.quantity} ${ingredient.unit} - ¥${ingredient.cost.toLocaleString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteIngredient(ingredient.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < formData.ingredients.length - 1 && <Divider />}
              </div>
            ))}
          </List>
          
          {formData.ingredients.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="subtitle1">
                材料費合計: ¥{calculateTotalCost().toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {formData.ingredients.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              材料がまだ追加されていません
            </Typography>
          )}
        </Paper>
        
        {/* 調理手順 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            調理手順
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="手順の説明"
                name="description"
                value={newStep.description}
                onChange={handleStepChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={6} sm={2}>
              <TextField
                label="所要時間（分）"
                name="time"
                type="number"
                value={newStep.time}
                onChange={handleStepChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={6} sm={2}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: '100%' }}
              >
                画像
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleStepImageUpload}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddStep}
                disabled={!newStep.description}
                sx={{ height: '100%' }}
              >
                追加
              </Button>
            </Grid>
            
            {newStep.imagePreview && (
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <img 
                    src={newStep.imagePreview} 
                    alt="手順画像プレビュー" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '150px',
                      borderRadius: '4px',
                      objectFit: 'cover'
                    }} 
                  />
                </Box>
              </Grid>
            )}
          </Grid>
          
          <List>
            {formData.steps.map((step, index) => (
              <div key={step.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ 
                      minWidth: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main', 
                      color: 'white', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      mr: 2
                    }}>
                      {step.id}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        {step.description}
                      </Typography>
                      {step.time && (
                        <Typography variant="body2" color="text.secondary">
                          所要時間: 約{step.time}分
                        </Typography>
                      )}
                      {step.imagePreview && (
                        <Box sx={{ mt: 1 }}>
                          <img 
                            src={step.imagePreview} 
                            alt={`手順 ${step.id}`} 
                            style={{ 
                              maxWidth: '200px', 
                              maxHeight: '150px',
                              borderRadius: '4px',
                              objectFit: 'cover'
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteStep(step.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < formData.steps.length - 1 && <Divider />}
              </div>
            ))}
          </List>
          
          {formData.steps.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              調理手順がまだ追加されていません
            </Typography>
          )}
        </Paper>
        
        {/* タグ */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            タグ
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={10}>
              <TextField
                label="タグ"
                value={newTag}
                onChange={handleTagChange}
                fullWidth
                placeholder="例: 丼物, 魚介, 人気"
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddTag}
                disabled={!newTag}
                sx={{ height: '100%' }}
              >
                追加
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
              />
            ))}
            
            {formData.tags.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                タグがまだ追加されていません
              </Typography>
            )}
          </Box>
        </Paper>
        
        {/* 備考 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            備考
          </Typography>
          
          <TextField
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            placeholder="調理のコツや注意点などを記入してください"
          />
        </Paper>
        
        {/* 送信ボタン */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
          >
            {id === 'new' || !isEditMode ? 'レシピを作成' : 'レシピを更新'}
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

export default RecipeForm;
