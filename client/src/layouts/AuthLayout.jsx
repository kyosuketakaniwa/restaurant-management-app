import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, CssBaseline } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: 'primary.main',
            }}
          >
            和食レストラン 匠
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            レストラン管理システム
          </Typography>
          
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
