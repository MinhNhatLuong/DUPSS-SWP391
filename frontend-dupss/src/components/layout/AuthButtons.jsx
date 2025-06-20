import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Avatar, Typography, Menu, MenuItem, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';

// 创建自定义MenuItem组件，覆盖默认样式
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

  useEffect(() => {
    checkAuthStatus();

    // Lắng nghe sự kiện cập nhật thông tin người dùng từ trang Profile
    const handleProfileUpdate = (event) => {
      // Nếu userData đã tồn tại, chỉ cập nhật các thông tin được truyền từ sự kiện
      if (userData) {
        setUserData(prevData => ({
          ...prevData,
          fullName: event.detail.fullName || prevData.fullName,
          avatar: event.detail.avatar || prevData.avatar
        }));
      }
    };

    // Đăng ký lắng nghe sự kiện
    document.addEventListener('user-profile-updated', handleProfileUpdate);

    // Hủy đăng ký khi component unmount
    return () => {
      document.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
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
    const accessToken = localStorage.getItem('accessToken');
    
    // 调用登出API
    if (accessToken) {
      fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      }).catch(error => {
        console.error('Error during logout:', error);
      });
    }
    
    // 不等待API响应，直接清除本地令牌
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