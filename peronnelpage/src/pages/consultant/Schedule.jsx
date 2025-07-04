import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';
import apiClient from '../../services/apiService';

// Đăng ký plugin tuần trong năm
dayjs.extend(weekOfYear);

// Khung giờ từ 7h đến 24h (nửa đêm)
const TIME_SLOTS = [
  { id: 1, time: '8:00 - 9:00' },
  { id: 2, time: '9:00 - 10:00' },
  { id: 3, time: '10:00 - 11:00' },
  { id: 4, time: '11:00 - 12:00' },
  { id: 5, time: '13:00 - 14:00' },
  { id: 6, time: '14:00 - 15:00' },
  { id: 7, time: '15:00 - 16:00' },
  { id: 8, time: '16:00 - 17:00' },
];
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6']; // Thứ 2 đến thứ 6

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
  // Nếu là chủ nhật (0), trả về thứ 2 tuần trước
  if (day === 0) return d.subtract(6, 'day');
  // Nếu là thứ 2-7, trả về thứ 2 cùng tuần
  return d.subtract(day - 1, 'day');
}

// Hàm tạo danh sách các tuần trong năm
function getWeeksInYear(year) {
  const weeks = [];
  const firstDay = dayjs(`${year}-01-01`);
  const lastDay = dayjs(`${year}-12-31`);
  
  let weekStart = getStartOfWeek(firstDay);
  
  // Tạo danh sách tất cả các tuần trong năm
  while (weekStart.isBefore(lastDay)) {
    const weekEnd = weekStart.clone().add(6, 'day');
    weeks.push({
      value: weekStart.format('YYYY-MM-DD'),
      label: `Tuần ${weekStart.week()}: ${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM')}`
    });
    weekStart = weekStart.add(7, 'day');
  }
  
  return weeks;
}

