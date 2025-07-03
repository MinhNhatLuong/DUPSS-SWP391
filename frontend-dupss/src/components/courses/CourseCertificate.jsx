import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, Container, Paper, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { showErrorAlert } from '../common/AlertNotification';
import { API_URL } from '../../services/config';

const CourseCertificate = () => {
  const { courseId, userId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/public/course/${courseId}/cert/${userId}`);
        setCertificate(response.data);
      } catch (error) {
        console.error("Error fetching certificate data:", error);
        if (error.response && error.response.status === 400) {
          showErrorAlert("Chứng chỉ không tồn tại!");
          // Chuyển hướng về trang khóa học sau 3 giây
          setTimeout(() => {
            navigate(`/courses/${courseId}`);
          }, 3000);
        } else {
          showErrorAlert("Đã xảy ra lỗi khi tải chứng chỉ. Vui lòng thử lại sau!");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificateData();
  }, [courseId, userId, navigate]);

  // Xử lý tải xuống chứng chỉ
  const handleDownload = () => {
    if (certificateRef.current) {
      html2canvas(certificateRef.current, {
        scale: 2, // Tăng độ phân giải
        useCORS: true, // Cho phép tải hình ảnh từ domain khác
        backgroundColor: null // Giữ nguyên nền trong suốt
      }).then(canvas => {
        const link = document.createElement("a");
        link.download = `chung-chi-${certificate?.courseTitle?.replace(/\s+/g, '-').toLowerCase() || 'khoa-hoc'}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Xử lý chia sẻ (copy URL)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!certificate) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Không tìm thấy chứng chỉ hoặc đã xảy ra lỗi.</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Quay lại khóa học
        </Button>
      </Box>
    );
  }

  // Tính toán fontSize dựa vào độ dài của tên khóa học
  const getCourseTitleFontSize = () => {
    const length = certificate.courseTitle.length;
    if (length > 60) return '1.5rem';
    if (length > 40) return '1.7rem';
    if (length > 30) return '1.9rem';
    return '2.1rem';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {showAlert && (
        <Alert 
          severity="success" 
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
          onClose={() => setShowAlert(false)}
        >
          Copy đường dẫn thành công!
        </Alert>
      )}
      
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 600, color: "#0056b3", fontSize: '2.5rem'}}>
          Chứng chỉ hoàn thành khóa học
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3, 
          position: 'relative',
          textAlign: 'center',
          backgroundColor: '#f9f9f9'
        }}
      >
        <Box 
          ref={certificateRef}
          sx={{
            backgroundImage: `url('/certificate.png')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '100%',
            height: 0,
            paddingBottom: '70%', // Tỉ lệ khung hình
            position: 'relative',
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: 'bold',
              color: '#1a237e',
              width: '70%',
              textAlign: 'center',
              fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
              textTransform: 'uppercase',
              fontSize: '2rem'
            }}
          >
            {certificate.username}
          </Typography>
          
          <Typography 
            variant="h6"
            sx={{ 
              position: 'absolute',
              top: '57%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontStyle: 'italic',
              color: '#333',
              width: '80%',
              textAlign: 'center',
              lineHeight: 1.5,
              fontSize: '1.7rem'
            }}
          >
            đã hoàn thành xuất sắc khóa học
          </Typography>
          
          <Typography 
            variant="h5"
            sx={{ 
              position: 'absolute',
              top: '67%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: 'bold',
              color: '#1a237e',
              width: '85%',
              textAlign: 'center',
              fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
              fontSize: getCourseTitleFontSize(),
              lineHeight: 1.3,
              marginTop: '10px',
              padding: '10px'
            }}
          >
            {certificate.courseTitle}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          size="large"
        >
          Tải xuống chứng chỉ
        </Button>
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={<ShareIcon />}
          onClick={handleShare}
          size="large"
        >
          Chia sẻ
        </Button>
      </Box>
    </Container>
  );
};

export default CourseCertificate; 