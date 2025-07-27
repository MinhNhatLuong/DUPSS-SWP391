import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent,
  Grid,
  Pagination,
  Tooltip,
  Container,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  AlertTitle
} from '@mui/material';
import {
  Article as ArticleIcon,
  School as SchoolIcon,
  Poll as PollIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  CalendarToday as CalendarIcon,
  Topic as TopicIcon,
  Label as LabelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiClient from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

// Component to display status with appropriate color and icon
const StatusChip = ({ status }) => {
  let color = 'default';
  let icon = <PendingIcon />;
  let label = status;
  
  switch (status) {
    case 'APPROVED':
      color = 'success';
      icon = <CheckCircleIcon />;
      label = 'Đã duyệt';
      break;
    case 'REJECTED':
      color = 'error';
      icon = <CancelIcon />;
      label = 'Từ chối';
      break;
    case 'PENDING':
    default:
      color = 'warning';
      icon = <PendingIcon />;
      label = 'Chờ duyệt';
  }
  
  return (
    <Chip 
      icon={icon} 
      label={label} 
      color={color} 
      size="small" 
      variant="outlined"
    />
  );
};

// Format date helper function
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

const History = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState({
    blogs: false,
    courses: false,
    surveys: false
  });
  const [error, setError] = useState({
    blogs: null,
    courses: null,
    surveys: null
  });
  
  // Pagination states
  const [page, setPage] = useState({
    blogs: 1,
    courses: 1,
    surveys: 1
  });
  const itemsPerPage = 6;
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: null, // 'blog', 'course', or 'survey'
    id: null,
    title: ''
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handlePageChange = (type, event, value) => {
    setPage(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  // Fetch blogs data
  const fetchBlogs = async () => {
    setLoading(prev => ({ ...prev, blogs: true }));
    setError(prev => ({ ...prev, blogs: null }));
    
    try {
      const response = await apiClient.get('/staff/blogs');
      setBlogs(response.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(prev => ({ 
        ...prev, 
        blogs: 'Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, blogs: false }));
    }
  };
  
  // Fetch courses data
  const fetchCourses = async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    setError(prev => ({ ...prev, courses: null }));
    
    try {
      const response = await apiClient.get('/staff/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(prev => ({ 
        ...prev, 
        courses: 'Không thể tải dữ liệu khóa học. Vui lòng thử lại sau.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };
  
  // Fetch surveys data
  const fetchSurveys = async () => {
    setLoading(prev => ({ ...prev, surveys: true }));
    setError(prev => ({ ...prev, surveys: null }));
    
    try {
      const response = await apiClient.get('/staff/surveys');
      setSurveys(response.data);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError(prev => ({ 
        ...prev, 
        surveys: 'Không thể tải dữ liệu khảo sát. Vui lòng thử lại sau.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, surveys: false }));
    }
  };
  
  // Handle edit action
  const handleEdit = (type, id) => {
    // Redirect to edit page based on type
    console.log(`Editing ${type} with ID: ${id}`);
    
    // Make sure id is a clean number without any colons or other characters
    const cleanId = id.toString().split(':')[0];
    
    switch (type) {
      case 'blog':
        navigate(`/staff/edit-blog/${cleanId}`);
        break;
      case 'course':
        navigate(`/staff/edit-course/${cleanId}`);
        break;
      case 'survey':
        navigate(`/staff/edit-survey/${cleanId}`);
        break;
      default:
        break;
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (type, id, title) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      title
    });
  };
  
  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      type: null,
      id: null,
      title: ''
    });
  };
  
  // Handle delete action
  const handleDelete = async () => {
    const { type, id } = deleteDialog;
    
    try {
      switch (type) {
        case 'blog':
          await apiClient.patch(`/staff/blog/delete/${id}`);
          setBlogs(blogs.filter(blog => blog.id !== id));
          break;
        case 'course':
          await apiClient.patch(`/staff/course/delete/${id}`);
          setCourses(courses.filter(course => course.id !== id));
          break;
        case 'survey':
          await apiClient.patch(`/staff/survey/delete/${id}`);
          setSurveys(surveys.filter(survey => survey.surveyId !== id));
          break;
        default:
          break;
      }
      
      setSnackbar({
        open: true,
        message: 'Xóa thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({
        open: true,
        message: `Lỗi khi xóa: ${error.message}`,
        severity: 'error'
      });
    } finally {
      closeDeleteDialog();
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Fetch all data on component mount
  useEffect(() => {
    fetchBlogs();
    fetchCourses();
    fetchSurveys();
  }, []);
  
  // Get paginated data
  const getPaginatedData = (data, type) => {
    const startIndex = (page[type] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };
  
  // Render blogs section with card layout
  const renderBlogsTable = () => {
    if (loading.blogs) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error.blogs) {
      return <Alert severity="error" sx={{ my: 2 }}>{error.blogs}</Alert>;
    }
    
    if (blogs.length === 0) {
      return <Alert severity="info" sx={{ my: 2 }}>Bạn chưa tạo bài viết nào.</Alert>;
    }
    
    const paginatedBlogs = getPaginatedData(blogs, 'blogs');
    
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3, width: '1100px', margin: '0 auto' }}>
          {paginatedBlogs.map((blog) => (
            <Card key={blog.id} sx={{ 
              height: '200px',
              width: '1100px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ 
                display: 'flex',
                height: '100%'
              }}>
                <Box sx={{ 
                  width: 200, 
                  minWidth: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  bgcolor: '#f5f5f5',
                  position: 'relative'
                }}>
                  {blog.imageUrl ? (
                    <img 
                      src={blog.imageUrl} 
                      alt={blog.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <ArticleIcon sx={{ fontSize: 48, color: '#1976d2' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Tooltip title={blog.title}>
                        <Typography component="div" variant="h6" noWrap sx={{ maxWidth: 600, fontWeight: 'bold' }}>
                          {blog.title}
                        </Typography>
                      </Tooltip>
                      <StatusChip status={blog.status} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '40px',
                      maxWidth: '850px'
                    }}>
                      {blog.description || 'Không có mô tả'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TopicIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {blog.topic || 'Không có chủ đề'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(blog.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Sửa bài viết">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEdit('blog', blog.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa bài viết">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog('blog', blog.id, blog.title)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(blogs.length / itemsPerPage)} 
            page={page.blogs} 
            onChange={(event, value) => handlePageChange('blogs', event, value)}
            color="primary"
            size="large"
          />
        </Box>
      </>
    );
  };
  
  // Render courses section
  const renderCoursesTable = () => {
    if (loading.courses) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error.courses) {
      return <Alert severity="error" sx={{ my: 2 }}>{error.courses}</Alert>;
    }
    
    if (courses.length === 0) {
      return <Alert severity="info" sx={{ my: 2 }}>Bạn chưa tạo khóa học nào.</Alert>;
    }
    
    const paginatedCourses = getPaginatedData(courses, 'courses');
    
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3, width: '1100px', margin: '0 auto' }}>
          {paginatedCourses.map((course) => (
            <Card key={course.id} sx={{ 
              height: '200px',
              width: '1100px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ 
                display: 'flex',
                height: '100%'
              }}>
                <Box sx={{ 
                  width: 200, 
                  minWidth: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  bgcolor: '#f5f5f5' 
                }}>
                  {course.coverImage ? (
                    <img 
                      src={course.coverImage} 
                      alt={course.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <SchoolIcon sx={{ fontSize: 48, color: '#1976d2' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Tooltip title={course.title}>
                        <Typography component="div" variant="h6" noWrap sx={{ maxWidth: 600, fontWeight: 'bold' }}>
                          {course.title}
                        </Typography>
                      </Tooltip>
                      <StatusChip status={course.status} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '40px',
                      maxWidth: '850px'
                    }}>
                      {course.description || 'Không có mô tả'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(course.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="caption" color="primary" fontWeight="bold" sx={{ mr: 2 }}>
                          {course.modules?.length || 0} module(s)
                        </Typography>
                        <Tooltip title="Sửa khóa học">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEdit('course', course.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa khóa học">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog('course', course.id, course.title)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(courses.length / itemsPerPage)} 
            page={page.courses} 
            onChange={(event, value) => handlePageChange('courses', event, value)}
            color="primary"
            size="large"
          />
        </Box>
      </>
    );
  };
  
  // Render surveys section with card layout
  const renderSurveysTable = () => {
    if (loading.surveys) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error.surveys) {
      return <Alert severity="error" sx={{ my: 2 }}>{error.surveys}</Alert>;
    }
    
    if (surveys.length === 0) {
      return <Alert severity="info" sx={{ my: 2 }}>Bạn chưa tạo khảo sát nào.</Alert>;
    }
    
    const paginatedSurveys = getPaginatedData(surveys, 'surveys');
    
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3, width: '1100px', margin: '0 auto' }}>
          {paginatedSurveys.map((survey) => (
            <Card key={survey.surveyId} sx={{ 
              height: '200px',
              width: '1100px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ 
                display: 'flex',
                height: '100%'
              }}>
                <Box sx={{ 
                  width: 200, 
                  minWidth: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  bgcolor: '#f5f5f5' 
                }}>
                  {survey.surveyImage ? (
                    <img 
                      src={survey.surveyImage} 
                      alt={survey.surveyTitle} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <PollIcon sx={{ fontSize: 48, color: '#1976d2' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Tooltip title={survey.surveyTitle}>
                        <Typography component="div" variant="h6" noWrap sx={{ maxWidth: 600, fontWeight: 'bold' }}>
                          {survey.surveyTitle}
                        </Typography>
                      </Tooltip>
                      <StatusChip status={survey.status} />
                    </Box>
                    
                    {/* Placeholder div to maintain consistent spacing */}
                    <Box sx={{ 
                      height: '40px', 
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {survey.sections && (
                          <>
                            <strong>{survey.sections.length}</strong> phần | 
                            <strong> {survey.sections.reduce((total, section) => total + (section.questions?.length || 0), 0)}</strong> câu hỏi
                          </>
                        )}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(survey.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={survey.forCourse ? "Khóa học" : "Khảo sát độc lập"} 
                          size="small" 
                          color={survey.forCourse ? "primary" : "secondary"}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Sửa khảo sát">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEdit('survey', survey.surveyId)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa khảo sát">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog('survey', survey.surveyId, survey.surveyTitle)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(surveys.length / itemsPerPage)} 
            page={page.surveys} 
            onChange={(event, value) => handlePageChange('surveys', event, value)}
            color="primary"
            size="large"
          />
        </Box>
      </>
    );
  };
  
  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={{ width: '1200px', margin: '0 auto' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Lịch Sử Nội Dung
        </Typography>
        
        <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontSize: '1rem',
                fontWeight: 'medium'
              },
              '& .MuiTabs-indicator': {
                height: 3
              }
            }}
          >
            <Tab 
              icon={<ArticleIcon />} 
              label="Bài viết" 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                '&.Mui-selected': {
                  fontWeight: 'bold'
                }
              }}
            />
            <Tab 
              icon={<SchoolIcon />} 
              label="Khóa học" 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                '&.Mui-selected': {
                  fontWeight: 'bold'
                }
              }}
            />
            <Tab 
              icon={<PollIcon />} 
              label="Khảo sát" 
              iconPosition="start"
              sx={{ 
                minHeight: 64,
                '&.Mui-selected': {
                  fontWeight: 'bold'
                }
              }}
            />
          </Tabs>
        </Paper>
        
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderBlogsTable()}
          {activeTab === 1 && renderCoursesTable()}
          {activeTab === 2 && renderSurveysTable()}
        </Box>
      </Container>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa "{deleteDialog.title}"? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default History;