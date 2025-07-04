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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarMonthIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  AccountCircle,
  Logout,
  Settings,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';
import { logout, getUserInfo } from '../utils/auth';

// Map học hàm/học vị sang định dạng hiển thị đầy đủ theo enum AcademicTitle
const academicTitleMap = {
  'GS': 'Giáo sư',
  'PGS': 'Phó Giáo sư',
  'TS': 'Tiến sĩ',
  'ThS': 'Thạc sĩ',
  'CN': 'Cử nhân',
  'BS': 'Bác sĩ',
  'TVV': 'Tư vấn viên',
};

const HeaderConsultant = ({ userName }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [userInfo, setUserInfo] = useState(getUserInfo());
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      // Update the user info from the event data
      const updatedInfo = event.detail;
      setUserInfo(prevInfo => ({
        ...prevInfo,
        fullName: updatedInfo.fullName || prevInfo?.fullName,
        avatar: updatedInfo.avatar || prevInfo?.avatar,
        academicTitle: updatedInfo.academicTitle || prevInfo?.academicTitle,
        bio: updatedInfo.bio || prevInfo?.bio
      }));
    };
    
    // Add event listener
    document.addEventListener('user-profile-updated', handleProfileUpdate);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    // Đặt trạng thái đang logout
    setLoggingOut(true);
    
    try {
      // Sử dụng hàm logout từ auth.js và chuyển callback để điều hướng
      await logout(() => {
        navigate('/login');
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Nếu có lỗi, vẫn chuyển hướng về trang login
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/consultant/dashboard' },
    { text: 'Lịch làm việc', icon: <CalendarMonthIcon />, path: '/consultant/schedule' },
    { text: 'Đăng ký slot', icon: <EventAvailableIcon />, path: '/consultant/slot-registration' },
    { text: 'Lịch sử', icon: <HistoryIcon />, path: '/consultant/history' },
  ];

  // Lấy chữ cái đầu tiên của tên người dùng để hiển thị trong Avatar nếu không có avatar
  const getAvatarText = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return 'C';
  };

  // Hiển thị tên đầy đủ với học hàm/học vị (nếu có)
  const getFormattedName = () => {
    const displayName = userName || 'Consultant';
    const title = userInfo?.academicTitle;
    
    if (title && academicTitleMap[title]) {
      return `${academicTitleMap[title]} ${displayName}`;
    }
    
    return displayName;
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
            {getFormattedName()}
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
                alt={userName || 'Consultant'}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#8e24aa' }}>{getAvatarText()}</Avatar>
            )}
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
          <MenuItem onClick={() => navigate('/consultant/change-password')}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Đổi mật khẩu
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} disabled={loggingOut}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderConsultant; 