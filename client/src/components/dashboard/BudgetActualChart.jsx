import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const BudgetActualChart = ({ budgetData, isLoading }) => {
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  const { 
    categories = [],
    monthly = { 
      budget: 0, 
      actual: 0,
      achievementRate: 0
    } 
  } = budgetData || {};

  // カテゴリ別グラフデータの構築
  const barChartData = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: '予算',
        data: categories.map(cat => cat.budget),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: '実績',
        data: categories.map(cat => cat.actual),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ]
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>予算比較</Typography>

      {/* 月間トータル予算達成状況 */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">月間予算達成率</Typography>
          <Chip 
            label={`${monthly.achievementRate || 0}%`} 
            size="small" 
            color={
              (monthly.achievementRate || 0) >= 100 ? "success" : 
              (monthly.achievementRate || 0) >= 80 ? "warning" : 
              "error"
            }
          />
        </Box>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="textSecondary">予算</Typography>
            <Typography variant="h6">¥{monthly.budget?.toLocaleString() || '0'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">実績</Typography>
            <Typography variant="h6">¥{monthly.actual?.toLocaleString() || '0'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">差異</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {(monthly.actual - monthly.budget) > 0 ? (
                <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main' }} />
              ) : (monthly.actual - monthly.budget) < 0 ? (
                <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main' }} />
              ) : (
                <RemoveIcon fontSize="small" color="disabled" />
              )}
              <Typography 
                variant="h6" 
                sx={{ 
                  color: (monthly.actual - monthly.budget) > 0 ? 'success.main' : 
                        (monthly.actual - monthly.budget) < 0 ? 'error.main' : 
                        'text.secondary'
                }}
              >
                {(monthly.actual - monthly.budget) > 0 ? '+' : ''}
                ¥{Math.abs(monthly.actual - monthly.budget).toLocaleString() || '0'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* カテゴリ別の表とグラフ */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>カテゴリ別予算実績</Typography>
        
        {/* カテゴリ別テーブル */}
        <TableContainer sx={{ mt: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell>カテゴリ</TableCell>
                <TableCell align="right">予算</TableCell>
                <TableCell align="right">実績</TableCell>
                <TableCell align="right">達成率</TableCell>
                <TableCell align="right">差異</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => {
                const diff = category.actual - category.budget;
                const achievementRate = Math.round((category.actual / category.budget) * 100) || 0;
                
                return (
                  <TableRow key={category.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell align="right">¥{category.budget?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">¥{category.actual?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${achievementRate}%`} 
                        size="small" 
                        color={achievementRate >= 100 ? "success" : achievementRate >= 80 ? "warning" : "error"}
                        sx={{ minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {diff > 0 ? (
                          <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main' }} />
                        ) : diff < 0 ? (
                          <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main' }} />
                        ) : (
                          <RemoveIcon fontSize="small" color="disabled" />
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            ml: 0.5,
                            color: diff > 0 ? 'success.main' : diff < 0 ? 'error.main' : 'text.secondary'
                          }}
                        >
                          {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* カテゴリ別グラフ */}
        <Box sx={{ mt: 3, height: 300 }}>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: {
                    display: false
                  }
                },
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.dataset.label + ': ¥' + context.parsed.y.toLocaleString();
                    }
                  }
                }
              }
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default BudgetActualChart;
