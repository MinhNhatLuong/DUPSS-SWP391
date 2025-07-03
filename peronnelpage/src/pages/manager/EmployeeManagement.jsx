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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

import axios from 'axios';
import apiClient from '../../services/apiService';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  
  // Dialog state
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    employee: null,
    appointmentStats: null,
    loadingStats: false
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Apply filters whenever data or filter options change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [employees, filterOption, searchTerm]);

  // Fetch both consultants and staff
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Fetch consultants
      const consultantsResponse = await apiClient.get('/manager/consultants', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Fetch staff
      const staffResponse = await apiClient.get('/manager/staff', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Combine and set data
      const allEmployees = [
        ...consultantsResponse.data.map(c => ({ ...c, type: 'consultant' })),
        ...staffResponse.data.map(s => ({ ...s, type: 'staff' }))
      ];
      
      setEmployees(allEmployees);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Đã xảy ra lỗi khi tải danh sách nhân viên'
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  const applyFiltersAndSearch = () => {
    let result = [...employees];

    // Apply role filter
    if (filterOption === 'consultant') {
      result = result.filter(emp => emp.type === 'consultant' || emp.role === 'CONSULTANT');
    } else if (filterOption === 'staff') {
      result = result.filter(emp => emp.type === 'staff' || emp.role === 'STAFF');
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(emp => 
        (emp.id && emp.id.toString().includes(searchTerm)) ||
        (emp.fullName && emp.fullName.toLowerCase().includes(searchLower))
      );
    }

    setFilteredEmployees(result);
  };

  // Handle detail button click
  const handleDetailClick = async (employee) => {
    setDetailDialog({
      open: true,
      employee,
      appointmentStats: null,
      loadingStats: employee.type === 'consultant' || employee.role === 'CONSULTANT'
    });

    // If employee is consultant, fetch their appointment history
    if (employee.type === 'consultant' || employee.role === 'CONSULTANT') {
      try {
        const response = await apiClient.get(`/appointments/consultant/${employee.id}/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        // Calculate statistics
        const stats = {
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          total: response.data.length
        };

        response.data.forEach(appointment => {
          if (appointment.status === 'CONFIRMED') stats.confirmed++;
          if (appointment.status === 'COMPLETED') stats.completed++;
          if (appointment.status === 'CANCELLED') stats.cancelled++;
        });

        setDetailDialog(prev => ({
          ...prev,
          appointmentStats: stats,
          loadingStats: false
        }));
      } catch (err) {
        console.error('Error fetching appointment history:', err);
        setDetailDialog(prev => ({
          ...prev,
          loadingStats: false
        }));
        
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin lịch tư vấn: ' + 
                   (err.response?.data?.message || err.message),
          severity: 'error'
        });
      }
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDetailDialog({
      open: false,
      employee: null,
      appointmentStats: null,
      loadingStats: false
    });
  };

  // Format date for display (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle ISO date string
      if (typeof dateString === 'string') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        // Format as YYYY
        return date.getFullYear().toString();
      }
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const getRoleDisplay = (role, type) => {
    if (role === 'CONSULTANT' || type === 'consultant') return 'Tư vấn viên';
    if (role === 'STAFF' || type === 'staff') return 'Nhân viên';
    return role || 'N/A';
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Quản lý nhân viên
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo vai trò</InputLabel>
          <Select
            value={filterOption}
            label="Lọc theo vai trò"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">Tất cả nhân viên</MenuItem>
            <MenuItem value="consultant">Tư vấn viên</MenuItem>
            <MenuItem value="staff">Nhân viên hệ thống</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Tìm kiếm theo ID hoặc họ tên"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Employees Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : filteredEmployees.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Không tìm thấy nhân viên nào
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell width="5%" align="center">ID</TableCell>
                <TableCell width="20%">Họ và tên</TableCell>
                <TableCell width="10%">Vai trò</TableCell>
                <TableCell width="15%">Email</TableCell>
                <TableCell width="10%">Số điện thoại</TableCell>
                <TableCell width="10%">Giới tính</TableCell>
                <TableCell width="10%">Năm sinh</TableCell>
                <TableCell width="10%" align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell align="center">{employee.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{employee.fullName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRoleDisplay(employee.role, employee.type)}
                      size="small"
                      sx={{
                        bgcolor: (employee.role === 'CONSULTANT' || employee.type === 'consultant') 
                          ? '#e3f2fd' : '#f5f5f5',
                        color: (employee.role === 'CONSULTANT' || employee.type === 'consultant') 
                          ? '#1976d2' : '#333',
                        fontWeight: 'medium',
                      }}
                    />
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone || 'N/A'}</TableCell>
                  <TableCell>{employee.gender || 'N/A'}</TableCell>
                  <TableCell>{formatDate(employee.yob)}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleDetailClick(employee)}
                      title="Xem chi tiết"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialog.open} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', py: 2, fontWeight: 'bold' }}>
          Chi tiết nhân viên
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {detailDialog.employee && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  THÔNG TIN CÁ NHÂN
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">ID</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{detailDialog.employee.id}</Typography>
                  
                  <Typography variant="body2" color="text.secondary">Họ và tên</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{detailDialog.employee.fullName}</Typography>
                  
                  <Typography variant="body2" color="text.secondary">Vai trò</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {getRoleDisplay(detailDialog.employee.role, detailDialog.employee.type)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {detailDialog.employee.address || 'Không có thông tin'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">Năm sinh</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(detailDialog.employee.yob)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  THÔNG TIN LIÊN HỆ
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{detailDialog.employee.email}</Typography>
                  
                  <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {detailDialog.employee.phone || 'Không có thông tin'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">Username</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {detailDialog.employee.username || 'Không có thông tin'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">Giới tính</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {detailDialog.employee.gender || 'Không có thông tin'}
                  </Typography>
                </Box>
              </Grid>
              
              {(detailDialog.employee.role === 'CONSULTANT' || detailDialog.employee.type === 'consultant') && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ mb: 2 }}>
                    THỐNG KÊ TƯ VẤN
                  </Typography>
                  
                  {detailDialog.loadingStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : detailDialog.appointmentStats ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Card sx={{ minWidth: 140, boxShadow: 2 }}>
                        <CardContent>
                          <Typography variant="h4" color="primary" fontWeight="bold">
                            {detailDialog.appointmentStats.confirmed}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Đã xác nhận
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ minWidth: 140, boxShadow: 2 }}>
                        <CardContent>
                          <Typography variant="h4" color="success.main" fontWeight="bold">
                            {detailDialog.appointmentStats.completed}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Đã hoàn thành
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ minWidth: 140, boxShadow: 2 }}>
                        <CardContent>
                          <Typography variant="h4" color="error.main" fontWeight="bold">
                            {detailDialog.appointmentStats.cancelled}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Đã hủy
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ minWidth: 140, boxShadow: 2 }}>
                        <CardContent>
                          <Typography variant="h4" fontWeight="bold">
                            {detailDialog.appointmentStats.total}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tổng số
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Không có dữ liệu thống kê
                    </Alert>
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', py: 2, px: 3 }}>
          <Button onClick={handleDialogClose} variant="contained">Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 