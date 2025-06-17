import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';

// Khung giờ từ 7h đến 19h
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => 7 + i); // 7h-19h
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6']; // Chỉ thứ 2 đến thứ 6

const statusColor = {
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELED: 'error',
  PENDING: 'default',
  ongoing: 'warning',
};

const statusLabel = {
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELED: 'Đã hủy',
  PENDING: 'Chờ xác nhận',
  ongoing: 'Đang diễn ra',
};

// Lấy ngày đầu tuần (thứ 2)
function getStartOfWeek(date) {
  const d = dayjs(date);
  const day = d.day();
  // Nếu là chủ nhật (0), trả về thứ 2 tuần sau
  if (day === 0) return d.add(1, 'day');
  // Nếu là thứ 2-6, trả về thứ 2 cùng tuần
  if (day >= 1 && day <= 5) return d.subtract(day - 1, 'day');
  // Nếu là thứ 7, trả về thứ 2 tuần sau
  return d.add(9 - day, 'day');
}

export default function Schedule() {
  const [dialog, setDialog] = useState({ open: false, appt: null });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(dayjs()));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const tableRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Dialog xác nhận
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    appointmentId: null, 
    action: null, // 'complete' hoặc 'cancel'
    appointmentData: null,
    loading: false
  });
  
  const weekDays = Array.from({ length: 5 }, (_, i) => weekStart.clone().add(i, 'day'));

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchAppointments();
    
    // Cập nhật thời gian hiện tại mỗi phút
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [weekStart]);
  
  // Kiểm tra và tự động hủy các cuộc hẹn quá 24 giờ
  useEffect(() => {
    const checkExpiredAppointments = async () => {
      const now = dayjs();
      
      // Kiểm tra từng cuộc hẹn
      for (const appt of appointments) {
        if (appt.status !== 'CONFIRMED') continue;
        
        // Chuyển đổi ngày và giờ hẹn sang đối tượng dayjs
        const appointmentDate = dayjs(appt.appointmentDate, 'DD/MM/YYYY');
        
        let appointmentHour = 0;
        let appointmentMinute = 0;
        
        if (typeof appt.appointmentTime === 'string') {
          const timeParts = appt.appointmentTime.split(':');
          appointmentHour = parseInt(timeParts[0]);
          appointmentMinute = parseInt(timeParts[1]);
        } else if (appt.appointmentTime && appt.appointmentTime.hour !== undefined) {
          appointmentHour = appt.appointmentTime.hour || 0;
          appointmentMinute = appt.appointmentTime.minute || 0;
        }
        
        const appointmentDateTime = appointmentDate.hour(appointmentHour).minute(appointmentMinute);
        const timeDiff = now.diff(appointmentDateTime, 'hour');
        
        // Nếu đã qua 24 giờ kể từ thời điểm hẹn và vẫn ở trạng thái CONFIRMED
        if (timeDiff >= 24) {
          try {
            const userInfo = getUserInfo();
            if (!userInfo || !userInfo.id) {
              console.error('Không tìm thấy thông tin người dùng');
              continue;
            }
            
            // Tự động hủy cuộc hẹn dựa vào loại người dùng
            if (appt.guest) {
              // Sử dụng API hủy cho guest
              await axios.post(`/api/appointments/${appt.id}/cancel/guest?email=${encodeURIComponent(appt.email)}`, {}, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
              });
            } else {
              // Sử dụng API hủy cho user
              await axios.post(`/api/appointments/${appt.id}/cancel/user/${userInfo.id}`, {}, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
              });
            }
            
            // Cập nhật danh sách lịch hẹn
            setAppointments(prev => 
              prev.map(item => item.id === appt.id ? { ...item, status: 'CANCELED' } : item)
            );
            
            console.log(`Tự động hủy cuộc hẹn ID ${appt.id} sau 24 giờ`);
          } catch (error) {
            console.error(`Lỗi khi tự động hủy cuộc hẹn ID ${appt.id}:`, error);
          }
        }
      }
    };
    
    // Kiểm tra mỗi giờ
    const timer = setInterval(checkExpiredAppointments, 3600000); // 1 giờ
    
    // Kiểm tra ngay khi danh sách cuộc hẹn thay đổi
    if (appointments.length > 0) {
      checkExpiredAppointments();
    }
    
    return () => clearInterval(timer);
  }, [appointments]);
  
  // Cập nhật thanh thời gian thực
  useEffect(() => {
    updateTimeline();
    
    // Update timeline position every 30 seconds for smoother movement
    const timer = setInterval(updateTimeline, 30000);
    
    return () => clearInterval(timer);
  }, [currentTime, weekStart, weekDays]);
  
  const updateTimeline = () => {
    if (!tableRef.current || !timelineRef.current) return;
    
    const now = dayjs();
    const today = now.format('YYYY-MM-DD');
    const currentDay = now.day(); // 0: chủ nhật, 1-5: thứ 2-6, 6: thứ 7
    
    // Check if current day is in the visible week range
    const startOfWeek = weekStart.format('YYYY-MM-DD');
    const endOfWeek = weekStart.clone().add(4, 'day').format('YYYY-MM-DD');
    const isInCurrentWeek = dayjs(today).isAfter(startOfWeek, 'day') || dayjs(today).isSame(startOfWeek, 'day');
    const isBeforeEndOfWeek = dayjs(today).isBefore(endOfWeek, 'day') || dayjs(today).isSame(endOfWeek, 'day');
    
    // Only show timeline if it's a weekday, within working hours, and in the visible week
    if (currentDay >= 1 && currentDay <= 5 && now.hour() >= 7 && now.hour() < 19 && isInCurrentWeek && isBeforeEndOfWeek) {
      // Find column index for current day in the displayed week
      const dayIndex = weekDays.findIndex(d => d.format('YYYY-MM-DD') === today);
      
      if (dayIndex !== -1) {
        // Calculate position based on current hour and minute
        const hourFraction = now.hour() - 7 + now.minute() / 60;
        
        // Get table dimensions
        const tableRect = tableRef.current.getBoundingClientRect();
        const headerHeight = tableRef.current.querySelector('thead').offsetHeight;
        const timeColumnWidth = tableRef.current.querySelector('th') ? 
                               tableRef.current.querySelector('th').offsetWidth : 
                               tableRect.width / 6;
        
        // Calculate positions accounting for borders and padding
        const cellWidth = (tableRect.width - timeColumnWidth) / 5;
        const bodyHeight = tableRect.height - headerHeight;
        const rowHeight = bodyHeight / TIME_SLOTS.length;
        
        // Position the timeline - adjust top position to account for header height
        timelineRef.current.style.left = `${timeColumnWidth + dayIndex * cellWidth}px`;
        timelineRef.current.style.top = `${headerHeight + hourFraction * rowHeight}px`;
        timelineRef.current.style.width = `${cellWidth}px`;
        timelineRef.current.style.display = 'block';
        timelineRef.current.style.transition = 'top 0.5s linear';
      } else {
        timelineRef.current.style.display = 'none';
      }
    } else {
      // Hide timeline if not in working hours or not a weekday
      timelineRef.current.style.display = 'none';
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Lấy ngày bắt đầu và kết thúc của tuần
      const startDate = weekStart.format('YYYY-MM-DD');
      const endDate = weekStart.clone().add(4, 'day').format('YYYY-MM-DD');

      const response = await axios.get(`/api/appointments/consultant/${userInfo.id}`, {
        params: {
          startDate,
          endDate
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Đã xảy ra lỗi khi tải lịch làm việc'
      );
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đến tuần trước
  const goToPreviousWeek = () => {
    setWeekStart(weekStart.clone().subtract(7, 'day'));
  };

  // Chuyển đến tuần hiện tại
  const goToCurrentWeek = () => {
    setWeekStart(getStartOfWeek(dayjs()));
  };

  // Chuyển đến tuần tiếp theo
  const goToNextWeek = () => {
    setWeekStart(weekStart.clone().add(7, 'day'));
  };

  // Cập nhật trạng thái buổi tư vấn
  const updateAppointmentStatus = async (id, status) => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log(`Đang cập nhật trạng thái cuộc hẹn ${id} thành ${status}`);
      console.log('Thông tin người dùng:', userInfo);
      console.log('Gửi request đến:', `/api/appointments/${id}/status`);
      
      await axios.patch(`/api/appointments/${id}/status?status=${status}&consultantId=${userInfo.id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Cập nhật danh sách lịch hẹn
      setAppointments(prev => 
        prev.map(appt => appt.id === id ? { ...appt, status } : appt)
      );
      
      // Hiển thị thông báo
      setSnackbar({ 
        open: true, 
        message: status === 'COMPLETED' 
          ? 'Buổi tư vấn đã được đánh dấu hoàn thành!' 
          : 'Buổi tư vấn đã được hủy bỏ!', 
        severity: status === 'COMPLETED' ? 'success' : 'error' 
      });
      
      setDialog({ open: false, appt: null });
    } catch (err) {
      console.error('Error updating appointment status:', err);
      console.error('Error details:', err.response?.data || 'No response data');
      setSnackbar({ 
        open: true, 
        message: 'Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
    }
  };

  // Tìm lịch hẹn cho từng ô
  function findAppointment(day, hour) {
    const dateString = day.format('DD/MM/YYYY');
    
    return appointments.find(appt => {
      // Parse the appointment time from the database format
      let appointmentHour = null;
      if (typeof appt.appointmentTime === 'string') {
        // If it's a string like "14:00" or "14:00:00.000000"
        appointmentHour = parseInt(appt.appointmentTime.split(':')[0]);
      } else if (appt.appointmentTime && appt.appointmentTime.hour !== undefined) {
        // If it's an object with hour property
        appointmentHour = appt.appointmentTime.hour;
      }
      
      // Check if the appointment matches the current day and hour
      const dateMatches = appt.appointmentDate === dateString;
      const hourMatches = appointmentHour === hour;
      
      return dateMatches && hourMatches;
    });
  }

  // Format thời gian
  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    
    // Handle string time format (e.g. "14:00:00.000000")
    if (typeof timeObj === 'string') {
      const parts = timeObj.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    
    // Handle object time format
    const { hour, minute } = timeObj;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Kiểm tra xem buổi tư vấn có đang diễn ra không
  function getAppointmentStatus(appt) {
    if (appt.status !== 'CONFIRMED') return appt.status;
    
    const appointmentDate = dayjs(appt.appointmentDate);
    
    // Handle different time formats
    let appointmentHour = 0;
    let appointmentMinute = 0;
    
    if (typeof appt.appointmentTime === 'string') {
      // If it's a string like "14:00:00.000000"
      const timeParts = appt.appointmentTime.split(':');
      appointmentHour = parseInt(timeParts[0]);
      appointmentMinute = parseInt(timeParts[1]);
    } else if (appt.appointmentTime && appt.appointmentTime.hour !== undefined) {
      // If it's an object with hour/minute properties
      appointmentHour = appt.appointmentTime.hour || 0;
      appointmentMinute = appt.appointmentTime.minute || 0;
    }
    
    const startTime = appointmentDate.hour(appointmentHour).minute(appointmentMinute);
    const endTime = startTime.add(1, 'hour'); // Giả sử mỗi buổi tư vấn kéo dài 1 giờ
    
    const now = dayjs();
    
    if (now.isAfter(startTime) && now.isBefore(endTime)) {
      return 'ongoing';
    }
    
    return appt.status;
  }

  // Kiểm tra xem có thể hiển thị nút hoàn thành/hủy bỏ không
  const canShowActionButtons = (appt) => {
    // Chỉ hiển thị nút cho các cuộc hẹn ở trạng thái CONFIRMED hoặc PENDING
    if (appt.status !== 'CONFIRMED' && appt.status !== 'PENDING') return false;
    
    console.log('Kiểm tra hiển thị nút cho cuộc hẹn:', appt);
    console.log('Trạng thái cuộc hẹn:', appt.status);
    console.log('Thời gian hiện tại:', dayjs().format('DD/MM/YYYY HH:mm'));
    
    // Xử lý ngày tháng
    let appointmentDate;
    if (typeof appt.appointmentDate === 'string' && appt.appointmentDate.includes('/')) {
      // Định dạng DD/MM/YYYY
      const [day, month, year] = appt.appointmentDate.split('/');
      appointmentDate = dayjs(`${year}-${month}-${day}`);
    } else {
      // Định dạng khác
      appointmentDate = dayjs(appt.appointmentDate);
    }
    
    console.log('Ngày hẹn (đã parse):', appointmentDate.format('DD/MM/YYYY'));
    
    // Handle different time formats
    let appointmentHour = 0;
    let appointmentMinute = 0;
    
    if (typeof appt.appointmentTime === 'string') {
      // If it's a string like "14:00:00.000000"
      const timeParts = appt.appointmentTime.split(':');
      appointmentHour = parseInt(timeParts[0]);
      appointmentMinute = parseInt(timeParts[1]);
    } else if (appt.appointmentTime && appt.appointmentTime.hour !== undefined) {
      // If it's an object with hour/minute properties
      appointmentHour = appt.appointmentTime.hour || 0;
      appointmentMinute = appt.appointmentTime.minute || 0;
    }
    
    // Tạo đối tượng dayjs đầy đủ với ngày và giờ
    const appointmentDateTime = appointmentDate
      .hour(appointmentHour)
      .minute(appointmentMinute)
      .second(0);
    
    console.log('Thời gian hẹn đầy đủ:', appointmentDateTime.format('DD/MM/YYYY HH:mm'));
    
    const now = dayjs();
    const isAfterOrSame = now.isAfter(appointmentDateTime) || 
                          now.format('YYYY-MM-DD HH:mm') === appointmentDateTime.format('YYYY-MM-DD HH:mm');
    
    console.log('Đã đến hoặc qua giờ hẹn?', isAfterOrSame);
    
    // Hiển thị nút khi thời gian hiện tại đã đến hoặc vượt qua thời gian bắt đầu buổi tư vấn
    return isAfterOrSame;
  };

  // Tạo link Google Meet (giả)
  const generateMeetLink = (appt) => {
    return `https://meet.google.com/${appt.id.toString().substring(0, 3)}-${appt.id.toString().substring(3, 7)}-${appt.id.toString().substring(7, 10)}`;
  };

  // Cập nhật trạng thái buổi tư vấn thành hoàn thành
  const handleComplete = (appt) => {
    setConfirmDialog({
      open: true,
      appointmentId: appt.id,
      action: 'complete',
      appointmentData: appt
    });
  };

  // Hủy buổi tư vấn
  const handleCancel = (appt) => {
    setConfirmDialog({
      open: true,
      appointmentId: appt.id,
      action: 'cancel',
      appointmentData: appt
    });
  };

  // Xử lý sau khi xác nhận
  const handleConfirmAction = async () => {
    try {
      // Set loading state
      setConfirmDialog(prev => ({ ...prev, loading: true }));
      // Show loading notification
      setSnackbar({ 
        open: true, 
        message: 'Đang xử lý...', 
        severity: 'warning' 
      });
      
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const { appointmentId, action, appointmentData } = confirmDialog;
      console.log(`Xử lý hành động ${action} cho cuộc hẹn ${appointmentId}`);
      console.log('Dữ liệu cuộc hẹn:', appointmentData);

      if (action === 'complete') {
        // Hoàn thành buổi tư vấn
        console.log('Gửi request hoàn thành cuộc hẹn');
        try {
          await axios.patch(`/api/appointments/${appointmentId}/status?status=COMPLETED&consultantId=${userInfo.id}`, {}, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          console.log('Hoàn thành cuộc hẹn thành công');
        } catch (patchError) {
          console.error('Lỗi khi gọi API hoàn thành:', patchError);
          console.error('Chi tiết lỗi:', patchError.response?.data || 'Không có dữ liệu phản hồi');
          throw patchError;
        }

        // Cập nhật danh sách lịch hẹn
        setAppointments(prev => 
          prev.map(appt => appt.id === appointmentId ? { ...appt, status: 'COMPLETED' } : appt)
        );
      } else if (action === 'cancel') {
        // Hủy buổi tư vấn dựa vào loại người dùng (guest hoặc user)
        console.log('Gửi request hủy cuộc hẹn');
        try {
          if (appointmentData.guest) {
            // Sử dụng API hủy cho guest
            console.log('Hủy cuộc hẹn cho khách (guest)');
            await axios.post(`/api/appointments/${appointmentId}/cancel/guest?email=${encodeURIComponent(appointmentData.email)}`, {}, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
          } else {
            // Sử dụng API hủy cho user
            console.log('Hủy cuộc hẹn cho người dùng (user)');
            await axios.post(`/api/appointments/${appointmentId}/cancel/user/${userInfo.id}`, {}, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
          }
          console.log('Hủy cuộc hẹn thành công');
        } catch (cancelError) {
          console.error('Lỗi khi gọi API hủy:', cancelError);
          console.error('Chi tiết lỗi:', cancelError.response?.data || 'Không có dữ liệu phản hồi');
          throw cancelError;
        }

        // Cập nhật danh sách lịch hẹn
        setAppointments(prev => 
          prev.map(appt => appt.id === appointmentId ? { ...appt, status: 'CANCELED' } : appt)
        );
      }
      
      // Hiển thị thông báo thành công
      setSnackbar({ 
        open: true, 
        message: 'Dữ liệu đã được cập nhật thành công!', 
        severity: 'success' 
      });
      
      // Đóng dialog
      setConfirmDialog({ open: false, appointmentId: null, action: null, appointmentData: null, loading: false });
      setDialog({ open: false, appt: null });
    } catch (err) {
      console.error('Error updating appointment status:', err);
      console.error('Error stack:', err.stack);
      setSnackbar({ 
        open: true, 
        message: 'Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lịch tư vấn
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lịch tư vấn (Thứ 2 - Thứ 6)
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button variant="outlined" onClick={goToPreviousWeek} sx={{ mr: 1 }}>
            Tuần trước
          </Button>
          <Button variant="contained" onClick={goToCurrentWeek} sx={{ mr: 1 }}>
            Tuần hiện tại
          </Button>
          <Button variant="outlined" onClick={goToNextWeek}>
            Tuần sau
          </Button>
        </Box>
        <Typography variant="h6">
          {weekStart.format('DD/MM/YYYY')} - {weekStart.clone().add(4, 'day').format('DD/MM/YYYY')}
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ position: 'relative' }}>
          <TableContainer 
            component={Paper} 
            sx={{ borderRadius: 3, boxShadow: 3, background: '#fafcff', overflow: 'hidden' }}
            ref={tableRef}
          >
            <Table size="small" sx={{ minWidth: 900, tableLayout: 'fixed', borderRadius: 3 }}>
              <TableHead>
                <TableRow sx={{ background: '#e3f2fd' }}>
                  <TableCell sx={{ width: 70, fontWeight: 700, background: '#e3f2fd', color: '#1976d2', fontSize: 16 }}>Giờ</TableCell>
                  {weekDays.map((d, idx) => (
                    <TableCell key={idx} align="center" sx={{ fontWeight: 700, background: '#e3f2fd', color: '#1976d2', fontSize: 16 }}>
                      <div>{WEEK_DAYS[idx]}</div>
                      <div style={{ fontSize: 15 }}>{d.format('DD/MM')}</div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {TIME_SLOTS.map((hour) => (
                  <TableRow key={hour} sx={{ height: 60, '&:hover': { background: '#f1f8ff' } }}>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5', fontSize: 15 }}>{hour}:00</TableCell>
                    {weekDays.map((d, idx) => {
                      const appt = findAppointment(d, hour);
                      const status = appt ? getAppointmentStatus(appt) : null;
                      return (
                        <TableCell key={idx} align="center" sx={{ p: 0, border: '1px solid #e3e3e3', borderLeft: 0, borderRight: 0 }}>
                          {appt ? (
                            <Tooltip title={`${appt.topicName} - ${appt.customerName}`} arrow>
                              <Box
                                sx={{
                                  bgcolor: '#e3f2fd',
                                  border: `2px solid ${status === 'COMPLETED' ? '#388e3c' : 
                                                      status === 'ongoing' ? '#ffa726' : 
                                                      status === 'CANCELED' ? '#d32f2f' : '#42a5f5'}`,
                                  color: '#222',
                                  borderRadius: 2,
                                  px: 1,
                                  py: 0.5,
                                  m: 0.5,
                                  cursor: 'pointer',
                                  minWidth: 110,
                                  minHeight: 60,
                                  boxShadow: 2,
                                  fontWeight: 500,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                onClick={() => setDialog({ open: true, appt })}
                              >
                                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{appt.customerName}</div>
                                <div style={{ fontSize: 13, color: '#1976d2', marginBottom: 2 }}>{appt.topicName}</div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                                  {formatTime(appt.appointmentTime)} - {
                                    typeof appt.appointmentTime === 'string' 
                                      ? (() => {
                                          const parts = appt.appointmentTime.split(':');
                                          const hour = parseInt(parts[0]);
                                          return `${(hour + 1).toString().padStart(2, '0')}:${parts[1]}`;
                                        })()
                                      : formatTime({
                                          hour: (appt.appointmentTime?.hour || 0) + 1,
                                          minute: appt.appointmentTime?.minute || 0
                                        })
                                  }
                                </div>
                                <Chip
                                  label={statusLabel[status] || status}
                                  color={statusColor[status] || 'default'}
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Thanh thời gian thực */}
          <Box
            ref={timelineRef}
            sx={{
              position: 'absolute',
              height: '2px',
              backgroundColor: 'red',
              zIndex: 10,
              left: 0,
              right: 0,
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: 'red',
                borderRadius: '50%',
                left: '-5px',
                top: '-4px'
              }
            }}
          />
        </Box>
      )}
      
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, appt: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
        <DialogContent>
          {dialog.appt && (
            <Box>
              <Typography sx={{ mb: 1 }}><b>Khách hàng:</b> {dialog.appt.customerName}</Typography>
              <Typography sx={{ mb: 1 }}><b>Email:</b> {dialog.appt.email || 'Không có'}</Typography>
              <Typography sx={{ mb: 1 }}><b>Số điện thoại:</b> {dialog.appt.phoneNumber || 'Không có'}</Typography>
              <Typography sx={{ mb: 1 }}><b>Chủ đề tư vấn:</b> {dialog.appt.topicName}</Typography>
              <Typography sx={{ mb: 1 }}>
                <b>Thời gian:</b> {formatTime(dialog.appt.appointmentTime)} - {
                  typeof dialog.appt.appointmentTime === 'string' 
                    ? (() => {
                        const parts = dialog.appt.appointmentTime.split(':');
                        const hour = parseInt(parts[0]);
                        return `${(hour + 1).toString().padStart(2, '0')}:${parts[1]}`;
                      })()
                    : formatTime({
                        hour: (dialog.appt.appointmentTime?.hour || 0) + 1,
                        minute: dialog.appt.appointmentTime?.minute || 0
                      })
                } {dialog.appt.appointmentDate}
              </Typography>
              <Typography sx={{ mb: 1 }}><b>Trạng thái:</b> {statusLabel[getAppointmentStatus(dialog.appt)] || dialog.appt.status}</Typography>
              
              <Button
                variant="contained"
                color="primary"
                href={generateMeetLink(dialog.appt)}
                target="_blank"
                sx={{ mt: 2, mr: 1 }}
              >
                Vào Google Meet
              </Button>
              
              {canShowActionButtons(dialog.appt) && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleComplete(dialog.appt)}
                    sx={{ mt: 2, mr: 1 }}
                  >
                    Hoàn thành
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancel(dialog.appt)}
                    sx={{ mt: 2 }}
                  >
                    Hủy bỏ
                  </Button>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, appt: null })}>Đóng</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận hành động */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => !confirmDialog.loading && setConfirmDialog({ open: false, appointmentId: null, action: null, appointmentData: null, loading: false })}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action === 'complete' ? 'Xác nhận hoàn thành' : 'Xác nhận hủy bỏ'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'complete' 
              ? 'Bạn có chắc chắn muốn đánh dấu buổi tư vấn này là đã hoàn thành không?' 
              : 'Bạn có chắc chắn muốn hủy bỏ buổi tư vấn này không?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => !confirmDialog.loading && setConfirmDialog({ open: false, appointmentId: null, action: null, appointmentData: null, loading: false })} 
            color="primary"
            disabled={confirmDialog.loading}
          >
            Không
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={confirmDialog.action === 'complete' ? 'success' : 'error'} 
            variant="contained"
            disabled={confirmDialog.loading}
            startIcon={confirmDialog.loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {confirmDialog.loading 
              ? 'Đang xử lý...' 
              : (confirmDialog.action === 'complete' ? 'Hoàn thành' : 'Hủy bỏ')}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Box sx={{ fontSize: 14, color: 'text.secondary', mt: 2 }}>
        <b>Chú thích:</b> 
        <Chip label="Đã xác nhận" color="info" size="small" sx={{ mx: 1 }} />
        <Chip label="Đang diễn ra" color="warning" size="small" sx={{ mx: 1 }} />
        <Chip label="Đã hoàn thành" color="success" size="small" sx={{ mx: 1 }} />
        <Chip label="Đã hủy" color="error" size="small" sx={{ mx: 1 }} />
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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