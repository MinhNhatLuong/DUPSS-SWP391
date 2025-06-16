import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const CourseCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
  }
}));

const CourseImage = styled('div')({
  height: '200px',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
});

const StyledCardMedia = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
});

const ViewMoreButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0056b3',
  color: 'white',
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  fontWeight: 500,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#003d82',
  }
}));

const ViewAllLink = styled(Link)(({ theme }) => ({
  display: 'inline-block',
  padding: '10px 25px',
  backgroundColor: 'transparent',
  color: '#0056b3',
  border: '1px solid #0056b3',
  borderRadius: '4px',
  fontWeight: 500,
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: '#0056b3',
    color: 'white',
    textDecoration: 'none'
  }
}));

const GridWrapper = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '30px',
  '@media (max-width: 1024px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  }
});

const FeaturedCourses = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/public/courses/latest');
        setCoursesData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="featured-courses">
      <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: 5,
            fontWeight: 600,
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
          }}
        >
          Khóa học nổi bật
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : (
          <GridWrapper>
            {coursesData.map(course => (
              <CourseCard key={course.id}>
                <CourseImage>
                  <StyledCardMedia
                    src={course.coverImage || 'https://via.placeholder.com/300x200'}
                    alt={course.title}
                    loading="lazy"
                  />
                </CourseImage>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 2.5
                }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontSize: '1.2rem', 
                      lineHeight: 1.4,
                      mb: 1.25,
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {course.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2, 
                      flexGrow: 1,
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {course.summary || 'Không có mô tả'}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <ViewMoreButton 
                      component={Link} 
                      to={`/course-detail/${course.id}`}
                    >
                      Xem chi tiết
                    </ViewMoreButton>
                  </Box>
                </CardContent>
              </CourseCard>
            ))}
          </GridWrapper>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <ViewAllLink to="/courses">
            Xem tất cả khóa học
          </ViewAllLink>
        </Box>
      </Box>
    </section>
  );
};

export default FeaturedCourses;