import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const TaskShiftSummary = ({ taskData, shiftData, isLoading }) => {
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  const { 
    totalTasks = 0,
    completedTasks = 0,
    completionRate = 0,
    upcomingTasks = [] 
  } = taskData || {};

  const { 
    currentStaff = [],
    nextShift = {
      time: '',
      staff: []
    }
  } = shiftData || {};

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Grid container spacing={3}>
        {/* タスク情報 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>タスク状況</Typography>
          
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                本日のタスク進捗
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {completedTasks}/{totalTasks} ({completionRate}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={completionRate} 
              color={completionRate >= 80 ? "success" : completionRate >= 50 ? "warning" : "error"}
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Box>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            今後のタスク
          </Typography>
          
          {upcomingTasks.length > 0 ? (
            <List>
              {upcomingTasks.map((task, index) => (
                <ListItem 
                  key={task.id || index} 
                  sx={{ 
                    px: 2, 
                    py: 1,
                    bgcolor: 'background.default', 
                    mb: 1,
                    borderRadius: 1
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {task.completed ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <PendingIcon color="warning" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={task.title} 
                    secondary={task.assignee ? `担当: ${task.assignee}` : null}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  {task.dueTime && (
                    <Chip 
                      label={task.dueTime} 
                      size="small" 
                      variant="outlined"
                      icon={<AccessTimeIcon fontSize="small" />}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                予定されているタスクはありません
              </Typography>
            </Box>
          )}
        </Grid>
        
        {/* シフト情報 */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>シフト状況</Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            現在の出勤スタッフ
          </Typography>
          
          {currentStaff.length > 0 ? (
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {currentStaff.map((staff, index) => (
                <Grid item xs={6} key={staff.id || index}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1, 
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}>
                    <PersonIcon color="primary" sx={{ mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="body2">{staff.name}</Typography>
                    <Chip 
                      label={staff.role} 
                      size="small" 
                      sx={{ ml: 'auto', fontSize: '0.7rem' }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                出勤中のスタッフはいません
              </Typography>
            </Box>
          )}
          
          <Typography variant="subtitle2" gutterBottom>
            次のシフト: {nextShift.time}
          </Typography>
          
          {nextShift.staff.length > 0 ? (
            <Grid container spacing={1}>
              {nextShift.staff.map((staff, index) => (
                <Grid item xs={6} key={staff.id || index}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1, 
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}>
                    <PersonIcon color="secondary" sx={{ mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="body2">{staff.name}</Typography>
                    <Chip 
                      label={staff.role} 
                      size="small" 
                      sx={{ ml: 'auto', fontSize: '0.7rem' }}
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                予定されているシフトはありません
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TaskShiftSummary;
