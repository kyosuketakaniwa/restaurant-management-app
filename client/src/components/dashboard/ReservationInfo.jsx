import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';

const ReservationInfo = ({ reservationStats }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
    // 実際のAPIリクエストがある場合はここに記述
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 3,
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
          <EventNoteIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            本日の予約状況
          </Typography>
        </Box>
        <Box>
          <IconButton 
            sx={{ color: 'white', mr: 1 }}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
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
            予約管理へ
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: '#f5f7fa', 
          border: '1px solid #e1e5eb', 
          borderLeft: '4px solid #3f67bf',
          borderRadius: 1,
          p: 2,
          mb: 2
        }}>
          <Typography variant="body1">
            本日 ({new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}{new Date().toLocaleDateString('ja-JP', { weekday: 'short' })}) の予約状況をリアルタイムで確認できます。
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* 総予約数 */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    width: 140, 
                    border: '1px solid #e1e5eb',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <PeopleAltIcon sx={{ fontSize: 32, color: '#3f67bf', mb: 1 }} />
                  <Typography color="textSecondary" variant="body2" gutterBottom>総予約数</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{reservationStats.totalReservations || 0}</Typography>
                </Paper>
                
                {/* 完了 */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    width: 140, 
                    border: '1px solid #e1e5eb',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 32, color: '#4caf50', mb: 1 }} />
                  <Typography color="textSecondary" variant="body2" gutterBottom>完了</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>{reservationStats.completedReservations || 0}</Typography>
                </Paper>
                  
                {/* 待機中 */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    width: 140, 
                    border: '1px solid #e1e5eb',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 32, color: '#ff9800', mb: 1 }} />
                  <Typography color="textSecondary" variant="body2" gutterBottom>待機中</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>{reservationStats.pendingReservations || 0}</Typography>
                </Paper>
                
                {/* キャンセル */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    width: 140, 
                    border: '1px solid #e1e5eb',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <CancelIcon sx={{ fontSize: 32, color: '#f44336', mb: 1 }} />
                  <Typography color="textSecondary" variant="body2" gutterBottom>キャンセル</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>{reservationStats.cancelledReservations || 0}</Typography>
                </Paper>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  border: '1px solid #e1e5eb',
                  borderRadius: 1 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1, color: '#3f67bf' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    時間帯別予約数
                  </Typography>
                </Box>
                
                {reservationStats && reservationStats.reservationsByHour && Object.keys(reservationStats.reservationsByHour).length > 0 ? (
                  <Box>
                    {/* 時間帯別予約状況 */}
                    {Object.entries(reservationStats.reservationsByHour).map(([hour, count]) => {
                      // 時間帯の混雑状況に応じてラベルとカラーを決定
                      let statusLabel = "空きあり";
                      let statusColor = "#ffb74d";
                      let barColor = "#ff9800";
                      
                      if (count >= 7) {
                        statusLabel = "混雑";
                        statusColor = "#ef5350";
                        barColor = "#f44336";
                      } else if (count >= 4) {
                        statusLabel = "やや混雑";
                        statusColor = "#ffb74d";
                        barColor = "#ff9800";
                      } else if (count > 0) {
                        statusLabel = "空きあり";
                        statusColor = "#4caf50";
                        barColor = "#4caf50";
                      }
                      
                      return (
                        <Box key={hour} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{hour}:00 - {hour}:59</Typography>
                            <Chip 
                              size="small" 
                              label={statusLabel} 
                              sx={{ bgcolor: statusColor, color: 'white', fontSize: '0.7rem' }} 
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, (count / 10) * 100)} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: '#f5f5f5',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: barColor
                              }
                            }} 
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                            <Typography variant="body2">{count}件</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                    予約はありません
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Paper>
  );
};

export default ReservationInfo;
