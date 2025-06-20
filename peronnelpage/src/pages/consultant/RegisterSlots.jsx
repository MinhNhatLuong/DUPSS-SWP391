import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Stack,
  Chip,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';

const RegisterSlots = () => {
  // States for table data
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for filtering and search
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState(null);
  
  // States for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // States for form
  const [formData, setFormData] = useState({
    date: dayjs(),
    startTime: dayjs().hour(8).minute(0),
    endTime: dayjs().hour(17).minute(0),
    available: true,
  });
  
  // States for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    slotId: null,
  });
  
  // States for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // State for processing actions
  const [processing, setProcessing] = useState(false);

  // Fetch slots on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Apply filters whenever slots, filter, searchTerm, or searchDate changes
  useEffect(() => {
    applyFilters();
  }, [slots, filter, searchTerm, searchDate]);

  // Fetch slots from API
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.get(`/api/slots/consultant/${userInfo.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      setSlots(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Đã xảy ra lỗi khi tải dữ liệu'
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to slots
  const applyFilters = () => {
    let result = [...slots];

    // Apply availability filter
    if (filter === 'available') {
      result = result.filter(slot => slot.available);
    } else if (filter === 'unavailable') {
      result = result.filter(slot => !slot.available);
    }

    // Apply search term (by ID)
    if (searchTerm) {
      result = result.filter(slot => 
        String(slot.id).includes(searchTerm)
      );
    }

    // Apply date filter
    if (searchDate) {
      const formattedSearchDate = searchDate.format('DD/MM/YYYY');
      result = result.filter(slot => slot.date === formattedSearchDate);
    }

    setFilteredSlots(result);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search date change
  const handleSearchDateChange = (newDate) => {
    setSearchDate(newDate);
  };

  // Reset filters
  const resetFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setSearchDate(null);
  };

  // Open dialog for creating a new slot
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      date: dayjs(),
      startTime: dayjs().hour(8).minute(0),
      endTime: dayjs().hour(17).minute(0),
      available: true,
    });
    setOpenDialog(true);
  };

  // Open dialog for editing a slot
  const handleOpenEditDialog = (slot) => {
    setDialogMode('edit');
    
    // Parse date and time from slot data
    const [day, month, year] = slot.date.split('/').map(Number);
    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const [endHour, endMinute] = slot.endTime.split(':').map(Number);
    
    setFormData({
      date: dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`),
      startTime: dayjs().hour(startHour).minute(startMinute),
      endTime: dayjs().hour(endHour).minute(endMinute),
      available: slot.available,
    });
    
    setSelectedSlot(slot);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit form data
  const handleSubmit = () => {
    // Basic validation
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin ngày và thời gian',
        severity: 'error',
      });
      return;
    }
    
    // Check if end time is after start time
    if (formData.endTime.isBefore(formData.startTime)) {
      setSnackbar({
        open: true,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
        severity: 'error',
      });
      return;
    }
    
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: dialogMode === 'create' ? 'Tạo slot mới' : 'Chỉnh sửa slot',
      message: dialogMode === 'create' 
        ? 'Bạn có muốn tạo slot mới không?' 
        : 'Bạn có muốn sửa lại slot này không?',
      action: dialogMode === 'create' ? executeCreateSlot : executeUpdateSlot,
    });
  };

  // Execute the create slot action after confirmation
  const executeCreateSlot = () => {
    // Immediately close confirmation dialog and set processing state
    setConfirmDialog(prev => ({ ...prev, open: false }));
    createSlot();
  };

  // Execute the update slot action after confirmation
  const executeUpdateSlot = () => {
    // Immediately close confirmation dialog and set processing state
    setConfirmDialog(prev => ({ ...prev, open: false }));
    updateSlot();
  };

  // Create a new slot
  const createSlot = async () => {
    setProcessing(true);
    setSnackbar({
      open: true,
      message: 'Đang xử lý...',
      severity: 'warning',
    });
    
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      // Format date as dd/MM/yyyy to match backend expectations
      const formattedDate = formData.date.format('DD/MM/YYYY');
      
      // Format time as strings HH:mm
      const startTimeFormatted = formData.startTime.format('HH:mm');
      const endTimeFormatted = formData.endTime.format('HH:mm');
      
      // Check for duplicate slots
      const isDuplicate = slots.some(slot => 
        slot.date === formattedDate && 
        slot.startTime === startTimeFormatted && 
        slot.endTime === endTimeFormatted
      );
      
      if (isDuplicate) {
        throw new Error('Slot với ngày và thời gian này đã tồn tại. Vui lòng chọn thời gian khác.');
      }
      
      const payload = {
        date: formattedDate,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        consultantId: userInfo.id,
        available: formData.available
      };
      
      console.log('Creating slot with payload:', payload);
      
      const response = await axios.post('/api/slots', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Add the new slot to the list
      setSlots(prev => [...prev, response.data]);
      
      setSnackbar({
        open: true,
        message: 'Slot đã được tạo thành công',
        severity: 'success',
      });
      
      setOpenDialog(false);
    } catch (err) {
      console.error('Error creating slot:', err);
      setSnackbar({
        open: true,
        message: 'Không thể tạo slot: ' + (err.response?.data?.message || err.message),
        severity: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Update an existing slot
  const updateSlot = async () => {
    setProcessing(true);
    setSnackbar({
      open: true,
      message: 'Đang xử lý...',
      severity: 'warning',
    });
    
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      // Update availability
      const response = await axios.patch(
        `/api/slots/${selectedSlot.id}/availability?isAvailable=${formData.available}&consultantId=${userInfo.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Update the slot in the list
      setSlots(prev => 
        prev.map(slot => 
          slot.id === selectedSlot.id ? response.data : slot
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Slot đã được chỉnh sửa thành công',
        severity: 'success',
      });
      
      setOpenDialog(false);
    } catch (err) {
      console.error('Error updating slot:', err);
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật slot: ' + (err.response?.data?.message || err.message),
        severity: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete slot
  const handleDelete = (slot) => {
    if (!slot || typeof slot.id !== 'number') {
      console.error('Slot không hợp lệ:', slot);
      setSnackbar({
        open: true,
        message: 'Không thể xóa: Slot không hợp lệ',
        severity: 'error',
      });
      return;
    }

    // Reset the confirm dialog first to clear any previous state
    setConfirmDialog({
      open: true,
      title: 'Xóa slot',
      message: 'Bạn có muốn xóa slot này không?',
      action: () => executeDeleteSlot(slot.id),
      slotId: slot.id,
    });
  };

  // Execute the delete slot action after confirmation
  const executeDeleteSlot = (slotId) => {
    // Immediately close confirmation dialog and set processing state
    setConfirmDialog(prev => ({ ...prev, open: false }));
    deleteSlot(slotId);
  };

  // Delete a slot
  const deleteSlot = async (slotId) => {
    if (!slotId || typeof slotId !== 'number') {
      console.error('ID slot không hợp lệ:', slotId);
      setSnackbar({
        open: true,
        message: 'Không thể xóa: ID slot không hợp lệ',
        severity: 'error',
      });
      return;
    }

    setProcessing(true);
    setSnackbar({
      open: true,
      message: 'Đang xử lý...',
      severity: 'warning',
    });
    
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      console.log(`Deleting slot with ID: ${slotId}, consultantId: ${userInfo.id}`);
      
      await axios.delete(`/api/slots/${slotId}?consultantId=${userInfo.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Remove the slot from the list
      setSlots(prev => prev.filter(slot => slot.id !== slotId));
      
      setSnackbar({
        open: true,
        message: 'Slot đã được xóa thành công',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting slot:', err);
      setSnackbar({
        open: true,
        message: 'Không thể xóa slot: ' + (err.response?.data?.message || err.message),
        severity: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Close confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ 
      ...prev, 
      open: false,
      // Reset the action and slotId to prevent stale data
      action: null,
      slotId: null
    }));
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Render the component
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Đăng ký thời gian tư vấn
      </Typography>
      
      {/* Filters and search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="filter-label">Lọc theo trạng thái</InputLabel>
              <Select
                labelId="filter-label"
                value={filter}
                onChange={handleFilterChange}
                label="Lọc theo trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="available">Có thể làm việc</MenuItem>
                <MenuItem value="unavailable">Không thể làm việc</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Tìm kiếm theo ID"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Tìm kiếm theo ngày"
                value={searchDate}
                onChange={handleSearchDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    size: 'small',
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetFilters}
                startIcon={<FilterListIcon />}
              >
                Xóa bộ lọc
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenCreateDialog}
                startIcon={<AddIcon />}
              >
                Tạo slot
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Slots table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Thời gian bắt đầu</TableCell>
                <TableCell>Thời gian kết thúc</TableCell>
                <TableCell>Có thể làm việc</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : filteredSlots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filteredSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>{slot.id}</TableCell>
                    <TableCell>{slot.date}</TableCell>
                    <TableCell>{slot.startTime}</TableCell>
                    <TableCell>{slot.endTime}</TableCell>
                    <TableCell>
                      <Chip
                        label={slot.available ? 'Có' : 'Không'}
                        color={slot.available ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(slot)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(slot)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Create/Edit dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Tạo slot mới' : 'Chỉnh sửa slot'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Ngày"
                    value={formData.date}
                    onChange={(newDate) => handleFormChange('date', newDate)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        margin: 'normal',
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Thời gian bắt đầu"
                    value={formData.startTime}
                    onChange={(newTime) => handleFormChange('startTime', newTime)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        margin: 'normal',
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Thời gian kết thúc"
                    value={formData.endTime}
                    onChange={(newTime) => handleFormChange('endTime', newTime)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        margin: 'normal',
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" margin="normal" sx={{ minWidth: '200px' }}>
                  <InputLabel id="available-label">Có thể làm việc</InputLabel>
                  <Select
                    labelId="available-label"
                    value={formData.available}
                    onChange={(e) => handleFormChange('available', e.target.value)}
                    label="Có thể làm việc"
                  >
                    <MenuItem value={true}>Có</MenuItem>
                    <MenuItem value={false}>Không</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={processing}
          >
            {dialogMode === 'create' ? 'Tạo' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            KHÔNG
          </Button>
          <Button 
            onClick={confirmDialog.action} 
            color="primary" 
            variant="contained"
            disabled={processing}
          >
            {processing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'CÓ'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterSlots; 