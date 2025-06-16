import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Avatar, Typography, Menu, MenuItem, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const AuthButtons = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
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
      const response = await fetch('http://localhost:8080/api/auth/refresh-token', {
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

  return (
    <div className="user-actions">
      {!isLoggedIn ? (
        <div className="auth-buttons">
          <RouterLink to="/login" className="login-btn">Đăng nhập</RouterLink>
          <RouterLink to="/register" className="register-btn">Đăng ký</RouterLink>
        </div>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            onClick={handleMenuOpen}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '4px',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
            }}
          >
            <Avatar 
              src={userData?.avatar} 
              alt={userData?.fullName || 'User'} 
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
          >
            <MenuItem onClick={handleProfileClick}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              Hồ sơ
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      )}
    </div>
  );
};

export default AuthButtons; 