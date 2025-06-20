import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  InputAdornment,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { 
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  Wc as WcIcon
} from '@mui/icons-material';
import { showErrorAlert, showSuccessAlert } from '../common/AlertNotification';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    avatar: ''
  });
  const [birthDate, setBirthDate] = useState(''); // Separate state for birth date
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // State to track processing status

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      // Follow the exact API endpoint structure
      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ accessToken })
      });

      if (response.status === 200) {
        const data = await response.json();
        setUserData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          address: data.address || '',
          avatar: data.avatar || '',
        });
        
        // Handle birth date separately
        if (data.yob) {
          // Convert from DD/MM/YYYY to YYYY-MM-DD for input type="date"
          const parts = data.yob.split('/');
          if (parts.length === 3) {
            setBirthDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
      } else {
        // Handle expired token
        if (response.status === 401) {
          try {
            // Try refreshing token
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const refreshResponse = await fetch('http://localhost:8080/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
              });
              
              if (refreshResponse.status === 200) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('accessToken', refreshData.accessToken);
                
                // Retry with new token
                return fetchUserData();
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
          
          // If refresh token fails or doesn't exist
          showErrorAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }
        
        const errorData = await response.json();
        showErrorAlert(errorData.message || 'Có lỗi xảy ra!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showErrorAlert('Có lỗi xảy ra!');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle birth date field separately
  const handleBirthDateChange = (e) => {
    setBirthDate(e.target.value);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData(prev => ({
          ...prev,
          avatar: event.target.result
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Format date function to ensure DD/MM/YYYY format output
  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    
    // Convert string to date object
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return null;
    
    // Format to DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Function to update information in AuthButton
  const updateAuthButtonInfo = () => {
    try {
      // Create and dispatch a custom event to notify AuthButton to update
      const updateEvent = new CustomEvent('user-profile-updated', { 
        detail: { 
          fullName: userData.fullName,
          avatar: userData.avatar
        } 
      });
      document.dispatchEvent(updateEvent);
    } catch (error) {
      console.error('Failed to update AuthButton:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!userData.fullName || !userData.email || !userData.phone) {
      showErrorAlert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      // Set processing state to true for button loading indicator
      setIsProcessing(true);

      // Use FormData instead of JSON
      const formData = new FormData();
      
      // Note: Backend requires field 'fullname' (not 'fullName')
      formData.append('fullname', userData.fullName);
      formData.append('email', userData.email);
      formData.append('phone', userData.phone);
      
      // Add optional fields if they have values
      if (userData.gender) formData.append('gender', userData.gender);
      
      // Format birth date if available
      if (birthDate) {
        const formattedDate = formatDateForApi(birthDate);
        // Only send if date is valid
        if (formattedDate) {
          formData.append('yob', formattedDate);
        }
      }
      
      if (userData.address) formData.append('address', userData.address);
      
      // Add avatar file if available
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Display data being sent for debugging
      console.log('Sending data:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
          // Don't add Content-Type, let browser set it automatically when sending FormData
        },
        body: formData
      });

      console.log('Status code:', response.status);
      
      // Set processing state to false
      setIsProcessing(false);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('Response data:', data);
        showSuccessAlert(data.message || 'Cập nhật thông tin thành công!');
        
        // Update user data after successful save
        fetchUserData();
        
        // Update information in AuthButton
        updateAuthButtonInfo();
        
        // Wait 1.5 seconds for user to see success message, then refresh page
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        showErrorAlert(errorData.message || 'Cập nhật thất bại!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorAlert('Có lỗi xảy ra khi cập nhật thông tin!');
      setIsProcessing(false); // Ensure processing state is turned off if error occurs
    }
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 4, color: '#0056b3', fontWeight: 600 }}>
          Thông tin tài khoản
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {/* Left column - Avatar */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                position: 'sticky',
                top: 20,
                width: '100%',
                maxWidth: 250
              }}
            >
              <Box position="relative" sx={{ mb: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Avatar 
                  src={userData.avatar} 
                  alt={userData.fullName} 
                  sx={{ 
                    width: 200, 
                    height: 200,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                />
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <IconButton 
                    component="span" 
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Box>
          </Grid>
          
          {/* Right column - Form fields */}
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Full Name - full width */}
                <TextField
                  fullWidth
                  required
                  id="fullName"
                  name="fullName"
                  label="Họ và tên"
                  value={userData.fullName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Email - full width */}
                <TextField
                  fullWidth
                  required
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Phone and Date of Birth on the same row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Phone */}
                  <TextField
                    sx={{ flex: 1 }}
                    required
                    id="phone"
                    name="phone"
                    label="Số điện thoại"
                    value={userData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {/* Date of Birth */}
                  <TextField
                    label="Ngày sinh"
                    type="date"
                    value={birthDate || ''}
                    onChange={handleBirthDateChange}
                    id="birthDate"
                    name="birthDate"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      )
                    }}
                    sx={{ flex: 1 }}
                  />
                </Box>
                
                {/* Gender and Address on the same row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Gender - shorter */}
                  <FormControl sx={{ flex: 0.3 }}>
                    <InputLabel id="gender-label">Giới tính</InputLabel>
                    <Select
                      labelId="gender-label"
                      id="gender"
                      name="gender"
                      value={userData.gender || 'other'}
                      onChange={handleChange}
                      label="Giới tính"
                      startAdornment={
                        <InputAdornment position="start">
                          <WcIcon />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                      <MenuItem value="other">Khác</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Address - longer */}
                  <TextField
                    sx={{ flex: 0.7 }}
                    id="address"
                    name="address"
                    label="Địa chỉ"
                    value={userData.address || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={isProcessing}
                  sx={{ 
                    py: 1.5,
                    px: 5,
                    fontSize: '1rem',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    position: 'relative',
                    fontWeight: 600
                  }}
                >
                  {isProcessing ? (
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
                      <span style={{ visibility: 'hidden' }}>Lưu thông tin</span>
                    </>
                  ) : 'Lưu thông tin'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 