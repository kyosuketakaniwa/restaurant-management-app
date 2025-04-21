import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardHeader, CardContent, CardActions, Button,
  Modal, Backdrop, Fade, IconButton, Divider, List, ListItem, 
  ListItemIcon, ListItemText, FormControl, InputLabel, Select, MenuItem,
  TextField, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Movie as MovieIcon,
  Slideshow as SlideshowIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

// メディア表示用コンポーネント
export const MediaViewer = ({ media }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // メディアタイプに基づいたアイコンの表示
  const getMediaIcon = (type) => {
    switch (type) {
      case 'video':
        return <MovieIcon />;
      case 'slide':
        return <SlideshowIcon />;
      case 'image':
        return <ImageIcon />;
      case 'document':
        return <DocumentIcon />;
      default:
        return <LinkIcon />;
    }
  };

  // メディア表示モーダルを開く
  const handleOpenModal = (media) => {
    setSelectedMedia(media);
    setModalOpen(true);
  };

  // メディア表示モーダルを閉じる
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // メディアの種類によってコンテンツを表示
  const renderMediaContent = (media) => {
    switch (media.type) {
      case 'video':
        return (
          <Box sx={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}>
            <iframe
              width="100%"
              height="450"
              src={media.url}
              title={media.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        );
      case 'slide':
        return (
          <Box sx={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}>
            <iframe
              width="100%"
              height="450"
              src={media.url}
              title={media.title}
              frameBorder="0"
              allowFullScreen
            />
          </Box>
        );
      case 'image':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <img 
              src={media.url} 
              alt={media.title} 
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
            />
          </Box>
        );
      case 'document':
      default:
        return (
          <Box sx={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}>
            <iframe
              width="100%"
              height="450"
              src={media.url}
              title={media.title}
              frameBorder="0"
              allowFullScreen
            />
          </Box>
        );
    }
  };

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        メディア資料
      </Typography>
      <Grid container spacing={2}>
        {media.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card variant="outlined">
              <CardHeader
                avatar={getMediaIcon(item.type)}
                title={item.title}
                subheader={item.type === 'video' ? '動画' : item.type === 'slide' ? 'スライド' : item.type === 'image' ? '画像' : '文書'}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleOpenModal(item)}
                >
                  表示
                </Button>
                <Button 
                  size="small" 
                  startIcon={<OpenInNewIcon />}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  別ウィンドウ
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 4
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            boxShadow: 24, 
            p: 4, 
            borderRadius: 1,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto' 
          }}>
            {selectedMedia && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{selectedMedia.title}</Typography>
                  <IconButton onClick={handleCloseModal} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {renderMediaContent(selectedMedia)}
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {selectedMedia.description}
                </Typography>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

// メディア編集用コンポーネント
export const MediaEditor = ({ documentId, media = [], onAddMedia, onRemoveMedia, mediaTypes }) => {
  const [mediaForm, setMediaForm] = useState({
    type: 'video',
    title: '',
    url: '',
    description: ''
  });

  // 入力変更ハンドラー
  const handleMediaFormChange = (e) => {
    const { name, value } = e.target;
    setMediaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // メディア追加ハンドラー
  const handleAddMedia = () => {
    if (mediaForm.title && mediaForm.url) {
      onAddMedia(documentId, mediaForm);
      // フォームをリセット
      setMediaForm({
        type: 'video',
        title: '',
        url: '',
        description: ''
      });
    }
  };

  // メディア削除ハンドラー
  const handleRemoveMedia = (mediaId) => {
    onRemoveMedia(documentId, mediaId);
  };

  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">メディア資料（動画・スライド・画像）</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {media.length > 0 ? (
            <Grid item xs={12}>
              <List>
                {media.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      {item.type === 'video' ? <MovieIcon /> : 
                       item.type === 'slide' ? <SlideshowIcon /> : 
                       item.type === 'image' ? <ImageIcon /> : 
                       <DocumentIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      secondary={item.description}
                    />
                    <IconButton 
                      edge="end" 
                      color="error"
                      onClick={() => handleRemoveMedia(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                メディアが登録されていません。下のフォームから追加してください。
              </Typography>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              新規メディア追加
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>メディアタイプ</InputLabel>
              <Select
                name="type"
                value={mediaForm.type}
                onChange={handleMediaFormChange}
                label="メディアタイプ"
              >
                {mediaTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="title"
              label="タイトル"
              value={mediaForm.title}
              onChange={handleMediaFormChange}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="url"
              label="URL"
              placeholder={mediaForm.type === 'video' ? 'YouTubeなどの埋め込みURL' : 
                          mediaForm.type === 'slide' ? 'Googleスライドなどの埋め込みURL' : 
                          mediaForm.type === 'image' ? '画像のURL' : '文書のURL'}
              value={mediaForm.url}
              onChange={handleMediaFormChange}
              fullWidth
              required
              variant="outlined"
              helperText={mediaForm.type === 'video' ? 'YouTube動画のembedURLを入力してください' : 
                       mediaForm.type === 'slide' ? 'GoogleスライドなどのembedURLを入力してください' : 
                       'メディアのURLを入力してください'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="説明"
              value={mediaForm.description}
              onChange={handleMediaFormChange}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddMedia}
                disabled={!mediaForm.title || !mediaForm.url}
                startIcon={<AddIcon />}
              >
                メディアを追加
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
