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
  TextField,
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
  const [googleMeetLink, setGoogleMeetLink] = useState("");
  const [linkError, setLinkError] = useState(false);
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const requestsPerPage = 12;
  
  // Thêm state cho loading nút nhận cuộc hẹn
  const [claiming, setClaiming] = useState(false);

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

      const response = await axios.get(`/api/appointments/unassigned`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      setRequests(response.data);
      setTotalPages(Math.ceil(response.data.length / requestsPerPage));
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
    setGoogleMeetLink("");
    setLinkError(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setGoogleMeetLink("");
    setLinkError(false);
  };

  const handleClaim = async () => {
    if (!googleMeetLink.trim()) {
      setLinkError(true);
      setSnackbar({
        open: true,
        message: 'Bạn phải có link Google Meet trước khi chấp thuận yêu cầu',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Bật trạng thái loading
      setClaiming(true);
      
      // Hiển thị thông báo đang xử lý
      setSnackbar({ 
        open: true, 
        message: 'Yêu cầu đang được xử lý...', 
        severity: 'warning' 
      });
      
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.put(`/api/appointments/${selected.id}/approve?consultantId=${userInfo.id}`, {
        linkGoogleMeet: googleMeetLink
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
        message: 'Yêu cầu đã được nhận thành công!', 
        severity: 'success' 
      });
      
      // Gửi thông báo đến dashboard
      NotificationService.notify({
        type: 'info',
        message: 'Yêu cầu tư vấn mới',
        description: `Bạn đã nhận yêu cầu tư vấn của ${selected.customerName}`
      });
      
      // Đóng dialog và reset trạng thái loading
      setOpen(false);
      setClaiming(false);
    } catch (err) {
      console.error('Error claiming request:', err);
      setSnackbar({ 
        open: true, 
        message: 'Không thể nhận yêu cầu: ' + (err.response?.data?.message || err.message), 
        severity: 'error' 
      });
      // Reset trạng thái loading khi có lỗi
      setClaiming(false);
    }
  };

  // Thêm hàm xử lý định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có ngày';
    
    try {
      // Định dạng chuẩn từ database: YYYY-MM-DD
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        
        // Validate các giá trị ngày tháng
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          return 'Ngày không hợp lệ';
        }
        
        // Format trực tiếp thành DD/MM/YYYY
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
      
      // Nếu người dùng nhập ngược định dạng DD/MM/YYYY, không xử lý lại
      if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
      }
      
      // Sử dụng Date object để parse chuỗi ngày tháng
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      // Format thành DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
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
          Tất cả yêu cầu tư vấn đang chờ
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
          Hiện tại, không có yêu cầu tư vấn nào đang chờ xử lý trong hệ thống!
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
                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                  Ngày: {formatDate(selected.appointmentDate)}
                </Typography>
                <Typography variant="body1">
                  Giờ: {formatTime(selected.appointmentTime)}
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
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  LINK GOOGLE MEET
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Nhập link Google Meet (bắt buộc)"
                  value={googleMeetLink}
                  onChange={(e) => {
                    setGoogleMeetLink(e.target.value);
                    setLinkError(!e.target.value.trim());
                  }}
                  error={linkError}
                  helperText={linkError ? "Bạn phải có link Google Meet trước khi chấp thuận yêu cầu" : ""}
                  margin="dense"
                  sx={{ mt: 1 }}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleClaim}
            disabled={claiming || linkError}
            startIcon={claiming ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {claiming ? 'Đang xử lý...' : 'Nhận yêu cầu'}
          </Button>
          <Button onClick={handleClose} disabled={claiming}>Đóng</Button>
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