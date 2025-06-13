import React, { useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import NotificationService from '../../services/NotificationService';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Fake data
const stats = {
  week: 3,
  month: 10,
  quarter: 22,
  pending: 2,
};

const upcoming = [
  {
    id: 1,
    client: 'Nguyen Van A',
    topic: 'Phòng ngừa sử dụng ma túy',
    time: '2024-07-10 14:00',
    meet: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 2,
    client: 'Tran Thi B',
    topic: 'Điều trị nghiện ma túy',
    time: '2024-07-12 09:00',
    meet: 'https://meet.google.com/xyz-uvw-123',
  },
  {
    id: 3,
    client: 'Le Van C',
    topic: 'Hỗ trợ người thân',
    time: '2024-07-13 15:00',
    meet: 'https://meet.google.com/ghi-jkl-mno',
  },
  {
    id: 4,
    client: 'Pham Thi D',
    topic: 'Giáo dục cộng đồng',
    time: '2024-07-14 10:00',
    meet: 'https://meet.google.com/pqr-stu-vwx',
  },
];

// Fake chart data
const weekData = [
  { name: 'T2', value: 1 },
  { name: 'T3', value: 0 },
  { name: 'T4', value: 1 },
  { name: 'T5', value: 0 },
  { name: 'T6', value: 1 },
  { name: 'T7', value: 0 },
  { name: 'CN', value: 0 },
];
const monthData = [
  { name: 'Tuần 1', value: 2 },
  { name: 'Tuần 2', value: 3 },
  { name: 'Tuần 3', value: 4 },
  { name: 'Tuần 4', value: 1 },
];

export default function ConsultantDashboard() {
  useEffect(() => {
    // Giả lập có request mới và sắp đến giờ meeting
    NotificationService.newRequest({ client: 'Nguyen Van A', topic: 'Tư vấn du học' });
    setTimeout(() => {
      NotificationService.meetingSoon({ client: 'Tran Thi B', time: '2024-07-12 09:00' });
    }, 2000);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Consultant Dashboard
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Buổi tư vấn tuần này
              </Typography>
              <Typography variant="h5">{stats.week} / 5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Buổi tư vấn tháng này
              </Typography>
              <Typography variant="h5">{stats.month}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Buổi tư vấn quý này
              </Typography>
              <Typography variant="h5">{stats.quarter}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Request chờ duyệt
              </Typography>
              <Typography variant="h5">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ số buổi tư vấn trong tuần
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1976d2" name="Số buổi" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ số buổi tư vấn trong tháng
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#43a047" name="Số buổi" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Buổi tư vấn sắp tới
        </Typography>
        <Card>
          <List>
            {upcoming.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.client + ' - ' + item.topic}
                    secondary={item.time + ' | '} 
                  />
                  <a href={item.meet} target="_blank" rel="noopener noreferrer">
                    Vào Google Meet
                  </a>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {upcoming.length === 0 && (
              <ListItem>
                <ListItemText primary="Không có buổi tư vấn nào sắp tới." />
              </ListItem>
            )}
          </List>
        </Card>
      </Box>
    </Box>
  );
} 