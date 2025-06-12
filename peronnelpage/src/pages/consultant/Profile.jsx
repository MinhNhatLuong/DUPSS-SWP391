import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

// Fake initial data
const initialProfile = {
  name: 'Nguyen Consultant',
  email: 'consultant@example.com',
  phone: '0912345678',
  specialization: 'Tư vấn du học',
  bio: 'Tôi là chuyên gia tư vấn với 5 năm kinh nghiệm.',
  avatar: '/Logo_Website_Blue.png',
};

export default function ConsultantProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setProfile((prev) => ({ ...prev, avatar: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Thực tế: gọi API cập nhật profile
    setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Thông tin cá nhân
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar src={profile.avatar} sx={{ width: 80, height: 80, mb: 1 }} />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <IconButton color="primary" component="span" aria-label="upload picture">
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
          <form onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Họ tên"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Số điện thoại"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Chuyên môn"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Giới thiệu bản thân"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Lưu thay đổi
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 