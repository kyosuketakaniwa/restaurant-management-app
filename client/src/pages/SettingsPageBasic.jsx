import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const SettingsPageBasic = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          設定ページ
        </Typography>
        <Typography variant="body1" paragraph>
          これはシンプルな設定ページです。
        </Typography>
        <Box border={1} p={2} borderRadius={1} borderColor="grey.300">
          <Typography variant="h6" gutterBottom>
            店舗情報
          </Typography>
          <Typography variant="body1">
            店舗名: 和食レストラン 匠
          </Typography>
          <Typography variant="body1">
            住所: 東京都中央区銀座1-1-1
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsPageBasic;
