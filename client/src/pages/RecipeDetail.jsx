import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  RestaurantMenu as DifficultyIcon,
  ExpandMore as ExpandMoreIcon,
  LocalDining as ServingsIcon,
  AttachMoney as CostIcon,
  History as HistoryIcon,
  Restaurant as MenuIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 状態管理
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkedMenuItems, setLinkedMenuItems] = useState([]);
  
  // レシピデータの取得
  useEffect(() => {
    // 実際のアプリでは、APIからレシピデータを取得
    // const fetchRecipe = async () => {
    //   try {
    //     const data = await recipeApi.getRecipeById(id);
    //     setRecipe(data);
    //   } catch (error) {
    //     setError('レシピの取得に失敗しました');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchRecipe();
    
    // モックデータを使用
    setTimeout(() => {
      const mockRecipe = {
        id: 1,
        name: '海鮮丼',
        image: 'https://source.unsplash.com/random/800x600/?sushi',
        preparationTime: 20,
        cookingTime: 10,
        difficulty: 'medium',
        servings: 2,
        description: '新鮮な魚介をふんだんに使った海鮮丼です。サーモン、マグロ、イクラなどの海の幸を贅沢に盛り付けました。わさびと醤油で味わう本格的な一品です。',
        ingredients: [
          { id: 1, name: '米', quantity: 2, unit: '合', cost: 200 },
          { id: 2, name: 'マグロ', quantity: 100, unit: 'g', cost: 500 },
          { id: 3, name: 'サーモン', quantity: 100, unit: 'g', cost: 400 },
          { id: 4, name: 'イクラ', quantity: 50, unit: 'g', cost: 300 },
          { id: 5, name: 'わさび', quantity: 10, unit: 'g', cost: 50 },
          { id: 6, name: '醤油', quantity: 30, unit: 'ml', cost: 30 },
          { id: 7, name: '海苔', quantity: 2, unit: '枚', cost: 20 }
        ],
        steps: [
          { 
            id: 1, 
            description: '米を研いで炊飯器で炊く。炊き上がったら寿司酢を混ぜて寿司飯を作る。', 
            image: null,
            time: 30
          },
          { 
            id: 2, 
            description: 'マグロとサーモンを適切な大きさに切る。新鮮な魚を使用し、切り方は均一にする。', 
            image: 'https://source.unsplash.com/random/300x200/?fish',
            time: 10
          },
          { 
            id: 3, 
            description: 'ご飯をどんぶりに盛り、その上に切った魚とイクラを彩りよく盛り付ける。', 
            image: 'https://source.unsplash.com/random/300x200/?sushi',
            time: 5
          },
          { 
            id: 4, 
            description: '海苔を適当な大きさに切り、丼の側面に立てる。わさびを添えて完成。', 
            image: 'https://source.unsplash.com/random/300x200/?sushi-bowl',
            time: 5
          }
        ],
        cost: 1500,
        sellingPrice: 2800,
        profit: 1300,
        profitMargin: 46.4,
        createdAt: '2023-04-10T10:30:00',
        updatedAt: '2023-04-15T14:45:00',
        version: 2,
        tags: ['丼物', '魚介', '人気'],
        versionHistory: [
          { 
            version: 1, 
            updatedAt: '2023-04-10T10:30:00', 
            changes: '初回作成' 
          },
          { 
            version: 2, 
            updatedAt: '2023-04-15T14:45:00', 
            changes: 'イクラの量を増やし、海苔を追加。調理手順を詳細化。' 
          }
        ],
        notes: '・魚は新鮮なものを使用すること\n・提供直前に盛り付けること\n・わさびは別添えにすることも可能'
      };
      
      setRecipe(mockRecipe);
      
      // 関連するメニュー項目を取得（実際のアプリではAPIから取得）
      const mockLinkedMenuItems = [
        {
          id: 1,
          name: '海鮮丼',
          price: 1800,
          categoryName: '主菜',
          isAvailable: true
        }
      ];
      
      setLinkedMenuItems(mockLinkedMenuItems);
      setLoading(false);
    }, 500);
  }, [id]);
  
  // 前のページに戻る
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // レシピ編集ページへの遷移
  const handleEditRecipe = () => {
    navigate(`/recipes/edit/${id}`);
  };
  
  // 削除ダイアログを開く
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  // レシピを削除
  const handleDeleteRecipe = () => {
    // 実際のアプリでは、APIを呼び出してレシピを削除
    // await recipeApi.deleteRecipe(id);
    
    setDeleteDialogOpen(false);
    navigate('/recipes');
  };
  
  // バージョン履歴ダイアログを開く
  const handleVersionHistoryClick = () => {
    setVersionHistoryOpen(true);
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
  
  // 材料の総コストを計算
  const getTotalIngredientCost = (ingredients) => {
    return ingredients.reduce((total, ingredient) => total + ingredient.cost, 0);
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
  
  if (!recipe) {
    return (
      <Container className="content-container">
        <Typography>レシピが見つかりませんでした</Typography>
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
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          戻る
        </Button>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={handleEditRecipe}
            sx={{ mr: 1 }}
          >
            編集
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            削除
          </Button>
        </Box>
      </Box>
      
      {/* レシピ概要 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {recipe.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {recipe.description}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  調理時間: {getTotalTime(recipe.preparationTime, recipe.cookingTime)}分
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DifficultyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  難易度: 
                  <Chip 
                    label={getDifficultyText(recipe.difficulty)} 
                    color={getDifficultyColor(recipe.difficulty)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ServingsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  人数: {recipe.servings}人前
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {recipe.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                バージョン: {recipe.version} (最終更新: {new Date(recipe.updatedAt).toLocaleDateString()})
              </Typography>
              <Button 
                size="small" 
                onClick={handleVersionHistoryClick}
                sx={{ ml: 1 }}
              >
                履歴を表示
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={recipe.image}
                alt={recipe.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* コスト計算 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          コスト計算
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  原価
                </Typography>
                <Typography variant="h5" component="div">
                  ¥{recipe.cost.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  販売価格
                </Typography>
                <Typography variant="h5" component="div">
                  ¥{recipe.sellingPrice.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  利益
                </Typography>
                <Typography variant="h5" component="div">
                  ¥{recipe.profit.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  利益率
                </Typography>
                <Typography variant="h5" component="div">
                  {recipe.profitMargin.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 材料リスト */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          材料 ({recipe.servings}人前)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>材料名</TableCell>
                <TableCell align="right">数量</TableCell>
                <TableCell align="right">単位</TableCell>
                <TableCell align="right">コスト</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipe.ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell align="right">{ingredient.quantity}</TableCell>
                  <TableCell align="right">{ingredient.unit}</TableCell>
                  <TableCell align="right">¥{ingredient.cost.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                  合計
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ¥{getTotalIngredientCost(recipe.ingredients).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* 調理手順 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          調理手順
        </Typography>
        <Stepper orientation="vertical">
          {recipe.steps.map((step) => (
            <Step key={step.id} active={true}>
              <StepLabel>
                <Typography variant="subtitle1">
                  手順 {step.id}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography paragraph>
                  {step.description}
                </Typography>
                {step.time && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    所要時間: 約{step.time}分
                  </Typography>
                )}
                {step.image && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <img 
                      src={step.image} 
                      alt={`手順 ${step.id}`} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }} 
                    />
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {/* 備考 */}
      {recipe.notes && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            備考
          </Typography>
          <Typography 
            variant="body1" 
            component="pre" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit'
            }}
          >
            {recipe.notes}
          </Typography>
        </Paper>
      )}
      
      {/* メニュー連携情報 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuIcon sx={{ mr: 1 }} />
          メニュー連携
        </Typography>
        
        {linkedMenuItems.length > 0 ? (
          <>
            <Typography variant="body2" paragraph>
              このレシピは以下のメニュー項目に使用されています：
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>メニュー名</TableCell>
                    <TableCell>カテゴリ</TableCell>
                    <TableCell align="right">価格</TableCell>
                    <TableCell align="center">提供状況</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {linkedMenuItems.map((menuItem) => (
                    <TableRow key={menuItem.id}>
                      <TableCell>{menuItem.name}</TableCell>
                      <TableCell>{menuItem.categoryName}</TableCell>
                      <TableCell align="right">¥{menuItem.price.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={menuItem.isAvailable ? '提供中' : '提供停止中'} 
                          color={menuItem.isAvailable ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          component={Link} 
                          to={`/menu/edit/${menuItem.id}`}
                          size="small"
                          startIcon={<EditIcon />}
                        >
                          編集
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              このレシピはまだメニューに登録されていません
            </Typography>
            <Button 
              variant="contained" 
              component={Link}
              to="/menu/new"
              startIcon={<LinkIcon />}
              sx={{ mt: 1 }}
            >
              メニューに登録する
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* バージョン履歴ダイアログ */}
      <Dialog
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>バージョン履歴</DialogTitle>
        <DialogContent>
          <List>
            {recipe.versionHistory.map((version, index) => (
              <div key={version.version}>
                <ListItem>
                  <ListItemText
                    primary={`バージョン ${version.version}`}
                    secondary={`${new Date(version.updatedAt).toLocaleString()} - ${version.changes}`}
                  />
                </ListItem>
                {index < recipe.versionHistory.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionHistoryOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>レシピの削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{recipe.name}」を削除してもよろしいですか？この操作は元に戻せません。
          </Typography>
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
    </Container>
  );
};

export default RecipeDetail;
