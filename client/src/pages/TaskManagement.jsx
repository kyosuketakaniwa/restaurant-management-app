import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  IconButton,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress,
  Alert,
  Badge,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Checkbox,
  Switch,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Loop as LoopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Today as TodayIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon,
  Done as DoneIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import moment from 'moment';
import { useTask } from '../contexts/TaskContext';
import { useStaff } from '../contexts/StaffContext';

// タスク作成・編集ダイアログ
const TaskFormDialog = ({ open, handleClose, task = null, staffList, onSubmit }) => {
  const initialTaskState = {
    title: '',
    description: '',
    assigneeId: '',
    dueDate: moment().format('YYYY-MM-DD'),
    priority: 'medium',
    recurring: false,
    recurringPattern: { type: 'weekly', days: [1] } // デフォルトは毎週月曜日
  };

  const [taskData, setTaskData] = useState(initialTaskState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      // 編集モードの場合、タスクデータをセット
      setTaskData({
        ...task,
        dueDate: moment(task.dueDate).format('YYYY-MM-DD')
      });
    } else {
      // 新規作成モードの場合、初期状態にリセット
      setTaskData(initialTaskState);
    }
  }, [task, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
    
    // エラー状態をクリア
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleRecurringChange = (e) => {
    const { checked } = e.target;
    setTaskData({ ...taskData, recurring: checked });
  };

  const handleRecurringPatternTypeChange = (e) => {
    const { value } = e.target;
    setTaskData({
      ...taskData,
      recurringPattern: {
        ...taskData.recurringPattern,
        type: value
      }
    });
  };

  const handleRecurringDayChange = (day) => {
    const currentDays = taskData.recurringPattern.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setTaskData({
      ...taskData,
      recurringPattern: {
        ...taskData.recurringPattern,
        days: newDays
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!taskData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    
    if (!taskData.assigneeId) {
      newErrors.assigneeId = '担当者は必須です';
    }
    
    if (!taskData.dueDate) {
      newErrors.dueDate = '期限は必須です';
    }
    
    if (taskData.recurring && 
        taskData.recurringPattern.type === 'weekly' && 
        (!taskData.recurringPattern.days || taskData.recurringPattern.days.length === 0)) {
      newErrors.recurringDays = '曜日を少なくとも1つ選択してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // フォームデータを送信
    onSubmit(taskData);
    handleClose();
  };

  const getDayName = (day) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[day];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {task ? 'タスクを編集' : '新規タスクを作成'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="タイトル"
                fullWidth
                value={taskData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="説明"
                fullWidth
                multiline
                rows={3}
                value={taskData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.assigneeId}>
                <InputLabel id="assignee-label">担当者</InputLabel>
                <Select
                  labelId="assignee-label"
                  name="assigneeId"
                  value={taskData.assigneeId}
                  label="担当者"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="" disabled>
                    <em>担当者を選択</em>
                  </MenuItem>
                  {staffList.map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.assigneeId && (
                  <Typography variant="caption" color="error">
                    {errors.assigneeId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueDate"
                label="期限日"
                type="date"
                fullWidth
                value={taskData.dueDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">優先度</InputLabel>
                <Select
                  labelId="priority-label"
                  name="priority"
                  value={taskData.priority}
                  label="優先度"
                  onChange={handleChange}
                >
                  <MenuItem value="high">高</MenuItem>
                  <MenuItem value="medium">中</MenuItem>
                  <MenuItem value="low">低</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Typography sx={{ mr: 2 }}>定期タスク</Typography>
                <Switch
                  checked={taskData.recurring}
                  onChange={handleRecurringChange}
                  color="primary"
                />
              </Box>
            </Grid>
            
            {taskData.recurring && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    繰り返しパターン
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="recurring-type-label">繰り返しタイプ</InputLabel>
                    <Select
                      labelId="recurring-type-label"
                      value={taskData.recurringPattern.type}
                      label="繰り返しタイプ"
                      onChange={handleRecurringPatternTypeChange}
                    >
                      <MenuItem value="daily">毎日</MenuItem>
                      <MenuItem value="weekly">毎週</MenuItem>
                      <MenuItem value="monthly">毎月</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {taskData.recurringPattern.type === 'weekly' && (
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      曜日を選択
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {[0, 1, 2, 3, 4, 5, 6].map(day => (
                        <Chip
                          key={day}
                          label={getDayName(day)}
                          onClick={() => handleRecurringDayChange(day)}
                          color={taskData.recurringPattern.days.includes(day) ? 'primary' : 'default'}
                          variant={taskData.recurringPattern.days.includes(day) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                    {errors.recurringDays && (
                      <Typography variant="caption" color="error">
                        {errors.recurringDays}
                      </Typography>
                    )}
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button type="submit" variant="contained" color="primary">
            {task ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// タスクカード
const TaskCard = ({ task, staffList, onComplete, onEdit, onDelete }) => {
  const assignee = staffList.find(staff => staff.id === task.assigneeId);
  const formattedDueDate = moment(task.dueDate).format('YYYY年MM月DD日');
  const isOverdue = moment().isAfter(moment(task.dueDate), 'day') && task.status !== 'completed';
  
  // 優先度に基づく色を設定
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'success.main';
      default:
        return 'text.secondary';
    }
  };
  
  // ステータスに基づくラベルを設定
  const getStatusLabel = (status) => {
    switch (status) {
      case 'not_started':
        return '未着手';
      case 'in_progress':
        return '進行中';
      case 'completed':
        return '完了';
      default:
        return '不明';
    }
  };

  return (
    <Card raised={isOverdue} sx={{ 
      mb: 2, 
      borderLeft: '5px solid',
      borderColor: getPriorityColor(task.priority),
      backgroundColor: task.status === 'completed' ? '#f5f5f5' : 'white',
      opacity: task.status === 'completed' ? 0.8 : 1
    }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>
              {task.title}
            </Typography>
            {task.recurring && (
              <Tooltip title="定期タスク">
                <LoopIcon fontSize="small" color="primary" />
              </Tooltip>
            )}
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              担当: {assignee ? assignee.name : '未割当'}
            </Typography>
            <Typography 
              variant="body2" 
              color={isOverdue ? 'error.main' : 'text.secondary'}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
              {isOverdue ? `期限超過: ${formattedDueDate}` : `期限: ${formattedDueDate}`}
            </Typography>
          </Box>
        }
        action={
          <Chip 
            label={getStatusLabel(task.status)}
            color={
              task.status === 'completed' ? 'success' :
              task.status === 'in_progress' ? 'primary' :
              isOverdue ? 'error' : 'default'
            }
            size="small"
          />
        }
      />
      
      {task.description && (
        <CardContent>
          <Typography variant="body2">
            {task.description}
          </Typography>
        </CardContent>
      )}
      
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        {task.status !== 'completed' && (
          <Button
            startIcon={<DoneIcon />}
            size="small"
            onClick={() => onComplete(task.id)}
          >
            完了
          </Button>
        )}
        <Button
          startIcon={<EditIcon />}
          size="small"
          onClick={() => onEdit(task)}
        >
          編集
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          size="small"
          color="error"
          onClick={() => onDelete(task.id)}
        >
          削除
        </Button>
      </CardActions>
    </Card>
  );
};

// タスク管理メイン画面
const TaskManagement = () => {
  const {
    tasks,
    recurringTasks,
    loading,
    error,
    taskFilter,
    setTaskFilter,
    getFilteredTasks,
    fetchTasks,
    createTask,
    createRecurringTask,
    updateTask,
    deleteTask,
    completeTask,
    changeTaskStatus,
    generateRecurringTasksForToday
  } = useTask();
  
  const { staff, loading: staffLoading } = useStaff();
  
  const [tabValue, setTabValue] = useState(0);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // フィルターモード
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  // スタッフリスト取得（開発用にモックデータ）
  const staffList = staffLoading ? [] : staff;
  
  // フィルタリングされたタスク
  const filteredTasks = getFilteredTasks().filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // タブに対応するタスクを取得
  const getTabTasks = () => {
    switch (tabValue) {
      case 0: // すべてのタスク
        return filteredTasks;
      case 1: // 未着手のタスク
        return filteredTasks.filter(task => task.status === 'not_started');
      case 2: // 進行中のタスク
        return filteredTasks.filter(task => task.status === 'in_progress');
      case 3: // 完了済みのタスク
        return filteredTasks.filter(task => task.status === 'completed');
      default:
        return filteredTasks;
    }
  };
  
  // 定期タスクを抽出
  const getRecurringTasksList = () => {
    return filteredTasks.filter(task => task.recurring);
  };
  
  // ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenFormDialog = (task = null) => {
    setCurrentTask(task);
    setOpenFormDialog(true);
  };
  
  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setCurrentTask(null);
  };
  
  const handleCreateTask = async (taskData) => {
    try {
      const newTaskData = { ...taskData };
      
      if (newTaskData.recurring) {
        await createRecurringTask(newTaskData);
        setNotification({
          open: true,
          message: '定期タスクを作成しました',
          type: 'success'
        });
      } else {
        await createTask(newTaskData);
        setNotification({
          open: true,
          message: 'タスクを作成しました',
          type: 'success'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: 'タスクの作成に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleUpdateTask = async (taskData) => {
    try {
      const updatedTaskData = { ...taskData };
      await updateTask(taskData.id, updatedTaskData);
      setNotification({
        open: true,
        message: 'タスクを更新しました',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'タスクの更新に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setNotification({
        open: true,
        message: 'タスクを削除しました',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'タスクの削除に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleCompleteTask = async (id) => {
    try {
      await completeTask(id);
      setNotification({
        open: true,
        message: 'タスクを完了しました',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'タスクの完了処理に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleGenerateRecurringTasks = () => {
    generateRecurringTasksForToday();
    setNotification({
      open: true,
      message: '今日の定期タスクを生成しました',
      type: 'success'
    });
  };
  
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };
  
  const handleOpenFilterMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
    setFilterMenuOpen(true);
  };
  
  const handleCloseFilterMenu = () => {
    setFilterMenuOpen(false);
    setFilterAnchorEl(null);
  };
  
  const handleTaskSubmit = (taskData) => {
    if (currentTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTaskFilter({
      ...taskFilter,
      [name]: value
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            タスク管理
          </Typography>
          
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFormDialog()}
              sx={{ mr: 1 }}
            >
              新規タスク
            </Button>
            <Button
              variant="outlined"
              startIcon={<LoopIcon />}
              onClick={handleGenerateRecurringTasks}
            >
              定期タスク生成
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="タスク検索"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1, minWidth: '200px' }}
          />
          
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="priority-filter-label">優先度</InputLabel>
            <Select
              labelId="priority-filter-label"
              name="priority"
              value={taskFilter.priority}
              label="優先度"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="high">高</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="low">低</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="assignee-filter-label">担当者</InputLabel>
            <Select
              labelId="assignee-filter-label"
              name="assignee"
              value={taskFilter.assignee}
              label="担当者"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              {staffList.map(staff => (
                <MenuItem key={staff.id} value={staff.id.toString()}>
                  {staff.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="due-date-filter-label">期限</InputLabel>
            <Select
              labelId="due-date-filter-label"
              name="dueDate"
              value={taskFilter.dueDate}
              label="期限"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="today">今日</MenuItem>
              <MenuItem value="week">今週</MenuItem>
              <MenuItem value="month">今月</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab 
            label={
              <Badge badgeContent={filteredTasks.length} color="primary">
                <Box sx={{ px: 1 }}>すべて</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={filteredTasks.filter(t => t.status === 'not_started').length} 
                color="error"
              >
                <Box sx={{ px: 1 }}>未着手</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={filteredTasks.filter(t => t.status === 'in_progress').length} 
                color="primary"
              >
                <Box sx={{ px: 1 }}>進行中</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={filteredTasks.filter(t => t.status === 'completed').length} 
                color="success"
              >
                <Box sx={{ px: 1 }}>完了</Box>
              </Badge>
            } 
          />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : getTabTasks().length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              表示するタスクがありません
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFormDialog()}
            >
              新規タスクを作成
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {getTabTasks().map(task => (
              <Grid item xs={12} md={6} key={task.id}>
                <TaskCard
                  task={task}
                  staffList={staffList}
                  onComplete={handleCompleteTask}
                  onEdit={handleOpenFormDialog}
                  onDelete={handleDeleteTask}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* タスク作成・編集ダイアログ */}
      <TaskFormDialog
        open={openFormDialog}
        handleClose={handleCloseFormDialog}
        task={currentTask}
        staffList={staffList}
        onSubmit={handleTaskSubmit}
      />
      
      {/* 通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        message={notification.message}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseNotification}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskManagement;
