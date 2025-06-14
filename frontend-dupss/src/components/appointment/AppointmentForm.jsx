import { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  MenuItem,
  Typography,
  Grid,
  InputAdornment
} from '@mui/material';
import { 
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import './AppointmentForm.css';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    appointmentDate: '',
    appointmentTime: '',
    topic: ''
  });

  const [errors, setErrors] = useState({});

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
    }
    
    // Validate topic
    if (!formData.topic) {
      newErrors.topic = 'Chủ đề tư vấn là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Replace with your actual API endpoint
      console.log('Form submitted:', formData);
      // Implementation for API call would go here
      alert('Đặt lịch hẹn thành công!');
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      appointmentDate: '',
      appointmentTime: '',
      topic: ''
    });
    setErrors({});
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
              fullWidth
              required
              id="appointmentDate"
              name="appointmentDate"
              label="Ngày hẹn"
              type="date"
              value={formData.appointmentDate}
              onChange={handleChange}
              error={!!errors.appointmentDate}
              helperText={errors.appointmentDate}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                )
              }}
              InputLabelProps={{
                shrink: true,
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
              helperText={errors.appointmentTime}
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
            id="topic"
            name="topic"
            label="Chủ đề tư vấn"
            value={formData.topic}
            onChange={handleChange}
            error={!!errors.topic}
            helperText={errors.topic || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">-- Chọn chủ đề --</MenuItem>
            <MenuItem value="prevention">Phòng ngừa sử dụng ma túy</MenuItem>
            <MenuItem value="treatment">Điều trị nghiện ma túy</MenuItem>
            <MenuItem value="support">Hỗ trợ người thân</MenuItem>
            <MenuItem value="education">Giáo dục cộng đồng</MenuItem>
            <MenuItem value="other">Khác</MenuItem>
          </TextField>
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ 
              flex: 2, 
              py: 1.5,
              bgcolor: '#3498db',
              '&:hover': {
                bgcolor: '#2980b9'
              }
            }}
          >
            Đặt lịch hẹn
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            sx={{ 
              flex: 1, 
              py: 1.5,
              color: '#2c3e50',
              borderColor: '#e5e7eb',
              bgcolor: '#f1f2f6',
              '&:hover': {
                bgcolor: '#e5e7eb',
                borderColor: '#d1d5db'
              }
            }}
          >
            Xóa form
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AppointmentForm; 