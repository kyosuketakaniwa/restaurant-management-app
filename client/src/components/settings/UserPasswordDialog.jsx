import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Alert,
  FormControl, InputAdornment, IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { getUserById } from '../../utils/userUtils';

/**
 * ユーザーパスワードリセットダイアログ
 */
const UserPasswordDialog = ({ open, onClose, onSave, userId }) => {
  // 状態管理
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // ユーザー情報取得
  const user = userId ? getUserById(userId) : null;
  
  // 入力変更ハンドラー
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    validateInput('newPassword', e.target.value);
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    validateInput('confirmPassword', e.target.value);
  };
  
  // パスワード表示切り替え
  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // 入力検証
  const validateInput = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'newPassword':
        if (!value || value.trim() === '') {
          newErrors.newPassword = 'パスワードは必須です';
        } else if (value.length < 6) {
          newErrors.newPassword = 'パスワードは6文字以上必要です';
        } else {
          delete newErrors.newPassword;
        }
        
        // 確認用パスワードとの一致チェック
        if (confirmPassword && value !== confirmPassword) {
          newErrors.confirmPassword = 'パスワードが一致しません';
        } else if (confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (!value || value.trim() === '') {
          newErrors.confirmPassword = '確認用パスワードは必須です';
        } else if (value !== newPassword) {
          newErrors.confirmPassword = 'パスワードが一致しません';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };
  
  // フォーム全体の検証
  const validateForm = () => {
    const newErrors = {};
    
    if (!newPassword || newPassword.trim() === '') {
      newErrors.newPassword = 'パスワードは必須です';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'パスワードは6文字以上必要です';
    }
    
    if (!confirmPassword || confirmPassword.trim() === '') {
      newErrors.confirmPassword = '確認用パスワードは必須です';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // 保存ハンドラー
  const handleSave = () => {
    if (validateForm()) {
      onSave(userId, newPassword);
      resetForm();
    }
  };
  
  // フォームリセット
  const resetForm = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };
  
  // ダイアログが閉じられたときにフォームをリセット
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        パスワードリセット
      </DialogTitle>
      
      <DialogContent dividers>
        {user && (
          <Box mb={3}>
            <Typography variant="subtitle1">
              {user.lastName} {user.firstName} ({user.username}) のパスワードをリセットします
            </Typography>
          </Box>
        )}
        
        <Alert severity="info" sx={{ mb: 3 }}>
          新しいパスワードは6文字以上で設定してください。セキュリティ向上のために、大文字、小文字、数字、特殊文字を組み合わせることをお勧めします。
        </Alert>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="新しいパスワード"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handleNewPasswordChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </FormControl>
        
        <FormControl fullWidth>
          <TextField
            label="パスワード確認"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleShowConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </FormControl>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!newPassword || !confirmPassword || Object.keys(errors).length > 0}
        >
          パスワード変更
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPasswordDialog;
