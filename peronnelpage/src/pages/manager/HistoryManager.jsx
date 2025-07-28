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
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, Videocam as VideocamIcon } from '@mui/icons-material';
import axios from 'axios';
import apiClient from '../../services/apiService';

const History = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDescriptionDialog, setOpenDescriptionDialog] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  
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
        const response = await apiClient.get('/manager/courses/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } else if (selectedTab === 1) {
        const response = await apiClient.get('/manager/blogs/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(response.data);
      } else if (selectedTab === 2) {
        const response = await apiClient.get('/manager/surveys/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSurveys(response.data);
      } else if (selectedTab === 3) {
        const response = await apiClient.get('/manager/appointments/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
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
    if (!dateString) return 'Không xác định';
    try {
      // If the date is already in dd/mm/yyyy format, return it as is
      if (dateString.includes('/')) {
        // Validate that it's actually in the right format
        const parts = dateString.split('/');
        if (parts.length === 3) {
          return dateString; // Already in the right format
        }
      }
      
      // For yyyy-MM-dd format from database
      if (dateString.includes('-') && !dateString.includes('T')) {
        const parts = dateString.split('-');
        if (parts.length !== 3) return 'Invalid Date';
        
        // Explicitly parse parts as yyyy-MM-dd
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        
        if (!year || !month || !day || isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) {
          return 'Invalid Date';
        }
        
        // Explicitly return in dd/MM/yyyy format
        return `${day}/${month}/${year}`;
      }
      
      // For ISO format with time component
      if (dateString.includes('T')) {
        const parts = dateString.split('T')[0].split('-');
        if (parts.length !== 3) return 'Invalid Date';
        
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        
        return `${day}/${month}/${year}`;
      }
      
      // Last resort: try with Date object
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Manually format to dd/MM/yyyy
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  const formatTime = (timeObj) => {
    if (!timeObj) return 'Không xác định';
    try {
      // If it's already a string in HH:MM format, return as is
      if (typeof timeObj === 'string' && timeObj.includes(':')) {
        const parts = timeObj.split(':');
        if (parts.length >= 2) {
          return timeObj; // Already in the right format
        }
      }
      
      // Handle object with hour and minute properties
      if (typeof timeObj === 'object' && timeObj !== null) {
        const hour = timeObj.hour || 0;
        const minute = timeObj.minute || 0;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
      
      // Handle string representation
      if (typeof timeObj === 'string') {
        // Try to extract hour and minute from string
        const timeParts = timeObj.split(':');
        if (timeParts.length >= 2) {
          return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
        }
      }
      
      return 'Không xác định';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Không xác định';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Không xác định';
    try {
      // If already in dd/mm/yyyy HH:mm format, return as is
      if (dateTimeString.includes('/') && dateTimeString.includes(':')) {
        const parts = dateTimeString.split(' ');
        if (parts.length === 2 && parts[0].split('/').length === 3 && parts[1].split(':').length >= 2) {
          return dateTimeString; // Already in the right format
        }
      }
      
      // Handle ISO format (most common from API)
      if (dateTimeString.includes('T')) {
        const datePart = dateTimeString.split('T')[0];
        const timePart = dateTimeString.split('T')[1];
        
        const [year, month, day] = datePart.split('-');
        
        // Extract hours and minutes from the time part
        let hours = '00';
        let minutes = '00';
        
        if (timePart) {
          // Handle different time formats
          if (timePart.includes(':')) {
            const timeComponents = timePart.split(':');
            hours = timeComponents[0] || '00';
            minutes = timeComponents[1] || '00';
            if (minutes.includes('.')) {
              minutes = minutes.split('.')[0];
            }
          }
        }
        
        // Return in dd/MM/yyyy HH:mm format
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Last resort: use Date object
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Manually format to ensure dd/MM/yyyy
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting datetime:', error, dateTimeString);
      return 'Invalid Date';
    }
  };

  // Format duration (already in hours)
  const formatDuration = (hours) => {
    if (hours === null || hours === undefined) return 'Không xác định';
    
    // Format hours as whole number
    return `${parseInt(hours)} giờ`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
      case 'CANCELLED':
        return 'error';
      case 'PENDING':
      case 'SCHEDULED':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      default:
        return 'default';
    }
  };

  // Function to translate status labels
  const getStatusLabel = (status) => {
    if (!status) return 'Không xác định';
    
    const statusMap = {
      'PENDING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Đã từ chối',
      'DRAFT': 'Bản nháp',
      'PUBLISHED': 'Đã xuất bản',
      'SCHEDULED': 'Đã lên lịch',
      'CANCELLED': 'Đã hủy',
      'COMPLETED': 'Đã hoàn thành',
      'IN_PROGRESS': 'Đang diễn ra'
    };
    
    return statusMap[status] || status;
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

  // Filter function for appointments
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (appointment.id && appointment.id.toString().includes(query)) ||
      (appointment.customerName && appointment.customerName.toLowerCase().includes(query)) ||
      (appointment.consultantName && appointment.consultantName.toLowerCase().includes(query)) ||
      (appointment.topicName && appointment.topicName.toLowerCase().includes(query))
    );
  });

  // Pagination logic
  const getDataForCurrentPage = (data) => {
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Open dialog to view appointment details
  const handleOpenDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Open dialog to view HTML description content
  const handleOpenDescriptionDialog = (description, title = 'Nội dung chi tiết') => {
    setSelectedDescription(description);
    setDialogTitle(title);
    setOpenDescriptionDialog(true);
  };
  
  // Close description dialog
  const handleCloseDescriptionDialog = () => {
    setOpenDescriptionDialog(false);
  };

  // Open Google Meet link in a new tab
  const openGoogleMeet = (link) => {
    if (link) {
      window.open(link, '_blank');
    }
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
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Chủ đề</TableCell>
                <TableCell>Thời lượng</TableCell>
                <TableCell>Người tạo</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người duyệt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                  <TableRow key={course.id} hover>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.topicName}</TableCell>
                    <TableCell>{formatDuration(course.duration)}</TableCell>
                    <TableCell>{course.creatorName}</TableCell>
                    <TableCell>{formatDate(course.createdAt)}</TableCell>
                    <TableCell>{formatDate(course.updatedAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(course.status)} 
                        size="small" 
                        color={getStatusColor(course.status)} 
                      />
                    </TableCell>
                    <TableCell>{course.checkedBy || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không tìm thấy khóa học nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredCourses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
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
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Chủ đề</TableCell>
                <TableCell>Tác giả</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người duyệt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog) => (
                  <TableRow key={blog.id} hover>
                    <TableCell>{blog.id}</TableCell>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>{blog.topic}</TableCell>
                    <TableCell>{blog.authorName}</TableCell>
                    <TableCell>{formatDate(blog.createdAt)}</TableCell>
                    <TableCell>{formatDate(blog.updatedAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(blog.status)} 
                        size="small" 
                        color={getStatusColor(blog.status)} 
                      />
                    </TableCell>
                    <TableCell>{blog.checkedBy || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không tìm thấy bài viết nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredBlogs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
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
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Người tạo</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người duyệt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSurveys.length > 0 ? (
                paginatedSurveys.map((survey) => (
                  <TableRow key={survey.surveyId} hover>
                    <TableCell>{survey.surveyId}</TableCell>
                    <TableCell>{survey.surveyTitle}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenDescriptionDialog(survey.description || 'Không có nội dung', 'Nội dung khảo sát')}
                      >
                        Xem nội dung
                      </Button>
                    </TableCell>
                    <TableCell>{survey.createdBy}</TableCell>
                    <TableCell>{formatDate(survey.createdAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(survey.status)} 
                        size="small" 
                        color={getStatusColor(survey.status)} 
                      />
                    </TableCell>
                    <TableCell>{survey.checkedBy || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không tìm thấy khảo sát nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredSurveys.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </>
    );
  };

  // Render appointments table
  const renderAppointmentsTable = () => {
    const paginatedAppointments = getDataForCurrentPage(filteredAppointments);
    
    return (
      <>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>ID</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Chuyên viên tư vấn</TableCell>
                <TableCell>Chủ đề</TableCell>
                <TableCell>Ngày hẹn</TableCell>
                <TableCell>Giờ hẹn</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đánh giá</TableCell>
                <TableCell>Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAppointments.length > 0 ? (
                paginatedAppointments.map((appointment) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>{appointment.customerName}</TableCell>
                    <TableCell>{appointment.consultantName}</TableCell>
                    <TableCell>{appointment.topicName}</TableCell>
                    <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                    <TableCell>{formatTime(appointment.appointmentTime)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(appointment.status)} 
                        size="small" 
                        color={getStatusColor(appointment.status)} 
                      />
                    </TableCell>
                    <TableCell>
                      {appointment.review ? (
                        <Rating value={appointment.reviewScore} readOnly precision={0.5} size="small" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">Chưa đánh giá</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleOpenDialog(appointment)}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không tìm thấy lịch hẹn nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredAppointments.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
        
        {/* Appointment Detail Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedAppointment && (
            <>
              <DialogTitle>
                Chi tiết lịch hẹn #{selectedAppointment.id}
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin lịch hẹn
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Typography><strong>Khách hàng:</strong> {selectedAppointment.customerName}</Typography>
                    <Typography><strong>Số điện thoại:</strong> {selectedAppointment.phoneNumber}</Typography>
                    <Typography><strong>Email:</strong> {selectedAppointment.email}</Typography>
                    <Typography><strong>Loại khách:</strong> {selectedAppointment.guest ? 'Khách vãng lai' : 'Người dùng đã đăng ký'}</Typography>
                    <Typography><strong>Ngày hẹn:</strong> {formatDate(selectedAppointment.appointmentDate)}</Typography>
                    <Typography><strong>Giờ hẹn:</strong> {formatTime(selectedAppointment.appointmentTime)}</Typography>
                    <Typography><strong>Chuyên viên tư vấn:</strong> {selectedAppointment.consultantName}</Typography>
                    <Typography><strong>Chủ đề:</strong> {selectedAppointment.topicName}</Typography>
                    <Typography><strong>Trạng thái:</strong> {getStatusLabel(selectedAppointment.status)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography component="span" sx={{ mr: 1 }}><strong>Link Meet:</strong></Typography>
                      {selectedAppointment.linkGoogleMeet ? (
                        <Tooltip title="Mở Link Meet">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => openGoogleMeet(selectedAppointment.linkGoogleMeet)}
                          >
                            <VideocamIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography component="span" color="text.secondary">Không có</Typography>
                      )}
                    </Box>
                    <Typography><strong>Thời gian check-in:</strong> {formatDateTime(selectedAppointment.checkInTime)}</Typography>
                    <Typography><strong>Thời gian check-out:</strong> {formatDateTime(selectedAppointment.checkOutTime)}</Typography>
                  </Box>
                </Box>
                
                {selectedAppointment.consultantNote && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Ghi chú của chuyên viên tư vấn
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {selectedAppointment.consultantNote}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {selectedAppointment.review && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Đánh giá của khách hàng
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography component="span" variant="body2" mr={1}>
                        Điểm đánh giá:
                      </Typography>
                      <Rating value={selectedAppointment.reviewScore} readOnly precision={0.5} />
                      <Typography component="span" variant="body2" ml={1}>
                        ({selectedAppointment.reviewScore}/5)
                      </Typography>
                    </Box>
                    {selectedAppointment.customerReview && (
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                          {selectedAppointment.customerReview}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Đóng</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
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
    } else if (selectedTab === 2) {
      return renderSurveysTable();
    } else {
      return renderAppointmentsTable();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Lịch Sử Quản Lý
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Khóa Học" />
          <Tab label="Bài Viết" />
          <Tab label="Khảo Sát" />
          <Tab label="Lịch Hẹn Tư Vấn" />
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={selectedTab === 3 
            ? "Tìm kiếm theo tên khách hàng, chuyên viên, chủ đề hoặc ID" 
            : "Tìm kiếm theo tiêu đề hoặc ID"}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderContent()
      )}

      {/* Description Content Dialog */}
      <Dialog
        open={openDescriptionDialog}
        onClose={handleCloseDescriptionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogTitle}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2 }}>
            {typeof selectedDescription === 'string' && selectedDescription.trim().startsWith('<') ? (
              <div dangerouslySetInnerHTML={{ __html: selectedDescription }} />
            ) : (
              <Typography>{selectedDescription}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDescriptionDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>
              Chi tiết lịch hẹn #{selectedAppointment.id}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin lịch hẹn
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Typography><strong>Khách hàng:</strong> {selectedAppointment.customerName}</Typography>
                  <Typography><strong>Số điện thoại:</strong> {selectedAppointment.phoneNumber}</Typography>
                  <Typography><strong>Email:</strong> {selectedAppointment.email}</Typography>
                  <Typography><strong>Loại khách:</strong> {selectedAppointment.guest ? 'Khách vãng lai' : 'Người dùng đã đăng ký'}</Typography>
                  <Typography><strong>Ngày hẹn:</strong> {formatDate(selectedAppointment.appointmentDate)}</Typography>
                  <Typography><strong>Giờ hẹn:</strong> {formatTime(selectedAppointment.appointmentTime)}</Typography>
                  <Typography><strong>Chuyên viên tư vấn:</strong> {selectedAppointment.consultantName}</Typography>
                  <Typography><strong>Chủ đề:</strong> {selectedAppointment.topicName}</Typography>
                  <Typography><strong>Trạng thái:</strong> {getStatusLabel(selectedAppointment.status)}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="span" sx={{ mr: 1 }}><strong>Link Meet:</strong></Typography>
                    {selectedAppointment.linkGoogleMeet ? (
                      <Tooltip title="Mở Link Meet">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => openGoogleMeet(selectedAppointment.linkGoogleMeet)}
                        >
                          <VideocamIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography component="span" color="text.secondary">Không có</Typography>
                    )}
                  </Box>
                  <Typography><strong>Thời gian check-in:</strong> {formatDateTime(selectedAppointment.checkInTime)}</Typography>
                  <Typography><strong>Thời gian check-out:</strong> {formatDateTime(selectedAppointment.checkOutTime)}</Typography>
                </Box>
              </Box>
              
              {selectedAppointment.consultantNote && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ghi chú của chuyên viên tư vấn
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                      {selectedAppointment.consultantNote}
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {selectedAppointment.review && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Đánh giá của khách hàng
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography component="span" variant="body2" mr={1}>
                      Điểm đánh giá:
                    </Typography>
                    <Rating value={selectedAppointment.reviewScore} readOnly precision={0.5} />
                    <Typography component="span" variant="body2" ml={1}>
                      ({selectedAppointment.reviewScore}/5)
                    </Typography>
                  </Box>
                  {selectedAppointment.customerReview && (
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {selectedAppointment.customerReview}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default History; 