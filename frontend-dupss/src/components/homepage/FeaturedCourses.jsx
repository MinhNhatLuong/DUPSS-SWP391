import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Card, CardContent, Button, Container, Chip, CardMedia, CardActions
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { API_URL } from '../../services/config';

const CourseCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
  }
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  zIndex: 2,
}));

const DateText = styled(Typography)({
  fontSize: '0.8rem',
  color: '#666',
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  height: '24px',
  padding: '0 4px',
  whiteSpace: 'nowrap',
});

const MetaInfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: '8px',
  flexWrap: 'nowrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    '& > *': {
      margin: 0,
    }
  }
}));

const ReadMoreLink = styled(Link)(({ theme }) => ({
  color: '#0056b3',
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
  '& svg': {
    marginLeft: '4px',
    transition: 'transform 0.3s',
  },
  '&:hover svg': {
    transform: 'translateX(3px)',
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
  gap: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
  }
});

const FeaturedCourses = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/public/courses/latest`);
        setCoursesData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Format duration from hours to display string
  const formatDuration = (hours) => {
    return `${hours} giờ`;
  };

  return (
    <section className="featured-courses">
      <Container maxWidth="lg" sx={{ py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
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

        <Box sx={{ position: 'relative' }}>
          {loading ? (
            <LoadingOverlay>
              <Typography>Đang tải...</Typography>
            </LoadingOverlay>
          ) : (
            <GridWrapper>
              {coursesData.map(course => (
                <CourseCard key={course.id}>
                  <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={course.coverImage || 'https://via.placeholder.com/300x200'}
                      alt={course.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                    <Chip
                      label={course.topicName}
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 500
                      }}
                    />
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={formatDuration(course.duration)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3" sx={{
                      height: '3.6em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      fontSize: '1rem',
                      lineHeight: 1.4,
                      fontWeight: 'bold',
                    }}>
                      {course.title}
                    </Typography>

                    <MetaInfoRow>
                      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {course.creatorName}
                      </Typography>
                      <DateText>
                        {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                      </DateText>
                    </MetaInfoRow>

                    <Typography variant="body2" color="text.secondary" sx={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2
                    }}>
                      {course.summary || 'Không có mô tả'}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <ReadMoreLink to={`/courses/${course.id}`}>
                      Tham gia <ArrowForward fontSize="small" />
                    </ReadMoreLink>
                  </CardActions>
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
      </Container>
    </section>
  );
};

export default FeaturedCourses;