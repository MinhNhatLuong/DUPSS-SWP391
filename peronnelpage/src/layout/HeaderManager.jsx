import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  RateReview as RateReviewIcon,
  AccountCircle,
  Logout,
  Settings,
  Topic as TopicIcon,
} from '@mui/icons-material';
import { logout, getUserInfo } from '../utils/auth';

const HeaderManager = ({ userName }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const userInfo = getUserInfo();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Sử dụng hàm logout từ auth.js và chuyển callback để điều hướng
    logout(() => {
      navigate('/login');
    });
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager/dashboard' },
    { text: 'Consultants', icon: <PeopleIcon />, path: '/manager/consultants' },
    { text: 'Content Review', icon: <RateReviewIcon />, path: '/manager/content-review' },
    { text: 'Topics', icon: <TopicIcon />, path: '/manager/topics' },
  ];

  // Lấy chữ cái đầu tiên của tên người dùng để hiển thị trong Avatar nếu không có avatar
  const getAvatarText = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return 'M';
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
          <Typography variant="body1" sx={{ mr: 1 }}>
            {userName || 'Manager'}
          </Typography>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            {userInfo?.avatar ? (
              <Avatar 
                sx={{ width: 32, height: 32 }} 
                src={userInfo.avatar}
                alt={userName || 'Manager'}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#ffa000' }}>{getAvatarText()}</Avatar>
            )}
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => navigate('/manager/profile')}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderManager; 