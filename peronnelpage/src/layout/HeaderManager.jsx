import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge } from '@mui/material';
import { Notifications as NotificationsIcon, Dashboard as DashboardIcon, 
         People as PeopleIcon, RateReview as RateReviewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HeaderManager = ({ userName }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DUPSS Manager Portal
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/manager/dashboard')}
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/manager/consultants')}
          >
            Consultants
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<RateReviewIcon />}
            onClick={() => navigate('/manager/content-review')}
          >
            Content Review
          </Button>

          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Typography variant="subtitle1" sx={{ ml: 2 }}>
            Welcome, {userName}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderManager; 