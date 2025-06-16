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
  CANCELLED: 'error',
  PENDING: 'default',
  ongoing: 'warning',
};

const statusLabel = {
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
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
    appointmentData: null 
  });
  
  const weekDays = Array.from({ length: 5 }, (_, i) => weekStart.add(i, 'day'));

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchAppointments();
    
    // Cập nhật thời gian hiện tại mỗi phút
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [weekStart]);
  
  // Cập nhật thanh thời gian thực
  useEffect(() => {
    updateTimeline();
    
    // Cập nhật vị trí thanh thời gian mỗi phút
    const timer = setInterval(updateTimeline, 60000);
    
    return () => clearInterval(timer);
  }, [currentTime, tableRef.current]);
  
  const updateTimeline = () => {
    if (!tableRef.current || !timelineRef.current) return;
    
    const now = dayjs();
    const today = now.format('YYYY-MM-DD');
    const currentDay = now.day(); // 0: chủ nhật, 1-5: thứ 2-6, 6: thứ 7
    
    // Chỉ hiển thị thanh thời gian nếu là ngày trong tuần và trong giờ làm việc
    if (currentDay >= 1 && currentDay <= 5 && now.hour() >= 7 && now.hour() < 19) {
      // Tìm index của ngày hiện tại trong tuần (0-4)
      const dayIndex = currentDay - 1;
      
      // Tính toán vị trí dựa trên giờ và phút hiện tại
      const hourFraction = now.hour() - 7 + now.minute() / 60;
      
      // Lấy kích thước và vị trí của bảng
      const tableRect = tableRef.current.getBoundingClientRect();
      const cellWidth = tableRect.width / 6; // 6 cột (1 cột giờ + 5 cột ngày)
      const cellHeight = tableRect.height / 13; // 13 hàng (7h-19h)
      
      // Đặt vị trí của thanh thời gian
      timelineRef.current.style.left = `${cellWidth + dayIndex * cellWidth}px`;
      timelineRef.current.style.top = `${hourFraction * cellHeight}px`;
      timelineRef.current.style.width = `${cellWidth}px`;
      timelineRef.current.style.display = 'block';
    } else {
      // Ẩn thanh thời gian nếu không phải giờ làm việc hoặc không phải ngày trong tuần
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
      const endDate = weekStart.add(4, 'day').format('YYYY-MM-DD');

      const response = await axios.get(`http://localhost:8080/api/appointments/consultant/${userInfo.id}`, {
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
    setWeekStart(weekStart.subtract(7, 'day'));
  };

  // Chuyển đến tuần hiện tại
  const goToCurrentWeek = () => {
    setWeekStart(getStartOfWeek(dayjs()));
  };

  // Chuyển đến tuần tiếp theo
  const goToNextWeek = () => {
    setWeekStart(weekStart.add(7, 'day'));
  };

  // Cập nhật trạng thái buổi tư vấn
  const updateAppointmentStatus = async (id, status) => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      await axios.patch(`http://localhost:8080/api/appointments/${id}/status`, {
        status,
        consultantId: userInfo.id
      }, {
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
      setSnackbar({ 
        open: true, 
        message: 'Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
    }
  };

  // Tìm lịch hẹn cho từng ô
  function findAppointment(day, hour) {
    const dateString = day.format('YYYY-MM-DD');
    return appointments.find(appt => {
      const appointmentDate = appt.appointmentDate;
      const appointmentHour = appt.appointmentTime?.hour;
      return appointmentDate === dateString && appointmentHour === hour;
    });
  }

  // Kiểm tra xem buổi tư vấn có đang diễn ra không
  function getAppointmentStatus(appt) {
    if (appt.status !== 'CONFIRMED') return appt.status;
    
    const appointmentDate = dayjs(appt.appointmentDate);
    const appointmentHour = appt.appointmentTime?.hour || 0;
    const appointmentMinute = appt.appointmentTime?.minute || 0;
    
    const startTime = appointmentDate.hour(appointmentHour).minute(appointmentMinute);
    const endTime = startTime.add(1, 'hour'); // Giả sử mỗi buổi tư vấn kéo dài 1 giờ
    
    const now = dayjs();
    
    if (now.isAfter(startTime) && now.isBefore(endTime)) {
      return 'ongoing';
    }
    
    return appt.status;
  }

  // Format thời gian
  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    const { hour, minute } = timeObj;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Kiểm tra xem có thể hiển thị nút hoàn thành/hủy bỏ không
  const canShowActionButtons = (appt) => {
    if (appt.status !== 'CONFIRMED') return false;
    
    const appointmentDate = dayjs(appt.appointmentDate);
    const appointmentHour = appt.appointmentTime?.hour || 0;
    const appointmentMinute = appt.appointmentTime?.minute || 0;
    
    const startTime = appointmentDate.hour(appointmentHour).minute(appointmentMinute);
    const now = dayjs();
    
    // Hiển thị nút sau khi buổi tư vấn bắt đầu 10 phút
    return now.isAfter(startTime.add(10, 'minute'));
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
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const { appointmentId, action, appointmentData } = confirmDialog;

      if (action === 'complete') {
        // Hoàn thành buổi tư vấn
        await axios.patch(`http://localhost:8080/api/appointments/${appointmentId}/status`, {
          status: 'COMPLETED',
          consultantId: userInfo.id
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        // Cập nhật danh sách lịch hẹn
        setAppointments(prev => 
          prev.map(appt => appt.id === appointmentId ? { ...appt, status: 'COMPLETED' } : appt)
        );
        
        // Hiển thị thông báo
        setSnackbar({ 
          open: true, 
          message: 'Buổi tư vấn đã được đánh dấu hoàn thành!', 
          severity: 'success' 
        });
      } else if (action === 'cancel') {
        // Hủy buổi tư vấn
        if (appointmentData.guest) {
          await axios.post(`http://localhost:8080/api/appointments/${appointmentId}/cancel/guest`, {
            email: appointmentData.email
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
        } else {
          await axios.post(`http://localhost:8080/api/appointments/${appointmentId}/cancel/user/${userInfo.id}`, {}, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
        }

        // Cập nhật danh sách lịch hẹn
        setAppointments(prev => 
          prev.map(appt => appt.id === appointmentId ? { ...appt, status: 'CANCELLED' } : appt)
        );
        
        // Hiển thị thông báo
        setSnackbar({ 
          open: true, 
          message: 'Buổi tư vấn đã được hủy bỏ!', 
          severity: 'error' 
        });
      }
      
      // Đóng dialog
      setConfirmDialog({ open: false, appointmentId: null, action: null, appointmentData: null });
      setDialog({ open: false, appt: null });
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
      setConfirmDialog({ open: false, appointmentId: null, action: null, appointmentData: null });
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
          {weekStart.format('DD/MM/YYYY')} - {weekStart.add(4, 'day').format('DD/MM/YYYY')}
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
                                                      status === 'CANCELLED' ? '#d32f2f' : '#42a5f5'}`,
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
                                  {formatTime(appt.appointmentTime)} - {formatTime({
                                    hour: (appt.appointmentTime?.hour || 0) + 1,
                                    minute: appt.appointmentTime?.minute || 0
                                  })}
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
                <b>Thời gian:</b> {formatTime(dialog.appt.appointmentTime)} - {formatTime({
                  hour: (dialog.appt.appointmentTime?.hour || 0) + 1,
                  minute: dialog.appt.appointmentTime?.minute || 0
                })} {dialog.appt.appointmentDate}
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
        onClose={() => setConfirmDialog({ open: false, appointmentId: null, action: null, appointmentData: null })}
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
            onClick={() => setConfirmDialog({ open: false, appointmentId: null, action: null, appointmentData: null })} 
            color="primary"
          >
            Không
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={confirmDialog.action === 'complete' ? 'success' : 'error'} 
            variant="contained"
          >
            {confirmDialog.action === 'complete' ? 'Hoàn thành' : 'Hủy bỏ'}
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