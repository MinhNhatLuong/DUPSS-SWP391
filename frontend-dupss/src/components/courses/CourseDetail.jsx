import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper, Divider, 
         List, ListItem, ListItemIcon, ListItemText, Avatar, Chip, styled, Alert, Snackbar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamIcon from '@mui/icons-material/Videocam';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
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
  backgroundColor: status === 'COMPLETED' ? '#27ae60' : '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginTop: theme.spacing(1),
  '&:hover': {
    backgroundColor: status === 'COMPLETED' ? '#219653' : '#2980b9',
  },
}));

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        const headers = accessToken 
          ? { Authorization: `Bearer ${accessToken}` } 
          : {};
          
        const response = await axios.get(`http://localhost:8080/api/public/course/${id}`, { headers });
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
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return false;

    try {
      const response = await axios.post('http://localhost:8080/api/auth/me', { accessToken });
      return response.status === 200;
    } catch (err) {
      console.error('Authentication error:', err);
      return false;
    }
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
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
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
        const accessToken = localStorage.getItem('accessToken');
        
        await axios.post(
          `http://localhost:8080/api/courses/${id}/enroll`, 
          {}, 
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

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
    } else if (course.status === 'IN_PROGRESS') {
      // Navigate to course learning page
      navigate(`/courses/${course.id}/learn`);
    } else if (course.status === 'COMPLETED') {
      // Handle certificate download or view
      console.log('Download certificate');
    }
  };

  // Get button text based on enrollment status
  const getButtonText = () => {
    switch (course?.status) {
      case 'IN_PROGRESS':
        return 'TIẾP TỤC KHÓA HỌC';
      case 'COMPLETED':
        return 'NHẬN CHỨNG CHỈ';
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
                status={course.status}
                onClick={handleEnrollClick}
              >
                {getButtonText()}
              </EnrollButton>
            </CourseFeatures>
          </CoursePreview>
        </CourseSidebar>
      </CourseDetailWrapper>
    </Container>
  );
}

export default CourseDetail;