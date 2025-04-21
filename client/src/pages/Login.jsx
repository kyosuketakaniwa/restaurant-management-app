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

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // フォームの状態
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // UI状態
  const [showPassword, setShowPassword] = useState(false);
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
  
  // フォーム送信の処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // モックログイン処理（開発用）
      // 実際のAPIが実装されるまでのモック処理
      localStorage.setItem('token', 'mock-token');
      
      // モックユーザーデータ
      const mockUser = {
        id: '1',
        email: formData.email,
        name: 'テストユーザー',
        role: 'admin'
      };
      
      // 認証コンテキストを更新
      await login({
        user: mockUser,
        token: 'mock-token'
      });
      
      // ダッシュボードにリダイレクト
      navigate('/');
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
        ログイン
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
        id="email"
        label="メールアドレス"
        name="email"
        autoComplete="email"
        autoFocus
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
        autoComplete="current-password"
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
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'ログイン'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          アカウントをお持ちでない場合は{' '}
          <Link to="/register" style={{ textDecoration: 'none', color: 'primary.main' }}>
            こちら
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
