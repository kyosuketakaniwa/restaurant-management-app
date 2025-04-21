import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { mockData } from '../services/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.jsの登録
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseManagement = () => {
  // 状態管理
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category_id: '',
    payment_method: 'cash',
    description: '',
    receipt_image: null,
    receipt_image_preview: null,
    vendor: '',
    status: 'pending'
  });

  // データ取得
  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  // 経費データの取得
  const fetchExpenses = async () => {
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await expensesApi.getExpenses();
      
      // モックデータを使用
      const mockExpenses = [
        { 
          id: 1, 
          date: '2023-04-16', 
          amount: 15000, 
          category_id: 1, 
          category_name: '食材', 
          payment_method: 'cash', 
          description: '野菜・肉類の仕入れ', 
          receipt_image: 'receipt1.jpg', 
          vendor: '〇〇市場',
          status: 'approved'
        },
        { 
          id: 2, 
          date: '2023-04-15', 
          amount: 8000, 
          category_id: 2, 
          category_name: '備品', 
          payment_method: 'credit_card', 
          description: '調理器具の購入', 
          receipt_image: 'receipt2.jpg', 
          vendor: '厨房用品店',
          status: 'approved'
        },
        { 
          id: 3, 
          date: '2023-04-14', 
          amount: 5000, 
          category_id: 3, 
          category_name: '水道光熱費', 
          payment_method: 'bank_transfer', 
          description: '電気代', 
          receipt_image: null, 
          vendor: '電力会社',
          status: 'pending'
        },
        { 
          id: 4, 
          date: '2023-04-13', 
          amount: 3000, 
          category_id: 4, 
          category_name: '消耗品', 
          payment_method: 'cash', 
          description: '洗剤・タオルなど', 
          receipt_image: 'receipt4.jpg', 
          vendor: 'ドラッグストア',
          status: 'approved'
        },
        { 
          id: 5, 
          date: '2023-04-12', 
          amount: 12000, 
          category_id: 1, 
          category_name: '食材', 
          payment_method: 'cash', 
          description: '魚介類の仕入れ', 
          receipt_image: 'receipt5.jpg', 
          vendor: '海鮮市場',
          status: 'approved'
        },
        { 
          id: 6, 
          date: '2023-04-11', 
          amount: 20000, 
          category_id: 5, 
          category_name: '家賃', 
          payment_method: 'bank_transfer', 
          description: '店舗家賃', 
          receipt_image: null, 
          vendor: '不動産会社',
          status: 'approved'
        },
        { 
          id: 7, 
          date: '2023-04-10', 
          amount: 7000, 
          category_id: 6, 
          category_name: '広告宣伝費', 
          payment_method: 'credit_card', 
          description: 'チラシ印刷', 
          receipt_image: 'receipt7.jpg', 
          vendor: '印刷会社',
          status: 'rejected'
        }
      ];
      
      setExpenses(mockExpenses);
    } catch (error) {
      showAlert('経費データの取得に失敗しました', 'error');
    }
  };

  // カテゴリデータの取得
  const fetchCategories = async () => {
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await expensesApi.getCategories();
      
      // モックデータを使用
      const mockCategories = [
        { id: 1, name: '食材' },
        { id: 2, name: '備品' },
        { id: 3, name: '水道光熱費' },
        { id: 4, name: '消耗品' },
        { id: 5, name: '家賃' },
        { id: 6, name: '広告宣伝費' },
        { id: 7, name: '人件費' },
        { id: 8, name: '保険料' },
        { id: 9, name: 'その他' }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      showAlert('カテゴリデータの取得に失敗しました', 'error');
    }
  };

  // フォーム入力の処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ファイル入力の処理
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          receipt_image: file,
          receipt_image_preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // フォーム送信の処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        // 経費データを更新
        // await expensesApi.updateExpense(formData);
        
        // モック更新処理
        const updatedExpenses = expenses.map(expense => {
          if (expense.id === formData.id) {
            const categoryObj = categories.find(cat => cat.id === parseInt(formData.category_id));
            return {
              ...formData,
              category_name: categoryObj ? categoryObj.name : '',
              amount: parseFloat(formData.amount)
            };
          }
          return expense;
        });
        setExpenses(updatedExpenses);
        
        showAlert('経費データが正常に更新されました', 'success');
      } else {
        // 新しい経費データを追加
        // await expensesApi.addExpense(formData);
        
        // モック追加処理
        const categoryObj = categories.find(cat => cat.id === parseInt(formData.category_id));
        const newExpense = {
          ...formData,
          id: Math.max(...expenses.map(expense => expense.id), 0) + 1,
          category_name: categoryObj ? categoryObj.name : '',
          amount: parseFloat(formData.amount)
        };
        setExpenses([newExpense, ...expenses]);
        
        showAlert('経費データが正常に追加されました', 'success');
      }
      
      // フォームをリセット
      resetForm();
    } catch (error) {
      showAlert(
        editMode 
          ? '経費データの更新に失敗しました' 
          : '経費データの追加に失敗しました', 
        'error'
      );
    }
  };

  // 編集モードを開始
  const handleEdit = (expense) => {
    setFormData({
      id: expense.id,
      date: expense.date,
      amount: expense.amount.toString(),
      category_id: expense.category_id.toString(),
      payment_method: expense.payment_method,
      description: expense.description || '',
      receipt_image: expense.receipt_image,
      receipt_image_preview: expense.receipt_image ? `/${expense.receipt_image}` : null,
      vendor: expense.vendor || '',
      status: expense.status
    });
    setEditMode(true);
    setFormOpen(true);
  };

  // 削除ダイアログを開く
  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  // 経費データを削除
  const handleDelete = async () => {
    try {
      // await expensesApi.deleteExpense(selectedExpense.id);
      
      // モック削除処理
      const filteredExpenses = expenses.filter(expense => expense.id !== selectedExpense.id);
      setExpenses(filteredExpenses);
      
      showAlert('経費データが正常に削除されました', 'success');
    } catch (error) {
      showAlert('経費データの削除に失敗しました', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  // 領収書プレビューを開く
  const handleReceiptPreview = (receipt) => {
    setSelectedReceipt(receipt);
    setReceiptPreviewOpen(true);
  };

  // フォームのリセット
  const resetForm = () => {
    setFormData({
      id: null,
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category_id: '',
      payment_method: 'cash',
      description: '',
      receipt_image: null,
      receipt_image_preview: null,
      vendor: '',
      status: 'pending'
    });
    setEditMode(false);
    setFormOpen(false);
  };

  // アラートの表示
  const showAlert = (message, severity) => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  // アラートを閉じる
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // ページネーションの処理
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 支払い方法のテキストを取得
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return '現金';
      case 'credit_card':
        return 'クレジットカード';
      case 'bank_transfer':
        return '銀行振込';
      case 'electronic_money':
        return '電子マネー';
      default:
        return method;
    }
  };

  // ステータスに基づいて色を決定
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // ステータスのテキストを取得
  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return '承認済み';
      case 'pending':
        return '保留中';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  // カテゴリ別の支出額を計算
  const getCategoryExpenses = () => {
    const categoryExpenses = {};
    
    categories.forEach(category => {
      categoryExpenses[category.name] = 0;
    });
    
    expenses.forEach(expense => {
      if (expense.status !== 'rejected') {
        if (categoryExpenses[expense.category_name] !== undefined) {
          categoryExpenses[expense.category_name] += expense.amount;
        } else {
          categoryExpenses[expense.category_name] = expense.amount;
        }
      }
    });
    
    return categoryExpenses;
  };

  // 円グラフのデータ
  const pieData = {
    labels: Object.keys(getCategoryExpenses()),
    datasets: [
      {
        data: Object.values(getCategoryExpenses()),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 円グラフのオプション
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ¥${value.toLocaleString()}`;
          }
        }
      }
    },
  };

  // 総支出額を計算
  const getTotalExpenses = () => {
    return expenses
      .filter(expense => expense.status !== 'rejected')
      .reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <Container className="content-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          経費管理
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
        >
          経費を追加
        </Button>
      </Box>

      {/* 経費サマリー */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              カテゴリ別支出
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={pieData} options={pieOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              経費サマリー
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                総支出額
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                ¥{getTotalExpenses().toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                経費件数
              </Typography>
              <Typography variant="h6" component="div">
                {expenses.length}件
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ステータス
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={`承認済み: ${expenses.filter(e => e.status === 'approved').length}件`} 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label={`保留中: ${expenses.filter(e => e.status === 'pending').length}件`} 
                  color="warning" 
                  size="small" 
                />
                <Chip 
                  label={`却下: ${expenses.filter(e => e.status === 'rejected').length}件`} 
                  color="error" 
                  size="small" 
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {formOpen && (
        <Paper className="form-container" sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {editMode ? '経費データを編集' : '経費データを追加'}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="日付"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="金額"
                  type="number"
                  name="amount"
                  value={formData.amount}
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
                <FormControl fullWidth required>
                  <InputLabel>カテゴリ</InputLabel>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
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
                <FormControl fullWidth required>
                  <InputLabel>支払い方法</InputLabel>
                  <Select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                  >
                    <MenuItem value="cash">現金</MenuItem>
                    <MenuItem value="credit_card">クレジットカード</MenuItem>
                    <MenuItem value="bank_transfer">銀行振込</MenuItem>
                    <MenuItem value="electronic_money">電子マネー</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="取引先"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <MenuItem value="pending">保留中</MenuItem>
                    <MenuItem value="approved">承認済み</MenuItem>
                    <MenuItem value="rejected">却下</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="説明"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                >
                  領収書をアップロード
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.receipt_image_preview && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      プレビュー:
                    </Typography>
                    <img 
                      src={formData.receipt_image_preview} 
                      alt="Receipt preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
            
            <Box className="form-actions">
              <Button 
                variant="outlined" 
                onClick={resetForm}
              >
                キャンセル
              </Button>
              <Button 
                variant="contained" 
                type="submit"
              >
                {editMode ? '更新する' : '追加する'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日付</TableCell>
              <TableCell>カテゴリ</TableCell>
              <TableCell>取引先</TableCell>
              <TableCell align="right">金額</TableCell>
              <TableCell>支払い方法</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>領収書</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.category_name}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell align="right">¥{expense.amount.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentMethodText(expense.payment_method)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(expense.status)} 
                      color={getStatusColor(expense.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {expense.receipt_image ? (
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleReceiptPreview(expense.receipt_image)}
                      >
                        <ReceiptIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        なし
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEdit(expense)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(expense)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={expenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="表示件数:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}–${to} / ${count !== -1 ? count : `${to}以上`}`
          }
        />
      </TableContainer>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>経費データの削除</DialogTitle>
        <DialogContent>
          {selectedExpense && (
            <Typography>
              {selectedExpense.date}の経費データ（¥{selectedExpense.amount.toLocaleString()}）を削除してもよろしいですか？
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDelete} color="error">
            削除する
          </Button>
        </DialogActions>
      </Dialog>

      {/* 領収書プレビューダイアログ */}
      <Dialog
        open={receiptPreviewOpen}
        onClose={() => setReceiptPreviewOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>領収書</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <img 
              src={`/${selectedReceipt}`} 
              alt="Receipt" 
              style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptPreviewOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>

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

export default ExpenseManagement;
