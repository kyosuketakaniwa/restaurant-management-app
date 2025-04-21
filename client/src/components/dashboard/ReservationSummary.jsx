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
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const ReservationSummary = ({ reservationData, isLoading }) => {
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  const { 
    totalReservations = 0,
    totalGuests = 0,
    upcomingReservations = [] 
  } = reservationData || {};

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>本日の予約状況</Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventAvailableIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">予約件数</Typography>
            </Box>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {totalReservations}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">総客数</Typography>
            </Box>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {totalGuests}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
        これからの予約
      </Typography>
      
      {upcomingReservations.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
          {upcomingReservations.map((reservation, index) => (
            <React.Fragment key={reservation.id || index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <AccessTimeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {reservation.customerName}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${reservation.guestCount}名`} 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {reservation.time}
                      </Typography>
                      {" — "}
                      {reservation.tableInfo && (
                        <Typography component="span" variant="body2">
                          {reservation.tableInfo}
                        </Typography>
                      )}
                      {reservation.course && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <RestaurantIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          <Typography variant="body2">
                            {reservation.course}
                          </Typography>
                        </Box>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < upcomingReservations.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            これからの予約はありません
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ReservationSummary;
