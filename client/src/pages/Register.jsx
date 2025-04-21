import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI状態
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // フォーム入力の処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // パスワード表示の切り替え
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // 確認用パスワード表示の切り替え
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // フォーム送信の処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードと確認用パスワードが一致しません');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('パスワードは6文字以上である必要があります');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // 開発用のモック登録
      // 実際のAPIが実装されたら、以下のコメントを解除
      // await register(formData);
      
      // モック登録処理（開発用）
      localStorage.setItem('token', 'mock-token');
      
      // ダッシュボードにリダイレクト
      navigate('/');
    } catch (error) {
      console.error('登録エラー:', error);
      setError('登録に失敗しました。入力内容を確認してください。');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
        アカウント登録
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="名前"
        name="name"
        autoComplete="name"
        autoFocus
        value={formData.name}
        onChange={handleChange}
        disabled={loading}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="メールアドレス"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="パスワード"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="パスワード（確認）"
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={handleToggleConfirmPasswordVisibility}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : '登録'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          既にアカウントをお持ちの場合は{' '}
          <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
            こちら
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
