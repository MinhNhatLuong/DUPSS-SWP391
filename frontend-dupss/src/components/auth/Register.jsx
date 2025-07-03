import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Link, 
  Divider, 
  InputAdornment, 
  IconButton,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';
import { API_URL } from '../../services/config';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    birthDate: '',
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    document.title = "Đăng Ký - DUPSS";
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setAlert({
        open: true,
        message: 'Mật khẩu không khớp!',
        severity: 'error'
      });
      return;
    }
    
    // Set processing state to true
    setProcessing(true);
    
    try {
      // Format birthDate to DD/MM/YYYY format for the API if it exists
      const yobFormat = formData.birthDate ? 
        new Date(formData.birthDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '';
        
      const payload = {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullname: formData.fullName, // Note: API expects fullname not fullName
        email: formData.email,
        phone: formData.phone,
        yob: yobFormat // API expects yob not birthDate
      };
      
      const response = await axios.post(
        `${API_URL}/auth/register`,
        payload
      );
      
      if (response.status === 201) {
        // Set processing state to false
        setProcessing(false);
        
        setAlert({
          open: true,
          message: 'Đăng ký thành công!',
          severity: 'success'
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      // Set processing state to false on error
      setProcessing(false);
      
      const errorMessage = error.response?.data?.confirmPassword || 
                          error.response?.data?.message ||
                          'Đã có lỗi xảy ra khi đăng ký!';
                          
      setAlert({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogleRegister = () => {
    console.log('Google register clicked');
    // Placeholder for Google registration functionality
  };

  const handleFacebookRegister = () => {
    console.log('Facebook register clicked');
    // Placeholder for Facebook registration functionality
  };

  return (
    <Box sx={{
      padding: '60px 0',
      backgroundColor: '#f8f9fa',
      minHeight: 'calc(100vh - 300px)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ 
          '& .MuiPaper-root': { 
            width: '320px',
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            fontWeight: 500,
            padding: '12px 16px',
            backgroundColor: alert.severity === 'success' ? '#4caf50' : 
                              alert.severity === 'error' ? '#f44336' : '#f0ad4e',
            color: '#ffffff'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Card sx={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        {/* Left side - Register Form */}
        <Box sx={{
          flex: 1,
          padding: '40px'
        }}>
          <Box sx={{ textAlign: 'center', marginBottom: '30px' }}>
            <Typography variant="h4" component="h1" sx={{ marginBottom: '10px', color: '#0056b3', fontWeight: 600 }}>
              Đăng ký tài khoản
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Tham gia cùng DUPSS để tiếp cận các khóa học và tài nguyên phòng chống ma túy
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '500px', margin: '0 auto' }}>
            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Username <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="username"
                placeholder="Nhập username của bạn"
                value={formData.username}
                onChange={handleChange}
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
                    '& fieldset': { borderColor: '#ddd' },
                    '&:hover fieldset': { borderColor: '#0056b3' },
                    '&.Mui-focused fieldset': { borderColor: '#0056b3' },
                  }
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Email <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="email"
                name="email"
                placeholder="Nhập địa chỉ email của bạn"
                value={formData.email}
                onChange={handleChange}
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
                    '& fieldset': { borderColor: '#ddd' },
                    '&:hover fieldset': { borderColor: '#0056b3' },
                    '&.Mui-focused fieldset': { borderColor: '#0056b3' },
                  }
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Mật khẩu <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Nhập mật khẩu của bạn"
                value={formData.password}
                onChange={handleChange}
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
                    '& fieldset': { borderColor: '#ddd' },
                    '&:hover fieldset': { borderColor: '#0056b3' },
                    '&.Mui-focused fieldset': { borderColor: '#0056b3' },
                  }
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Nhập lại mật khẩu <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu của bạn"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#ddd' },
                    '&:hover fieldset': { borderColor: '#0056b3' },
                    '&.Mui-focused fieldset': { borderColor: '#0056b3' },
                  }
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Họ và Tên <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="fullName"
                placeholder="Nhập họ và tên của bạn"
                value={formData.fullName}
                onChange={handleChange}
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
                    '& fieldset': { borderColor: '#ddd' },
                    '&:hover fieldset': { borderColor: '#0056b3' },
                    '&.Mui-focused fieldset': { borderColor: '#0056b3' },
                  }
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Số điện thoại <span style={{ color: '#e74c3c' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="phone"
                placeholder="Nhập số điện thoại của bạn"
                value={formData.phone}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#aaa' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#ddd' },
                    '&:hover fieldset': { borderColor: '#0056b3' },
                    '&.Mui-focused fieldset': { borderColor: '#0056b3' },
                  }
                }}
              />
            </Box>

            <Box sx={{ marginBottom: '25px' }}>
              <Typography variant="subtitle1" sx={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>
                Ngày sinh
              </Typography>
              <TextField
                type="date"
                fullWidth
                name="birthDate"
                value={formData.birthDate || ''}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: '#aaa' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#ddd' },
                    '&:hover fieldset': { borderColor: '#0056b3' },
                    '&.Mui-focused fieldset': { borderColor: '#0056b3' },
                  }
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox 
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  sx={{
                    color: '#0056b3',
                    '&.Mui-checked': { color: '#0056b3' },
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  Tôi đồng ý với <Link href="#" sx={{ color: '#0056b3' }}>Điều khoản sử dụng</Link> và <Link href="#" sx={{ color: '#0056b3' }}>Chính sách bảo mật</Link>
                </Typography>
              }
              sx={{ marginBottom: '20px' }}
            />

            <Button 
              fullWidth 
              variant="contained"
              type="submit"
              disabled={processing}
              sx={{
                padding: '12px',
                backgroundColor: '#0056b3',
                '&:hover': {
                  backgroundColor: '#003d82',
                },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                position: 'relative'
              }}
            >
              {processing ? (
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
                  <span style={{ visibility: 'hidden' }}>Đăng ký</span>
                </>
              ) : 'Đăng ký'}
            </Button>

            <Box sx={{ 
              textAlign: 'center', 
              position: 'relative',
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
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block',
                  padding: '0 15px',
                  backgroundColor: 'white',
                  position: 'relative',
                  color: '#777'
                }}
              >
                Hoặc đăng ký bằng
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', width: '100%' }}>
              <Button
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleRegister}
                sx={{
                  width: '100%',
                  padding: '10px',
                  borderColor: '#ddd',
                  color: '#DB4437',
                  '&:hover': {
                    backgroundColor: '#fef0ef',
                    borderColor: '#DB4437'
                  },
                  textTransform: 'none'
                }}
              >
                Google
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Đã có tài khoản? <Link component={RouterLink} to="/login" sx={{ color: '#0056b3', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Đăng nhập ngay</Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right side - Image */}
        <Box 
          sx={{
            flex: 1,
            position: 'relative',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Box 
            component="img"
            src="https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg"
            alt="Phòng chống ma túy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '40px'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white', 
                fontWeight: 700, 
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              Chung tay xây dựng cộng đồng lành mạnh
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'white', 
                textAlign: 'center',
                lineHeight: 1.6
              }}
            >
              Đăng ký tài khoản để tiếp cận các khóa học, tài liệu và hoạt động phòng chống ma túy cùng DUPSS
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Register; 