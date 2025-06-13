import React, { useState } from 'react';
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
} from '@mui/material';

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
  const [requests, setRequests] = useState(initialRequests);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleOpen = (item) => {
    setSelected(item);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleApprove = () => {
    // Kiểm tra trùng lịch và max 5 buổi/tuần
    if (isConflict(selected.time, selected.duration, approvedThisWeek)) {
      setSnackbar({ open: true, message: 'Trùng lịch với buổi đã duyệt!', severity: 'error' });
      return;
    }
    if (approvedThisWeek.length >= 5) {
      setSnackbar({ open: true, message: 'Đã đạt tối đa 5 buổi trong tuần!', severity: 'error' });
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== selected.id));
    setSnackbar({ open: true, message: 'Đã duyệt request thành công!', severity: 'success' });
    setOpen(false);
    // Thực tế: thêm vào lịch làm việc, gửi thông báo, gọi API...
  };

  const handleDeny = () => {
    setRequests((prev) => prev.filter((r) => r.id !== selected.id));
    setSnackbar({ open: true, message: 'Đã từ chối request!', severity: 'info' });
    setOpen(false);
    // Thực tế: gửi thông báo, gọi API...
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Booking Requests
      </Typography>
      <Grid container spacing={2}>
        {requests.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.topic}</Typography>
                <Typography color="textSecondary">Khách: {item.client}</Typography>
                <Typography color="textSecondary">Thời gian: {item.time}</Typography>
                <Button variant="outlined" sx={{ mt: 1 }} onClick={() => handleOpen(item)}>
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {requests.length === 0 && (
          <Grid item xs={12}>
            <Typography>Không có request nào chờ duyệt.</Typography>
          </Grid>
        )}
      </Grid>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết request booking</DialogTitle>
        <DialogContent>
          {selected && (
            <List>
              <ListItem>
                <ListItemText primary="Khách hàng" secondary={selected.client} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={selected.email} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Số điện thoại" secondary={selected.phone || '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Chủ đề" secondary={selected.topic} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Thời gian" secondary={selected.time} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Ghi chú" secondary={selected.note || 'Không có'} />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Duyệt
          </Button>
          <Button variant="outlined" color="error" onClick={handleDeny}>
            Từ chối
          </Button>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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