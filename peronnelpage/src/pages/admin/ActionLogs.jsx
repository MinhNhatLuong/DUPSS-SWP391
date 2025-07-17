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
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  TableSortLabel,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import apiClient from '../../services/apiService';

// Định nghĩa màu sắc cho các loại hành động
const actionTypeColors = {
  CREATE: '#4caf50', // Xanh lá
  UPDATE: '#2196f3', // Xanh dương
  DELETE: '#f44336', // Đỏ
};

// Định nghĩa màu sắc cho các loại đối tượng
const targetTypeColors = {
  USER: '#1976d2',      // Xanh dương đậm
  BLOG: '#e91e63',      // Hồng
  COURSE: '#ff9800',    // Cam
  SURVEY: '#9c27b0',    // Tím
  APPOINTMENT: '#4caf50', // Xanh lá
  SLOT: '#607d8b',      // Xám xanh
  TOPIC: '#795548',     // Nâu
};

// Các trường có thể sắp xếp
const sortableFields = [
  { key: 'performedBy', label: 'Người thực hiện' },
  { key: 'actionType', label: 'Loại hành động' },
  { key: 'targetType', label: 'Đối tượng' },
  { key: 'targetId', label: 'ID đối tượng' },
  { key: 'actionTime', label: 'Thời gian' },
];

// Các loại hành động
const actionTypes = [
  { value: 'all', label: 'Tất cả' },
  { value: 'CREATE', label: 'Tạo mới' },
  { value: 'UPDATE', label: 'Cập nhật' },
  { value: 'DELETE', label: 'Xóa' },
];



export default function ActionLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'error' });
  const [orderBy, setOrderBy] = useState('actionTime');
  const [order, setOrder] = useState('desc');
  const [filterActionType, setFilterActionType] = useState('all');

  // Fetch logs data on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/actionLogs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching action logs:', error);
      let errorMessage = 'Không thể tải dữ liệu bản ghi hoạt động';
      
      // Xử lý thông báo lỗi từ API
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Format date function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Translate action type
  const translateActionType = (type) => {
    const actionMap = {
      CREATE: 'Tạo mới',
      UPDATE: 'Cập nhật',
      DELETE: 'Xóa'
    };
    return actionMap[type] || type;
  };

  // Translate target type
  const translateTargetType = (type) => {
    const targetMap = {
      USER: 'Người dùng',
      BLOG: 'Bài viết',
      COURSE: 'Khóa học',
      SURVEY: 'Khảo sát',
      APPOINTMENT: 'Cuộc hẹn',
      SLOT: 'Slot',
      TOPIC: 'Chủ đề'
    };
    return targetMap[type] || type;
  };

  // Filter and sort logs
  const filteredLogs = logs.filter((log) => {
    // Apply search filter
    const searchMatch = search === '' || 
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toString().includes(search.toLowerCase());
    
    // Apply action type filter
    const actionTypeMatch = filterActionType === 'all' || log.actionType === filterActionType;
    
    return searchMatch && actionTypeMatch;
  });

  // Sort function
  function sortComparator(a, b, key) {
    if (key === 'actionTime') {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (key === 'targetId') {
      return order === 'asc' ? a[key] - b[key] : b[key] - a[key];
    }
    
    const valA = (a[key] || '').toString().toLowerCase();
    const valB = (b[key] || '').toString().toLowerCase();
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  }

  const sortedLogs = [...filteredLogs].sort((a, b) => sortComparator(a, b, orderBy));
  const pagedLogs = sortedLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box className="admin-container" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Bản ghi hoạt động
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        {/* Search */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        {/* Filter by Action Type */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Loại hành động</InputLabel>
          <Select
            value={filterActionType}
            label="Loại hành động"
            onChange={(e) => setFilterActionType(e.target.value)}
          >
            {actionTypes.map((type) => (
              <MenuItem value={type.value} key={type.value}>{type.label}</MenuItem>
            ))}
          </Select>
        </FormControl>


      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {sortableFields.map((field) => (
                <TableCell key={field.key} sortDirection={orderBy === field.key ? order : false}>
                  <TableSortLabel
                    active={orderBy === field.key}
                    direction={orderBy === field.key ? order : 'asc'}
                    onClick={() => handleRequestSort(field.key)}
                  >
                    {field.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : pagedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không tìm thấy bản ghi hoạt động nào.
                </TableCell>
              </TableRow>
            ) : (
              pagedLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.performedBy}</TableCell>
                  <TableCell>
                    <Chip 
                      label={translateActionType(log.actionType)} 
                      sx={{ 
                        backgroundColor: actionTypeColors[log.actionType] || '#757575',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={translateTargetType(log.targetType)} 
                      sx={{ 
                        backgroundColor: targetTypeColors[log.targetType] || '#757575',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </TableCell>
                  <TableCell>{log.targetId}</TableCell>
                  <TableCell>{formatDate(log.actionTime)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredLogs.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
        }
      />

      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 