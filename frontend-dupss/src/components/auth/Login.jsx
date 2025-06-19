import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  InputAdornment, 
  IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { Link as RouterLink } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';
import styles from './Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng Nhập - DUPSS";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      showErrorAlert('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call login API
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Handle response
      if (loginResponse.status === 400 || loginResponse.status === 401 || loginResponse.status === 403) {
        showErrorAlert('Username hoặc Mật khẩu sai!');
        setIsLoading(false);
        return;
      }

      if (!loginResponse.ok) {
        throw new Error(`Login failed with status: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      
      // Save tokens
      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);

      // Get user information
      const meResponse = await fetch('http://localhost:8080/api/auth/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: loginData.accessToken }),
      });

      if (!meResponse.ok) {
        throw new Error(`Failed to fetch user profile: ${meResponse.status}`);
      }

      showSuccessAlert('Đăng nhập thành công!');
      
      // Navigate to home page and refresh to update UI
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      // Check if the error is related to network or other technical issues
      if (error.name === 'TypeError' || error.name === 'NetworkError') {
        showErrorAlert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
      } else {
        // For any other errors, assume it's related to credentials
        showErrorAlert('Username hoặc Mật khẩu sai!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Placeholder for Google login functionality
  };

  return (
    <Box className={styles.loginSection}>
      <Card sx={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Left side - Login Form */}
        <Box sx={{
          flex: 1,
          padding: '40px'
        }}>
          <Box sx={{ textAlign: 'center', marginBottom: '30px' }}>
            <Typography variant="h4" component="h1" sx={{ marginBottom: '10px', color: '#0056b3', fontWeight: 600 }}>
              Đăng nhập
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Chào mừng bạn quay trở lại với DUPSS
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '400px', margin: '0 auto' }}>
            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Username
              </Typography>
              <TextField
                fullWidth
                placeholder="Nhập username của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#aaa' }} />
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
                    '& input': {
                      padding: '12px 15px 12px 15px',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Mật khẩu
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#aaa' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                    '& input': {
                      padding: '12px 15px 12px 15px',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginBottom: '20px'
            }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: '#0056b3', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Quên mật khẩu?
              </Link>
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
                fontWeight: 500
              }}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Box sx={{
              position: 'relative',
              textAlign: 'center',
              margin: '25px 0',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: 0,
                width: 'calc(50% - 70px)',
                height: '1px',
                backgroundColor: '#ddd'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                right: 0,
                width: 'calc(50% - 70px)',
                height: '1px',
                backgroundColor: '#ddd'
              }
            }}>
              <Typography variant="body2" sx={{ 
                display: 'inline-block',
                padding: '0 15px',
                backgroundColor: 'white',
                position: 'relative',
                color: '#777',
                fontSize: '0.9rem'
              }}>
                Hoặc đăng nhập bằng
              </Typography>
            </Box>

            <Box sx={{ 
              marginBottom: '25px'
            }}>
              <Button 
                fullWidth 
                variant="outlined"
                onClick={handleGoogleLogin}
                startIcon={<GoogleIcon />}
                sx={{
                  color: '#DB4437',
                  borderColor: '#ddd',
                  padding: '10px',
                  '&:hover': {
                    backgroundColor: '#fef0ef',
                    borderColor: '#DB4437',
                  },
                  textTransform: 'none',
                }}
              >
                Google
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
              <Typography variant="body2">
                Chưa có tài khoản? {' '}
                <Link component={RouterLink} to="/register" sx={{ color: '#0056b3', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right side - Image with overlay text */}
        <Box sx={{
          flex: 1,
          position: 'relative',
          display: { xs: 'none', md: 'block' }
        }}>
          <Box
            component="img"
            src="https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg"
            alt="Phòng chống ma túy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 40px',
            textAlign: 'center',
          }}>
            <Typography variant="h3" component="h2" sx={{ 
              color: 'white', 
              marginBottom: '20px',
              fontWeight: 600,
            }}>
              Chung tay xây dựng cộng đồng lành mạnh
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'white',
              fontSize: '1.1rem'
            }}>
              Đăng nhập để tham gia các khóa học và hoạt động phòng chống ma túy cùng DUPSS
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Login; 