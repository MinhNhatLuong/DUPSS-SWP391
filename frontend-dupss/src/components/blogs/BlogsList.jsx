import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Chip, TextField, MenuItem, InputAdornment, Pagination, CircularProgress } from '@mui/material';
import { Search } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { RelatedArticles } from './index';
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

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [sortDir, setSortDir] = useState('desc');
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

  // Fetch blogs based on filters
  useEffect(() => {
    document.title = "Blogs & Thông Tin - DUPSS";
    
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/public/blogs?keyword=${searchQuery}&page=${currentPage}&sortBy=createdAt&sortDir=${sortDir}`;
        
        if (selectedTopic) {
          url += `&topic=${selectedTopic}`;
        }
        
        const response = await axios.get(url);
        setBlogs(response.data.blogs);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (error) {
        console.error('Error fetching blogs:', error);
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

    fetchBlogs();
  }, [searchQuery, selectedTopic, sortDir, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    // No longer directly updating searchQuery here, that will happen in the debounce effect
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCurrentPage(1); // Reset to first page on topic change
  };

  const handleSortChange = (e) => {
    setSortDir(e.target.value);
    setCurrentPage(1); // Reset to first page on sort change
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
          color: '#0056b3',
        }}
      >
        Blogs & Thông tin
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
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          label="Chủ đề"
          value={selectedTopic}
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
      
      <Box sx={{ position: 'relative' }}>
        {loading && !initialLoad && (
          <LoadingOverlay>
            <CircularProgress size={40} />
          </LoadingOverlay>
        )}
        
        {blogs.length > 0 ? (
          <>
            <Box sx={{ opacity: loading ? 0.5 : 1 }}>
              <RelatedArticles articles={blogs} />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%', 
              mt: 4,
              px: { xs: 2, sm: 0 }
            }}>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                disabled={loading}
                sx={{ 
                  '& .MuiPagination-ul': { 
                    justifyContent: 'center',
                    width: '100%'
                  }
                }}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', my: 5 }}>
            <Typography>Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BlogsList; 