import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material';
import { getAccessToken, setUserInfo, checkAndRefreshToken } from '../utils/auth';

const Login = ({ updateUserInfo }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Kiểm tra đăng nhập khi load trang
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await axios.post('http://localhost:8080/api/auth/me', {
            accessToken: token
          });
          
          // Lưu thông tin người dùng
          setUserInfo(response.data);
          // Cập nhật state userInfo ở App component
          if (updateUserInfo) updateUserInfo();
          
          // Nếu token hợp lệ, chuyển hướng người dùng theo role
          handleRoleNavigation(response.data.role);
        } catch (err) {
          if (err.response && err.response.status === 401) {
            // Token hết hạn, thử refresh
            const refreshSuccess = await checkAndRefreshToken();
            if (refreshSuccess) {
              // Nếu refresh thành công, lấy lại thông tin người dùng
              try {
                const userResponse = await axios.post('http://localhost:8080/api/auth/me', {
                  accessToken: getAccessToken()
                });
                setUserInfo(userResponse.data);
                // Cập nhật state userInfo ở App component
                if (updateUserInfo) updateUserInfo();
                handleRoleNavigation(userResponse.data.role);
              } catch (error) {
                console.error('Error fetching user info after token refresh:', error);
              }
            }
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate, updateUserInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Kiểm tra thông tin đăng nhập
    if (!formData.username || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: formData.username,
        password: formData.password
      });

      // Lưu token vào local storage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      setSuccess('Đăng nhập thành công!');
      
      // Gọi API lấy thông tin người dùng
      try {
        const userResponse = await axios.post('http://localhost:8080/api/auth/me', {
          accessToken: response.data.accessToken
        });
        
        // Lưu thông tin người dùng
        setUserInfo(userResponse.data);
        // Cập nhật state userInfo ở App component
        if (updateUserInfo) updateUserInfo();
        
        // Xử lý điều hướng dựa trên role
        setTimeout(() => {
          handleRoleNavigation(userResponse.data.role);
        }, 1000);
        
      } catch (err) {
        setError('Không thể lấy thông tin người dùng');
        console.error('User info error:', err);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          setError(err.response.data.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
        } else {
          setError('Có lỗi xảy ra. Vui lòng thử lại!');
        }
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý điều hướng dựa trên role
  const handleRoleNavigation = (role) => {
    if (!role) {
      setError('Không tìm thấy thông tin vai trò trong tài khoản!');
      return;
    }
    
    // Xử lý các chuỗi vai trò có định dạng ROLE_XXX
    if (role.includes('ROLE_ADMIN') || role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role.includes('ROLE_MANAGER') || role === 'manager') {
      navigate('/manager/dashboard');
    } else if (role.includes('ROLE_CONSULTANT') || role === 'consultant') {
      navigate('/consultant/dashboard');
    } else if (role.includes('ROLE_MEMBER')) {
      // Không cho phép member đăng nhập vào hệ thống
      setError('Bạn không có quyền truy cập vào hệ thống này!');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    } else {
      setError('Bạn không có quyền truy cập vào hệ thống này!');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        padding: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            padding: 3,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <img
            src="/Logo_Website_White.png"
            alt="DUPSS Logo"
            style={{ width: 300, height: 90, margin: '0 auto 16px', display: 'block' }}
          />
          <Typography variant="subtitle1">
            Đăng nhập vào hệ thống
          </Typography>
        </Box>

        <CardContent sx={{ padding: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Tên đăng nhập"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                height: 48,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #2196f3 90%)',
                },
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Paper>
    </Box>
  );
};

export default Login; 