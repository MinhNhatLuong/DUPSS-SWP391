import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import AppointmentForm from './AppointmentForm';
import './Appointment.css';
import { useEffect } from 'react';

const Appointment = () => {
  useEffect(() => {
    document.title = "Đặt Lịch Hẹn - DUPSS";
  }, []);

  return (
    <Container maxWidth="lg" className="appointment-container">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Đặt Lịch Hẹn Tư Vấn
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn
        </Typography>
      </Box>

      {/* Notice Box */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderLeft: '4px solid #3498db',
          borderRadius: '4px',
          bgcolor: '#f8f9fa' 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <InfoIcon sx={{ color: '#3498db', mr: 2, mt: 0.5 }} />
          <Typography variant="body1" color="text.primary">
            Khi bạn đặt lịch tư vấn, bạn sẽ nhận được đường link Google Meet qua email hoặc trong lịch sử tư vấn (nếu có tài khoản). Vui lòng kiểm tra email và đăng nhập đúng giờ để không bỏ lỡ buổi tư vấn.
          </Typography>
        </Box>
      </Paper>

      {/* Form Container */}
      <AppointmentForm />

      {/* Info Cards */}
      <Box sx={{ display: 'flex', mt: 5, gap: 3 }}>
        {/* Card 1: Đội ngũ chuyên gia */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            flex: 1,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box 
            sx={{ 
              width: 70, 
              height: 70, 
              bgcolor: '#3498db', 
              color: 'white', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mx: 'auto', 
              mb: 2 
            }}
          >
            <PersonIcon fontSize="large" />
          </Box>
          <Typography variant="h6" gutterBottom>Đội ngũ chuyên gia</Typography>
          <Typography variant="body2" color="text.secondary">
            Đội ngũ chuyên gia của chúng tôi bao gồm các bác sĩ, nhà tâm lý học và chuyên gia tư vấn có nhiều năm kinh nghiệm trong lĩnh vực phòng chống ma túy.
          </Typography>
        </Paper>
        
        {/* Card 2: Thời gian tư vấn */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            flex: 1,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box 
            sx={{ 
              width: 70, 
              height: 70, 
              bgcolor: '#3498db', 
              color: 'white', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mx: 'auto', 
              mb: 2 
            }}
          >
            <AccessTimeIcon fontSize="large" />
          </Box>
          <Typography variant="h6" gutterBottom>Thời gian tư vấn</Typography>
          <Typography variant="body2" color="text.secondary">
            Thời gian tư vấn linh hoạt từ 8:00 đến 20:00 hàng ngày, kể cả cuối tuần. Mỗi buổi tư vấn kéo dài khoảng 30-45 phút.
          </Typography>
        </Paper>
        
        {/* Card 3: Bảo mật thông tin */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            flex: 1,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Box 
            sx={{ 
              width: 70, 
              height: 70, 
              bgcolor: '#3498db', 
              color: 'white', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mx: 'auto', 
              mb: 2 
            }}
          >
            <SecurityIcon fontSize="large" />
          </Box>
          <Typography variant="h6" gutterBottom>Bảo mật thông tin</Typography>
          <Typography variant="body2" color="text.secondary">
            Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân và nội dung tư vấn của bạn. Mọi thông tin chỉ được sử dụng cho mục đích tư vấn.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Appointment; 