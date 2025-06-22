import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Article as ArticleIcon, School as SchoolIcon, Poll as PollIcon } from '@mui/icons-material';

const Dashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Staff Dashboard
      </Typography>
      
      <Typography paragraph color="text.secondary">
        Chào mừng bạn đến với trang quản lý nội dung của DUPSS. Từ đây, bạn có thể tạo và quản lý blogs, khóa học, và khảo sát.
      </Typography>

      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4 }}>
              <ArticleIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Quản lý Blog
              </Typography>
              <Typography color="text.secondary">
                Tạo, chỉnh sửa và quản lý các bài viết blog để chia sẻ thông tin và kiến thức.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4 }}>
              <SchoolIcon sx={{ fontSize: 60, color: '#e91e63', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Quản lý Khóa học
              </Typography>
              <Typography color="text.secondary">
                Xây dựng và duy trì các khóa học trực tuyến với nội dung đa phương tiện và bài tập.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4 }}>
              <PollIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Quản lý Khảo sát
              </Typography>
              <Typography color="text.secondary">
                Thiết kế và phân tích các khảo sát để thu thập thông tin từ người dùng.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 