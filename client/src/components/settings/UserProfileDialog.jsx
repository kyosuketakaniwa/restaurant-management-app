import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Box, Typography
} from '@mui/material';
import { getUserById } from '../../utils/userUtils';

/**
 * ユーザープロファイル編集ダイアログ
 */
const UserProfileDialog = ({ open, onClose, onSave, userId }) => {
  // 初期値となる空のユーザーデータ
  const emptyUserData = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    hireDate: '',
    position: '',
    department: ''
  };
  
  // 状態管理
  const [userData, setUserData] = useState(emptyUserData);
  const [errors, setErrors] = useState({});
  const [isNewUser, setIsNewUser] = useState(true);

  // ユーザーIDが変更されたらデータをロード
  useEffect(() => {
    if (open) {
      if (userId) {
        // 既存ユーザーの編集
        const user = getUserById(userId);
        if (user) {
          setUserData({
            id: user.id,
            username: user.username,
            password: '', // 編集時はパスワードフィールドは空にする
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            emergencyContact: user.emergencyContact || '',
            hireDate: user.hireDate || '',
            position: user.position || '',
            department: user.department || ''
          });
          setIsNewUser(false);
        }
      } else {
        // 新規ユーザー作成
        setUserData({
          ...emptyUserData,
          hireDate: new Date().toISOString().substring(0, 10) // 今日の日付をデフォルトに
        });
        setIsNewUser(true);
      }
      
      // エラーをクリア
      setErrors({});
    }
  }, [userId, open]);

  // 入力変更ハンドラー
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 入力があればエラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // フォームの検証
  const validateForm = () => {
    const newErrors = {};
    
    // ユーザー名は必須
    if (!userData.username || userData.username.trim() === '') {
      newErrors.username = 'ユーザー名は必須です';
    }
    
    // 新規ユーザーの場合、パスワードは必須
    if (isNewUser && (!userData.password || userData.password.trim() === '')) {
      newErrors.password = 'パスワードは必須です';
    }
    
    // パスワードの長さチェック
    if (userData.password && userData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上にしてください';
    }
    
    // 名前のバリデーション
    if (!userData.lastName || userData.lastName.trim() === '') {
      newErrors.lastName = '姓は必須です';
    }
    
    if (!userData.firstName || userData.firstName.trim() === '') {
      newErrors.firstName = '名は必須です';
    }
    
    // メールアドレスの形式チェック
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    // 電話番号の形式チェック
    if (userData.phone && !/^[0-9\-\(\)]+$/.test(userData.phone)) {
      newErrors.phone = '有効な電話番号を入力してください';
    }
    
    setErrors(newErrors);
    
    // エラーがなければtrue、あればfalseを返す
    return Object.keys(newErrors).length === 0;
  };

  // 保存ハンドラー
  const handleSave = () => {
    if (validateForm()) {
      onSave(userData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {isNewUser ? '新規ユーザー登録' : 'ユーザー情報の編集'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              アカウント情報
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="username"
              label="ユーザー名"
              value={userData.username}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.username}
              helperText={errors.username}
              disabled={!isNewUser} // 既存ユーザーのユーザー名は変更不可
            />
          </Grid>
          
          {isNewUser && (
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="パスワード"
                type="password"
                value={userData.password}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password || '6文字以上の安全なパスワードを設定してください'}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
              個人情報
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="lastName"
              label="姓"
              value={userData.lastName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              label="名"
              value={userData.firstName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="メールアドレス"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="phone"
              label="電話番号"
              value={userData.phone}
              onChange={handleInputChange}
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="emergencyContact"
              label="緊急連絡先"
              value={userData.emergencyContact}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="hireDate"
              label="入社日"
              type="date"
              value={userData.hireDate}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
              職務情報
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="position"
              label="役職"
              value={userData.position}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="department"
              label="部署"
              value={userData.department}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          キャンセル
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileDialog;
