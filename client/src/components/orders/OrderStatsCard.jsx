import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

/**
 * 注文統計を表示するカードコンポーネント
 * @param {Object} props
 * @param {string} props.title カードタイトル
 * @param {number} props.count 表示する数値
 * @param {React.ReactNode} props.icon アイコン
 * @param {string} props.color アイコンの背景色
 */
const OrderStatsCard = ({ title, count, icon, color }) => {
  return (
    <Card elevation={1}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: color || '#1976d2',
              color: 'white'
            }}
          >
            {icon}
          </Avatar>
          <Box ml={2}>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {count}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderStatsCard;
