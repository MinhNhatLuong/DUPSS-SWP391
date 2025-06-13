import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';

// Khung giờ từ 7h đến 19h
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => 7 + i); // 7h-19h
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6']; // Chỉ thứ 2 đến thứ 6

// Fake data các lịch hẹn tư vấn trong tuần
const fakeAppointments = [
  {
    id: 1,
    client: 'Nguyen Van A',
    topic: 'Phòng ngừa sử dụng ma túy',
    start: '2025-06-09T15:00', // Thứ 2, 15h
    end: '2025-06-09T16:00',
    meet: 'https://meet.google.com/abc',
    note: 'Muốn hỏi về nguy cơ',
  },
  {
    id: 2,
    client: 'Tran Thi B',
    topic: 'Điều trị nghiện ma túy',
    start: '2025-06-10T09:00', // Thứ 3, 9h
    end: '2025-06-10T10:00',
    meet: 'https://meet.google.com/def',
    note: '',
  },
  {
    id: 3,
    client: 'Le Van C',
    topic: 'Hỗ trợ người thân',
    start: '2025-06-12T14:00', // Thứ 5, 14h
    end: '2025-06-12T15:30',
    meet: 'https://meet.google.com/ghi',
    note: 'Cần tư vấn cho người thân',
  },
  {
    id: 4,
    client: 'Pham Thi D',
    topic: 'Giáo dục cộng đồng',
    start: '2025-06-13T10:00', // Thứ 6, 10h
    end: '2025-06-13T11:00',
    meet: 'https://meet.google.com/jkl',
    note: '',
  },
];

function getStatus(start, end) {
  const now = dayjs();
  if (now.isBefore(dayjs(start))) return 'notstarted';
  if (now.isAfter(dayjs(end))) return 'done';
  return 'ongoing';
}

const statusColor = {
  notstarted: 'default',
  ongoing: 'warning',
  done: 'success',
};
const statusLabel = {
  notstarted: 'Chưa bắt đầu',
  ongoing: 'Đang diễn ra',
  done: 'Đã xong',
};

// Lấy ngày đầu tuần (thứ 2)
function getStartOfWeek(date) {
  const d = dayjs(date);
  // Đảm bảo trả về thứ 2
  return d.startOf('week').add(1, 'day');
}

export default function Schedule() {
  const [dialog, setDialog] = useState({ open: false, appt: null });
  // Tuần hiện tại (giả lập tuần 2025-06-09 -> 2025-06-13)
  const [weekStart, setWeekStart] = useState(dayjs('2025-06-09'));
  const weekDays = Array.from({ length: 5 }, (_, i) => weekStart.add(i, 'day'));

  // Tìm lịch hẹn cho từng ô
  function findAppointment(day, hour) {
    return fakeAppointments.find(appt => {
      const start = dayjs(appt.start);
      return start.date() === day.date() && start.hour() === hour;
    });
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lịch tư vấn (Thứ 2 - Thứ 6)
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, background: '#fafcff' }}>
        <Table size="small" sx={{ minWidth: 900, tableLayout: 'fixed', borderRadius: 3 }}>
          <TableHead>
            <TableRow sx={{ background: '#e3f2fd' }}>
              <TableCell sx={{ width: 70, fontWeight: 700, background: '#e3f2fd', color: '#1976d2', fontSize: 16 }}>Giờ</TableCell>
              {weekDays.map((d, idx) => (
                <TableCell key={idx} align="center" sx={{ fontWeight: 700, background: '#e3f2fd', color: '#1976d2', fontSize: 16 }}>
                  <div>{WEEK_DAYS[idx]}</div>
                  <div style={{ fontSize: 15 }}>{d.format('DD/MM')}</div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {TIME_SLOTS.map((hour) => (
              <TableRow key={hour} sx={{ height: 48, '&:hover': { background: '#f1f8ff' } }}>
                <TableCell sx={{ fontWeight: 600, background: '#f5f5f5', fontSize: 15 }}>{hour}:00</TableCell>
                {weekDays.map((d, idx) => {
                  const appt = findAppointment(d, hour);
                  return (
                    <TableCell key={idx} align="center" sx={{ p: 0, border: '1px solid #e3e3e3', borderLeft: 0, borderRight: 0 }}>
                      {appt ? (
                        <Tooltip title={appt.topic + ' - ' + appt.client} arrow>
                          <Box
                            sx={{
                              bgcolor: '#e3f2fd',
                              border: `2px solid ${appt ? (statusColor[getStatus(appt.start, appt.end)] === 'success' ? '#388e3c' : statusColor[getStatus(appt.start, appt.end)] === 'warning' ? '#ffa726' : '#bdbdbd') : '#e0e0e0'}`,
                              color: '#222',
                              borderRadius: 2,
                              px: 1,
                              py: 0.5,
                              m: 0.5,
                              cursor: 'pointer',
                              minWidth: 110,
                              minHeight: 60,
                              boxShadow: 2,
                              fontWeight: 500,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => setDialog({ open: true, appt })}
                          >
                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{appt.client}</div>
                            <div style={{ fontSize: 13, color: '#1976d2', marginBottom: 2 }}>{appt.topic}</div>
                            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{dayjs(appt.start).format('HH:mm')} - {dayjs(appt.end).format('HH:mm')}</div>
                            <Chip
                              label={statusLabel[getStatus(appt.start, appt.end)]}
                              color={statusColor[getStatus(appt.start, appt.end)]}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Tooltip>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, appt: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
        <DialogContent>
          {dialog.appt && (
            <Box>
              <Typography><b>Khách hàng:</b> {dialog.appt.client}</Typography>
              <Typography><b>Chủ đề:</b> {dialog.appt.topic}</Typography>
              <Typography><b>Thời gian:</b> {dayjs(dialog.appt.start).format('HH:mm')} - {dayjs(dialog.appt.end).format('HH:mm')} {dayjs(dialog.appt.start).format('DD/MM/YYYY')}</Typography>
              <Typography><b>Ghi chú:</b> {dialog.appt.note || 'Không có'}</Typography>
              <Button
                variant="contained"
                color="primary"
                href={dialog.appt.meet}
                target="_blank"
                sx={{ mt: 2 }}
              >
                Vào Google Meet
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, appt: null })}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ fontSize: 14, color: 'text.secondary', mt: 2 }}>
        <b>Chú thích:</b> <Chip label="Chưa bắt đầu" color="default" size="small" sx={{ mr: 1 }} />
        <Chip label="Đang diễn ra" color="warning" size="small" sx={{ mr: 1 }} />
        <Chip label="Đã xong" color="success" size="small" sx={{ mr: 1 }} />
      </Box>
    </Box>
  );
} 