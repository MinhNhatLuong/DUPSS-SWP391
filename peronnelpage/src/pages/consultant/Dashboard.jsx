import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Paper, Alert, CircularProgress } from '@mui/material';
import NotificationService from '../../services/NotificationService';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';

// Fake data
const stats = {
  week: 3,
  month: 10,
  quarter: 22,
  pending: 2,
};

// Fake chart data
const weekData = [
  { name: 'T2', value: 1 },
  { name: 'T3', value: 0 },
  { name: 'T4', value: 1 },
  { name: 'T5', value: 0 },
  { name: 'T6', value: 1 },
  { name: 'T7', value: 0 },
  { name: 'CN', value: 0 },
];
const monthData = [
  { name: 'Tuần 1', value: 2 },
  { name: 'Tuần 2', value: 3 },
  { name: 'Tuần 3', value: 4 },
  { name: 'Tuần 4', value: 1 },
];

export default function ConsultantDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Giả lập có request mới và sắp đến giờ meeting
    NotificationService.newRequest({ client: 'Nguyen Van A', topic: 'Tư vấn du học' });
    setTimeout(() => {
      NotificationService.meetingSoon({ client: 'Tran Thi B', time: '2024-07-12 09:00' });
    }, 2000);
    
    // Fetch upcoming appointments
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/appointments/consultant/${userInfo.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log('Upcoming appointments:', response.data);
      
      // Filter only confirmed appointments and sort by date
      const confirmedAppointments = response.data
        .filter(appointment => appointment.status === 'CONFIRMED')
        .sort((a, b) => {
          const dateA = parseDateString(a.appointmentDate);
          const dateB = parseDateString(b.appointmentDate);
          return dateA - dateB;
        });
      
      setUpcomingAppointments(confirmedAppointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching upcoming appointments:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải danh sách cuộc hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse date in both formats
  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date();
    
    // Check if format is DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    
    // Otherwise assume ISO format
    return new Date(dateStr);
  };

  // Format time for display
  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') return timeObj;
    const { hour, minute } = timeObj;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // If already in DD/MM/YYYY format, return as is
    if (dateStr.includes('/')) return dateStr;
    // Otherwise format it
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Consultant Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Buổi tư vấn tuần này
              </Typography>
              <Typography variant="h5">{stats.week} / 5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Buổi tư vấn tháng này
              </Typography>
              <Typography variant="h5">{stats.month}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Buổi tư vấn quý này
              </Typography>
              <Typography variant="h5">{stats.quarter}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Request chờ duyệt
              </Typography>
              <Typography variant="h5">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ số buổi tư vấn trong tuần
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1976d2" name="Số buổi" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ số buổi tư vấn trong tháng
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#43a047" name="Số buổi" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Buổi tư vấn sắp tới
        </Typography>
        <Card>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : (
            <List>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${appointment.customerName} - ${appointment.topicName}`}
                        secondary={`${formatDate(appointment.appointmentDate)} ${formatTime(appointment.appointmentTime)}`}
                      />
                      <a 
                        href={`https://meet.google.com/${appointment.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Vào Google Meet
                      </a>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Không có buổi tư vấn nào sắp tới." />
                </ListItem>
              )}
            </List>
          )}
        </Card>
      </Box>
    </Box>
  );
} 