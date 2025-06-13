import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar as MuiAvatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Assignment as RequestIcon,
} from '@mui/icons-material';
import NotificationService from '../services/NotificationService';
import dayjs from 'dayjs';

const HeaderConsultant = ({ userName }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const open = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchorEl);

  useEffect(() => {
    const unsub = NotificationService.subscribe((notification) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: notification.type,
        message: notification.message,
        description: notification.description,
        timestamp: new Date(),
      }, ...prev]);
    });
    return unsub;
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    // Clear notifications when closing the menu
    setNotifications([]);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/consultant/dashboard' },
    { text: 'Lịch làm việc', icon: <CalendarMonthIcon />, path: '/consultant/schedule' },
    { text: 'Booking Requests', icon: <AssignmentIcon />, path: '/consultant/requests' },
    { text: 'Lịch sử', icon: <HistoryIcon />, path: '/consultant/history' },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <RequestIcon color="primary" />;
      case 'warning':
        return <EventIcon color="warning" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          DUPSS
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.text}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={handleNotifClick}
            sx={{ mr: 1 }}
          >
            <Badge
              badgeContent={notifications.length}
              color="error"
              invisible={notifications.length === 0}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Typography variant="body1" sx={{ mr: 1 }}>
            {userName}
          </Typography>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>C</Avatar>
          </IconButton>
        </Box>

        {/* Account Menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => navigate('/consultant/profile')}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/consultant/settings')}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={notifOpen}
          onClose={handleNotifClose}
          PaperProps={{
            sx: { width: 360, maxHeight: 400 }
          }}
        >
          <List sx={{ width: '100%', p: 0 }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem key={notification.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <MuiAvatar sx={{ bgcolor: 'background.paper' }}>
                      {getNotificationIcon(notification.type)}
                    </MuiAvatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.message}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {notification.description}
                        </Typography>
                        <br />
                        {dayjs(notification.timestamp).format('HH:mm DD/MM/YYYY')}
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không có thông báo mới" />
              </ListItem>
            )}
          </List>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderConsultant; 