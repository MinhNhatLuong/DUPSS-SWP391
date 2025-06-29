import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  MenuItem,
  Typography,
  Grid,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import './AppointmentForm.css';
import { CalendarIcon as CalendarIconX } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    appointmentDate: '',
    appointmentTime: '',
    topicId: ''
  });

  const [errors, setErrors] = useState({});
  const [topics, setTopics] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Fetch topics when component mounts
    fetchTopics();
    // Check authentication status
    checkAuthStatus();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const checkAuthStatus = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      // Check authentication status with POST method
      const response = await axios.post('http://localhost:8080/api/auth/me', {
        accessToken
      });
      
      if (response.status === 200) {
        // Prefill form with user data
        const userData = response.data;
        setUserId(userData.id); // Store user ID
        setFormData(prev => ({
          ...prev,
          fullName: userData.fullName || '',
          email: userData.email || '',
          phoneNumber: userData.phone || ''
        }));
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token expired, try refreshing
        tryRefreshToken();
      } else {
        console.error('Error checking auth status:', error);
      }
    }
  };

  const tryRefreshToken = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const response = await axios.post('http://localhost:8080/api/auth/refresh-token', {
        accessToken
      });
      
      if (response.data && response.data.accessToken) {
        // Save new tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Retry auth check
        checkAuthStatus();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Validate appointment date
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Ngày hẹn là bắt buộc';
    }
    
    // Validate appointment time
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Giờ hẹn là bắt buộc';
    } else {
      const time = formData.appointmentTime;
      const [hours] = time.split(':').map(Number);
      
      if (hours < 8 || hours >= 21) {
        newErrors.appointmentTime = 'Giờ hẹn phải từ 8:00 đến 21:00';
      }
    }
    
    // Validate topic
    if (!formData.topicId) {
      newErrors.topicId = 'Chủ đề tư vấn là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForApi = (dateString) => {
    if (!dateString) return '';
    
    // 无论输入格式如何，都将其转换为dd/mm/yyyy格式
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Set processing state to true for button loading indicator
        setIsProcessing(true);
        
        // Format the data for API
        const appointmentData = {
          customerName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          appointmentDate: formatDateForApi(formData.appointmentDate),
          appointmentTime: formData.appointmentTime,
          topicId: parseInt(formData.topicId),
          userId: userId // Include userId (will be null if not logged in)
        };

        // Submit the appointment
        const response = await axios.post('http://localhost:8080/api/appointments', appointmentData);
        
        // Set processing state to false
        setIsProcessing(false);
        
        // Handle success
        setAlert({
          open: true,
          message: 'Đăng ký cuộc hẹn thành công',
          severity: 'success'
        });
        // Reset form but keep personal info if user is logged in
        handleReset();
      } catch (error) {
        // Set processing state to false on error
        setIsProcessing(false);
        
        // Handle error
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch hẹn';
        setAlert({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    }
  };

  const handleReset = () => {
    // Keep personal information fields if the user is logged in
    if (userId) {
      setFormData(prev => ({
        ...prev,
        appointmentDate: '',
        appointmentTime: '',
        topicId: ''
      }));
    } else {
      // If not logged in, clear all fields
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      appointmentDate: '',
      appointmentTime: '',
      topicId: ''
    });
    }
    setErrors({});
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Thông tin đặt lịch hẹn
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Full Name */}
          <TextField
            fullWidth
            required
            id="fullName"
            name="fullName"
            label="Họ và Tên"
            value={formData.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Phone Number */}
          <TextField
            fullWidth
            id="phoneNumber"
            name="phoneNumber"
            label="Số điện thoại"
            value={formData.phoneNumber}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Email */}
          <TextField
            fullWidth
            required
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Date and Time Row */}
          <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
            {/* Appointment Date */}
            <TextField
              label="Ngày hẹn"
              type="date"
              fullWidth
              required
              id="appointmentDate"
              name="appointmentDate"
              value={formData.appointmentDate || ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  appointmentDate: e.target.value
                });
              }}
              error={!!errors.appointmentDate}
              helperText={errors.appointmentDate}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIconX />
                  </InputAdornment>
                )
              }}
              sx={{ flex: 1 }}
            />
            
            {/* Appointment Time */}
            <TextField
              fullWidth
              required
              id="appointmentTime"
              name="appointmentTime"
              label="Giờ hẹn"
              type="time"
              value={formData.appointmentTime}
              onChange={handleChange}
              error={!!errors.appointmentTime}
              helperText={errors.appointmentTime || "Giờ hẹn chỉ cho phép đặt  từ 8:00 đến 21:00"}
              inputProps={{
                step: 60, // Step is in seconds, 60 = 1 minute (removes seconds)
                min: '08:00',
                max: '21:00'
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon />
                  </InputAdornment>
                )
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ flex: 1 }}
            />
          </Box>
          
          {/* Topic */}
          <TextField
            select
            fullWidth
            required
            id="topicId"
            name="topicId"
            label="Chủ đề tư vấn"
            value={formData.topicId}
            onChange={handleChange}
            error={!!errors.topicId}
            helperText={errors.topicId || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">-- Chọn chủ đề --</MenuItem>
            {topics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.topicName}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isProcessing}
            sx={{ 
              flex: 2, 
              py: 1.5,
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#3f8dda'
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
                <span style={{ visibility: 'hidden' }}>Đặt lịch hẹn</span>
              </>
            ) : 'Đặt lịch hẹn'}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            disabled={isProcessing}
            sx={{ 
              flex: 1, 
              py: 1.5,
              color: '#2c3e50',
              borderColor: '#e5e7eb',
              bgcolor: '#f1f2f6',
              '&:hover': {
                bgcolor: '#e5e7eb',
                borderColor: '#d1d5db'
              },
              fontWeight: 600
            }}
          >
            Xóa form
          </Button>
        </Box>
      </Box>

      {/* Success/Error notification */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
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
            padding: '12px 16px'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AppointmentForm;