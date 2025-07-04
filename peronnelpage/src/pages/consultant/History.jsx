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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
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
  if (!dateStr) return new Date();
  
  // Check if format is DD/MM/YYYY
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  }
  
  // Otherwise assume ISO format
  return new Date(dateStr);
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
        
        // Process the response data
        const history = response.data.map(item => ({
          id: item.id,
          clientName: item.fullName || item.email || 'Khách hàng',
          date: item.appointmentDate,
          time: item.timeSlot,
          status: item.status,
          topic: item.topicName || 'Chưa xác định',
          feedback: item.feedback || null,
          rating: item.rating || null
        }));
        
        setAppointments(history);
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
    if (typeof timeObj === 'string') return timeObj;
    const { hour, minute } = timeObj;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // If already in DD/MM/YYYY format, return as is
    if (dateStr.includes('/')) return dateStr;
    // Otherwise format it
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  // Format datetime for check-in, check-out
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('vi-VN');
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
                    <TableRow key={row.id}>
                      <TableCell>{row.clientName}</TableCell>
                      <TableCell>{row.email || '—'}</TableCell>
                      <TableCell>{row.phoneNumber || '—'}</TableCell>
                      <TableCell>
                        {formatDate(row.date)} {formatTime(row.time)}
                      </TableCell>
                      <TableCell>{row.topic}</TableCell>
                      <TableCell>{formatDateTime(row.checkInTime)}</TableCell>
                      <TableCell>{formatDateTime(row.checkOutTime)}</TableCell>
                      <TableCell>
                        {row.rating ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={row.rating} readOnly size="small" precision={0.5} />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({row.rating})
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
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Khách hàng:</strong> {detailDialog.appointment.clientName}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {detailDialog.appointment.email || '—'}</Typography>
                    <Typography variant="body2"><strong>Số điện thoại:</strong> {detailDialog.appointment.phoneNumber || '—'}</Typography>
                    <Typography variant="body2">
                      <strong>Thời gian:</strong> {formatDate(detailDialog.appointment.date)} {formatTime(detailDialog.appointment.time)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Chủ đề:</strong> {detailDialog.appointment.topic}</Typography>
                    <Typography variant="body2"><strong>Trạng thái:</strong> {statusMap[detailDialog.appointment.status] || detailDialog.appointment.status}</Typography>
                    <Typography variant="body2"><strong>Check-in:</strong> {formatDateTime(detailDialog.appointment.checkInTime)}</Typography>
                    <Typography variant="body2"><strong>Check-out:</strong> {formatDateTime(detailDialog.appointment.checkOutTime)}</Typography>
                  </Grid>
                </Grid>
              </Box>
              
              {detailDialog.appointment.feedback && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Đánh giá từ khách hàng
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body2">
                      {detailDialog.appointment.feedback}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {detailDialog.appointment.rating > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Đánh giá từ khách hàng
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={detailDialog.appointment.rating} readOnly precision={0.5} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({detailDialog.appointment.rating}/5)
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