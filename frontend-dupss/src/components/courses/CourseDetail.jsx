import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper, Divider, 
         List, ListItem, ListItemIcon, ListItemText, Avatar, Chip, styled, Alert, Snackbar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamIcon from '@mui/icons-material/Videocam';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api, { isAuthenticated } from '../../services/authService';
import axios from 'axios';

// Styled components to match the original HTML/CSS
const CourseDetailWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(5),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  }
}));

const CourseInfoSection = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: '300px',
}));

const CourseSidebar = styled(Box)(({ theme }) => ({
  width: '350px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
  },
}));

const CoursePreview = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
  position: 'sticky',
  top: '20px',
}));

const CourseFeatures = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  color: '#555',
  paddingLeft: 0,
  paddingRight: 0,
}));

const EnrollButton = styled(Button)(({ theme, status }) => ({
  width: '100%',
  padding: '15px',
  backgroundColor: status === 'IN_PROGRESS' ? '#3498db' : '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginTop: theme.spacing(1),
  '&:hover': {
    backgroundColor: status === 'IN_PROGRESS' ? '#2980b9' : '#219653',
  },
}));

const CertificateButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '15px',
  backgroundColor: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginTop: theme.spacing(1),
  '&:hover': {
    backgroundColor: '#219653',
  },
}));

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  useEffect(() => {
    // 检查是否有通过导航传递的状态
    if (location.state?.showAlert) {
      setAlertMessage(location.state.alertMessage);
      setAlertSeverity(location.state.alertSeverity || 'error');
      setAlertOpen(true);
      
      // 清除状态，避免用户刷新页面时再次显示提示
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        // Sử dụng api instance thay vì axios trực tiếp
        // Không cần thêm header Authorization vì api instance đã tự động thêm
        const response = await api.get(`/public/course/${id}`);
        setCourse(response.data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Không thể tải thông tin khóa học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id]);

  // Check if user is authenticated
  const checkAuthentication = async () => {
    return isAuthenticated();
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Handle enrollment button click
  const handleEnrollClick = async () => {
    if (course.status === 'NOT_ENROLLED') {
      // Check if user is authenticated
      const isUserAuthenticated = await checkAuthentication();
      if (!isUserAuthenticated) {
        // 直接重定向到登录页面，并传递状态以显示alert
        navigate('/login', { 
          state: { 
            showAuthAlert: true, 
            authMessage: 'Cần đăng nhập để có thể đăng ký khóa học!',
            returnUrl: `/courses/${id}` 
          } 
        });
        return;
      }
      
      // Call API to enroll in the course
      try {
        // Sử dụng api instance thay vì axios trực tiếp
        await api.post(`/courses/${id}/enroll`);

        // Show success message
        showAlert('Đăng ký khóa học thành công!', 'success');
        
        // Reload the page to refresh course status
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        if (err.response && err.response.status === 400) {
          // Show error message if user already enrolled
          showAlert('Bạn đã đăng ký khóa học này!', 'error');
        } else {
          showAlert('Đã có lỗi xảy ra khi đăng ký khóa học!', 'error');
        }
        console.error('Enrollment error:', err);
      }
    } else {
      // Navigate to course learning page
      navigate(`/courses/${course.id}/learn`);
    }
  };
  
  // Handle certificate button click
  const handleCertificateClick = () => {
    // 处理下载证书逻辑
    console.log('Download certificate');
    // TODO: 添加下载证书的API调用
  };

  // Get button text based on enrollment status
  const getButtonText = () => {
    switch (course?.status) {
      case 'IN_PROGRESS':
        return 'TIẾP TỤC KHÓA HỌC';
      case 'COMPLETED':
        return 'TIẾP TỤC KHÓA HỌC';
      default:
        return 'ĐĂNG KÝ KHÓA HỌC';
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Typography>Đang tải...</Typography>
    </Box>;
  }

  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Typography color="error">{error}</Typography>
    </Box>;
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      <CourseDetailWrapper>
        {/* Left Side - Course Information */}
        <CourseInfoSection>
          <Chip 
            label={course.topicName} 
            color="primary" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              bgcolor: '#e9f5ff',
              color: '#0056b3',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          />
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 700, mb: 2.5, color: '#2c3e50', lineHeight: 1.3 }}
          >
            {course.title}
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#0056b3', fontWeight: 600, mb: 1.5, paddingBottom: 0.5, paddingTop: 2.5, borderTop: '1px solid #eee' }}>
              Nội dung khóa học
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: course.content }} style={{ color: '#333', lineHeight: 1.7 }} />
          </Box>
          
        </CourseInfoSection>
        
        {/* Right Side - Course Sidebar */}
        <CourseSidebar>
          <CoursePreview elevation={3}>
            <Box sx={{ width: '100%' }}>
              <img 
                src={course.coverImage}
                alt={course.title}
                style={{ 
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
              />
            </Box>
            
            <CourseFeatures>
              <FeatureItem disableGutters>
                <AccessTimeIcon sx={{ mr: 1.5, color: '#3498db' }} />
                <Typography>Thời lượng: <strong>{course.duration} giờ</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <VideocamIcon sx={{ mr: 1.5, color: '#3498db' }} />
                <Typography>Bài giảng: <strong>{course.videoCount} video</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <PeopleIcon sx={{ mr: 1.5, color: '#3498db' }} />
                <Typography>Số lượng học viên: <strong>{course.totalEnrolled}</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <PersonIcon sx={{ mr: 1.5, color: '#3498db' }} />
                <Typography>Giảng viên: <strong>{course.createdBy}</strong></Typography>
              </FeatureItem>
              
              <EnrollButton 
                status={course.status !== 'COMPLETED' ? course.status : 'IN_PROGRESS'}
                onClick={handleEnrollClick}
              >
                {getButtonText()}
              </EnrollButton>

              {course.status === 'COMPLETED' && (
                <CertificateButton
                  onClick={handleCertificateClick}
                  startIcon={<EmojiEventsIcon />}
                >
                  NHẬN CHỨNG CHỈ
                </CertificateButton>
              )}
            </CourseFeatures>
          </CoursePreview>
        </CourseSidebar>
      </CourseDetailWrapper>
    </Container>
  );
}

export default CourseDetail;