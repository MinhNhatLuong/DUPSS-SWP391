import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  InputAdornment
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';
import styles from './Login.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = email input, 2 = OTP and password reset
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Quên Mật Khẩu - DUPSS";
  }, []);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorAlert('Vui lòng nhập địa chỉ email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/password/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 400) {
        showErrorAlert(data.message);
        setEmail('');
      } else if (response.ok) {
        showSuccessAlert(data.message);
        setStep(2); // Move to next step
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showErrorAlert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email || !otp || !newPassword) {
      showErrorAlert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.status === 400) {
        showErrorAlert(data.message || 'Đổi mật khẩu không thành công');
        setOtp('');
        setNewPassword('');
      } else if (response.ok) {
        showSuccessAlert(data.message);
        navigate('/login'); // Redirect to login page
      } else {
        throw new Error(`Request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showErrorAlert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      setOtp('');
      setNewPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        {/* Left side - Form */}
        <Box sx={{
          flex: 1,
          padding: '40px'
        }}>
          <Box sx={{ textAlign: 'center', marginBottom: '30px' }}>
            <Typography variant="h4" component="h1" sx={{ marginBottom: '10px', color: '#333' }}>
              {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              {step === 1 
                ? 'Vui lòng nhập email để nhận mã xác thực' 
                : 'Vui lòng nhập mã OTP và mật khẩu mới'}
            </Typography>
          </Box>

          {step === 1 ? (
            // Step 1: Email Form
            <Box component="form" onSubmit={handleSubmitEmail} sx={{ maxWidth: '400px', margin: '0 auto' }}>
              <Box sx={{ marginBottom: '20px' }}>
                <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#aaa' }} />
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
                  fontWeight: 500,
                  marginTop: '20px'
                }}
              >
                {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
              </Button>

              <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
                <Typography variant="body2">
                  Đã có tài khoản? {' '}
                  <Link component={RouterLink} to="/login" sx={{ color: '#0056b3', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    Đăng nhập ngay
                  </Link>
                </Typography>
              </Box>
            </Box>
          ) : (
            // Step 2: OTP and Password Reset Form
            <Box component="form" onSubmit={handleResetPassword} sx={{ maxWidth: '400px', margin: '0 auto' }}>
              <Box sx={{ marginBottom: '20px' }}>
                <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={email}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#aaa' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ddd',
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
                  Mã OTP
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Nhập mã OTP từ email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
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
                  Mật khẩu mới
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  fontWeight: 500,
                  marginTop: '20px'
                }}
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </Box>
          )}
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
              Khôi phục tài khoản của bạn
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'white',
              fontSize: '1.1rem'
            }}>
              Chúng tôi sẽ gửi mã xác thực đến email và hướng dẫn bạn đặt lại mật khẩu
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ForgotPassword; 