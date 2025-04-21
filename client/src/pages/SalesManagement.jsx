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
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { mockData } from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.jsの登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesManagement = () => {
  // 状態管理
  const [sales, setSales] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [salesData, setSalesData] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'cash',
    category: 'food',
    note: ''
  });

  // データ取得
  useEffect(() => {
    fetchSales();
    fetchSalesData();
  }, [salesPeriod]);

  // 売上データの取得
  const fetchSales = async () => {
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await salesApi.getSales();
      
      // モックデータを使用
      const mockSales = [
        { id: 1, date: '2023-04-16', amount: 25000, payment_method: 'cash', category: 'food', note: 'ランチタイム' },
        { id: 2, date: '2023-04-16', amount: 18000, payment_method: 'credit_card', category: 'food', note: 'ディナータイム' },
        { id: 3, date: '2023-04-16', amount: 5000, payment_method: 'qr_code', category: 'beverage', note: '飲み物のみ' },
        { id: 4, date: '2023-04-15', amount: 22000, payment_method: 'cash', category: 'food', note: 'ランチタイム' },
        { id: 5, date: '2023-04-15', amount: 30000, payment_method: 'credit_card', category: 'food', note: 'ディナータイム' },
        { id: 6, date: '2023-04-15', amount: 8000, payment_method: 'electronic_money', category: 'beverage', note: '飲み物のみ' },
        { id: 7, date: '2023-04-14', amount: 20000, payment_method: 'cash', category: 'food', note: 'ランチタイム' },
        { id: 8, date: '2023-04-14', amount: 28000, payment_method: 'credit_card', category: 'food', note: 'ディナータイム' },
        { id: 9, date: '2023-04-14', amount: 7000, payment_method: 'qr_code', category: 'beverage', note: '飲み物のみ' },
        { id: 10, date: '2023-04-13', amount: 23000, payment_method: 'cash', category: 'food', note: 'ランチタイム' },
        { id: 11, date: '2023-04-13', amount: 32000, payment_method: 'credit_card', category: 'food', note: 'ディナータイム' },
        { id: 12, date: '2023-04-13', amount: 6000, payment_method: 'electronic_money', category: 'beverage', note: '飲み物のみ' }
      ];
      
      setSales(mockSales);
    } catch (error) {
      showAlert('売上データの取得に失敗しました', 'error');
    }
  };

  // 売上グラフデータの取得
  const fetchSalesData = async () => {
    try {
      // 実際のAPIが実装されるまでモックデータを使用
      // const data = await salesApi.getSalesData(salesPeriod);
      
      // モックデータを使用
      const data = mockData.salesData[salesPeriod];
      setSalesData(data);
    } catch (error) {
      showAlert('売上グラフデータの取得に失敗しました', 'error');
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

  // フォーム送信の処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        // 売上データを更新
        // await salesApi.updateSale(formData);
        
        // モック更新処理
        const updatedSales = sales.map(sale => 
          sale.id === formData.id ? formData : sale
        );
        setSales(updatedSales);
        
        showAlert('売上データが正常に更新されました', 'success');
      } else {
        // 新しい売上データを追加
        // await salesApi.addSale(formData);
        
        // モック追加処理
        const newSale = {
          ...formData,
          id: Math.max(...sales.map(sale => sale.id), 0) + 1
        };
        setSales([newSale, ...sales]);
        
        showAlert('売上データが正常に追加されました', 'success');
      }
      
      // フォームをリセット
      resetForm();
    } catch (error) {
      showAlert(
        editMode 
          ? '売上データの更新に失敗しました' 
          : '売上データの追加に失敗しました', 
        'error'
      );
    }
  };

  // 編集モードを開始
  const handleEdit = (sale) => {
    setFormData({
      id: sale.id,
      date: sale.date,
      amount: sale.amount.toString(),
      payment_method: sale.payment_method,
      category: sale.category,
      note: sale.note || ''
    });
    setEditMode(true);
    setFormOpen(true);
  };

  // 削除ダイアログを開く
  const handleDeleteClick = (sale) => {
    setSelectedSale(sale);
    setDeleteDialogOpen(true);
  };

  // 売上データを削除
  const handleDelete = async () => {
    try {
      // await salesApi.deleteSale(selectedSale.id);
      
      // モック削除処理
      const filteredSales = sales.filter(sale => sale.id !== selectedSale.id);
      setSales(filteredSales);
      
      showAlert('売上データが正常に削除されました', 'success');
    } catch (error) {
      showAlert('売上データの削除に失敗しました', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSale(null);
    }
  };

  // フォームのリセット
  const resetForm = () => {
    setFormData({
      id: null,
      date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_method: 'cash',
      category: 'food',
      note: ''
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

  // 期間の変更ハンドラ
  const handlePeriodChange = (event) => {
    setSalesPeriod(event.target.value);
  };

  // 支払い方法のテキストを取得
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return '現金';
      case 'credit_card':
        return 'クレジットカード';
      case 'electronic_money':
        return '電子マネー';
      case 'qr_code':
        return 'QRコード決済';
      default:
        return method;
    }
  };

  // カテゴリのテキストを取得
  const getCategoryText = (category) => {
    switch (category) {
      case 'food':
        return '料理';
      case 'beverage':
        return '飲料';
      case 'takeout':
        return 'テイクアウト';
      case 'delivery':
        return 'デリバリー';
      case 'other':
        return 'その他';
      default:
        return category;
    }
  };

  // 売上グラフのオプション
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `¥${value.toLocaleString()}`,
        },
      },
    },
  };

  // 売上グラフのデータ
  const chartData = {
    labels: salesData.map(item => item.date),
    datasets: [
      {
        label: '売上',
        data: salesData.map(item => item.sales),
        borderColor: '#4a6da7',
        backgroundColor: 'rgba(74, 109, 167, 0.5)',
        tension: 0.3,
      },
    ],
  };

  return (
    <Container className="content-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          売上管理
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
        >
          売上を追加
        </Button>
      </Box>

      {/* 売上グラフ */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            売上推移
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>期間</InputLabel>
            <Select
              value={salesPeriod}
              label="期間"
              onChange={handlePeriodChange}
            >
              <MenuItem value="daily">日次</MenuItem>
              <MenuItem value="weekly">週次</MenuItem>
              <MenuItem value="monthly">月次</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 300 }}>
          <Line options={chartOptions} data={chartData} />
        </Box>
      </Paper>

      {formOpen && (
        <Paper className="form-container" sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {editMode ? '売上データを編集' : '売上データを追加'}
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
                  <InputLabel>支払い方法</InputLabel>
                  <Select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                  >
                    <MenuItem value="cash">現金</MenuItem>
                    <MenuItem value="credit_card">クレジットカード</MenuItem>
                    <MenuItem value="electronic_money">電子マネー</MenuItem>
                    <MenuItem value="qr_code">QRコード決済</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>カテゴリ</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <MenuItem value="food">料理</MenuItem>
                    <MenuItem value="beverage">飲料</MenuItem>
                    <MenuItem value="takeout">テイクアウト</MenuItem>
                    <MenuItem value="delivery">デリバリー</MenuItem>
                    <MenuItem value="other">その他</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="備考"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                />
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
              <TableCell align="right">金額</TableCell>
              <TableCell>支払い方法</TableCell>
              <TableCell>備考</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>{getCategoryText(sale.category)}</TableCell>
                  <TableCell align="right">¥{sale.amount.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentMethodText(sale.payment_method)}</TableCell>
                  <TableCell>{sale.note}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEdit(sale)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(sale)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sales.length}
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
        <DialogTitle>売上データの削除</DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Typography>
              {selectedSale.date}の売上データ（¥{selectedSale.amount.toLocaleString()}）を削除してもよろしいですか？
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

export default SalesManagement;