export default function Schedule() {
  const [dialog, setDialog] = useState({ open: false, appt: null });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [weekStart, setWeekStart] = useState(getStartOfWeek(dayjs()));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const tableRef = useRef(null);
  
  // Danh sách tuần trong năm
  const currentYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [weeksInYear, setWeeksInYear] = useState(getWeeksInYear(currentYear));
  
  // Dialog xác nhận
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    appointmentId: null, 
    action: null, // 'complete' hoặc 'cancel'
    appointmentData: null,
    loading: false
  });

  // Thêm state cho consultant note và cancel reason
  const [consultantNote, setConsultantNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  
  const weekDays = Array.from({ length: 5 }, (_, i) => weekStart.clone().add(i, 'day'));

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchAppointments();
  }, [weekStart]);
  
  // Cập nhật giá trị tuần được chọn khi thay đổi tuần bắt đầu
  useEffect(() => {
    // Nếu năm của weekStart khác với selectedYear, cập nhật selectedYear và danh sách tuần
    if (weekStart.year() !== selectedYear) {
      setSelectedYear(weekStart.year());
      setWeeksInYear(getWeeksInYear(weekStart.year()));
    }
  }, [weekStart, selectedYear]);
  
  // Remove the useEffect for auto-cancellation after 24 hours
  useEffect(() => {
    fetchAppointments();
  }, [weekStart]);
  


  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Lấy ngày bắt đầu và kết thúc của tuần
      const startDate = weekStart.format('YYYY-MM-DD');
      const endDate = weekStart.clone().add(6, 'day').format('YYYY-MM-DD');

      // Fetch appointments
      const appointmentsResponse = await apiClient.get(`/appointments/consultant/${userInfo.id}`, {
        params: {
          startDate,
          endDate
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Fetch registered slots for each day in the week
      const slotsPromises = weekDays.map(async (day) => {
        try {
          const date = day.format('DD/MM/YYYY');
          const response = await apiClient.get(`/public/slots/consultant/${userInfo.id}`, {
            params: { date }
          });
          return response.data || [];
        } catch (error) {
          console.error(`Error fetching slots for ${day.format('DD/MM/YYYY')}:`, error);
          return [];
        }
      });
      
      const allSlotsResponses = await Promise.all(slotsPromises);
      // Flatten the array of arrays
      const registeredSlots = allSlotsResponses.flat();
      
      // Convert registered slots to a format similar to appointments
      const slotsAsAppointments = registeredSlots.map(slot => {
        return {
          ...slot,
          id: slot.id || `slot-${Math.random().toString(36).substr(2, 9)}`,
          isRegisteredSlot: true, // Mark as registered slot without appointment
          appointmentDate: slot.date, // Ensure the date is properly set
          appointmentTime: slot.startTime // Ensure the time is properly set
        };
      });
      
      // Merge appointments and slots, avoiding duplicates
      // A slot is a duplicate if there's already an appointment at the same date and time
      const mergedData = [...appointmentsResponse.data];
      
      slotsAsAppointments.forEach(slot => {
        // Check if this slot already has an appointment
        const hasAppointment = appointmentsResponse.data.some(appt => 
          appt.appointmentDate === slot.appointmentDate && 
          (
            (typeof appt.appointmentTime === 'string' && appt.appointmentTime === slot.appointmentTime) ||
            (appt.appointmentTime?.hour === parseInt(slot.appointmentTime.split(':')[0]) &&
             appt.appointmentTime?.minute === parseInt(slot.appointmentTime.split(':')[1]))
          )
        );
        
        // If this slot doesn't have an appointment, add it to the merged data
        if (!hasAppointment) {
          mergedData.push(slot);
        }
      });
      
      setAppointments(mergedData);
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

  // Chuyển đổi năm
  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    setWeeksInYear(getWeeksInYear(newYear));
  };
  
  // Chuyển đổi tuần
  const handleWeekChange = (e) => {
    const selectedDate = e.target.value;
    setWeekStart(dayjs(selectedDate));
  };

  // Chuyển đến tuần hiện tại
  const goToCurrentWeek = () => {
    const currentWeekStart = getStartOfWeek(dayjs());
    setWeekStart(currentWeekStart);
    setSelectedYear(currentWeekStart.year());
    setWeeksInYear(getWeeksInYear(currentWeekStart.year()));
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
      console.log('Gửi request đến:', `/appointments/${id}/status?status=${status}&consultantId=${userInfo.id}`);
      
      await apiClient.patch(`/appointments/${id}/status?status=${status}&consultantId=${userInfo.id}`, {}, {
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
  function findAppointment(day, slotId) {
    const dateString = day.format('DD/MM/YYYY');
    
    // Map slotId to corresponding hour
    let hour;
    switch(slotId) {
      case 1: hour = 8; break;  // 8:00 - 9:00
      case 2: hour = 9; break;  // 9:00 - 10:00
      case 3: hour = 10; break; // 10:00 - 11:00
      case 4: hour = 11; break; // 11:00 - 12:00
      case 5: hour = 13; break; // 13:00 - 14:00
      case 6: hour = 14; break; // 14:00 - 15:00
      case 7: hour = 15; break; // 15:00 - 16:00
      case 8: hour = 16; break; // 16:00 - 17:00
      default: return null;
    }
    
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
  const canShowActionButtons = (appt, action = 'all') => {
    // Chỉ hiển thị nút cho các cuộc hẹn ở trạng thái CONFIRMED hoặc PENDING
    if (appt.status !== 'CONFIRMED' && appt.status !== 'PENDING') return false;
    
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
    
    const now = dayjs();
    
    // Tính thời gian còn lại (tính bằng phút) đến buổi tư vấn
    const minutesUntilAppointment = appointmentDateTime.diff(now, 'minute');
    
    // Nếu kiểm tra cho nút hủy bỏ
    if (action === 'cancel') {
      // Cho phép hủy bỏ buổi tư vấn bất kỳ lúc nào trước khi bắt đầu
      return minutesUntilAppointment > 0;
    }
    
    // Nếu kiểm tra cho nút hoàn thành
    if (action === 'complete') {
      // Chỉ cho phép hoàn thành khi buổi tư vấn đã bắt đầu
      return now.isAfter(appointmentDateTime) || 
             now.format('YYYY-MM-DD HH:mm') === appointmentDateTime.format('YYYY-MM-DD HH:mm');
    }
    
    // Mặc định kiểm tra cho tất cả nút (trường hợp trước đây)
    const isAfterOrSame = now.isAfter(appointmentDateTime) || 
                          now.format('YYYY-MM-DD HH:mm') === appointmentDateTime.format('YYYY-MM-DD HH:mm');
    
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

  // Kiểm tra xem có thể bắt đầu buổi tư vấn chưa (cho phép trước 10 phút)
  const canStartAppointment = (appt) => {
    if (!appt || appt.status !== 'CONFIRMED') return false;
    
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
    
    const now = dayjs();
    
    // Tính thời gian còn lại (tính bằng phút) đến buổi tư vấn
    const minutesUntilAppointment = appointmentDateTime.diff(now, 'minute');
    
    // Cho phép bắt đầu nếu thời gian còn lại ≤ 10 phút
    return minutesUntilAppointment <= 10;
  };

  // Thêm hàm bắt đầu buổi tư vấn
  const handleStartAppointment = async (appointmentId) => {
    try {
      // Kiểm tra có thể bắt đầu buổi tư vấn chưa
      if (!canStartAppointment(dialog.appt)) {
        setSnackbar({ 
          open: true, 
          message: 'Chỉ có thể vào cuộc hẹn trước buổi tư vấn 10 phút!', 
          severity: 'warning' 
        });
        return;
      }
      
      setSnackbar({ 
        open: true, 
        message: 'Đang bắt đầu buổi tư vấn...', 
        severity: 'info' 
      });

      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await apiClient.put(`/appointments/${appointmentId}/start?consultantId=${userInfo.id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Mở Google Meet trong tab mới
      if (response.data && response.data.linkGoogleMeet) {
        window.open(response.data.linkGoogleMeet, '_blank');
      } else {
        // Nếu không có link trong response, mở link cũ
        window.open(generateMeetLink(dialog.appt), '_blank');
      }

      setSnackbar({ 
        open: true, 
        message: 'Buổi tư vấn đã bắt đầu!', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error starting appointment:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể bắt đầu buổi tư vấn: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
    }
  };

  // Xử lý kết thúc buổi tư vấn trực tiếp
  const handleEndAppointment = async (appointment) => {
    try {
      setSnackbar({ 
        open: true, 
        message: 'Đang kết thúc buổi tư vấn...', 
        severity: 'info' 
      });

      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Gọi API kết thúc buổi tư vấn
      await apiClient.put(`/appointments/${appointment.id}/end?consultantId=${userInfo.id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Cập nhật trạng thái trong danh sách
      setAppointments(prev => 
        prev.map(appt => appt.id === appointment.id ? { ...appt, status: 'COMPLETED' } : appt)
      );

      // Đóng dialog và hiển thị thông báo thành công
      setDialog({ open: false, appt: null });
      setSnackbar({ 
        open: true, 
        message: 'Buổi tư vấn đã kết thúc thành công!', 
        severity: 'success' 
      });
      
      // Cập nhật lại danh sách lịch hẹn
      fetchAppointments();
    } catch (err) {
      console.error('Lỗi khi kết thúc buổi tư vấn:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể kết thúc buổi tư vấn: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
    }
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

      if (action === 'complete') {
        // Hoàn thành buổi tư vấn với API mới
        try {
          await apiClient.put(`/appointments/${appointmentId}/end?consultantId=${userInfo.id}`, {
            consultantNote: consultantNote
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
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
        // Hủy buổi tư vấn với API mới
        console.log('Gửi request hủy cuộc hẹn');
        try {
          await apiClient.put(`/appointments/${appointmentId}/cancel/consultant?consultantId=${userInfo.id}`, {
            reason: cancelReason
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          console.log('Hủy cuộc hẹn thành công');
        } catch (cancelError) {
          console.error('Lỗi khi gọi API hủy:', cancelError);
          console.error('Chi tiết lỗi:', cancelError.response?.data || 'Không có dữ liệu phản hồi');
          throw cancelError;
        }

        // Cập nhật danh sách lịch hẹn
        setAppointments(prev => 
          prev.map(appt => appt.id === appointmentId ? { ...appt, status: 'CANCELLED' } : appt)
        );
      }
      
      // Hiển thị thông báo thành công
      setSnackbar({ 
        open: true, 
        message: 'Dữ liệu đã được cập nhật thành công!', 
        severity: 'success' 
      });
      
      // Reset các trạng thái
      setConsultantNote('');
      setCancelReason('');
      
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

  // For cancelAppointment function
  const cancelGuestAppointment = async (appt) => {
    try {
      await apiClient.post(`/appointments/${appt.id}/cancel/guest?email=${encodeURIComponent(appt.email)}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  const cancelUserAppointment = async (appt) => {
    try {
      await apiClient.post(`/appointments/${appt.id}/cancel/user/${userInfo.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  // For loadAppointments function
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/appointments/consultant/${userInfo.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  // For updateStatus function
  const updateStatus = async (id, status) => {
    try {
      console.log('Gửi request đến:', `/appointments/${id}/status?status=${status}&consultantId=${userInfo.id}`);
      await apiClient.patch(`/appointments/${id}/status?status=${status}&consultantId=${userInfo.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  // For startMeeting function
  const startMeeting = async (appointmentId) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/start?consultantId=${userInfo.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  // For endMeeting function
  const endMeeting = async (appointment) => {
    try {
      await apiClient.put(`/appointments/${appointment.id}/end?consultantId=${userInfo.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  // For handleEndMeeting function
  const handleEndMeeting = async () => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/end?consultantId=${userInfo.id}`, {
        consultantNotes: consultantNotes
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  // For cancelMeeting function
  const cancelMeeting = async () => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/cancel/consultant?consultantId=${userInfo.id}`, {
        cancelReason
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // ... rest of the function ...
    } catch (error) {
      // Error handling
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Thời khóa biểu
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
      
      <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Năm</InputLabel>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                label="Năm"
                size="small"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 300, flexGrow: 1 }}>
              <InputLabel>Chọn tuần</InputLabel>
              <Select
                value={weeksInYear.find(w => w.value === weekStart.format('YYYY-MM-DD'))?.value || ''}
                onChange={handleWeekChange}
                label="Chọn tuần"
                size="small"
              >
                {weeksInYear.map((week, index) => (
                  <MenuItem key={index} value={week.value}>
                    {week.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button variant="contained" onClick={goToCurrentWeek}>
              Tuần hiện tại
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={7} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Typography variant="h6">
            {weekStart.format('DD/MM/YYYY')} - {weekStart.clone().add(6, 'day').format('DD/MM/YYYY')}
          </Typography>
        </Grid>
      </Grid>
      
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
                  <TableCell sx={{ width: 100, fontWeight: 700, background: '#e3f2fd', color: '#1976d2', fontSize: 16 }}>Slot</TableCell>
                  {weekDays.map((d, idx) => (
                    <TableCell key={idx} align="center" sx={{ fontWeight: 700, background: '#e3f2fd', color: '#1976d2', fontSize: 16 }}>
                      <div>{WEEK_DAYS[idx]}</div>
                      <div style={{ fontSize: 15 }}>{d.format('DD/MM')}</div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {TIME_SLOTS.map((slot) => (
                  <TableRow key={slot.id} sx={{ height: 60, '&:hover': { background: '#f1f8ff' } }}>
                    <TableCell sx={{ fontWeight: 600, background: '#f5f5f5', fontSize: 15 }}>
                      Slot {slot.id}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{slot.time}</span>
                    </TableCell>
                    {weekDays.map((d, idx) => {
                      const appt = findAppointment(d, slot.id);
                      const status = appt ? getAppointmentStatus(appt) : null;
                      
                      // Determine if the slot is registered but has no customer
                      const isRegisteredOnly = appt && !appt.customerName;
                      
                      return (
                        <TableCell key={idx} align="center" sx={{ p: 0, border: '1px solid #e3e3e3', borderLeft: 0, borderRight: 0 }}>
                          {appt ? (
                            <Tooltip title={isRegisteredOnly ? "Slot đã đăng ký" : `${appt.topicName || 'Không có chủ đề'} - ${appt.customerName || 'Chưa có khách hàng'}`} arrow>
                              <Box
                                sx={{
                                  bgcolor: isRegisteredOnly ? '#e8f5e9' : '#e3f2fd',
                                  border: `2px solid ${
                                    isRegisteredOnly ? '#81c784' : 
                                    status === 'COMPLETED' ? '#388e3c' : 
                                    status === 'ongoing' ? '#ffa726' : 
                                    status === 'CANCELLED' ? '#d32f2f' : '#42a5f5'
                                  }`,
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
                                {isRegisteredOnly ? (
                                  // Display for registered slot without customer
                                  <>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>Slot đã đăng ký</div>
                                    <div style={{ fontSize: 13, color: '#388e3c' }}>Sẵn sàng nhận khách</div>
                                  </>
                                ) : (
                                  // Display for booked appointments
                                  <>
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
                                  </>
                                )}
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
        </Box>
      )}
      
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, appt: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.appt?.isRegisteredSlot ? 'Chi tiết slot đã đăng ký' : 'Chi tiết lịch hẹn'}
        </DialogTitle>
        <DialogContent>
          {dialog.appt && (
            <Box>
              {dialog.appt.isRegisteredSlot ? (
                // Display for registered slot without customer
                <>
                  <Typography sx={{ mb: 1 }}><b>Ngày:</b> {dialog.appt.appointmentDate}</Typography>
                  <Typography sx={{ mb: 1 }}>
                    <b>Giờ:</b> {formatTime(dialog.appt.appointmentTime)} - {
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
                    }
                  </Typography>
                  <Typography sx={{ mb: 1 }}><b>Trạng thái:</b> Sẵn sàng nhận khách</Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Slot này đã được đăng ký và sẵn sàng cho khách hàng đặt lịch.
                  </Alert>
                </>
              ) : (
                // Display for booked appointments
                <>
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
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {/* Nút 1: vào cuộc hẹn */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleStartAppointment(dialog.appt.id)}
                      disabled={!canStartAppointment(dialog.appt)}
                      sx={{ 
                        opacity: canStartAppointment(dialog.appt) ? 1 : 0.5
                      }}
                    >
                      {canStartAppointment(dialog.appt) ? 'vào cuộc hẹn' : 'Chưa đến giờ tham gia'}
                    </Button>
                    
                    {/* Nút 2: Hoàn thành */}
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleComplete(dialog.appt)}
                      disabled={dialog.appt.status !== 'CONFIRMED'}
                    >
                      Hoàn thành
                    </Button>
                    
                    {/* Nút 3: Hủy bỏ */}
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleCancel(dialog.appt)}
                      disabled={dialog.appt.status !== 'CONFIRMED' && dialog.appt.status !== 'PENDING'}
                    >
                      Hủy bỏ
                    </Button>
                  </Box>
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action === 'complete' ? 'Xác nhận hoàn thành' : 'Xác nhận hủy bỏ'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.action === 'complete' ? (
            <>
              <Typography gutterBottom>
                Bạn có chắc chắn muốn đánh dấu buổi tư vấn này là đã hoàn thành không?
              </Typography>
              <TextField
                label="Ghi chú của tư vấn viên"
                multiline
                rows={4}
                fullWidth
                value={consultantNote}
                onChange={(e) => setConsultantNote(e.target.value)}
                placeholder="Nhập ghi chú về buổi tư vấn này"
                margin="normal"
              />
            </>
          ) : (
            <>
              <Typography gutterBottom>
                Bạn có chắc chắn muốn hủy bỏ buổi tư vấn này không?
              </Typography>
              <TextField
                label="Lý do hủy"
                multiline
                rows={4}
                fullWidth
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vui lòng cho biết lý do hủy buổi tư vấn"
                margin="normal"
                required
                error={confirmDialog.action === 'cancel' && !cancelReason.trim()}
                helperText={confirmDialog.action === 'cancel' && !cancelReason.trim() ? 'Vui lòng nhập lý do hủy' : ''}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
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
            disabled={confirmDialog.loading || (confirmDialog.action === 'cancel' && !cancelReason.trim())}
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