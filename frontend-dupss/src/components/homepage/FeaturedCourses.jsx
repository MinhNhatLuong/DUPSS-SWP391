import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button, styled } from '@mui/material';
import { AccessTime as ClockIcon, School as StudentIcon } from '@mui/icons-material';

const SectionTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '2rem',
  marginBottom: '40px',
  color: '#0056b3',
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '50px',
    height: '3px',
    backgroundColor: '#0056b3',
    margin: '15px auto 0',
  }
}));

const CourseCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
  borderRadius: '8px',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
  }
}));

const CourseImageWrapper = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
}));

const CourseImage = styled(CardMedia)(({ theme }) => ({
  height: '180px',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const CourseTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  marginBottom: '10px',
  color: '#0056b3',
}));

const CourseMetaItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: '15px',
  color: '#666',
  fontSize: '0.875rem',
  '& svg': {
    fontSize: '1rem',
    marginRight: '5px',
  }
}));

const CourseButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0056b3',
  color: 'white',
  padding: '8px 20px',
  marginTop: '15px',
  borderRadius: '4px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#003d82',
  }
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0056b3',
  color: 'white',
  padding: '10px 20px',
  margin: '0 auto',
  display: 'block',
  borderRadius: '4px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#003d82',
  }
}));

// Mock data for courses
const coursesData = [
  {
    id: 1,
    title: 'Nhận biết và phòng tránh ma túy',
    description: 'Khóa học cung cấp kiến thức cơ bản về các loại ma túy phổ biến, cách nhận biết và phòng tránh hiệu quả.',
    image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
    duration: '8 tuần',
    students: '1,245 học viên',
  },
  {
    id: 2,
    title: 'Kỹ năng từ chối ma túy',
    description: 'Khóa học giúp thanh thiếu niên phát triển kỹ năng từ chối và đối phó với áp lực từ bạn bè về sử dụng ma túy.',
    image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
    duration: '6 tuần',
    students: '987 học viên',
  },
  {
    id: 3,
    title: 'Hỗ trợ người thân nghiện ma túy',
    description: 'Khóa học dành cho gia đình có người thân nghiện ma túy, cung cấp kiến thức và kỹ năng hỗ trợ hiệu quả.',
    image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
    duration: '10 tuần',
    students: '756 học viên',
  },
];

const FeaturedCourses = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <SectionTitle variant="h2">Khóa học nổi bật</SectionTitle>
        
        <Grid container spacing={4} className="card-grid">
          {coursesData.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard elevation={2} className="card-hover">
                <CourseImageWrapper className="image-hover">
                  <CourseImage
                    image={course.image}
                    title={course.title}
                  />
                </CourseImageWrapper>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <CourseTitle variant="h3">{course.title}</CourseTitle>
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>{course.description}</Typography>
                  
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <CourseMetaItem>
                      <ClockIcon /> {course.duration}
                    </CourseMetaItem>
                    <CourseMetaItem>
                      <StudentIcon /> {course.students}
                    </CourseMetaItem>
                  </Box>
                  
                  <CourseButton href="/course-detail">Xem chi tiết</CourseButton>
                </CardContent>
              </CourseCard>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <ViewAllButton href="/courses">Xem tất cả khóa học</ViewAllButton>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedCourses; 