import { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import apiClient from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    setError('');

    if (!oldPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return false;
    }

    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      setSuccess(response.data.message || 'Đổi mật khẩu thành công!');
      
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect after a delay
      setTimeout(() => {
        navigate(-1); // Go back to previous page
      }, 2000);
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f5f7fa'
    }}>
      <Card sx={{
        maxWidth: '500px',
        width: '100%',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          mb: 2, 
          color: '#0056b3', 
          fontWeight: 600, 
          textAlign: 'center' 
        }}>
          Đổi mật khẩu
        </Typography>
        
        <Typography variant="body1" sx={{ 
          mb: 4, 
          color: '#666', 
          textAlign: 'center' 
        }}>
          Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleChangePassword} sx={{ width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#555' }}>
              Mật khẩu hiện tại
            </Typography>
            <TextField
              fullWidth
              type={showOldPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu hiện tại"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#aaa' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                    >
                      {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0056b3',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0056b3',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#555' }}>
              Mật khẩu mới
            </Typography>
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#aaa' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0056b3',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0056b3',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500, color: '#555' }}>
              Xác nhận mật khẩu mới
            </Typography>
            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#aaa' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0056b3',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0056b3',
                  },
                },
              }}
            />
          </Box>

          <Button 
            fullWidth 
            variant="contained"
            type="submit"
            disabled={isLoading}
            sx={{
              padding: '12px',
              backgroundColor: '#0056b3',
              '&:hover': {
                backgroundColor: '#003d82',
              },
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Đổi mật khẩu'
            )}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default ChangePassword; 