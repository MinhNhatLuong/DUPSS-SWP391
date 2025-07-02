import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Box, Avatar, Typography, Menu, MenuItem, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LockIcon from '@mui/icons-material/Lock';
import { styled } from '@mui/material/styles';
import { API_URL } from '../../services/config';

// Create custom MenuItem component, override default styles
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  backgroundColor: 'transparent !important',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.04) !important',
  },
  '&.Mui-selected': {
    backgroundColor: 'transparent !important',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04) !important',
    }
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'transparent !important',
  }
}));

const AuthButtons = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();

    // Listen for user information update events from Profile page
    const handleProfileUpdate = (event) => {
      // If userData exists, only update information passed from the event
      if (userData) {
        setUserData(prevData => ({
          ...prevData,
          fullName: event.detail.fullName || prevData.fullName,
          avatar: event.detail.avatar || prevData.avatar
        }));
      }
    };

    // Lắng nghe sự kiện phiên đăng nhập hết hạn
    const handleSessionExpired = () => {
      console.log('Session expired event received');
      setIsLoggedIn(false);
      setUserData(null);
    };

    // Register event listeners
    document.addEventListener('user-profile-updated', handleProfileUpdate);
    document.addEventListener('session-expired', handleSessionExpired);

    // Unregister event listeners when component unmounts
    return () => {
      document.removeEventListener('user-profile-updated', handleProfileUpdate);
      document.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  // Kiểm tra trạng thái đăng nhập mỗi khi URL thay đổi
  useEffect(() => {
    // Kiểm tra token mỗi khi URL thay đổi
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setIsLoggedIn(false);
      setUserData(null);
    }
    
    // Nếu đang ở trang đăng nhập, đảm bảo rằng trạng thái đăng nhập được reset
    if (location.pathname === '/login') {
      const sessionExpired = location.state?.sessionExpired;
      if (sessionExpired) {
        setIsLoggedIn(false);
        setUserData(null);
      }
    }
  }, [location]);

  const checkAuthStatus = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setIsLoggedIn(false);
      setUserData(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (response.status === 200) {
        const userData = await response.json();
        setUserData(userData);
        setIsLoggedIn(true);
      } else if (response.status === 401) {
        await refreshToken();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      handleLogout();
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      handleLogout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        
        // Retry fetching user data with the new token
        await checkAuthStatus();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    const accessToken = localStorage.getItem('accessToken');
    
    // Call logout API
    if (accessToken) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      }).catch(error => {
        console.error('Error during logout:', error);
      });
    }
    
    // Don't wait for API response, directly clear local tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleChangePasswordClick = () => {
    handleMenuClose();
    navigate('/change-password');
  };

  return (
    <div className="user-actions">
      {!isLoggedIn ? (
        <div className="auth-buttons">
          <RouterLink to="/login" className="login-btn">Đăng nhập</RouterLink>
          <RouterLink to="/register" className="register-btn">Đăng ký</RouterLink>
        </div>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          minWidth: '220px',
          justifyContent: 'flex-end' 
        }}>
          <Box 
            onClick={handleMenuOpen}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '6px 15px',
              borderRadius: '4px',
              border: '1px solid #dddddd',
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
            }}
          >
            <Avatar 
              src={userData?.avatar} 
              alt={userData?.fullName || 'User'} 
              sx={{ 
                width: 36, 
                height: 36, 
                mr: 1.5
              }}
            />
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500,
                color: '#333333',
                fontSize: '1rem'
              }}
            >
              {userData?.fullName || userData?.username || 'User'}
            </Typography>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                '& .MuiList-root': {
                  paddingTop: 0,
                  paddingBottom: 0
                }
              },
            }}
          >
            <StyledMenuItem onClick={handleProfileClick} disableRipple selected={false}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              Hồ sơ
            </StyledMenuItem>
            <StyledMenuItem onClick={handleChangePasswordClick} disableRipple selected={false}>
              <LockIcon fontSize="small" sx={{ mr: 1 }} />
              Đổi mật khẩu
            </StyledMenuItem>
            <StyledMenuItem onClick={handleLogout} disableRipple selected={false}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Đăng xuất
            </StyledMenuItem>
          </Menu>
        </Box>
      )}
    </div>
  );
};

export default AuthButtons; 