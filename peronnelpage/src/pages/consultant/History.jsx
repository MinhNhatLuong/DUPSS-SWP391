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
} from '@mui/material';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';

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
  { id: 'status', label: 'Trạng thái', sortable: true },
];

function sortRows(rows, orderBy, order) {
  if (!orderBy) return rows;
  return [...rows].sort((a, b) => {
    if (orderBy === 'appointmentDate') {
      return order === 'asc'
        ? new Date(a.appointmentDate) - new Date(b.appointmentDate)
        : new Date(b.appointmentDate) - new Date(a.appointmentDate);
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

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const userInfo = getUserInfo();
        if (!userInfo || !userInfo.id) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }

        const response = await axios.get(`http://localhost:8080/api/appointments/consultant/${userInfo.id}/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        setAppointments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointment history:', err);
        setError(
          err.response?.data?.message || 
          err.message || 
          'Đã xảy ra lỗi khi tải lịch sử cuộc hẹn'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
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
    const { hour, minute } = timeObj;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
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
        <Alert severity="warning" sx={{ mt: 2 }}>
          Lịch sử cuộc hẹn của bạn đang không có gì!
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
          <TableContainer component={Paper}>
            <Table>
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
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.email || '-'}</TableCell>
                      <TableCell>{row.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        {new Date(row.appointmentDate).toLocaleDateString()} {formatTime(row.appointmentTime)}
                      </TableCell>
                      <TableCell>{row.topicName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={statusMap[row.status] || row.status} 
                          color={getStatusColor(row.status)} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
} 