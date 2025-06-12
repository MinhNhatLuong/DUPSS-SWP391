import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  School,
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Kiểm tra thông tin đăng nhập
    if (!formData.username || !formData.password || !formData.role) {
      setError('Vui lòng điền đầy đủ thông tin!');
      setLoading(false);
      return;
    }

    // Giả lập đăng nhập
    setTimeout(() => {
      setLoading(false);
      if (formData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (formData.role === 'manager') {
        navigate('/manager/dashboard');
      }
    }, 1000);
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

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Vai trò</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Vai trò"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>

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