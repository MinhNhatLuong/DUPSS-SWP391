import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { getUserInfo } from '../../utils/auth';
import apiClient from '../../services/apiService';

// Register week of year plugin
dayjs.extend(weekOfYear);

// Get the start of week (Monday)
function getStartOfWeek(date) {
  const d = dayjs(date);
  const day = d.day();
  // If it's Sunday (0), return previous Monday
  if (day === 0) return d.subtract(6, 'day');
  // Otherwise, return Monday of current week
  return d.subtract(day - 1, 'day');
}

// Generate list of weeks in a year
function getWeeksInYear(year) {
  const weeks = [];
  const firstDay = dayjs(`${year}-01-01`);
  const lastDay = dayjs(`${year}-12-31`);
  
  let weekStart = getStartOfWeek(firstDay);
  
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

// Available time slots from 8:00 to 17:00
const TIME_SLOTS = [
  { start: { hour: 8, minute: 0 }, end: { hour: 9, minute: 0 }, label: '8:00 - 9:00' },
  { start: { hour: 9, minute: 0 }, end: { hour: 10, minute: 0 }, label: '9:00 - 10:00' },
  { start: { hour: 10, minute: 0 }, end: { hour: 11, minute: 0 }, label: '10:00 - 11:00' },
  { start: { hour: 11, minute: 0 }, end: { hour: 12, minute: 0 }, label: '11:00 - 12:00' },
  { start: { hour: 13, minute: 0 }, end: { hour: 14, minute: 0 }, label: '13:00 - 14:00' },
  { start: { hour: 14, minute: 0 }, end: { hour: 15, minute: 0 }, label: '14:00 - 15:00' },
  { start: { hour: 15, minute: 0 }, end: { hour: 16, minute: 0 }, label: '15:00 - 16:00' },
  { start: { hour: 16, minute: 0 }, end: { hour: 17, minute: 0 }, label: '16:00 - 17:00' },
];

// Day names in Vietnamese
const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function SlotRegistration() {
  const [weekStart, setWeekStart] = useState(getStartOfWeek(dayjs()));
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [weeksInYear, setWeeksInYear] = useState(getWeeksInYear(selectedYear));
  const [registeredSlots, setRegisteredSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotDialog, setSlotDialog] = useState({ open: false, day: null, date: null });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [registering, setRegistering] = useState(false);
  
  // Generate weekdays from weekStart
  const weekDays = Array.from({ length: 6 }, (_, i) => weekStart.clone().add(i, 'day'));
  
  // Update weeks list when year changes
  useEffect(() => {
    setWeeksInYear(getWeeksInYear(selectedYear));
  }, [selectedYear]);
  
  // Fetch registered slots when week changes
  useEffect(() => {
    if (weekDays && weekDays.length > 0) {
      fetchRegisteredSlots();
    }
  }, [weekStart]);
  
    // Fetch registered slots from API
  const fetchRegisteredSlots = async () => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Lấy slots cho từng ngày trong tuần
      const allSlots = [];
      
      // Tạo một mảng promises để gọi API cho từng ngày
      const promises = weekDays.map(async (day) => {
        const date = day.format('DD/MM/YYYY');
        
        try {
          // Gọi API để lấy slots của consultant cho ngày cụ thể
          const response = await apiClient.get(`/public/slots/consultant/${userInfo.id}`, {
            params: {
              date
            }
          });
          
          // Thêm vào mảng tất cả slots
          if (response.data && Array.isArray(response.data)) {
            allSlots.push(...response.data);
          }
        } catch (dayError) {
          console.error(`Lỗi khi tải slots cho ngày ${date}:`, dayError);
        }
      });
      
      // Đợi tất cả các request hoàn tất
      await Promise.all(promises);
      
      // Cập nhật state với tất cả slots đã lấy được
      setRegisteredSlots(allSlots);
      
    } catch (err) {
      console.error('Lỗi khi tải slots đã đăng ký:', err);
      setSnackbar({
        open: true,
        message: 'Không thể tải slots đã đăng ký: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle year change
  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
  };
  
  // Handle week change
  const handleWeekChange = (e) => {
    const selectedDate = e.target.value;
    setWeekStart(dayjs(selectedDate));
  };

  // Go to current week
  const goToCurrentWeek = () => {
    const currentWeekStart = getStartOfWeek(dayjs());
    setWeekStart(currentWeekStart);
    setSelectedYear(currentWeekStart.year());
  };

  // Check if a slot is already registered for a specific day
  const isSlotRegistered = (date, startHour) => {
    const dateStr = date.format('DD/MM/YYYY');
    
    const result = registeredSlots.some(slot => {
      // Parse the date from the slot - handle different formats
      let slotDate;
      if (typeof slot.date === 'string') {
        // Try to handle both formats DD/MM/YYYY and YYYY-MM-DD
        slotDate = slot.date.includes('/')
          ? slot.date  // Already in DD/MM/YYYY format
          : dayjs(slot.date).format('DD/MM/YYYY'); // Convert YYYY-MM-DD to DD/MM/YYYY
      } else {
        // If date is some other format, try to convert it
        slotDate = dayjs(slot.date).format('DD/MM/YYYY');
      }
      
      // Parse the start time based on its type
      let slotStartHour;
      if (typeof slot.startTime === 'string') {
        // If startTime is a string like "08:00"
        slotStartHour = parseInt(slot.startTime.split(':')[0]);
      } else if (slot.startTime && typeof slot.startTime.hour === 'number') {
        // If startTime is an object with hour property
        slotStartHour = slot.startTime.hour;
      }
      
      const match = slotDate === dateStr && slotStartHour === startHour;
      
      return match;
    });
    
    return result;
  };
  
  // Lấy slot đã đăng ký cho một ngày cụ thể
  const getSlotsForDay = (date) => {
    return registeredSlots.filter(slot => {
      // Hỗ trợ cả định dạng DD/MM/YYYY và YYYY-MM-DD
      const slotDate = slot.date.includes('/') 
        ? dayjs(slot.date, 'DD/MM/YYYY').format('DD/MM/YYYY')
        : dayjs(slot.date).format('DD/MM/YYYY');
      return slotDate === date.format('DD/MM/YYYY');
    });
  };

  // Open dialog to register a new slot
  const openSlotDialog = (day, date) => {
    setSlotDialog({ open: true, day, date });
    setSelectedSlot(null);
  };

  // Close slot dialog
  const closeSlotDialog = () => {
    setSlotDialog({ open: false, day: null, date: null });
    setSelectedSlot(null);
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  // Register a new slot
  const registerSlot = async () => {
    if (!selectedSlot || !slotDialog.date) return;
    
    // Lưu lại ngày và slot đã chọn để cập nhật UI ngay lập tức
    const selectedDate = slotDialog.date;
    const selectedSlotTime = selectedSlot;
    
    setRegistering(true);
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Format date as required by API
      const formattedDate = selectedDate.format('DD/MM/YYYY');
      
      // Format thời gian theo định dạng HH:mm
      const formatTimeHHmm = (time) => {
        const hours = time.hour.toString().padStart(2, '0');
        const minutes = time.minute.toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      
      // Create request body
      const requestBody = {
        date: formattedDate,
        startTime: formatTimeHHmm(selectedSlotTime.start),
        endTime: formatTimeHHmm(selectedSlotTime.end)
      };

      // Call API to register slot
      const response = await apiClient.post('/consultant/slot', requestBody, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Đăng ký slot thành công!',
        severity: 'success'
      });
      
      // Close dialog trước
      closeSlotDialog();
      
      // Refresh lại toàn bộ danh sách từ server ngay lập tức
      await fetchRegisteredSlots();
    } catch (err) {
      console.error('Lỗi khi đăng ký slot:', err);
      setSnackbar({
        open: true,
        message: 'Không thể đăng ký slot: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Đăng Ký Slot Tư Vấn
      </Typography>
      
      {/* Year and Week Selection */}
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
                {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
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
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Day accordions */}
      <Box sx={{ mt: 4 }}>
        {weekDays.map((day, index) => (
          <Accordion key={index} sx={{ mb: 1, borderRadius: '8px', overflow: 'hidden' }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ 
                bgcolor: '#1976d2', 
                color: 'white',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                {DAY_NAMES[index]} ({day.format('DD/MM/YYYY')})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                {TIME_SLOTS.map((slot, slotIndex) => {
                                     const isRegistered = isSlotRegistered(day, slot.start.hour);
                  return (
                    <Grid item xs={12} sm={6} md={3} key={slotIndex}>
                      {isRegistered ? (
                        <Button
                          disabled
                          sx={{
                            bgcolor: '#e3f2fd',
                            border: '2px solid #42a5f5',
                            borderRadius: 2,
                            p: 2,
                            color: '#1976d2',
                            fontWeight: 'bold',
                            minHeight: 60,
                            '&.Mui-disabled': {
                              color: '#1976d2',
                              opacity: 1
                            }
                          }}
                          fullWidth
                        >
                          {slot.label}
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined"
                          fullWidth
                          sx={{
                            p: 2,
                            minHeight: 60,
                            borderRadius: 2,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                              bgcolor: '#e3f2fd',
                              borderColor: '#1976d2'
                            }
                          }}
                          onClick={() => openSlotDialog(DAY_NAMES[index], day)}
                        >
                          Thêm slot
                        </Button>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      {/* Slot registration dialog */}
      <Dialog open={slotDialog.open} onClose={closeSlotDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Chọn slot tư vấn cho {slotDialog.day} ({slotDialog.date?.format('DD/MM/YYYY')})
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {TIME_SLOTS.map((slot, index) => {
              const isRegistered = slotDialog.date && isSlotRegistered(slotDialog.date, slot.start.hour);
              return (
                <Grid item xs={12} sm={6} key={index}>
                  {isRegistered ? (
                    <Button
                      disabled
                      sx={{
                        bgcolor: '#f5f5f5',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        p: 1.5,
                        minHeight: 40,
                        color: '#9e9e9e',
                        '&.Mui-disabled': {
                          color: '#9e9e9e'
                        }
                      }}
                      fullWidth
                    >
                      {slot.label}
                    </Button>
                  ) : (
                    <Button
                      variant={selectedSlot === slot ? "contained" : "outlined"}
                      fullWidth
                      onClick={() => handleSlotSelect(slot)}
                      sx={{ 
                        p: 1.5
                      }}
                    >
                      {slot.label}
                    </Button>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeSlotDialog}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={registerSlot}
            disabled={!selectedSlot || registering}
            startIcon={registering && <CircularProgress size={20} color="inherit" />}
          >
            {registering ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 