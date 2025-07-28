import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Grid,
  Link,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import VideocamIcon from '@mui/icons-material/Videocam';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';
import apiClient from '../../services/apiService';

const statusMap = {
  all: 'Tất cả',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

const columns = [
  { id: 'customerName', label: 'Họ tên', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'phoneNumber', label: 'Số điện thoại', sortable: true },
  { id: 'appointmentDate', label: 'Ngày tư vấn', sortable: true },
  { id: 'topicName', label: 'Chủ đề tư vấn', sortable: true },
  { id: 'checkInTime', label: 'Check-in', sortable: true },
  { id: 'checkOutTime', label: 'Check-out', sortable: true },
  { id: 'reviewScore', label: 'Đánh giá', sortable: true },
  { id: 'status', label: 'Trạng thái', sortable: true },
  { id: 'actions', label: 'Thao tác', sortable: false },
];

// Helper to parse date in both formats
const parseDateString = (dateStr) => {
  if (!dateStr) return new Date(0); // Return epoch date for null/undefined dates
  
  try {
    // Check if format is DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      // Create date using year, month-1 (JS months are 0-indexed), day
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
    
    // Check if format is YYYY-MM-DD
    if (dateStr.includes('-') && !dateStr.includes('T')) {
      return new Date(dateStr);
    }
    
    // Otherwise assume ISO format or other valid date string
    return new Date(dateStr);
  } catch (e) {
    console.error('Error parsing date:', e, dateStr);
    return new Date(0);
  }
};

function sortRows(rows, orderBy, order) {
  if (!orderBy) return rows;
  return [...rows].sort((a, b) => {
    if (orderBy === 'appointmentDate') {
      const dateA = parseDateString(a.appointmentDate);
      const dateB = parseDateString(b.appointmentDate);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (order === 'asc') {
      return (a[orderBy] || '').toString().localeCompare((b[orderBy] || '').toString());
    }
    return (b[orderBy] || '').toString().localeCompare((a[orderBy] || '').toString());
  });
}

const TableRowSkeleton = () => (
  <TableRow>
    {columns.map((column, index) => (
      <TableCell key={index}>
        <Skeleton animation="wave" />
      </TableCell>
    ))}
  </TableRow>
);

export default function History() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [orderBy, setOrderBy] = useState('appointmentDate');
  const [order, setOrder] = useState('desc');
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    appointment: null
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        const userInfo = getUserInfo();
        if (!userInfo || !userInfo.id) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }
        
        const response = await apiClient.get(`/appointments/consultant/${userInfo.id}/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        // The response data is already in the correct format, so we can use it directly
        setAppointments(response.data || []);
      } catch (error) {
        console.error('Error fetching history:', error);
        setError(error.message || 'Đã xảy ra lỗi khi tải lịch sử');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSort = (col) => {
    if (orderBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(col);
      setOrder('asc');
    }
  };

  const filteredRows = appointments.filter(row => filter === 'all' ? true : row.status === filter);
  const sortedRows = sortRows(filteredRows, orderBy, order);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CONFIRMED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    
    try {
      // If it's already a string in the correct format (HH:MM)
      if (typeof timeObj === 'string') {
        // If it already has a colon, assume it's in HH:MM format
        if (timeObj.includes(':')) {
          const parts = timeObj.split(':');
          if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`;
          }
        }
        return timeObj;
      }
      
      // Handle object with hour, minute
      if (typeof timeObj === 'object' && timeObj !== null) {
        const hour = timeObj.hour !== undefined ? timeObj.hour : 0;
        const minute = timeObj.minute !== undefined ? timeObj.minute : 0;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting time:', error, timeObj);
      return '';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      // If already in DD/MM/YYYY format, return as is
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return dateStr;
        }
      }
      
      // For yyyy-MM-dd format from database
      if (dateStr.includes('-') && !dateStr.includes('T')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts;
          return `${day}/${month}/${year}`;
        }
      }
      
      // For ISO format with time component
      if (dateStr.includes('T')) {
        const [datePart] = dateStr.split('T');
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts;
          return `${day}/${month}/${year}`;
        }
      }
      
      // Last resort: use Date object
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateStr;
    }
  };

  // Format datetime for check-in, check-out
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    
    try {
      // If already in dd/MM/yyyy HH:mm format, return as is
      if (typeof dateTimeStr === 'string' && dateTimeStr.includes('/') && dateTimeStr.includes(':')) {
        return dateTimeStr;
      }
      
      // For ISO format with time component
      if (dateTimeStr.includes('T')) {
        const datePart = dateTimeStr.split('T')[0];
        const timePart = dateTimeStr.split('T')[1];
        
        const [year, month, day] = datePart.split('-');
        
        // Extract hours and minutes from the time part
        let hours = '00';
        let minutes = '00';
        
        if (timePart) {
          // Handle different time formats
          if (timePart.includes(':')) {
            const timeComponents = timePart.split(':');
            hours = timeComponents[0] || '00';
            minutes = timeComponents[1] || '00';
            if (minutes.includes('.')) {
              minutes = minutes.split('.')[0];
            }
          }
        }
        
        // Return in dd/MM/yyyy HH:mm format
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Last resort: use Date object
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        return dateTimeStr || '—';
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      console.error('Error formatting datetime:', e);
      return dateTimeStr || '—';
    }
  };

  // Open detailed view dialog
  const handleOpenDetail = (appointment) => {
    setDetailDialog({
      open: true,
      appointment
    });
  };

  // Close detailed view dialog
  const handleCloseDetail = () => {
    setDetailDialog({
      open: false,
      appointment: null
    });
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lịch sử tư vấn
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
        Lịch sử tư vấn
      </Typography>

      {loading ? (
        <Box sx={{ mt: 3 }}>
          <Skeleton animation="wave" height={60} width={200} sx={{ mb: 2 }} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(col => (
                    <TableCell key={col.id}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : appointments.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Bạn đang không có lịch sử cuộc hẹn nào.
        </Alert>
      ) : (
        <>
          <FormControl sx={{ mb: 3, minWidth: 200 }}>
            <InputLabel>Lọc theo trạng thái</InputLabel>
            <Select
              value={filter}
              label="Lọc theo trạng thái"
              onChange={e => setFilter(e.target.value)}
            >
              {Object.entries(statusMap).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  {columns.map(col => (
                    <TableCell
                      key={col.id}
                      sortDirection={orderBy === col.id ? order : false}
                    >
                      {col.sortable ? (
                        <TableSortLabel
                          active={orderBy === col.id}
                          direction={orderBy === col.id ? order : 'asc'}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      Không có dữ liệu phù hợp với bộ lọc hiện tại
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRows.map(row => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.email || '—'}</TableCell>
                      <TableCell>{row.phoneNumber || '—'}</TableCell>
                      <TableCell>
                        {formatDate(row.appointmentDate)} {formatTime(row.appointmentTime)}
                      </TableCell>
                      <TableCell>{row.topicName}</TableCell>
                      <TableCell>{formatDateTime(row.checkInTime)}</TableCell>
                      <TableCell>{formatDateTime(row.checkOutTime)}</TableCell>
                      <TableCell>
                        {row.reviewScore > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={row.reviewScore} readOnly size="small" precision={0.5} />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({row.reviewScore})
                            </Typography>
                          </Box>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={statusMap[row.status] || row.status} 
                          color={getStatusColor(row.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Xem chi tiết">
                          <IconButton onClick={() => handleOpenDetail(row)} size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Chi tiết buổi tư vấn */}
      <Dialog 
        open={detailDialog.open} 
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        {detailDialog.appointment && (
          <>
            <DialogTitle>
              Chi tiết buổi tư vấn
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Thông tin chung
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Khách hàng:</strong> {detailDialog.appointment.customerName}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Email:</strong> {detailDialog.appointment.email || '—'}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Số điện thoại:</strong> {detailDialog.appointment.phoneNumber || '—'}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Thời gian:</strong> {formatDate(detailDialog.appointment.appointmentDate)} {formatTime(detailDialog.appointment.appointmentTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Loại khách:</strong> {detailDialog.appointment.guest ? 'Khách vãng lai' : 'Người dùng đã đăng ký'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Chủ đề:</strong> {detailDialog.appointment.topicName}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Trạng thái:</strong> {statusMap[detailDialog.appointment.status] || detailDialog.appointment.status}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Check-in:</strong> {formatDateTime(detailDialog.appointment.checkInTime)}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Check-out:</strong> {formatDateTime(detailDialog.appointment.checkOutTime)}</Typography>
                    {detailDialog.appointment.linkGoogleMeet && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <VideocamIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Link href={detailDialog.appointment.linkGoogleMeet} target="_blank" rel="noopener">
                          Link phòng họp
                        </Link>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
              
              {detailDialog.appointment.consultantNote && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Ghi chú của tư vấn viên
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f5f7fa' }}>
                    <Typography variant="body2">
                      {detailDialog.appointment.consultantNote}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {detailDialog.appointment.customerReview && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Phản hồi từ khách hàng
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body2">
                      {detailDialog.appointment.customerReview}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {detailDialog.appointment.reviewScore > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Đánh giá từ khách hàng
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={detailDialog.appointment.reviewScore} readOnly precision={0.5} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({detailDialog.appointment.reviewScore}/5)
                    </Typography>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetail}>
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
} 