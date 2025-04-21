import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

const BudgetComparisonChart = ({ budgetActual }) => {
  if (!budgetActual?.categories || budgetActual.categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          カテゴリーデータがありません
        </Typography>
      </Box>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false
        }
      },
      y: {
        stacked: false,
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
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
    }
  };

  const data = {
    labels: budgetActual?.categories?.map(category => category.name) || [],
    datasets: [
      {
        label: '予算',
        data: budgetActual?.categories?.map(category => category.budget) || [],
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      },
      {
        label: '実績',
        data: budgetActual?.categories?.map(category => category.actual) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Bar options={options} data={data} />
    </Box>
  );
};

export default BudgetComparisonChart;
