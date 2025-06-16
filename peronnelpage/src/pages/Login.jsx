import React, { useState } from 'react';
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

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

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
      
      // Lấy thông tin vai trò từ token
      const userRole = getUserRoleFromToken(response.data.accessToken);
      
      // Kiểm tra vai trò và điều hướng
      if (userRole) {
        // Xử lý các chuỗi vai trò có định dạng ROLE_XXX
        if (userRole.includes('ROLE_ADMIN') || userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole.includes('ROLE_MANAGER') || userRole === 'manager') {
          navigate('/manager/dashboard');
        } else if (userRole.includes('ROLE_CONSULTANT') || userRole === 'consultant') {
          navigate('/consultant/dashboard');
        } else if (userRole.includes('ROLE_MEMBER')) {
          // Không cho phép member đăng nhập vào hệ thống
          setError('Bạn không có quyền truy cập vào hệ thống này!');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } else {
          setError('Bạn không có quyền truy cập vào hệ thống này!');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        setError('Không tìm thấy thông tin vai trò trong tài khoản!');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError(err.response.data.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại!');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm phân tích token để lấy thông tin vai trò
  const getUserRoleFromToken = (token) => {
    try {
      // Phân tích JWT token để lấy thông tin
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      // Kiểm tra trường role hoặc authorities (tùy vào cấu trúc token)
      return tokenPayload.role || (tokenPayload.authorities ? tokenPayload.authorities[0] : null);
    } catch (e) {
      console.error('Invalid token format', e);
      return null;
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