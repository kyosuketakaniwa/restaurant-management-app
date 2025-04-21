import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import KitchenIcon from '@mui/icons-material/Kitchen';

const InventoryAlert = ({ inventoryData, isLoading }) => {
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  const { lowStockItems = [] } = inventoryData || {};

  // 在庫アラートの優先度に応じてアイコンと色を設定
  const getAlertConfig = (priority) => {
    switch (priority) {
      case 'high':
        return { icon: <ErrorIcon />, color: 'error', text: '緊急' };
      case 'medium':
        return { icon: <WarningIcon />, color: 'warning', text: '警告' };
      case 'low':
        return { icon: <InfoIcon />, color: 'info', text: '注意' };
      default:
        return { icon: <InfoIcon />, color: 'default', text: '情報' };
    }
  };

  // カテゴリに応じたアイコンを取得
  const getCategoryIcon = (category) => {
    switch (category) {
      case '食材':
        return <RestaurantIcon />;
      case 'ドリンク':
        return <LocalBarIcon />;
      default:
        return <KitchenIcon />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>在庫アラート</Typography>
      
      {lowStockItems.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {lowStockItems.map((item, index) => {
            const alertConfig = getAlertConfig(item.priority);
            
            return (
              <React.Fragment key={item.id || index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: `${alertConfig.color}.lighter`,
                    borderRadius: 1,
                    mb: 1,
                    border: 1,
                    borderColor: `${alertConfig.color}.light`
                  }}
                >
                  <ListItemIcon sx={{ color: `${alertConfig.color}.main` }}>
                    {alertConfig.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          {item.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          color={alertConfig.color}
                          label={alertConfig.text}
                          sx={{ minWidth: 50 }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ mr: 2 }}>
                            <Typography component="span" variant="body2" color="text.primary">
                              現在: {item.currentStock} {item.unit}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography component="span" variant="body2" color="text.secondary">
                              最低: {item.minimumStock} {item.unit}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {getCategoryIcon(item.category)}
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                          >
                            {item.category} • {item.supplier || '指定なし'}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < lowStockItems.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
          <KitchenIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            現在、在庫アラートはありません
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default InventoryAlert;
