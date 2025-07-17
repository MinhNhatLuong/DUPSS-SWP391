import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import apiClient from '../../services/apiService';

const ContentReview = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewDialog, setPreviewDialog] = useState({ open: false, content: '' });
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selectedTab === 0) {
        const response = await apiClient.get('/manager/courses/pending');
        setCourses(response.data);
      } else if (selectedTab === 1) {
        const response = await apiClient.get('/manager/blogs/pending');
        setBlogs(response.data);
      } else if (selectedTab === 2) {
        const response = await apiClient.get('/manager/surveys/pending');
        setSurveys(response.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleReview = (content) => {
    setSelectedContent(content);
    setOpenDialog(true);
  };

  const handleApprove = async () => {
    setProcessingAction(true);
    try {
      let endpoint;
      let id;
      const status = 'APPROVED';

      if (selectedTab === 0) {
        // Course
        id = selectedContent.id;
        endpoint = `/manager/course/${id}/approval?status=${status}`;
      } else if (selectedTab === 1) {
        // Blog
        id = selectedContent.id;
        endpoint = `/manager/blog/${id}/approval?status=${status}`;
      } else if (selectedTab === 2) {
        // Survey
        id = selectedContent.surveyId;
        endpoint = `/manager/surveys/${id}/approval?status=${status}`;
      }

      await apiClient.patch(endpoint);

      // Remove the approved item from the list
      if (selectedTab === 0) {
        setCourses(courses.filter(c => c.id !== selectedContent.id));
      } else if (selectedTab === 1) {
        setBlogs(blogs.filter(b => b.id !== selectedContent.id));
      } else if (selectedTab === 2) {
        setSurveys(surveys.filter(s => s.surveyId !== selectedContent.surveyId));
      }

      setSnackbar({
        open: true,
        message: 'Đã duyệt nội dung thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error approving content:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Lỗi khi duyệt nội dung',
        severity: 'error'
      });
    } finally {
      setOpenDialog(false);
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    setProcessingAction(true);
    try {
      let endpoint;
      let id;
      const status = 'REJECTED';

      if (selectedTab === 0) {
        // Course
        id = selectedContent.id;
        endpoint = `/manager/course/${id}/approval?status=${status}`;
      } else if (selectedTab === 1) {
        // Blog
        id = selectedContent.id;
        endpoint = `/manager/blog/${id}/approval?status=${status}`;
      } else if (selectedTab === 2) {
        // Survey
        id = selectedContent.surveyId;
        endpoint = `/manager/surveys/${id}/approval?status=${status}`;
      }

      await apiClient.patch(endpoint);

      // Remove the rejected item from the list
      if (selectedTab === 0) {
        setCourses(courses.filter(c => c.id !== selectedContent.id));
      } else if (selectedTab === 1) {
        setBlogs(blogs.filter(b => b.id !== selectedContent.id));
      } else if (selectedTab === 2) {
        setSurveys(surveys.filter(s => s.surveyId !== selectedContent.surveyId));
      }

      setSnackbar({
        open: true,
        message: 'Đã từ chối nội dung thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error rejecting content:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Lỗi khi từ chối nội dung',
        severity: 'error'
      });
    } finally {
      setOpenDialog(false);
      setProcessingAction(false);
    }
  };

  const handlePreviewBlog = (content) => {
    setPreviewDialog({
      open: true,
      content: content.content,
      title: 'Xem trước bài viết'
    });
  };

  const handlePreviewCourse = (content) => {
    setPreviewDialog({
      open: true,
      content: content.content,
      title: 'Xem trước khóa học'
    });
  };

  const handlePreviewSurvey = (content) => {
    setPreviewDialog({
      open: true,
      content: content.description,
      title: 'Xem trước khảo sát'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getContentByType = () => {
    if (selectedTab === 0) {
      return courses;
    } else if (selectedTab === 1) {
      return blogs;
    } else {
      return surveys;
    }
  };

  const renderContent = () => {
    const content = getContentByType();

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          justifyContent: 'flex-start'
        }}>
          {content.map((item) => {
            const isSurvey = selectedTab === 2;
            const id = isSurvey ? item.surveyId : item.id;
            const title = isSurvey ? item.surveyTitle : item.title;
            const authorName = isSurvey ? item.createdBy : selectedTab === 0 ? item.creatorName : item.authorName;
            const createdAt = formatDate(item.createdAt);
            
            return (
              <Box 
                key={id} 
                sx={{ 
                  width: 'calc(25% - 18px)', 
                  minWidth: '270px',
                  '@media (max-width: 1200px)': {
                    width: 'calc(33.333% - 16px)',
                  },
                  '@media (max-width: 900px)': {
                    width: 'calc(50% - 12px)',
                  },
                  '@media (max-width: 600px)': {
                    width: '100%',
                  }
                }}
              >
                <Card sx={{ 
                  height: 320, 
                  display: 'flex', 
                  flexDirection: 'column',
                  width: '100%'
                }}>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    height: '210px', 
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="h6" gutterBottom noWrap sx={{ fontWeight: 'bold' }}>
                      {title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Tác giả: {authorName}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Ngày tạo: {createdAt}
                    </Typography>
                    <Box 
                      sx={{ 
                        cursor: 'pointer',
                        mt: 1,
                        mb: 1,
                        flexGrow: 1
                      }}
                      onClick={() => {
                        if (selectedTab !== 2) {
                          setPreviewDialog({
                            open: true,
                            content: item.description,
                            title: `Mô tả ${title}`
                          });
                        }
                      }}
                    >
                      {selectedTab !== 2 ? (
                        <Typography variant="body2" sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical',
                          '&:hover': { textDecoration: 'underline' }
                        }}>
                          {item.description || 'Không có mô tả'}
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewSurvey(item);
                          }}
                          sx={{ mt: 1 }}
                        >
                          Xem mô tả
                        </Button>
                      )}
                    </Box>
                    <Chip
                      label={item.status === 'PENDING' ? 'Đang chờ' : item.status}
                      color="warning"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      onClick={() => handleReview(item)}
                    >
                      Xem xét
                    </Button>
                    {selectedTab === 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewCourse(item)}
                      >
                        Xem trước
                      </Button>
                    )}
                    {selectedTab === 1 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewBlog(item)}
                      >
                        Xem trước
                      </Button>
                    )}
                    {selectedTab === 2 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewSurvey(item)}
                      >
                        Xem trước
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Snackbar for notifications - Moved to top */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            ...(snackbar.severity === 'success' && {
              bgcolor: 'success.main',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            })
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Duyệt Nội Dung
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
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ width: '100%' }}>
          {getContentByType().length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">
                {selectedTab === 0
                  ? 'Không có khóa học nào cần duyệt'
                  : selectedTab === 1
                  ? 'Không có bài viết nào cần duyệt'
                  : 'Không có khảo sát nào cần duyệt'}
              </Typography>
            </Paper>
          ) : (
            renderContent()
          )}
        </Box>
      )}

      {/* Dialog for content review */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTab === 0
            ? 'Duyệt Khóa Học'
            : selectedTab === 1
            ? 'Duyệt Bài Viết'
            : 'Duyệt Khảo Sát'}
        </DialogTitle>
        <DialogContent>
          {selectedContent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedContent.title}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>ID:</strong> {selectedContent.id || selectedContent.surveyId}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Người tạo:</strong> {selectedContent.creator?.fullName || 'Không xác định'}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Ngày tạo:</strong> {formatDate(selectedContent.createdAt)}
              </Typography>
              
              {selectedTab === 1 && selectedContent.content && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Nội dung:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                    <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
                  </Paper>
                </Box>
              )}
              
              {selectedTab === 0 && selectedContent.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Mô tả:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                    <Typography>{selectedContent.description}</Typography>
                  </Paper>
                </Box>
              )}
              
              {selectedTab === 2 && selectedContent.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Mô tả:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                    <Typography>{selectedContent.description}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={processingAction}>
            Đóng
          </Button>
          <Button 
            onClick={handleReject} 
            disabled={processingAction}
            sx={{ 
              bgcolor: 'error.main', 
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(211, 47, 47, 0.5)',
                color: 'white'
              }
            }}
          >
            {processingAction ? 'Đang xử lý...' : 'Từ chối'}
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={processingAction}
            sx={{ 
              bgcolor: 'success.main', 
              color: 'white',
              '&:hover': {
                bgcolor: 'success.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(46, 125, 50, 0.5)',
                color: 'white'
              }
            }}
          >
            {processingAction ? 'Đang xử lý...' : 'Duyệt'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog.open} onClose={() => setPreviewDialog({ ...previewDialog, open: false })} maxWidth="md" fullWidth>
        <DialogTitle>{previewDialog.title || 'Xem trước nội dung'}</DialogTitle>
        <DialogContent>
          <div dangerouslySetInnerHTML={{ __html: previewDialog.content }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ ...previewDialog, open: false })}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentReview; 