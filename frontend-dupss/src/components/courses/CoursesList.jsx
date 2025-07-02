import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Card, CardMedia, CardContent, CardActions,
  Button, Chip, TextField, MenuItem, InputAdornment, Pagination, CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { API_URL } from '../../services/config';

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  }
}));

const sortOptions = [
  { value: 'desc', label: 'Ngày đăng mới nhất' },
  { value: 'asc', label: 'Ngày đăng cũ nhất' },
];

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

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [topicId, setTopicId] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${API_URL}/topics`);
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  // Debounce search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchQuery(searchInput);
      if (searchInput !== searchQuery) {
        setCurrentPage(1); // Reset to first page on new search
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchInput, searchQuery]);

  // Fetch courses based on filters
  useEffect(() => {
    document.title = "Khóa học - DUPSS";
    
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/public/courses?keyword=${searchQuery}&page=${currentPage}&sortBy=createdAt&sortDir=${sortDir}`;
        
        if (topicId) {
          url += `&topicId=${topicId}`;
        }
        
        const response = await axios.get(url);
        setCourses(response.data.courses);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        
        // After data loading is complete, scroll to top if not initial loading
        if (!initialLoad) {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100); // Short delay to ensure DOM has been updated
        }
      }
    };

    fetchCourses();
  }, [searchQuery, topicId, sortDir, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleTopicChange = (e) => {
    setTopicId(e.target.value);
    setCurrentPage(1); // Reset to first page on topic change
  };

  const handleSortChange = (e) => {
    setSortDir(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Format duration from hours to display string
  const formatDuration = (hours) => {
    return `${hours} giờ`;
  };

  if (initialLoad) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          mb: 4,
          textAlign: 'center',
          fontWeight: 600,
          color: '#0056b3'
        }}
      >
        Khóa học
      </Typography>

      <FilterContainer>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchChange}
          fullWidth
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Chủ đề"
          value={topicId}
          onChange={handleTopicChange}
          variant="outlined"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {topics.map((topic) => (
            <MenuItem key={topic.id} value={topic.id}>
              {topic.topicName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Sắp xếp theo"
          value={sortDir}
          onChange={handleSortChange}
          variant="outlined"
          sx={{ minWidth: 200 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </FilterContainer>

      {/* Courses Grid */}
      <Box sx={{ position: 'relative' }}>
        {loading && !initialLoad && (
          <LoadingOverlay>
            <CircularProgress size={40} />
          </LoadingOverlay>
        )}
        
        {courses.length > 0 ? (
          <>
            <GridWrapper sx={{ opacity: loading ? 0.5 : 1 }}>
              {courses.map((course) => (
                <CourseCard key={course.id}>
                  <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={course.coverImage}
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
                    <Typography gutterBottom variant="h6" component="h2" sx={{
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

                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {course.creatorName}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 2
                    }}>
                      {course.summary}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      component={Link}
                      to={`/courses/${course.id}`}
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ fontWeight: 'bold' }}
                    >
                      Tham gia
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </CardActions>
                </CourseCard>
              ))}
            </GridWrapper>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                disabled={loading}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', my: 5 }}>
            <Typography>Không tìm thấy khóa học nào phù hợp với tiêu chí tìm kiếm</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default CoursesList;