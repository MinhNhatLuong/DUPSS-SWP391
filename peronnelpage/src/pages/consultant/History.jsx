import React, { useState } from 'react';
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
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const fakeBookings = [
  {
    id: '1',
    name: 'Nguyen Van A',
    email: 'a.nguyen@gmail.com',
    phone: '0912345678',
    date: '2024-06-01',
    topic: 'Phòng ngừa sử dụng ma túy',
    status: 'done',
    note: 'Tư vấn thành công',
  },
  {
    id: '2',
    name: 'Tran Thi B',
    email: 'b.tran@gmail.com',
    phone: '0987654321',
    date: '2024-06-02',
    topic: 'Điều trị nghiện ma túy',
    status: 'confirmed',
    note: '',
  },
  {
    id: '3',
    name: 'Le Van C',
    email: 'c.le@gmail.com',
    phone: '',
    date: '2024-06-03',
    topic: 'Hỗ trợ người thân',
    status: 'canceled',
    note: 'Người dùng hủy',
  },
  {
    id: '4',
    name: 'Pham Thi D',
    email: 'd.pham@gmail.com',
    phone: '0909090909',
    date: '2024-06-04',
    topic: 'Giáo dục cộng đồng',
    status: 'done',
    note: '',
  },
  {
    id: '5',
    name: 'Hoang Van E',
    email: 'e.hoang@gmail.com',
    phone: '',
    date: '2024-06-05',
    topic: 'Phòng ngừa sử dụng ma túy',
    status: 'confirmed',
    note: '',
  },
  {
    id: '6',
    name: 'Do Thi F',
    email: 'f.do@gmail.com',
    phone: '0933333333',
    date: '2024-06-06',
    topic: 'Điều trị nghiện ma túy',
    status: 'done',
    note: 'Cần theo dõi thêm',
  },
  {
    id: '7',
    name: 'Nguyen Van G',
    email: 'g.nguyen@gmail.com',
    phone: '',
    date: '2024-06-07',
    topic: 'Hỗ trợ người thân',
    status: 'canceled',
    note: 'Consultant hủy',
  },
  {
    id: '8',
    name: 'Tran Thi H',
    email: 'h.tran@gmail.com',
    phone: '0977777777',
    date: '2024-06-08',
    topic: 'Giáo dục cộng đồng',
    status: 'done',
    note: '',
  },
  {
    id: '9',
    name: 'Le Van I',
    email: 'i.le@gmail.com',
    phone: '0922222222',
    date: '2024-06-09',
    topic: 'Phòng ngừa sử dụng ma túy',
    status: 'confirmed',
    note: '',
  },
  {
    id: '10',
    name: 'Pham Thi K',
    email: 'k.pham@gmail.com',
    phone: '',
    date: '2024-06-10',
    topic: 'Điều trị nghiện ma túy',
    status: 'done',
    note: 'Đến trễ',
  },
];

const statusMap = {
  all: 'Tất cả',
  confirmed: 'Đã xác nhận',
  done: 'Đã hoàn thành',
  canceled: 'Đã hủy',
};

const columns = [
  { id: 'name', label: 'Họ tên', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'phone', label: 'Số điện thoại', sortable: true },
  { id: 'date', label: 'Ngày tư vấn', sortable: true },
  { id: 'topic', label: 'Chủ đề tư vấn', sortable: true },
  { id: 'status', label: 'Trạng thái', sortable: true },
];

function sortRows(rows, orderBy, order) {
  if (!orderBy) return rows;
  return [...rows].sort((a, b) => {
    if (orderBy === 'date') {
      return order === 'asc'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    if (order === 'asc') {
      return (a[orderBy] || '').localeCompare(b[orderBy] || '');
    }
    return (b[orderBy] || '').localeCompare(a[orderBy] || '');
  });
}

export default function History() {
  const [rows, setRows] = useState(fakeBookings);
  const [filter, setFilter] = useState('all');
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');

  const handleSort = (col) => {
    if (orderBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(col);
      setOrder('asc');
    }
  };

  const filteredRows = rows.filter(row => filter === 'all' ? true : row.status === filter);
  const sortedRows = sortRows(filteredRows, orderBy, order);

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'success';
      case 'confirmed': return 'info';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lịch sử tư vấn
      </Typography>
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
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone || '-'}</TableCell>
                  <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                  <TableCell>{row.topic}</TableCell>
                  <TableCell>
                    <Chip label={statusMap[row.status] || row.status} color={getStatusColor(row.status)} size="small" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 