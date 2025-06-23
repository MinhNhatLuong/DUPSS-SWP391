import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Paper, Alert, CircularProgress } from '@mui/material';


import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';

export default function ConsultantDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    week: 0,
    month: 0,
    quarter: 0,
    pending: 0
  });
  const [weekData, setWeekData] = useState([
    { name: 'T2', value: 0 },
    { name: 'T3', value: 0 },
    { name: 'T4', value: 0 },
    { name: 'T5', value: 0 },
    { name: 'T6', value: 0 },
    { name: 'T7', value: 0 },
    { name: 'CN', value: 0 },
  ]);
  const [monthData, setMonthData] = useState([
    { name: 'Tuần 1', value: 0 },
    { name: 'Tuần 2', value: 0 },
    { name: 'Tuần 3', value: 0 },
    { name: 'Tuần 4', value: 0 },
  ]);

  useEffect(() => {
    // Fetch data
    fetchAllData();
    
    // Set up interval to refresh data every 5 minutes
    const intervalId = setInterval(() => {
      fetchAllData();
    }, 300000); // 5 minutes
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUpcomingAppointments(),
        fetchStatistics()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Lấy tất cả cuộc hẹn
      const appointmentsResponse = await axios.get(`/api/appointments/consultant/${userInfo.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Lấy lịch sử cuộc hẹn (đã hoàn thành hoặc đã hủy)
      const historyResponse = await axios.get(`/api/appointments/consultant/${userInfo.id}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Lấy danh sách cuộc hẹn đang chờ (chưa được phân công)
      const pendingResponse = await axios.get(`/api/consultant/appointments/unassigned`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Kết hợp cả hai danh sách để có đầy đủ dữ liệu
      const allAppointments = [...appointmentsResponse.data, ...historyResponse.data];
      
      if (allAppointments.length > 0) {
        calculateStats(allAppointments, pendingResponse.data.length);
      } else {
        setStats({
          week: 0,
          month: 0,
          quarter: 0,
          pending: pendingResponse.data.length
        });
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu thống kê');
    }
  };

  const calculateStats = (appointments, pendingCount) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday of current week
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const startOfQuarter = new Date(now);
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    startOfQuarter.setMonth(quarterMonth, 1);
    startOfQuarter.setHours(0, 0, 0, 0);
    
         // Calculate stats
     const weekAppointments = appointments.filter(appt => {
       const apptDate = parseDateString(appt.appointmentDate);
       return apptDate >= startOfWeek && (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED');
     });
     
     const monthAppointments = appointments.filter(appt => {
       const apptDate = parseDateString(appt.appointmentDate);
       return apptDate >= startOfMonth && (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED');
     });
     
     const quarterAppointments = appointments.filter(appt => {
       const apptDate = parseDateString(appt.appointmentDate);
       return apptDate >= startOfQuarter && (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED');
     });
    
    // Update stats
    setStats({
      week: weekAppointments.length,
      month: monthAppointments.length,
      quarter: quarterAppointments.length,
      pending: pendingCount
    });
    
         // Calculate week data (appointments per day of current week)
     const weekDayData = Array(7).fill(0); // [Monday, Tuesday, ..., Sunday]
     
     // Chỉ tính các cuộc hẹn trong tuần hiện tại
     const currentWeekAppointments = appointments.filter(appt => {
       const apptDate = parseDateString(appt.appointmentDate);
       return apptDate >= startOfWeek && 
              apptDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000) && 
              (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED');
     });
     
     currentWeekAppointments.forEach(appt => {
       const apptDate = parseDateString(appt.appointmentDate);
       const dayOfWeek = apptDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
       const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0 = Monday, ..., 6 = Sunday
       weekDayData[index]++;
     });
    
    setWeekData([
      { name: 'T2', value: weekDayData[0] },
      { name: 'T3', value: weekDayData[1] },
      { name: 'T4', value: weekDayData[2] },
      { name: 'T5', value: weekDayData[3] },
      { name: 'T6', value: weekDayData[4] },
      { name: 'T7', value: weekDayData[5] },
      { name: 'CN', value: weekDayData[6] },
    ]);
    
         // Calculate month data (appointments per week of current month)
     const weekData = Array(4).fill(0); // [Week 1, Week 2, Week 3, Week 4]
     
     // Chỉ tính các cuộc hẹn trong tháng hiện tại
     const currentMonthAppointments = appointments.filter(appt => {
       const apptDate = parseDateString(appt.appointmentDate);
       const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
       return apptDate >= startOfMonth && 
              apptDate < nextMonth && 
              (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED');
     });
     
     currentMonthAppointments.forEach(appt => {
       const apptDate = parseDateString(appt.appointmentDate);
       const day = apptDate.getDate();
       let weekIndex = Math.floor((day - 1) / 7); // 0-based week index
       if (weekIndex > 3) weekIndex = 3; // Cap at week 4
       weekData[weekIndex]++;
     });
    
    setMonthData([
      { name: 'Tuần 1', value: weekData[0] },
      { name: 'Tuần 2', value: weekData[1] },
      { name: 'Tuần 3', value: weekData[2] },
      { name: 'Tuần 4', value: weekData[3] },
    ]);
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.get(`/api/appointments/consultant/${userInfo.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

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
              <Typography variant="h5">{stats.week}</Typography>
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
                Request chờ phân công
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