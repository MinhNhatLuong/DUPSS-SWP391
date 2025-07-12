import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  InputAdornment, 
  IconButton,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';
import styles from './Login.module.css';
import { login } from '../../services/authService';
import { submitSurveyResult } from '../../services/surveyService';
import axios from 'axios';
import { API_URL } from '../../services/config';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get alert message from location state
  const authAlert = location.state?.showAuthAlert;
  const authMessage = location.state?.authMessage;
  const returnUrl = location.state?.returnUrl;
  const sessionExpired = location.state?.sessionExpired;

  useEffect(() => {
    document.title = "Đăng Nhập - DUPSS";
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // If there's an alert message, display it in the top right corner via AlertNotification component
    if (authAlert && authMessage) {
      showErrorAlert(authMessage);
    }
    
    // Hiển thị thông báo phiên hết hạn nếu được chuyển hướng từ sự kiện session-expired
    if (sessionExpired) {
      showErrorAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    // Lắng nghe sự kiện phiên hết hạn
    const handleSessionExpired = (event) => {
      // Không hiển thị thông báo ở đây vì đã được xử lý trong authService.js
      console.log('Login page received session expired event');
    };
    
    document.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      document.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [authAlert, authMessage, sessionExpired]);

  // Hàm xử lý gửi dữ liệu khảo sát đã lưu
  const handlePendingSurveySubmission = async () => {
    try {
      // Kiểm tra xem có dữ liệu khảo sát đang chờ không
      const storedData = localStorage.getItem('pendingSurveySubmission');
      if (!storedData) return false;
      
      // Parse dữ liệu đã lưu
      const surveyData = JSON.parse(storedData);
      
      // Lấy thông tin cần thiết
      const { surveyId, selectedOptionIds } = surveyData;
      
      if (!surveyId || !selectedOptionIds) {
        throw new Error('Dữ liệu khảo sát không đầy đủ');
      }
      
      // Gửi kết quả khảo sát đến server
      await submitSurveyResult(surveyId, selectedOptionIds);
      
      // Xóa dữ liệu đã lưu sau khi gửi thành công
      localStorage.removeItem('pendingSurveySubmission');
      
      // Lưu thông báo thành công vào localStorage để hiển thị ở trang SurveysList
      localStorage.setItem('surveySubmissionResult', JSON.stringify({
        success: true,
        message: 'Lưu khảo sát thành công'
      }));
      
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu khảo sát:', error);
      
      // Lưu thông báo lỗi vào localStorage để hiển thị ở trang SurveysList
      localStorage.setItem('surveySubmissionResult', JSON.stringify({
        success: false,
        message: 'Có lỗi xảy ra khi lưu khảo sát'
      }));
      
      // Xóa dữ liệu đã lưu để tránh gửi lại lần sau
      localStorage.removeItem('pendingSurveySubmission');
      
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      showErrorAlert('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the login function from authService
      const userData = await login({ username, password });
      
      // Store login success flag in localStorage instead of showing alert immediately
      localStorage.setItem('loginSuccess', 'true');
      
      // Kiểm tra và gửi kết quả khảo sát đã lưu (nếu có)
      await handlePendingSurveySubmission();
      
      // Check if there's a redirect URL in sessionStorage
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectAfterLogin) {
        // Clear the redirect URL from sessionStorage
        sessionStorage.removeItem('redirectAfterLogin');
        // Navigate to the saved URL
        window.location.href = redirectAfterLogin;
      } 
      // If there's a returnUrl, redirect to that URL after successful login
      else if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        // If not, redirect to the homepage
        window.location.href = '/';
      }
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
  
  // Function to handle navigation to register page
  const handleRegisterClick = () => {
    window.scrollTo(0, 0);
    navigate('/register');
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
                fontWeight: 600,
                position: 'relative'
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      color: 'white',
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px'
                    }} 
                  />
                  <span style={{ visibility: 'hidden' }}>Đăng nhập</span>
                </>
              ) : 'Đăng nhập'}
            </Button>

            <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
              <Typography variant="body2">
                Chưa có tài khoản? {' '}
                <Link onClick={handleRegisterClick} sx={{ color: '#0056b3', fontWeight: 500, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
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