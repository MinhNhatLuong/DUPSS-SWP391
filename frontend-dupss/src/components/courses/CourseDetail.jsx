import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper, Divider, 
         List, ListItem, ListItemIcon, ListItemText, Avatar, Chip, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamIcon from '@mui/icons-material/Videocam';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';

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

const EnrollButton = styled(Button)(({ theme, isStartLearning, isEnrolled }) => ({
  width: '100%',
  padding: '15px',
  backgroundColor: isStartLearning ? '#27ae60' : isEnrolled ? '#27ae60' : '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginTop: theme.spacing(1),
  '&:hover': {
    backgroundColor: isStartLearning ? '#219653' : isEnrolled ? '#219653' : '#2980b9',
  },
}));

const CourseBenefits = styled(List)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiListItem-root': {
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'flex-start',
  },
  '& .MuiListItemIcon-root': {
    color: '#27ae60',
    minWidth: theme.spacing(4),
    marginTop: theme.spacing(0.5),
  },
}));

// Mock course data
const mockCourse = {
  id: 9,
  topicName: "Nhận thức",
  title: "Nhận thức về tác hại của ma túy đối với sức khỏe và xã hội",
  description: "Khóa học giúp người học hiểu rõ về tác hại của ma túy đối với sức khỏe cá nhân, gia đình và những hệ lụy xã hội.",
  targetAudience: "Học Sinh",
  coverImage: "https://res.cloudinary.com/dxkvlbzzu/image/upload/v1749404874/upload/file_ciwtlv.jpg",
  content: "<p>Khóa học cung cấp kiến thức và kỹ năng cơ bản giúp học sinh nhận biết và phòng tránh các chất gây nghiện phổ biến. Bạn sẽ được học về cách nhận diện các loại chất gây nghiện, tác hại của chúng đối với sức khỏe và cuộc sống, cũng như các kỹ năng từ chối khi bị rủ rê sử dụng.</p><p>Nội dung khóa học được thiết kế phù hợp với lứa tuổi học sinh, giúp các em hiểu rõ tác hại của ma túy và có khả năng nhận biết, phòng tránh hiệu quả.</p>",
  duration: 300,
  createdAt: "2025-06-09T00:47:54.695877",
  updatedAt: null,
  benefits: [
    "Nhận biết các loại chất gây nghiện phổ biến",
    "Hiểu rõ tác hại của ma túy đối với não bộ và cơ thể",
    "Phát triển kỹ năng từ chối hiệu quả",
    "Xây dựng lối sống lành mạnh",
    "Biết cách tìm kiếm sự hỗ trợ khi cần thiết"
  ],
  creator: {
    email: "laml33366@gmail.com",
    fullName: "Lương Gia Lâm",
    avatar: null,
    role: "ROLE_MANAGER"
  },
  modules: [
    {
      id: 9,
      title: "Nhận diện các chất ma túy phổ biến",
      content: "Phân biệt thuốc lắc, cần sa, heroin qua hình ảnh",
      videoUrl: [
        {
          videoTitle: "01.Bài 1",
          url: "https://www.youtube.com/watch?v=a_frdvO7f44"
        },
        {
          videoTitle: "02.Bài 2",
          url: "https://www.youtube.com/watch?v=zBZm0gXJF2E"
        }
      ],
      duration: 30,
      orderIndex: 1,
      createdAt: "2025-06-09T00:47:54.724879",
      updatedAt: null
    },
    {
      id: 10,
      title: "Tình huống xử lý khi bị rủ rê",
      content: "Cách từ chối và tìm kiếm giúp đỡ từ người lớn",
      videoUrl: [
        {
          videoTitle: "03.Bài 3",
          url: "https://www.youtube.com/watch?v=FSyB-coD7EM"
        }
      ],
      duration: 60,
      orderIndex: 2,
      createdAt: "2025-06-09T00:47:54.729983",
      updatedAt: null
    }
  ],
  enrollmentCount: 1250,
  isEnrolled: false,
  active: true,
  level: "Cơ bản",
  instructor: "ThS. Trần Minh Hiếu",
  language: "Tiếng Việt",
  videosCount: 3
};

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollButtonState, setEnrollButtonState] = useState('enroll'); // 'enroll', 'start', 'continue'

  useEffect(() => {
    // In a real application, this would be an API call using the ID
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const courseData = { ...mockCourse }; 
      setCourse(courseData);
      
      // Check if user is already enrolled (for a real app, this would come from API)
      if (courseData.isEnrolled) {
        setIsEnrolled(true);
        setEnrollButtonState('continue');
      }
      
      setLoading(false);
    }, 500);
  }, [id]);

  // Format duration from minutes to weeks
  const formatDuration = (minutes) => {
    const weeks = Math.ceil(minutes / (7 * 24 * 60));
    return `${weeks} tuần`;
  };

  // Handle enrollment button click
  const handleEnrollClick = () => {
    // If already enrolled, navigate to the course learning page
    if (enrollButtonState === 'continue' || enrollButtonState === 'start') {
      navigate(`/courses/${course.id}/learn`);
      return;
    }

    // Otherwise, enroll in the course
    setIsEnrolled(true);
    setEnrollButtonState('start');
    
    // In a real application, this would be an API call to enroll the user
    console.log(`Enrolled in course with ID: ${course.id}`);
    
    // Update enrollment count
    setCourse(prev => ({
      ...prev,
      enrollmentCount: prev.enrollmentCount + 1,
      isEnrolled: true
    }));
  };

  // Get button text based on enrollment state
  const getButtonText = () => {
    switch (enrollButtonState) {
      case 'start':
        return 'Bắt đầu học';
      case 'continue':
        return 'Tiếp tục học';
      default:
        return 'Đăng ký khóa học';
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Typography>Đang tải...</Typography>
    </Box>;
  }

  // Default avatar for instructor if not available
  const instructorAvatar = course.creator.avatar || "https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/476314747_1385229409130567_8947152286196030311_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=rkMeYzyclZwQ7kNvwGvBfhu&_nc_oc=Adn7UcDLnVRlbcel--VfDfxJb6ulC9FNQ6-GieHg-l5ctgxQuzRwIbn-Fn5vLCchKStkGqbmbUUmMAUbcfYUl3bS&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=adoTMxkMiEcQkwM9j7B47A&oh=00_AfM6CCIbhGtuTJmp3WSDe0_TvMS6zPZ5vOzeBFCvtKd3Uw&oe=684E272F";
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, color: 'text.secondary' }}>
            <PersonIcon sx={{ mr: 1, color: '#3498db' }} />
            <Typography variant="body1">
              {course.enrollmentCount} học viên
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3.5 }}>
            <Avatar 
              src={instructorAvatar} 
              alt={course.instructor}
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Typography>
              Giảng viên: <strong>{course.instructor}</strong>
            </Typography>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, mb: 1.5, paddingBottom: 1.2, borderBottom: '1px solid #eee' }}>
              Giới thiệu khóa học
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: course.content }} style={{ color: '#333', lineHeight: 1.7 }} />
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, mb: 1.5, paddingBottom: 1.2, borderBottom: '1px solid #eee' }}>
              Bạn sẽ học được gì
            </Typography>
            <CourseBenefits>
              {course.benefits.map((benefit, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon>
                    <CheckIcon />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </CourseBenefits>
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
                <Typography>Thời lượng: <strong>{formatDuration(course.duration)}</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <VideocamIcon sx={{ mr: 1.5, color: '#3498db' }} />
                <Typography>Bài giảng: <strong>{course.videosCount} video</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <SignalCellularAltIcon sx={{ mr: 1.5, color: '#3498db' }} />
                <Typography>Cấp độ: <strong>{course.level}</strong></Typography>
              </FeatureItem>
              
              <FeatureItem disableGutters>
                <LanguageIcon sx={{ mr: 1.5, color: '#3498db' }} />
                <Typography>Ngôn ngữ: <strong>{course.language}</strong></Typography>
              </FeatureItem>
              
              <EnrollButton 
                isStartLearning={enrollButtonState !== 'enroll'}
                isEnrolled={isEnrolled}
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