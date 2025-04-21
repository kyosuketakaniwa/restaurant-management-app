import React, { useState, useEffect } from 'react';
import { useManual } from '../contexts/ManualContext';
import { 
  Container, Box, Typography, Paper, Grid, TextField, Button, Chip,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Tabs, Tab, IconButton, Divider, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, Snackbar, Alert, CircularProgress,
  Autocomplete, ButtonGroup, CardHeader, Tooltip, Switch, FormControlLabel,
  Drawer, Badge, Modal, Backdrop, Fade, CardMedia, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  BookmarkBorder as BookmarkIcon,
  BookmarkAdded as BookmarkAddedIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
  OndemandVideo as VideoIcon,
  MenuBook as BookIcon,
  History as HistoryIcon,
  CloudDownload as DownloadIcon,
  Star as StarIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  LocalOffer as TagIcon,
  Image as ImageIcon,
  Movie as MovieIcon,
  Slideshow as SlideshowIcon,
  Description as DocumentIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
// react-markdownの代わりにシンプルなテキスト表示を使用
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MediaViewer, MediaEditor } from '../components/manual/MediaComponents';

// マークダウンスタイル
const markdownStyles = {
  wrapper: {
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
    color: '#333',
    padding: '10px 20px'
  },
  h1: {
    borderBottom: '2px solid #eaecef',
    paddingBottom: '0.3em',
    marginTop: '24px',
    marginBottom: '16px',
    fontWeight: 600,
    fontSize: '2em',
  },
  h2: {
    borderBottom: '1px solid #eaecef',
    paddingBottom: '0.3em',
    marginTop: '24px',
    marginBottom: '16px',
    fontWeight: 600,
    fontSize: '1.5em',
  },
  h3: {
    marginTop: '24px',
    marginBottom: '16px',
    fontWeight: 600,
    fontSize: '1.25em',
  },
  p: {
    marginTop: '0',
    marginBottom: '16px',
  },
  ul: {
    paddingLeft: '2em',
    marginTop: '0',
    marginBottom: '16px',
  },
  li: {
    marginTop: '0.25em',
  },
  code: {
    padding: '0.2em 0.4em',
    margin: '0',
    fontSize: '85%',
    backgroundColor: 'rgba(27,31,35,0.05)',
    borderRadius: '3px',
    fontFamily: 'monospace',
  },
  blockquote: {
    padding: '0 1em',
    color: '#6a737d',
    borderLeft: '0.25em solid #dfe2e5',
    margin: '0 0 16px 0',
  }
};

