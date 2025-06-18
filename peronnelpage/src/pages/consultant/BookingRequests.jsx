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
  Snackbar,
  Alert,
  Skeleton,
  Pagination,
  PaginationItem,
  Stack,
  CircularProgress,
  Chip,
} from '@mui/material';
import axios from 'axios';
import { getUserInfo } from '../../utils/auth';
import NotificationService from '../../services/NotificationService';




export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dialog, setDialog] = useState({ open: false, appt: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const requestsPerPage = 12;
  
  // Dialog xác nhận hủy
  const [confirmDialog, setConfirmDialog] = useState({ open: false, appointmentId: null, loading: false });

  useEffect(() => {
    fetchRequests();
    
    // Định kỳ cập nhật dữ liệu (mỗi 1 phút)
    const intervalId = setInterval(() => {
      fetchRequests();
    }, 60000);
    
    // Clear interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.get(`/api/appointments/consultant/${userInfo.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Lọc ra các yêu cầu có trạng thái PENDING
      const pendingRequests = response.data.filter(req => req.status === 'PENDING');
      
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

      // Cập nhật status từ PENDING sang CONFIRMED
      await axios.patch(`/api/appointments/${selected.id}/status?status=CONFIRMED&consultantId=${userInfo.id}`, {}, {
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
    // Mở dialog xác nhận hủy
    setConfirmDialog({ 
      open: true, 
      appointmentId: selected.id 
    });
  };
  
  // Xử lý hủy yêu cầu sau khi xác nhận
  const handleConfirmDeny = async () => {
    try {
      // Bật trạng thái loading
      setConfirmDialog(prev => ({ ...prev, loading: true }));
      
      // Hiển thị thông báo đang xử lý
      setSnackbar({ 
        open: true, 
        message: 'Đang xử lý yêu cầu hủy...', 
        severity: 'warning' 
      });
      
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Sử dụng API để hủy cuộc hẹn tùy theo loại người dùng
      if (selected.guest) {
        // Nếu người đặt lịch là khách (guest) không đăng nhập
        await axios.post(`/api/appointments/${confirmDialog.appointmentId}/cancel/guest?email=${encodeURIComponent(selected.email)}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
      } else {
        // Nếu người đặt lịch là user đã đăng nhập
        // Lấy userId của người đặt lịch, không phải consultant
        const userId = selected.userId || selected.user?.id;
        if (!userId) {
          console.error('Không tìm thấy userId của người đặt lịch trong yêu cầu:', selected);
          throw new Error('Không tìm thấy thông tin người đặt lịch');
        }
        
        await axios.post(`/api/appointments/${confirmDialog.appointmentId}/cancel/user/${userId}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
      }

      // Cập nhật danh sách yêu cầu
      setRequests(prev => prev.filter(r => r.id !== confirmDialog.appointmentId));
      
      // Hiển thị thông báo từ chối
      setSnackbar({ 
        open: true, 
        message: 'Yêu cầu tư vấn đã bị từ chối!', 
        severity: 'info' 
      });
      
      // Đóng các dialog
      setConfirmDialog({ open: false, appointmentId: null, loading: false });
      setDialog({ open: false, appt: null });
    } catch (err) {
      console.error('Error denying request:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể từ chối yêu cầu: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
      setConfirmDialog({ open: false, appointmentId: null, loading: false });
    }
  };

  // Thêm hàm xử lý định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có ngày';
    
    try {
      // Kiểm tra định dạng YYYY-MM-DD
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        // Tháng trong JavaScript bắt đầu từ 0 (0 = tháng 1)
        const date = new Date(year, month - 1, day);
        
        // Kiểm tra xem ngày có hợp lệ không
        if (isNaN(date.getTime())) {
          return 'Ngày không hợp lệ';
        }
        
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
      
      // Thử tạo đối tượng Date từ chuỗi
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Ngày không hợp lệ';
    }
  };

  const formatTime = (timeObj) => {
    // Nếu không có dữ liệu thời gian
    if (!timeObj) return 'Không có thời gian';
    
    try {
      // Trường hợp 1: timeObj là một chuỗi (như "09:00:00.000000")
      if (typeof timeObj === 'string') {
        // Cắt chuỗi để lấy phần giờ:phút
        const timeParts = timeObj.split(':');
        if (timeParts.length >= 2) {
          return `${timeParts[0]}:${timeParts[1]}`;
        }
        return timeObj;
      }
      
      // Trường hợp 2: timeObj là đối tượng với hour và minute
      if (typeof timeObj === 'object') {
        const { hour, minute } = timeObj;
        if (hour === undefined || minute === undefined) return 'Không có thời gian';
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
      
      // Trường hợp khác: Trả về dữ liệu nguyên bản
      return String(timeObj);
    } catch (error) {
      console.error('Error formatting time:', error, timeObj);
      return 'Không có thời gian';
    }
  };

  // Hàm định dạng đầy đủ ngày giờ
  const formatDateTime = (dateString, timeObj) => {
    const formattedDate = formatDate(dateString);
    const formattedTime = formatTime(timeObj);
    
    // Nếu ngày không hợp lệ nhưng giờ hợp lệ, chỉ trả về giờ
    if (formattedDate.includes('không hợp lệ') && !formattedTime.includes('Không có')) {
      return formattedTime;
    }
    
    return `${formattedDate} ${formattedTime}`;
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
    <Grid item xs={12} sm={6} md={6} lg={3}>
      <Card sx={{ position: 'relative', pt: 1, height: '100%' }}>
        <Box sx={{ position: 'absolute', top: 15, left: 15 }}>
          <Skeleton animation="wave" height={24} width={70} />
        </Box>
        <CardContent sx={{ pt: 4 }}>
          <Skeleton animation="wave" height={32} width="80%" sx={{ mt: 1 }} />
          <Skeleton animation="wave" height={20} width="60%" sx={{ mb: 2 }} />
          <Skeleton animation="wave" height={20} width="90%" />
          <Skeleton animation="wave" height={20} width="90%" sx={{ mb: 2 }} />
          
          <Skeleton animation="wave" height={16} width="30%" sx={{ mb: 0.5 }} />
          <Skeleton animation="wave" height={24} width="50%" sx={{ mb: 2 }} />
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
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Yêu cầu tư vấn
        </Typography>
      </Box>

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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={`Tổng: ${requests.length}`} 
                size="small"
                sx={{ 
                  bgcolor: '#e3f2fd', 
                  color: '#1976d2',
                  fontWeight: 'medium',
                  px: 1,
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Box>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {paginatedRequests.map((item) => (
              <Grid item xs={12} sm={6} md={6} lg={3} xl={3} key={item.id}>
                <Card 
                  onClick={() => handleOpen(item)}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      cursor: 'pointer'
                    },
                    pt: 1,
                    overflow: 'visible',
                    backgroundColor: '#ffffff',
                    borderRadius: 2
                  }}
                >
                  {/* Status Badge */}
                  <Box sx={{ position: 'absolute', top: 15, left: 15 }}>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        bgcolor: '#42a5f5', // Blue for PENDING
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        py: 0.5,
                        height: 24
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 2.5, pt: 4 }}>
                    {/* Title and Date */}
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, mb: 0 }} noWrap>
                      {item.topicName || "Chủ đề tư vấn"}
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                      {formatDateTime(item.appointmentDate, item.appointmentTime)}
                    </Typography>
                    
                    {/* Description */}
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: 40
                      }}
                    >
                      Yêu cầu tư vấn từ khách hàng {item.customerName}
                    </Typography>
                    
                    {/* Labels */}
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                        THÔNG TIN
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        {item.customerName}
                      </Typography>
                      

                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {requests.length > requestsPerPage && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    mx: 0.5
                  }
                }}
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ 
        sx: { borderRadius: 2 }
      }}>
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0', 
          py: 2,
          fontWeight: 'bold',
          bgcolor: '#f5f7fa'
        }}>
          Chi tiết yêu cầu tư vấn
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {selected && (
            <>
                             <Chip
                 label={selected.status}
                 size="small"
                 sx={{
                   bgcolor: '#42a5f5',
                   color: 'white',
                   fontWeight: 'bold',
                   fontSize: '0.75rem',
                   height: 24,
                   mb: 2
                 }}
               />
            
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {selected.topicName}
              </Typography>
            
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  THỜI GIAN
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(selected.appointmentDate, selected.appointmentTime)}
                </Typography>
              </Box>
            
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  THÔNG TIN KHÁCH HÀNG
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: '500', mb: 0.5 }}>
                  {selected.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.email || 'Không có email'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.phoneNumber || 'Không có số điện thoại'}
                </Typography>
              </Box>
              
              
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
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
      
      {/* Dialog xác nhận hủy yêu cầu */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => !confirmDialog.loading && setConfirmDialog({ open: false, appointmentId: null, loading: false })}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          Xác nhận từ chối yêu cầu
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn từ chối yêu cầu tư vấn này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, appointmentId: null, loading: false })} 
            color="primary"
            disabled={confirmDialog.loading}
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleConfirmDeny} 
            color="error" 
            variant="contained"
            disabled={confirmDialog.loading}
            startIcon={confirmDialog.loading ? 
              <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {confirmDialog.loading ? 'Đang xử lý...' : 'Từ chối yêu cầu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 