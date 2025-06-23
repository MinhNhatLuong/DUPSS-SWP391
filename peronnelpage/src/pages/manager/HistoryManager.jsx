import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

const History = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [surveys, setSurveys] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (selectedTab === 0) {
        const response = await axios.get('/api/manager/courses/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } else if (selectedTab === 1) {
        const response = await axios.get('/api/manager/blogs/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(response.data);
      } else if (selectedTab === 2) {
        const response = await axios.get('/api/manager/surveys/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSurveys(response.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0);
    setSearchQuery('');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Filter function for courses
  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (course.id && course.id.toString().includes(query)) ||
      (course.title && course.title.toLowerCase().includes(query))
    );
  });

  // Filter function for blogs
  const filteredBlogs = blogs.filter(blog => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (blog.id && blog.id.toString().includes(query)) ||
      (blog.title && blog.title.toLowerCase().includes(query))
    );
  });

  // Filter function for surveys
  const filteredSurveys = surveys.filter(survey => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (survey.surveyId && survey.surveyId.toString().includes(query)) ||
      (survey.surveyTitle && survey.surveyTitle.toLowerCase().includes(query))
    );
  });

  // Pagination logic
  const getDataForCurrentPage = (data) => {
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Render courses table
  const renderCoursesTable = () => {
    const paginatedCourses = getDataForCurrentPage(filteredCourses);
    
    return (
      <>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Creator</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Checked By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                  <TableRow key={course.id} hover>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.topicName}</TableCell>
                    <TableCell sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {course.description}
                    </TableCell>
                    <TableCell>{course.duration} min</TableCell>
                    <TableCell>{course.creatorName}</TableCell>
                    <TableCell>{formatDate(course.createdAt)}</TableCell>
                    <TableCell>{formatDate(course.updatedAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={course.status} 
                        size="small" 
                        color={getStatusColor(course.status)} 
                      />
                    </TableCell>
                    <TableCell>{course.checkedBy || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No courses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCourses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    );
  };

  // Render blogs table
  const renderBlogsTable = () => {
    const paginatedBlogs = getDataForCurrentPage(filteredBlogs);
    
    return (
      <>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Checked By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <TableRow key={blog.id} hover>
                    <TableCell>{blog.id}</TableCell>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>{blog.topic}</TableCell>
                    <TableCell sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {blog.description}
                    </TableCell>
                    <TableCell>{blog.authorName}</TableCell>
                    <TableCell>{formatDate(blog.createdAt)}</TableCell>
                    <TableCell>{formatDate(blog.updatedAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={blog.status} 
                        size="small" 
                        color={getStatusColor(blog.status)} 
                      />
                    </TableCell>
                    <TableCell>{blog.checkedBy || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No blogs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBlogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    );
  };

  // Render surveys table
  const renderSurveysTable = () => {
    const paginatedSurveys = getDataForCurrentPage(filteredSurveys);
    
    return (
      <>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>For Course</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Checked By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSurveys.length > 0 ? (
                paginatedSurveys.map((survey) => (
                  <TableRow key={survey.surveyId} hover>
                    <TableCell>{survey.surveyId}</TableCell>
                    <TableCell>{survey.surveyTitle}</TableCell>
                    <TableCell sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {survey.description}
                    </TableCell>
                    <TableCell>{survey.active ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{survey.forCourse ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{survey.createdBy}</TableCell>
                    <TableCell>{formatDate(survey.createdAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={survey.status} 
                        size="small" 
                        color={getStatusColor(survey.status)} 
                      />
                    </TableCell>
                    <TableCell>{survey.checkedBy || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No surveys found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSurveys.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    );
  };

  // Render content based on selected tab
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (selectedTab === 0) {
      return renderCoursesTable();
    } else if (selectedTab === 1) {
      return renderBlogsTable();
    } else {
      return renderSurveysTable();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Content History
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Courses" />
          <Tab label="Blogs" />
          <Tab label="Surveys" />
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={`Search by ${selectedTab === 0 ? 'ID or Course Title' : 
                               selectedTab === 1 ? 'ID or Blog Title' : 
                               'ID or Survey Title'}`}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Box>

      {renderContent()}
    </Box>
  );
};

export default History; 