const ManualManagement = () => {
  const theme = useTheme();
  const { 
    manuals, 
    trainingMaterials, 
    categories, 
    tags, 
    mediaTypes,
    loading, 
    error,
    searchManuals,
    getManualById,
    createManual,
    createTrainingMaterial,
    updateManual,
    deleteManual,
    addCategory,
    addTag,
    addMedia,
    removeMedia
  } = useManual();

  // 状態管理
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [newDocumentForm, setNewDocumentForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    isRequired: false,
    author: '',
    media: []
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // 初期読み込み
  useEffect(() => {
    handleSearch();
  }, [manuals, trainingMaterials, filterCategories, filterTags, tabValue]);

  // 検索処理
  const handleSearch = () => {
    let type = null;
    if (tabValue === 1) type = 'manual';
    if (tabValue === 2) type = 'training';
    
    const filters = {
      categories: filterCategories,
      tags: filterTags,
      type
    };
    
    const results = searchManuals(searchQuery, filters);
    setSearchResults(results);
  };

  // ドキュメントの種類に基づくアイコン表示
  const getDocumentIcon = (document) => {
    if (document.category === 'training') {
      if (document.format === 'pdf') return <PdfIcon color="secondary" />;
      if (document.format === 'video') return <VideoIcon color="primary" />;
      return <BookIcon color="primary" />;
    }
    return <BookIcon color="primary" />;
  };

  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 詳細ダイアログを開く
  const handleOpenDetailDialog = (document) => {
    setSelectedDocument(document);
    setDetailDialogOpen(true);
  };

  // 編集ダイアログを開く
  const handleOpenEditDialog = (document) => {
    setSelectedDocument(document);
    setNewDocumentForm({
      title: document.title,
      description: document.description,
      content: document.content,
      category: document.category,
      tags: document.tags,
      isRequired: document.isRequired || false,
      author: document.author,
      media: document.media || []
    });
    setEditDialogOpen(true);
  };

  // 削除ダイアログを開く
  const handleOpenDeleteDialog = (document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  // 新規ドキュメント作成ダイアログを開く
  const handleOpenNewDocumentDialog = () => {
    setSelectedDocument(null);
    setNewDocumentForm({
      title: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      isRequired: false,
      author: '',
      media: []
    });
    setEditDialogOpen(true);
  };

  // 検索フィルタードロワーの切り替え
  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };

  // 入力変更ハンドラー
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setNewDocumentForm((prev) => ({
      ...prev,
      [name]: name === 'isRequired' ? checked : value
    }));
  };

  // タグ選択の変更ハンドラー
  const handleTagsChange = (event, newValue) => {
    setNewDocumentForm((prev) => ({
      ...prev,
      tags: newValue.map(tag => (typeof tag === 'string' ? tag : tag.id))
    }));
  };

  // ドキュメント保存ハンドラー
  const handleSaveDocument = () => {
    try {
      if (selectedDocument) {
        // 既存ドキュメントの更新
        updateManual(selectedDocument.id, newDocumentForm);
        setSnackbarMessage('ドキュメントが更新されました');
      } else {
        // 新規ドキュメント作成
        if (newDocumentForm.category === 'training') {
          createTrainingMaterial(newDocumentForm);
        } else {
          createManual(newDocumentForm);
        }
        setSnackbarMessage('新しいドキュメントが作成されました');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setEditDialogOpen(false);
      handleSearch();
    } catch (err) {
      setSnackbarMessage('エラーが発生しました: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // メディア追加ハンドラー
  const handleAddMedia = (documentId, mediaData) => {
    try {
      // 新規文書作成時はフォームに追加
      if (!selectedDocument) {
        const newMedia = {
          id: `temp-media-${Date.now()}`,
          ...mediaData
        };
        setNewDocumentForm(prev => ({
          ...prev,
          media: [...(prev.media || []), newMedia]
        }));
      } 
      // 既存文書編集時は、コンテキストのaddMediaを使用
      else {
        const newMedia = addMedia(documentId, mediaData);
        // ローカルのフォームステートも更新
        setNewDocumentForm(prev => ({
          ...prev,
          media: [...(prev.media || []), newMedia]
        }));
      }
    } catch (err) {
      setSnackbarMessage('メディア追加中にエラーが発生しました: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // メディア削除ハンドラー
  const handleRemoveMedia = (documentId, mediaId) => {
    try {
      // 新規文書作成時はフォームから削除
      if (!selectedDocument) {
        setNewDocumentForm(prev => ({
          ...prev,
          media: (prev.media || []).filter(m => m.id !== mediaId)
        }));
      } 
      // 既存文書編集時は、コンテキストのremoveMediaを使用
      else {
        removeMedia(documentId, mediaId);
        // ローカルのフォームステートも更新
        setNewDocumentForm(prev => ({
          ...prev,
          media: (prev.media || []).filter(m => m.id !== mediaId)
        }));
      }
    } catch (err) {
      setSnackbarMessage('メディア削除中にエラーが発生しました: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // ドキュメント削除ハンドラー
  const handleDeleteDocument = () => {
    try {
      if (selectedDocument) {
        deleteManual(selectedDocument.id);
        setSnackbarMessage('ドキュメントが削除されました');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setDeleteDialogOpen(false);
        handleSearch();
      }
    } catch (err) {
      setSnackbarMessage('エラーが発生しました: ' + err.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // フィルターカテゴリの変更ハンドラー
  const handleFilterCategoryChange = (event, newCategories) => {
    setFilterCategories(newCategories);
  };

  // フィルタータグの変更ハンドラー
  const handleFilterTagChange = (event, newTags) => {
    setFilterTags(newTags);
  };

  // スナックバーを閉じるハンドラー
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // 日付フォーマット用関数
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          マニュアル管理
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          業務マニュアル、トレーニング資料、社内ナレッジベースを管理します
        </Typography>
      </Paper>

      {/* 検索とアクションバー */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="検索"
              placeholder="キーワードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: (
                  <Button
                    color="primary"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    検索
                  </Button>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={toggleFilterDrawer}
                sx={{ mr: 1 }}
              >
                フィルター
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenNewDocumentDialog}
              >
                新規作成
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* タブ */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="すべて" />
          <Tab label="業務マニュアル" />
          <Tab label="トレーニング資料" />
        </Tabs>
      </Paper>

      {/* ドキュメント一覧 */}
      <Box>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : searchResults.length > 0 ? (
          <Grid container spacing={3}>
            {searchResults.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card 
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 3,
                      transition: 'box-shadow 0.3s ease-in-out'
                    }
                  }}
                >
                  <CardHeader
                    avatar={getDocumentIcon(doc)}
                    title={
                      <Tooltip title={doc.title}>
                        <Typography noWrap variant="subtitle1">
                          {doc.title}
                        </Typography>
                      </Tooltip>
                    }
                    subheader={
                      <Typography variant="caption" color="textSecondary">
                        更新: {formatDate(doc.updatedAt)}
                      </Typography>
                    }
                    action={
                      doc.isRequired && (
                        <Tooltip title="必須">
                          <StarIcon color="warning" fontSize="small" />
                        </Tooltip>
                      )
                    }
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary" paragraph noWrap>
                      {doc.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip
                        size="small"
                        label={categories.find(c => c.id === doc.category)?.name || doc.category}
                        color="primary"
                        variant="outlined"
                      />
                      {doc.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          size="small"
                          label={tags.find(t => t.id === tag)?.name || tag}
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                      {doc.tags.length > 2 && (
                        <Chip
                          size="small"
                          label={`+${doc.tags.length - 2}`}
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="caption" display="block">
                      バージョン: {doc.version}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleOpenDetailDialog(doc)}
                    >
                      詳細
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEditDialog(doc)}
                    >
                      編集
                    </Button>
                    <IconButton 
                      size="small" 
                      edge="end"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(doc)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="textSecondary">
              {searchQuery 
                ? '検索結果がありません。検索条件を変更してお試しください。' 
                : 'マニュアルがありません。新しいマニュアルを作成しましょう。'}
            </Typography>
            {searchQuery === '' && (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={handleOpenNewDocumentDialog}
              >
                新規作成
              </Button>
            )}
          </Paper>
        )}
      </Box>

      {/* 詳細表示ダイアログ */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {selectedDocument && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedDocument.title}</Typography>
                <IconButton onClick={() => setDetailDialogOpen(false)} size="large">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      カテゴリ:
                    </Typography>
                    <Chip
                      label={categories.find(c => c.id === selectedDocument.category)?.name || selectedDocument.category}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      タグ:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedDocument.tags.map((tag) => (
                        <Chip
                          key={tag}
                          size="small"
                          label={tags.find(t => t.id === tag)?.name || tag}
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      説明:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedDocument.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="textSecondary">
                      作成日: {formatDate(selectedDocument.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="textSecondary">
                      更新日: {formatDate(selectedDocument.updatedAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="textSecondary">
                      作成者: {selectedDocument.author}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                </Grid>
              </Box>
              
              {/* メディアセクション */}
              {selectedDocument.media && selectedDocument.media.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <MediaViewer media={selectedDocument.media} />
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              <Box sx={markdownStyles.wrapper}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDocument.content}
                </div>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<PrintIcon />}
                onClick={() => window.print()} 
                color="primary"
              >
                印刷
              </Button>
              <Button 
                startIcon={<DownloadIcon />}
                color="primary"
              >
                ダウンロード
              </Button>
              <Button 
                startIcon={<ShareIcon />}
                color="primary"
              >
                共有
              </Button>
              <Button
                startIcon={<EditIcon />}
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleOpenEditDialog(selectedDocument);
                }}
                color="primary"
                variant="contained"
              >
                編集
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDocument ? 'ドキュメントを編集' : '新規ドキュメント作成'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="タイトル"
                value={newDocumentForm.title}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="説明"
                value={newDocumentForm.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  name="category"
                  value={newDocumentForm.category}
                  onChange={handleFormChange}
                  label="カテゴリ"
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
              <Autocomplete
                multiple
                id="tags"
                options={tags}
                getOptionLabel={(option) => 
                  typeof option === 'string' 
                    ? option
                    : option.name
                }
                value={newDocumentForm.tags.map(
                  tagId => tags.find(t => t.id === tagId) || tagId
                )}
                onChange={handleTagsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="タグ"
                    placeholder="タグを選択..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={typeof option === 'string' ? option : option.name}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="author"
                label="作成者"
                value={newDocumentForm.author}
                onChange={handleFormChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="isRequired"
                    checked={newDocumentForm.isRequired}
                    onChange={handleFormChange}
                    color="primary"
                  />
                }
                label="必須マニュアル（すべてのスタッフが読む必要あり）"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="content"
                label="内容"
                value={newDocumentForm.content}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={15}
                variant="outlined"
                placeholder="マークダウン形式で記述できます..."
                helperText="マークダウン形式でコンテンツを作成できます。# 見出し、- リスト、**太字**などが使えます。"
              />
            </Grid>
            
            {/* メディア編集セクション */}
            <Grid item xs={12}>
              <MediaEditor 
                documentId={selectedDocument?.id} 
                media={newDocumentForm.media || []} 
                onAddMedia={handleAddMedia} 
                onRemoveMedia={handleRemoveMedia} 
                mediaTypes={mediaTypes} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>キャンセル</Button>
          <Button 
            onClick={handleSaveDocument} 
            color="primary" 
            variant="contained"
            disabled={!newDocumentForm.title}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>ドキュメントを削除</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedDocument?.title}" を削除しますか？この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button 
            onClick={handleDeleteDocument} 
            color="error"
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* フィルタードロワー */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer}
      >
        <Box
          sx={{ width: 300, p: 3 }}
          role="presentation"
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">検索フィルター</Typography>
            <IconButton onClick={toggleFilterDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            カテゴリで絞り込み
          </Typography>
          <Autocomplete
            multiple
            id="filter-categories"
            options={categories.map(c => c.id)}
            getOptionLabel={(option) => 
              categories.find(c => c.id === option)?.name || option
            }
            value={filterCategories}
            onChange={handleFilterCategoryChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="カテゴリを選択..."
                size="small"
                sx={{ mb: 3 }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={categories.find(c => c.id === option)?.name || option}
                  {...getTagProps({ index })}
                  color="primary"
                  size="small"
                />
              ))
            }
          />
          
          <Typography variant="subtitle2" gutterBottom>
            タグで絞り込み
          </Typography>
          <Autocomplete
            multiple
            id="filter-tags"
            options={tags.map(t => t.id)}
            getOptionLabel={(option) => 
              tags.find(t => t.id === option)?.name || option
            }
            value={filterTags}
            onChange={handleFilterTagChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="タグを選択..."
                size="small"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={tags.find(t => t.id === option)?.name || option}
                  {...getTagProps({ index })}
                  color="secondary"
                  size="small"
                />
              ))
            }
          />
          
          <Box mt={4} display="flex" justifyContent="space-between">
            <Button 
              onClick={() => {
                setFilterCategories([]);
                setFilterTags([]);
              }}
            >
              クリア
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                handleSearch();
                toggleFilterDrawer();
              }}
            >
              適用
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* スナックバー通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManualManagement;
