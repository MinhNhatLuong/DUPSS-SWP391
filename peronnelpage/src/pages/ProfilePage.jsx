import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  Wc as WcIcon
} from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { getAccessToken, getUserInfo } from '../utils/auth';

export default function ProfilePage() {
  // Function to update user information in localStorage and trigger update event
  const updateUserInfoInStorage = (fullName, avatar) => {
    try {
      // Get current user info
      const currentUserInfo = getUserInfo();
      
      if (currentUserInfo) {
        // Update with new values
        const updatedUserInfo = {
          ...currentUserInfo,
          fullName: fullName || currentUserInfo.fullName,
          avatar: avatar || currentUserInfo.avatar
        };
        
        // Save back to localStorage
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        
        // Dispatch a custom event to notify header components
        const updateEvent = new CustomEvent('user-profile-updated', {
          detail: {
            fullName: updatedUserInfo.fullName,
            avatar: updatedUserInfo.avatar
          }
        });
        document.dispatchEvent(updateEvent);
      }
    } catch (error) {
      console.error('Error updating user info in storage:', error);
    }
  };
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Không tìm thấy access token');
      }
      
      const response = await axios.post('/api/auth/me', { accessToken });
      const userData = response.data;
      setProfile(userData);
      
      // Handle birth date if available
      if (userData.yob) {
        // Try to parse the date that could be in different formats
        if (userData.yob.includes('/')) {
          // Format DD/MM/YYYY
          const parts = userData.yob.split('/');
          if (parts.length === 3) {
            setBirthDate(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
          }
        } else {
          // Assume ISO format
          setBirthDate(userData.yob);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleBirthDateChange = (e) => {
    setBirthDate(e.target.value);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile((prev) => ({
          ...prev,
          avatarPreview: event.target.result
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Format date for API (DD/MM/YYYY)
  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Không tìm thấy access token');
      }
      
      // Prepare FormData for multipart/form-data submission (for avatar upload)
      const formData = new FormData();
      
      // Add required fields
      formData.append('fullname', profile.fullName);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone || '');
      
      // Add optional fields if they have values
      if (profile.gender) formData.append('gender', profile.gender);
      if (profile.address) formData.append('address', profile.address);
      
      // Format and add birth date if available
      if (birthDate) {
        const formattedDate = formatDateForApi(birthDate);
        if (formattedDate) {
          formData.append('yob', formattedDate);
        }
      }
      
      // Add avatar file if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      // Send update request
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
          // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
        },
        body: formData
      });
      
      if (response.status === 200) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: 'Cập nhật thông tin thành công!',
          severity: 'success'
        });
        
        // Update avatar file state after successful save
        setAvatarFile(null);
        
        // Update user info in localStorage to reflect in header
        updateUserInfoInStorage(profile.fullName, profile.avatarPreview || profile.avatar);
        
        // Refresh user data
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật thất bại!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">
          Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại.
        </Alert>
      </Box>
    );
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
                  src={profile.avatarPreview || profile.avatar}
                  alt={profile.fullName}
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
                  value={profile.fullName || ''}
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
                  value={profile.email || ''}
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
                    value={profile.phone || ''}
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
                      value={profile.gender || ''}
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
                    value={profile.address || ''}
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
                  disabled={saving}
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
                  {saving ? (
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 