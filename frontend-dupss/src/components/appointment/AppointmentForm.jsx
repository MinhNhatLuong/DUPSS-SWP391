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
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  Person
} from '@mui/icons-material';
import axios from 'axios';
import './AppointmentForm.css';
import { CalendarIcon as CalendarIconX } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';
import { API_URL } from '../../services/config';
import ConsultantSelector from './ConsultantSelector';
import { createMeeting, getToken } from '../../services/videoService';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    appointmentDate: '',
    appointmentTime: '',
    topicId: '',
    consultantName: '',
    slotId: null
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
  
  const [showConsultantSelector, setShowConsultantSelector] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    // Fetch topics when component mounts
    fetchTopics();
    // Check authentication status
    checkAuthStatus();

    // Add event listener for browser's back button
    window.addEventListener('popstate', handlePopState);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle browser's back button
  const handlePopState = (event) => {
    if (event.state && event.state.phase === 'appointmentForm') {
      setShowConsultantSelector(false);
    } else {
      setShowConsultantSelector(true);
      setSelectedSlot(null);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/topics`);
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
      const response = await axios.post(`${API_URL}/auth/me`, {
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
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
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
    
    // Validate topic
    if (!formData.topicId) {
      newErrors.topicId = 'Chủ đề tư vấn là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Set processing state to true for button loading indicator
        setIsProcessing(true);
        
        // Get VideoSDK token and create a meeting
        const token = await getToken();
        const { meetingId, err } = await createMeeting({ token });
        
        if (err || !meetingId) {
          throw new Error(err || 'Không thể tạo cuộc họp video');
        }
        
        // Generate meeting URL
        const meetingUrl = `https://dupss.vercel.app/appointment/${meetingId}/meeting`;
        
        // Format the data for API
        const appointmentData = {
          customerName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          topicId: parseInt(formData.topicId),
          slotId: parseInt(formData.slotId),
          meetingUrl: meetingUrl,
          userId: userId // Include userId (will be null if not logged in)
        };

        // Submit the appointment
        const response = await axios.post(`${API_URL}/appointments`, appointmentData);
        
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
        
        // Show a success alert notification when returning to ConsultantSelector
        showSuccessAlert('Đặt lịch tư vấn thành công!');
        
        // Return to consultant selector
        setShowConsultantSelector(true);
        // Reset browser history state
        window.history.replaceState(null, '', window.location.pathname);
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
        topicId: '',
        consultantName: '',
        slotId: null
      }));
    } else {
      // If not logged in, clear all fields
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        appointmentDate: '',
        appointmentTime: '',
        topicId: '',
        consultantName: '',
        slotId: null
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
  
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setFormData(prev => ({
      ...prev,
      appointmentDate: slot.date,
      appointmentTime: `${slot.startTime} - ${slot.endTime}`,
      consultantName: slot.consultantName,
      slotId: slot.id
    }));
    
    // Add browser history entry when moving to form view
    window.history.pushState(
      { phase: 'appointmentForm' }, 
      '', 
      window.location.pathname
    );
    
    setShowConsultantSelector(false);
  };
  
  const handleBackToConsultants = () => {
    // Update browser history when going back to consultant selection
    window.history.replaceState(null, '', window.location.pathname);
    setShowConsultantSelector(true);
    setSelectedSlot(null);
  };

  return (
    <>
      {showConsultantSelector ? (
        <ConsultantSelector onSlotSelect={handleSlotSelect} />
      ) : (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, textAlign: "center", fontWeight: 600, color: '#0056b3' }}>
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
              
              {/* Divider between personal info and appointment info */}
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Thông tin cuộc hẹn
                </Typography>
              </Divider>
              
              {/* Consultant Name */}
              <TextField
                fullWidth
                required
                id="consultantName"
                name="consultantName"
                label="Nhân viên tư vấn"
                value={formData.consultantName}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Appointment Date */}
              <TextField
                fullWidth
                required
                id="appointmentDate"
                name="appointmentDate"
                label="Ngày hẹn"
                value={formData.appointmentDate}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIconX />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Appointment Time */}
              <TextField
                fullWidth
                required
                id="appointmentTime"
                name="appointmentTime"
                label="Giờ hẹn"
                value={formData.appointmentTime}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon />
                    </InputAdornment>
                  ),
                }}
              />
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
                onClick={handleBackToConsultants}
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
                Quay lại
              </Button>
            </Box>
          </Box>

          {/* Success/Error notification */}
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
                padding: '12px 16px'
              }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </Paper>
      )}
    </>
  );
};

export default AppointmentForm;