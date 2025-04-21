import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip,
  CircularProgress 
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const SalesSummary = ({ salesData, isLoading }) => {
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  const { 
    todaySales = 0, 
    monthlySales = 0, 
    weeklySales = [], 
    comparisonData = { 
      yesterday: { sales: 0, change: 0 }, 
      lastWeek: { sales: 0, change: 0 }, 
      lastMonth: { sales: 0, change: 0 } 
    } 
  } = salesData || {};
  
  const labels = weeklySales.map(item => item.label) || Array(7).fill("");
  const values = weeklySales.map(item => item.value) || Array(7).fill(0);

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>売上概要</Typography>
      
      <Grid container spacing={2}>
        {/* 本日の売上 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" color="textSecondary">本日の売上</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
              <Typography variant="h4" component="div">
                ¥{todaySales?.toLocaleString() || '0'}
              </Typography>
              {comparisonData?.yesterday?.change !== 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {comparisonData?.yesterday?.change > 0 ? (
                    <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main' }} />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main' }} />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: comparisonData?.yesterday?.change > 0 ? 'success.main' : 'error.main',
                      ml: 0.5
                    }}
                  >
                    {comparisonData?.yesterday?.change > 0 ? '+' : ''}
                    {comparisonData?.yesterday?.change}%
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              前日比: ¥{comparisonData?.yesterday?.sales?.toLocaleString() || '0'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* 月間売上 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" color="textSecondary">月間売上</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
              <Typography variant="h4" component="div">
                ¥{monthlySales?.toLocaleString() || '0'}
              </Typography>
              {comparisonData?.lastMonth?.change !== 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {comparisonData?.lastMonth?.change > 0 ? (
                    <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main' }} />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main' }} />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: comparisonData?.lastMonth?.change > 0 ? 'success.main' : 'error.main',
                      ml: 0.5
                    }}
                  >
                    {comparisonData?.lastMonth?.change > 0 ? '+' : ''}
                    {comparisonData?.lastMonth?.change}%
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              先月比: ¥{comparisonData?.lastMonth?.sales?.toLocaleString() || '0'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 週間売上グラフ */}
      <Box sx={{ mt: 2, height: 200 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          直近7日間の売上推移
        </Typography>
        <Line
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { 
                callbacks: {
                  label: function(context) {
                    return '¥' + context.parsed.y.toLocaleString();
                  }
                }
              }
            },
            scales: {
              x: { 
                grid: { display: false },
                ticks: { maxRotation: 0 }
              },
              y: { 
                beginAtZero: true,
                grid: { borderDash: [2] }
              }
            }
          }}
          data={{
            labels: labels,
            datasets: [{
              data: values,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.3,
              pointRadius: 3
            }]
          }}
        />
      </Box>
    </Paper>
  );
};

export default SalesSummary;
