import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Article as ArticleIcon, School as SchoolIcon, Poll as PollIcon, History as HistoryIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bảng Điều Khiển Nhân Viên
      </Typography>
      
      <Typography paragraph color="text.secondary">
        Chào mừng bạn đến với trang quản lý nội dung của DUPSS. Từ đây, bạn có thể tạo và quản lý bài viết, khóa học, và khảo sát.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Card sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            transition: 'transform 0.3s', 
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            } 
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4, flexGrow: 1 }}>
              <ArticleIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Quản Lý Bài Viết
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                Tạo, chỉnh sửa và quản lý các bài viết để chia sẻ thông tin và kiến thức với người dùng.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleNavigation('/staff/create-blog')}
                fullWidth
              >
                Tạo Bài Viết
              </Button>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            transition: 'transform 0.3s', 
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            } 
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4, flexGrow: 1 }}>
              <SchoolIcon sx={{ fontSize: 60, color: '#e91e63', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Quản Lý Khóa Học
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                Xây dựng và duy trì các khóa học trực tuyến với nội dung đa phương tiện và bài tập cho người học.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => handleNavigation('/staff/create-course')}
                fullWidth
              >
                Tạo Khóa Học
              </Button>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Card sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            transition: 'transform 0.3s', 
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            } 
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4, flexGrow: 1 }}>
              <PollIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Quản Lý Khảo Sát
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                Thiết kế và phân tích các khảo sát để thu thập thông tin từ người dùng và cải thiện dịch vụ.
              </Typography>
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => handleNavigation('/staff/create-survey')}
                fullWidth
              >
                Tạo Khảo Sát
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            transition: 'transform 0.3s', 
            '&:hover': { 
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            } 
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4, flexGrow: 1 }}>
              <HistoryIcon sx={{ fontSize: 60, color: '#ff9800', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Lịch Sử Nội Dung
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                Xem và theo dõi trạng thái của tất cả bài viết, khóa học và khảo sát bạn đã tạo trước đây.
              </Typography>
              <Button 
                variant="contained" 
                sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#ed8c01' } }}
                onClick={() => handleNavigation('/staff/history')}
                fullWidth
              >
                Xem Lịch Sử
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;