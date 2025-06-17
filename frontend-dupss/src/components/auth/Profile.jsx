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
  IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { showErrorAlert, showSuccessAlert } from '../common/AlertNotification';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    yob: '',
    gender: '',
    address: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);

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
          yob: data.yob || '',
          gender: data.gender || '',
          address: data.address || '',
          avatar: data.avatar || '',
        });
      } else {
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
      // Prepare request data
      const requestData = {
        accessToken,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
      };
      
      // Add optional fields if they have values
      if (userData.gender) requestData.gender = userData.gender;
      if (userData.yob) requestData.yob = userData.yob;
      if (userData.address) requestData.address = userData.address;
      
      // Separate handling for avatar image if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        formData.append('accessToken', accessToken);
        
        // Upload avatar first if needed
        // Note: This part would need actual implementation based on backend API
        // This is a placeholder for avatar upload functionality
      }

      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.status === 200) {
        const data = await response.json();
        showSuccessAlert(data.message || 'Cập nhật thông tin thành công!');
      } else {
        const errorData = await response.json();
        showErrorAlert(errorData.message || 'Cập nhật thất bại!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorAlert('Có lỗi xảy ra khi cập nhật thông tin!');
    }
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Thông tin tài khoản
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Avatar section */}
              <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                <Box position="relative">
                  <Avatar 
                    src={userData.avatar} 
                    alt={userData.fullName} 
                    sx={{ width: 120, height: 120 }}
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
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </label>
                </Box>
              </Grid>

              {/* Personal information form */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Họ và tên"
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Số điện thoại"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ngày sinh"
                  name="yob"
                  value={userData.yob}
                  onChange={handleChange}
                  placeholder="dd/mm/yyyy"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="gender-label">Giới tính</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={userData.gender || 'other'}
                    onChange={handleChange}
                    label="Giới tính"
                  >
                    <MenuItem value="male">Nam</MenuItem>
                    <MenuItem value="female">Nữ</MenuItem>
                    <MenuItem value="other">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={userData.address || ''}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} display="flex" justifyContent="center" mt={2}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    px: 4, 
                    py: 1,
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    }
                  }}
                >
                  Lưu thông tin
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile; 