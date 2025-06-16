import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Skeleton,
  Pagination,
  PaginationItem,
  Stack,
} from '@mui/material';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';
import NotificationService from '../../services/NotificationService';

// Fake data
const initialRequests = [
  {
    id: 1,
    client: 'Nguyen Van A',
    topic: 'Phòng ngừa sử dụng ma túy',
    time: '2024-07-15 10:00',
    email: 'vana@example.com',
    phone: '0912345678',
    note: 'Muốn hỏi về nguy cơ',
    status: 'pending',
    duration: 60,
  },
  {
    id: 2,
    client: 'Tran Thi B',
    topic: 'Điều trị nghiện ma túy',
    time: '2024-07-16 14:00',
    email: 'thib@example.com',
    phone: '0987654321',
    note: '',
    status: 'pending',
    duration: 60,
  },
  {
    id: 3,
    client: 'Le Van C',
    topic: 'Hỗ trợ người thân',
    time: '2024-07-17 09:00',
    email: 'levanc@example.com',
    phone: '0909090909',
    note: 'Cần tư vấn cho người thân',
    status: 'pending',
    duration: 60,
  },
  {
    id: 4,
    client: 'Pham Thi D',
    topic: 'Giáo dục cộng đồng',
    time: '2024-07-18 16:00',
    email: 'phamthid@example.com',
    phone: '0933333333',
    note: '',
    status: 'pending',
    duration: 60,
  },
];

// Giả lập lịch đã duyệt trong tuần
const approvedThisWeek = [
  { id: 10, time: '2024-07-10 14:00', duration: 60 },
  { id: 11, time: '2024-07-12 09:00', duration: 60 },
  { id: 12, time: '2024-07-13 15:00', duration: 60 },
];

function isConflict(newTime, duration, approved) {
  // Đơn giản: chỉ kiểm tra trùng giờ bắt đầu
  return approved.some((item) => item.time === newTime);
}

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const requestsPerPage = 12;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/appointments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Lọc ra các yêu cầu có trạng thái pending và chưa có consultant
      const pendingRequests = response.data.filter(req => req.status === 'PENDING' && !req.consultantName);
      setRequests(pendingRequests);
      setTotalPages(Math.ceil(pendingRequests.length / requestsPerPage));
      setError(null);
    } catch (err) {
      console.error('Error fetching booking requests:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Đã xảy ra lỗi khi tải yêu cầu tư vấn'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item) => {
    setSelected(item);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleApprove = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      await axios.patch(`http://localhost:8080/api/appointments/${selected.id}/status`, {
        status: 'CONFIRMED',
        consultantId: userInfo.id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Cập nhật danh sách yêu cầu
      setRequests(prev => prev.filter(r => r.id !== selected.id));
      
      // Hiển thị thông báo thành công
      setSnackbar({ 
        open: true, 
        message: 'Yêu cầu tư vấn đã được chấp thuận!', 
        severity: 'success' 
      });
      
      // Gửi thông báo đến dashboard
      NotificationService.notify({
        type: 'info',
        message: 'Yêu cầu tư vấn mới',
        description: `Bạn đã chấp thuận yêu cầu tư vấn của ${selected.customerName}`
      });
      
      setOpen(false);
    } catch (err) {
      console.error('Error approving request:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể chấp thuận yêu cầu: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
    }
  };

  const handleDeny = async () => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      await axios.patch(`http://localhost:8080/api/appointments/${selected.id}/status`, {
        status: 'CANCELLED',
        consultantId: userInfo.id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Cập nhật danh sách yêu cầu
      setRequests(prev => prev.filter(r => r.id !== selected.id));
      
      // Hiển thị thông báo từ chối
      setSnackbar({ 
        open: true, 
        message: 'Yêu cầu tư vấn đã bị từ chối!', 
        severity: 'error' 
      });
      
      setOpen(false);
    } catch (err) {
      console.error('Error denying request:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể từ chối yêu cầu: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
    }
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    const { hour, minute } = timeObj;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Lấy dữ liệu phân trang
  const paginatedRequests = requests.slice(
    (page - 1) * requestsPerPage,
    page * requestsPerPage
  );

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Hiển thị skeleton loading
  const SkeletonItem = () => (
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent>
          <Skeleton animation="wave" height={32} width="80%" />
          <Skeleton animation="wave" height={24} width="60%" />
          <Skeleton animation="wave" height={24} width="70%" />
          <Skeleton animation="wave" height={36} width="50%" sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    </Grid>
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Yêu cầu tư vấn
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
        Yêu cầu tư vấn
      </Typography>

      {loading ? (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </Grid>
      ) : requests.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Hiện tại, bạn đang chưa có yêu cầu tư vấn nào!
        </Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedRequests.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {item.topicName}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Khách: {item.customerName}
                    </Typography>
                    <Typography color="textSecondary">
                      Thời gian: {new Date(item.appointmentDate).toLocaleDateString()} {formatTime(item.appointmentTime)}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }} 
                      onClick={() => handleOpen(item)}
                      fullWidth
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {requests.length > requestsPerPage && (
            <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                renderItem={(item) => (
                  <PaginationItem
                    {...item}
                    sx={{ mx: 0.5 }}
                    components={{
                      previous: () => "Trang trước",
                      next: () => "Trang sau",
                    }}
                  />
                )}
              />
            </Stack>
          )}
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết yêu cầu tư vấn</DialogTitle>
        <DialogContent>
          {selected && (
            <List>
              <ListItem>
                <ListItemText primary="Họ và tên" secondary={selected.customerName} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={selected.email || '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Số điện thoại" secondary={selected.phoneNumber || '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Chủ đề tư vấn" secondary={selected.topicName} />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Thời gian tư vấn" 
                  secondary={`${new Date(selected.appointmentDate).toLocaleDateString()} ${formatTime(selected.appointmentTime)}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Trạng thái" secondary={selected.status || 'PENDING'} />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Chấp thuận
          </Button>
          <Button variant="outlined" color="error" onClick={handleDeny}>
            Từ chối
          </Button>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

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