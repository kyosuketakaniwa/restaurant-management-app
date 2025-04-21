import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InventoryIcon from '@mui/icons-material/Inventory';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CircleIcon from '@mui/icons-material/Circle';
import RefreshIcon from '@mui/icons-material/Refresh';

const ShiftAndTaskInfo = ({ todayShifts, tasksForToday, inventoryAlerts, getStatusColor, getStatusText, getPriorityColor }) => {
  // 優先度ラベルを取得
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '不明';
    }
  };
  
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* 今日のシフト */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            bgcolor: '#3f67bf', 
            color: 'white',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleAltIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                本日のシフト
              </Typography>
            </Box>
            <Box>
              <IconButton sx={{ color: 'white', mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  bgcolor: '#4a76d6', 
                  '&:hover': { bgcolor: '#3a66c6' },
                  ml: 1
                }}
                endIcon={<NavigateNextIcon />}
              >
                シフト管理へ
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ p: 0 }}>
            {todayShifts.length > 0 ? (
              <List sx={{ p: 0 }}>
                {todayShifts.map((shift, index) => (
                  <Box key={shift.id}>
                    <ListItem 
                      sx={{ 
                        px: 3, 
                        py: 2
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          bgcolor: '#4a76d6',
                        }}
                      >
                        {shift.staffName.slice(0, 1)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {shift.staffName}
                        </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mt: 0.5,
                            color: 'text.secondary',
                          }}
                        >
                          <Chip 
                            label={shift.position} 
                            size="small" 
                            sx={{ 
                              mr: 1.5, 
                              bgcolor: '#e3eaff', 
                              color: '#3f67bf',
                              fontSize: '0.75rem'
                            }} 
                          />
                          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {shift.time}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < todayShifts.length - 1 && (
                      <Divider sx={{ mx: 3 }} />
                    )}
                  </Box>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  本日のシフト情報はありません
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      
      {/* 今日のタスク */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={1}
          sx={{ 
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            bgcolor: '#3f67bf', 
            color: 'white',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                本日のタスク
              </Typography>
            </Box>
            <Box>
              <IconButton sx={{ color: 'white', mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  bgcolor: '#4a76d6', 
                  '&:hover': { bgcolor: '#3a66c6' },
                  ml: 1
                }}
                endIcon={<NavigateNextIcon />}
              >
                タスク管理へ
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ p: 0 }}>
            {tasksForToday.length > 0 ? (
              <List sx={{ p: 0 }}>
                {tasksForToday.map((task, index) => {
                  const priorityColor = getPriorityColor(task.priority);
                  const statusColor = getStatusColor(task.status);
                  
                  return (
                    <Box key={task.id}>
                      <ListItem 
                        sx={{ 
                          px: 3, 
                          py: 2,
                        }}
                      >
                        <CircleIcon 
                          sx={{ 
                            mr: 2, 
                            color: priorityColor,
                            fontSize: 14
                          }} 
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {task.title}
                            </Typography>
                            <Chip 
                              label={getStatusText(task.status)} 
                              size="small"
                              sx={{ 
                                fontWeight: 'medium',
                                ml: 1,
                                fontSize: '0.7rem',
                                bgcolor: task.status === 'completed' ? '#4caf50' : 
                                         task.status === 'in_progress' ? '#ff9800' : '#f44336',
                                color: 'white'
                              }}
                            />
                          </Box>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mt: 0.5,
                              color: 'text.secondary',
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {task.assignee}
                            </Typography>
                            <Tooltip title={
                              task.priority === 'high' ? '高優先度' : 
                              task.priority === 'medium' ? '中優先度' : 
                              '低優先度'
                            }>
                              <Chip 
                                label={`優先度: ${getPriorityLabel(task.priority)}`} 
                                size="small" 
                                sx={{ 
                                  ml: 1.5, 
                                  height: 20,
                                  '& .MuiChip-label': { px: 1 },
                                  bgcolor: task.priority === 'high' ? '#ffebee' : 
                                            task.priority === 'medium' ? '#fff8e1' : '#e8f5e9',
                                  color: task.priority === 'high' ? '#f44336' : 
                                          task.priority === 'medium' ? '#ff9800' : '#4caf50',
                                  fontSize: '0.7rem'
                                }} 
                              />
                            </Tooltip>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < tasksForToday.length - 1 && (
                        <Divider sx={{ mx: 3 }} />
                      )}
                    </Box>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  本日のタスクはありません
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      
      {/* 在庫アラート */}
      <Grid item xs={12}>
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            bgcolor: '#3f67bf', 
            color: 'white',
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                在庫アラート
              </Typography>
            </Box>
            <Box>
              <IconButton sx={{ color: 'white', mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              <Button 
                variant="contained" 
                size="small" 
                sx={{ 
                  bgcolor: '#4a76d6', 
                  '&:hover': { bgcolor: '#3a66c6' },
                  ml: 1
                }}
                endIcon={<NavigateNextIcon />}
              >
                在庫管理へ
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ p: 2 }}>
            {inventoryAlerts.length > 0 ? (
              <Grid container spacing={2}>
                {inventoryAlerts.map(alert => (
                  <Grid item xs={12} sm={6} md={4} key={alert.id}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #e1e5eb',
                        borderLeft: '4px solid',
                        borderColor: alert.level === 'critical' ? '#f44336' : 
                                    alert.level === 'warning' ? '#ff9800' : '#4caf50',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <ErrorOutlineIcon 
                        sx={{ 
                          mr: 1.5, 
                          color: alert.level === 'critical' ? '#f44336' : 
                                alert.level === 'warning' ? '#ff9800' : '#4caf50'
                        }} 
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {alert.itemName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          残り {alert.currentStock} {alert.unit} ({alert.daysLeft}日分)
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  在庫アラートはありません
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ShiftAndTaskInfo;
