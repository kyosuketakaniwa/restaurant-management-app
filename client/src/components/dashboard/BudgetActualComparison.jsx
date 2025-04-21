import React, { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Zoom
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const BudgetActualComparison = ({ budgetActual }) => {
  const [showChart, setShowChart] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // 実際のAPIリクエストがある場合はここに記述
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // 棒グラフのアニメーション効果とスタイル
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad'
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            if (value >= 1000000) {
              return '¥' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '¥' + (value / 1000).toFixed(0) + 'K';
            }
            return '¥' + value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333333',
        bodyColor: '#666666',
        borderColor: '#e1e5eb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(context.raw);
            }
            return label;
          }
        }
      }
    },
    borderRadius: 4,
    barPercentage: 0.6,
    categoryPercentage: 0.7
  };

  // チャートデータ
  const chartData = {
    labels: budgetActual?.categories?.map(category => category.name) || [],
    datasets: [
      {
        label: '予算',
        data: budgetActual?.categories?.map(category => category.budget) || [],
        backgroundColor: 'rgba(63, 103, 191, 0.7)',
        borderColor: '#3f67bf',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(63, 103, 191, 0.9)',
      },
      {
        label: '実績',
        data: budgetActual?.categories?.map(category => category.actual) || [],
        backgroundColor: 'rgba(74, 118, 214, 0.7)',
        borderColor: '#4a76d6',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(74, 118, 214, 0.9)',
      }
    ]
  };

  // パーセント差の計算と、適切なアイコンと色を返す関数
  const getDifferenceDisplay = (actual, budget) => {
    if (budget === 0) return { icon: <RemoveIcon />, color: 'text.secondary', percentage: 0 };
    
    const diff = ((actual - budget) / budget) * 100;
    const percentage = Math.abs(diff).toFixed(1);
    
    if (diff > 0) {
      return { 
        icon: <ArrowUpwardIcon fontSize="small" />, 
        color: '#4caf50', 
        percentage 
      };
    } else if (diff < 0) {
      return { 
        icon: <ArrowDownwardIcon fontSize="small" />, 
        color: '#f44336', 
        percentage 
      };
    } else {
      return { 
        icon: <RemoveIcon fontSize="small" />, 
        color: 'text.secondary', 
        percentage: 0 
      };
    }
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
          <BarChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            予算と実績の比較
          </Typography>
        </Box>
        <Box>
          <IconButton 
            sx={{ color: 'white', mr: 1 }}
            onClick={() => setShowChart(!showChart)}
          >
            {showChart ? <TableChartIcon /> : <BarChartIcon />}
          </IconButton>
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
            売上分析へ
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
            カテゴリー別の予算と実績を比較し、経営状況を把握します。表示切替ボタンでグラフと表の表示を切り替えできます。
          </Typography>
        </Box>

        {showChart ? (
          <Box sx={{ height: 350, p: 1 }}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table stickyHeader aria-label="予算実績比較表">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>カテゴリー</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>予算</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>実績</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>差異</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f5f7fa' }}>達成率</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgetActual?.categories?.map((category, index) => {
                  const differenceData = getDifferenceDisplay(category.actual, category.budget);
                  const achievementRate = category.budget > 0 
                    ? Math.round((category.actual / category.budget) * 100) 
                    : 0;
                  
                  return (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {category.name}
                      </TableCell>
                      <TableCell align="right">
                        ¥{category.budget.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ¥{category.actual.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end',
                            color: differenceData.color
                          }}
                        >
                          {differenceData.icon}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {differenceData.percentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${achievementRate}%`}
                          size="small"
                          sx={{
                            bgcolor: achievementRate >= 100 ? '#e8f5e9' : 
                                      achievementRate >= 70 ? '#fff8e1' : '#ffebee',
                            color: achievementRate >= 100 ? '#4caf50' : 
                                    achievementRate >= 70 ? '#ff9800' : '#f44336',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow 
                  sx={{ 
                    bgcolor: '#f5f7fa',
                    '& .MuiTableCell-root': { fontWeight: 700 }
                  }}
                >
                  <TableCell>合計</TableCell>
                  <TableCell align="right">
                    ¥{budgetActual?.total?.budget.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    ¥{budgetActual?.total?.actual.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(() => {
                      const totalDiff = getDifferenceDisplay(
                        budgetActual?.total?.actual, 
                        budgetActual?.total?.budget
                      );
                      return (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end',
                            color: totalDiff.color
                          }}
                        >
                          {totalDiff.icon}
                          <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                            {totalDiff.percentage}%
                          </Typography>
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell align="right">
                    {(() => {
                      const totalAchievement = budgetActual?.total?.budget > 0 
                        ? Math.round((budgetActual?.total?.actual / budgetActual?.total?.budget) * 100) 
                        : 0;
                        
                      return (
                        <Chip
                          label={`${totalAchievement}%`}
                          size="small"
                          sx={{
                            bgcolor: totalAchievement >= 100 ? '#e8f5e9' : 
                                      totalAchievement >= 70 ? '#fff8e1' : '#ffebee',
                            color: totalAchievement >= 100 ? '#4caf50' : 
                                    totalAchievement >= 70 ? '#ff9800' : '#f44336',
                            fontWeight: 700,
                          }}
                        />
                      );
                    })()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
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

export default BudgetActualComparison;
