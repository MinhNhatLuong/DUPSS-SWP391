import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Paper, Alert, CircularProgress, Button, Container } from '@mui/material';


import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';

export default function ConsultantDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
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
    fetchAllData();
    
    // Auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchAllData();
    }, 300000);
    
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

      // Get consultant's appointments
      const appointmentsResponse = await axios.get(`/api/consultant/${userInfo.id}/appointments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Get appointment history
      const historyResponse = await axios.get(`/api/appointments/consultant/${userInfo.id}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Get unassigned appointments
      const pendingResponse = await axios.get(`/api/consultant/appointments/unassigned`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Combine data
      const allAppointments = [...appointmentsResponse.data, ...historyResponse.data];
      
      if (allAppointments.length > 0) {
        calculateStats(allAppointments, pendingResponse.data.length);
      } else {
        setStats({
          pending: pendingResponse.data.length,
          confirmed: 0,
          completed: 0,
          cancelled: 0
        });
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu thống kê');
    }
  };

  const calculateStats = (appointments, pendingCount) => {
    // Count appointments by status
    const confirmedAppointments = appointments.filter(appt => appt.status === 'CONFIRMED');
    const completedAppointments = appointments.filter(appt => appt.status === 'COMPLETED');
    const cancelledAppointments = appointments.filter(
      appt => appt.status === 'CANCELLED' || appt.status === 'CANCELED'
    );
    
    setStats({
      pending: pendingCount,
      confirmed: confirmedAppointments.length,
      completed: completedAppointments.length,
      cancelled: cancelledAppointments.length
    });
    
    // Calculate weekly data
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekDayData = Array(7).fill(0); // [Mon, Tue, ..., Sun]
    
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
    
    // Calculate monthly data
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekData = Array(4).fill(0); // [Week 1, Week 2, Week 3, Week 4]
    
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

      const response = await axios.get(`/api/consultant/${userInfo.id}/appointments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Filter confirmed appointments and sort by date
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

  // Helper functions for date/time handling
  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date();
    
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    
    return new Date(dateStr);
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') return timeObj;
    const { hour, minute } = timeObj;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  // Kiểm tra xem có thể bắt đầu buổi tư vấn chưa (cho phép trước 10 phút)
  const canStartAppointment = (appointment) => {
    if (!appointment || appointment.status !== 'CONFIRMED') return false;
    
    // Xử lý ngày tháng
    const appointmentDate = parseDateString(appointment.appointmentDate);
    
    // Xử lý giờ phút
    let appointmentHour = 0;
    let appointmentMinute = 0;
    
    if (typeof appointment.appointmentTime === 'string') {
      const timeParts = appointment.appointmentTime.split(':');
      appointmentHour = parseInt(timeParts[0]);
      appointmentMinute = parseInt(timeParts[1]);
    } else if (appointment.appointmentTime && appointment.appointmentTime.hour !== undefined) {
      appointmentHour = appointment.appointmentTime.hour || 0;
      appointmentMinute = appointment.appointmentTime.minute || 0;
    }
    
    // Tạo đối tượng Date đầy đủ với ngày và giờ
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(appointmentHour, appointmentMinute, 0);
    
    const now = new Date();
    
    // Tính thời gian còn lại (tính bằng phút) đến buổi tư vấn
    const minutesUntilAppointment = Math.floor((appointmentDateTime - now) / (60 * 1000));
    
    // Cho phép bắt đầu nếu thời gian còn lại ≤ 10 phút
    return minutesUntilAppointment <= 10;
  };

  // Handle starting an appointment via Google Meet
  const handleStartAppointment = async (appointment) => {
    try {
      // Kiểm tra có thể bắt đầu buổi tư vấn chưa
      if (!canStartAppointment(appointment)) {
        alert('Chỉ có thể vào Google Meet trước buổi tư vấn 10 phút!');
        return;
      }
      
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Call the start appointment API
      const response = await axios.put(`/api/appointments/${appointment.id}/start?consultantId=${userInfo.id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Open Google Meet link from response or fallback to generated link
      if (response.data && response.data.linkGoogleMeet) {
        window.open(response.data.linkGoogleMeet, '_blank');
      } else {
        // Fallback to a dummy Google Meet link based on appointment ID
        window.open(`https://meet.google.com/${appointment.id}`, '_blank');
      }
    } catch (err) {
      console.error('Error starting appointment:', err);
      alert('Không thể bắt đầu buổi tư vấn: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Consultant Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1%', mb: 4, width: '100%' }}>
        <Box sx={{ width: '24%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Yêu cầu đang đợi duyệt
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#ff9800' }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: '24%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Số buổi tư vấn đã xác nhận
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#2196f3' }}>
                {stats.confirmed}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: '24%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Số buổi tư vấn đã hoàn thành
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#4caf50' }}>
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: '24%' }}>
          <Card sx={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography color="textSecondary" gutterBottom>
                Số buổi tư vấn đã hủy
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#f44336' }}>
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '2%', mb: 4, width: '100%' }}>
        <Box sx={{ width: '49%' }}>
          <Paper sx={{ p: 3, height: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
              Biểu đồ số buổi tư vấn trong tuần
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="value" fill="#1976d2" name="Số buổi tư vấn" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
        <Box sx={{ width: '49%' }}>
          <Paper sx={{ p: 3, height: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
              Biểu đồ số buổi tư vấn trong tháng
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="value" fill="#43a047" name="Số buổi tư vấn" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>

      {/* Upcoming Appointments */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Buổi tư vấn sắp tới
        </Typography>
        <Card sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : (
            <Box sx={{ minHeight: '200px' }}>
              {upcomingAppointments.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {upcomingAppointments.map((appointment, index) => (
                    <ListItem 
                      key={appointment.id}
                      sx={{ 
                        py: 2.5, 
                        px: 3,
                        borderBottom: index < upcomingAppointments.length - 1 ? '1px solid #e0e0e0' : 'none',
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                            {`${appointment.customerName} - ${appointment.topicName}`}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {`${formatDate(appointment.appointmentDate)} ${formatTime(appointment.appointmentTime)}`}
                          </Typography>
                        }
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleStartAppointment(appointment)}
                        disabled={!canStartAppointment(appointment)}
                        sx={{ 
                          ml: 2,
                          px: 2,
                          borderRadius: '20px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          opacity: canStartAppointment(appointment) ? 1 : 0.6,
                          '&:hover': {
                            boxShadow: canStartAppointment(appointment) ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'
                          }
                        }}
                      >
                        {canStartAppointment(appointment) ? 'Vào Google Meet' : 'Chưa đến giờ tham gia'}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <Typography variant="body1" color="textSecondary">
                    Không có buổi tư vấn nào sắp tới
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
} 