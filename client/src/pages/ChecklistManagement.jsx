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
  Snackbar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Assignment as AssignmentIcon,
  LocalDining as LocalDiningIcon,
  CleaningServices as CleaningServicesIcon,
  Sanitizer as SanitizerIcon,
  NightsStay as NightsStayIcon,
  WbSunny as WbSunnyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import moment from 'moment';
import { useChecklist } from '../contexts/ChecklistContext';
import { useStaff } from '../contexts/StaffContext';

// チェックリスト項目
const ChecklistItem = ({ item, checklistId, onChange }) => {
  const handleChange = () => {
    onChange(checklistId, item.id, !item.completed);
  };

  return (
    <ListItem dense>
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={item.completed}
          onChange={handleChange}
          icon={<CheckBoxOutlineBlankIcon />}
          checkedIcon={<CheckBoxIcon />}
        />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          textDecoration: item.completed ? 'line-through' : 'none',
          color: item.completed ? 'text.secondary' : 'text.primary'
        }}
      />
    </ListItem>
  );
};

// チェックリストカード
const ChecklistCard = ({ checklist, staffList, onUpdateItem, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const assignee = staffList.find(staff => staff.id === checklist.assigneeId);
  const completedItemsCount = checklist.items.filter(item => item.completed).length;
  const totalItemsCount = checklist.items.length;
  const progress = totalItemsCount > 0 ? (completedItemsCount / totalItemsCount) * 100 : 0;
  const isCompleted = completedItemsCount === totalItemsCount;
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // チェックリストタイプに基づくアイコンを設定
  const getTypeIcon = (type) => {
    switch (type) {
      case 'opening':
        return <WbSunnyIcon />;
      case 'closing':
        return <NightsStayIcon />;
      case 'cleaning':
        return <CleaningServicesIcon />;
      case 'hygiene':
        return <SanitizerIcon />;
      default:
        return <AssignmentIcon />;
    }
  };
  
  // チェックリストタイプに基づくラベルを設定
  const getTypeLabel = (type) => {
    switch (type) {
      case 'opening':
        return '開店';
      case 'closing':
        return '閉店';
      case 'cleaning':
        return '清掃';
      case 'hygiene':
        return '衛生';
      default:
        return 'その他';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={getTypeIcon(checklist.type)}
        title={checklist.title}
        subheader={
          <Box>
            <Typography variant="body2" color="text.secondary">
              担当: {assignee ? assignee.name : '未割当'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                進捗: {completedItemsCount}/{totalItemsCount}
              </Typography>
              <Chip 
                label={isCompleted ? '完了' : '未完了'} 
                color={isCompleted ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        }
        action={
          <IconButton onClick={handleExpandClick}>
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      
      <CardContent sx={{ pt: 0 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          color={isCompleted ? 'success' : 'primary'}
          sx={{ height: 8, borderRadius: 5 }}
        />
        
        {expanded && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              {checklist.description}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <List>
              {checklist.items.map(item => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  checklistId={checklist.id}
                  onChange={onUpdateItem}
                />
              ))}
            </List>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          startIcon={<EditIcon />}
          size="small"
          onClick={() => onEdit(checklist)}
        >
          編集
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          size="small"
          color="error"
          onClick={() => onDelete(checklist.id)}
        >
          削除
        </Button>
      </CardActions>
    </Card>
  );
};

// チェックリスト作成・編集ダイアログ
const ChecklistFormDialog = ({ open, handleClose, checklist = null, templates = [], staffList, onSubmit }) => {
  const initialChecklistState = {
    title: '',
    description: '',
    type: 'opening',
    items: [],
    assigneeId: ''
  };

  const [checklistData, setChecklistData] = useState(initialChecklistState);
  const [errors, setErrors] = useState({});
  const [newItemText, setNewItemText] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    if (checklist) {
      // 編集モードの場合、チェックリストデータをセット
      setChecklistData(checklist);
      setUseTemplate(false);
    } else {
      // 新規作成モードの場合、初期状態にリセット
      setChecklistData(initialChecklistState);
    }
  }, [checklist, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChecklistData({ ...checklistData, [name]: value });
    
    // エラー状態をクリア
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setChecklistData({
          ...checklistData,
          title: template.title,
          description: template.description,
          type: template.type,
          items: [...template.items]
        });
      }
    }
  };

  const handleUseTemplateChange = (e) => {
    setUseTemplate(e.target.checked);
    if (!e.target.checked) {
      setSelectedTemplateId('');
    }
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem = {
      id: checklistData.items.length + 1,
      title: newItemText,
      completed: false
    };
    
    setChecklistData({
      ...checklistData,
      items: [...checklistData.items, newItem]
    });
    
    setNewItemText('');
  };

  const handleDeleteItem = (itemId) => {
    setChecklistData({
      ...checklistData,
      items: checklistData.items.filter(item => item.id !== itemId)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!checklistData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    
    if (!checklistData.assigneeId) {
      newErrors.assigneeId = '担当者は必須です';
    }
    
    if (checklistData.items.length === 0) {
      newErrors.items = 'チェックリストには少なくとも1つの項目が必要です';
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
    onSubmit(checklistData);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {checklist ? 'チェックリストを編集' : '新規チェックリストを作成'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!checklist && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ mr: 2 }}>テンプレートを使用</Typography>
                  <Switch
                    checked={useTemplate}
                    onChange={handleUseTemplateChange}
                    color="primary"
                  />
                </Box>
                
                {useTemplate && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="template-label">テンプレート</InputLabel>
                    <Select
                      labelId="template-label"
                      value={selectedTemplateId}
                      label="テンプレート"
                      onChange={handleTemplateChange}
                    >
                      <MenuItem value="" disabled>
                        <em>テンプレートを選択</em>
                      </MenuItem>
                      {templates.map(template => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                name="title"
                label="タイトル"
                fullWidth
                value={checklistData.title}
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
                rows={2}
                value={checklistData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">タイプ</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={checklistData.type}
                  label="タイプ"
                  onChange={handleChange}
                >
                  <MenuItem value="opening">開店</MenuItem>
                  <MenuItem value="closing">閉店</MenuItem>
                  <MenuItem value="cleaning">清掃</MenuItem>
                  <MenuItem value="hygiene">衛生</MenuItem>
                  <MenuItem value="other">その他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.assigneeId}>
                <InputLabel id="assignee-label">担当者</InputLabel>
                <Select
                  labelId="assignee-label"
                  name="assigneeId"
                  value={checklistData.assigneeId}
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
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                チェックリスト項目
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  label="新規項目"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddItem}
                  sx={{ ml: 1 }}
                  disabled={!newItemText.trim()}
                >
                  追加
                </Button>
              </Box>
              
              {errors.items && (
                <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                  {errors.items}
                </Typography>
              )}
              
              <List sx={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                {checklistData.items.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="項目がありません"
                      secondary="「追加」ボタンで項目を追加してください"
                      primaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                ) : (
                  checklistData.items.map((item, index) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={item.title} />
                    </ListItem>
                  ))
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button type="submit" variant="contained" color="primary">
            {checklist ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// チェックリスト管理メイン画面
const ChecklistManagement = () => {
  const {
    checklists,
    templates,
    loading,
    error,
    checklistFilter,
    setChecklistFilter,
    getFilteredChecklists,
    fetchChecklists,
    fetchTemplates,
    createChecklist,
    createChecklistFromTemplate,
    updateChecklist,
    deleteChecklist,
    updateChecklistItem,
    isChecklistCompleted
  } = useChecklist();
  
  const { staff, loading: staffLoading } = useStaff();
  
  const [tabValue, setTabValue] = useState(0);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [currentChecklist, setCurrentChecklist] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  
  // スタッフリスト取得（開発用にモックデータ）
  const staffList = staffLoading ? [] : staff;
  
  // フィルタリングされたチェックリスト
  const filteredChecklists = getFilteredChecklists();
  
  // タブに対応するチェックリストを取得
  const getTabChecklists = () => {
    switch (tabValue) {
      case 0: // すべてのチェックリスト
        return filteredChecklists;
      case 1: // 開店チェックリスト
        return filteredChecklists.filter(checklist => checklist.type === 'opening');
      case 2: // 閉店チェックリスト
        return filteredChecklists.filter(checklist => checklist.type === 'closing');
      case 3: // 清掃チェックリスト
        return filteredChecklists.filter(checklist => checklist.type === 'cleaning');
      case 4: // 衛生チェックリスト
        return filteredChecklists.filter(checklist => checklist.type === 'hygiene');
      default:
        return filteredChecklists;
    }
  };
  
  // ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenFormDialog = (checklist = null) => {
    setCurrentChecklist(checklist);
    setOpenFormDialog(true);
  };
  
  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setCurrentChecklist(null);
  };
  
  const handleCreateChecklist = async (checklistData) => {
    try {
      await createChecklist(checklistData);
      setNotification({
        open: true,
        message: 'チェックリストを作成しました',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'チェックリストの作成に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleUpdateChecklist = async (checklistData) => {
    try {
      await updateChecklist(checklistData.id, checklistData);
      setNotification({
        open: true,
        message: 'チェックリストを更新しました',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'チェックリストの更新に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleDeleteChecklist = async (id) => {
    try {
      await deleteChecklist(id);
      setNotification({
        open: true,
        message: 'チェックリストを削除しました',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'チェックリストの削除に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleUpdateChecklistItem = async (checklistId, itemId, completed) => {
    try {
      const updatedChecklist = await updateChecklistItem(checklistId, itemId, completed);
      
      // チェックリスト完了時の通知
      if (isChecklistCompleted(updatedChecklist) && completed) {
        setNotification({
          open: true,
          message: 'チェックリストを完了しました！',
          type: 'success'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: '項目の更新に失敗しました',
        type: 'error'
      });
    }
  };
  
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };
  
  const handleChecklistSubmit = (checklistData) => {
    if (currentChecklist) {
      handleUpdateChecklist(checklistData);
    } else {
      handleCreateChecklist(checklistData);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setChecklistFilter({
      ...checklistFilter,
      [name]: value
    });
  };
  
  // 各タイプのチェックリスト数を取得
  const countChecklistsByType = (type) => {
    return filteredChecklists.filter(checklist => checklist.type === type).length;
  };
  
  // 完了・未完了チェックリスト数を取得
  const getCompletionStats = () => {
    const completed = filteredChecklists.filter(checklist => 
      isChecklistCompleted(checklist)
    ).length;
    
    return {
      completed,
      incomplete: filteredChecklists.length - completed
    };
  };
  
  const stats = getCompletionStats();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            チェックリスト管理
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenFormDialog()}
          >
            新規チェックリスト
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="type-filter-label">タイプ</InputLabel>
            <Select
              labelId="type-filter-label"
              name="type"
              value={checklistFilter.type}
              label="タイプ"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="opening">開店</MenuItem>
              <MenuItem value="closing">閉店</MenuItem>
              <MenuItem value="cleaning">清掃</MenuItem>
              <MenuItem value="hygiene">衛生</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="completed-filter-label">状態</InputLabel>
            <Select
              labelId="completed-filter-label"
              name="completed"
              value={checklistFilter.completed}
              label="状態"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="completed">完了</MenuItem>
              <MenuItem value="incomplete">未完了</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="assignee-filter-label">担当者</InputLabel>
            <Select
              labelId="assignee-filter-label"
              name="assignee"
              value={checklistFilter.assignee}
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
        </Box>
        
        <Box sx={{ display: 'flex', mb: 3, justifyContent: 'center' }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`完了: ${stats.completed}`}
            color="success"
            variant="outlined"
            sx={{ mx: 1 }}
          />
          <Chip
            icon={<PlaylistAddCheckIcon />}
            label={`未完了: ${stats.incomplete}`}
            color="primary"
            variant="outlined"
            sx={{ mx: 1 }}
          />
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
              <Badge badgeContent={filteredChecklists.length} color="primary">
                <Box sx={{ px: 1 }}>すべて</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={countChecklistsByType('opening')} color="primary">
                <Box sx={{ px: 1 }}>開店</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={countChecklistsByType('closing')} color="primary">
                <Box sx={{ px: 1 }}>閉店</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={countChecklistsByType('cleaning')} color="primary">
                <Box sx={{ px: 1 }}>清掃</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={countChecklistsByType('hygiene')} color="primary">
                <Box sx={{ px: 1 }}>衛生</Box>
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
        ) : getTabChecklists().length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              表示するチェックリストがありません
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFormDialog()}
            >
              新規チェックリストを作成
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {getTabChecklists().map(checklist => (
              <Grid item xs={12} md={6} key={checklist.id}>
                <ChecklistCard
                  checklist={checklist}
                  staffList={staffList}
                  onUpdateItem={handleUpdateChecklistItem}
                  onEdit={handleOpenFormDialog}
                  onDelete={handleDeleteChecklist}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* チェックリスト作成・編集ダイアログ */}
      <ChecklistFormDialog
        open={openFormDialog}
        handleClose={handleCloseFormDialog}
        checklist={currentChecklist}
        templates={templates}
        staffList={staffList}
        onSubmit={handleChecklistSubmit}
      />
      
      {/* 通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
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

export default ChecklistManagement;
