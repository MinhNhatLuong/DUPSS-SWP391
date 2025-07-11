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
  TextField,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import apiClient from '../../services/apiService';

const ContentReview = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState('');
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
      const token = localStorage.getItem('accessToken');
      
      if (selectedTab === 0) {
        const response = await apiClient.get('/manager/courses/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } else if (selectedTab === 1) {
        const response = await apiClient.get('/manager/blogs/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(response.data);
      } else if (selectedTab === 2) {
        const response = await apiClient.get('/manager/surveys/pending', {
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
  };

  const handleReview = (content) => {
    setSelectedContent(content);
    setOpenDialog(true);
    setComment('');
  };

  const handleApprove = async () => {
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('accessToken');
      let endpoint;

      if (selectedTab === 0) {
        // Course
        endpoint = `/manager/courses/${selectedContent.id}/approve`;
      } else if (selectedTab === 1) {
        // Blog
        endpoint = `/manager/blogs/${selectedContent.id}/approve`;
      } else if (selectedTab === 2) {
        // Survey
        endpoint = `/manager/surveys/${selectedContent.surveyId}/approve`;
      }

      await apiClient.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

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
        message: 'Content approved successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error approving content:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Error approving content',
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
      const token = localStorage.getItem('accessToken');
      let endpoint;

      if (selectedTab === 0) {
        // Course
        endpoint = `/manager/courses/${selectedContent.id}/reject`;
      } else if (selectedTab === 1) {
        // Blog
        endpoint = `/manager/blogs/${selectedContent.id}/reject`;
      } else if (selectedTab === 2) {
        // Survey
        endpoint = `/manager/surveys/${selectedContent.surveyId}/reject`;
      }

      await apiClient.post(endpoint, {
        reason: comment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

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
        message: 'Content rejected successfully',
        severity: 'info'
      });
    } catch (err) {
      console.error('Error rejecting content:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Error rejecting content',
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
      content: content.content
    });
  };

  const handlePreviewSurvey = (content) => {
    setPreviewDialog({
      open: true,
      content: content.description,
      title: 'Survey Description Preview'
    });
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

    if (content.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No pending {selectedTab === 0 ? 'courses' : selectedTab === 1 ? 'blogs' : 'surveys'} to review.
        </Alert>
      );
    }

    return (
      <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        <Box 
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            margin: -1.5, // Negative margin to compensate for padding
          }}
        >
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
                  width: {
                    xs: '100%',    // Full width on mobile
                    sm: '50%',     // Half width on tablet
                    md: '33.333%', // One third on desktop
                  },
                  padding: 1.5,
                  boxSizing: 'border-box',
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
                      Author: {authorName}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Created: {createdAt}
                    </Typography>
                    <Box 
                      sx={{ 
                        cursor: 'pointer',
                        mt: 1,
                        mb: 1,
                        flexGrow: 1
                      }}
                      onClick={() => {
                        setPreviewDialog({
                          open: true,
                          content: item.description,
                          title: `${title} Description`
                        });
                      }}
                    >
                      <Typography variant="body2" sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical',
                        '&:hover': { textDecoration: 'underline' }
                      }}>
                        {item.description || 'No description available'}
                      </Typography>
                    </Box>
                    <Chip
                      label={item.status}
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
                      Review
                    </Button>
                    {selectedTab === 1 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewBlog(item)}
                      >
                        Preview
                      </Button>
                    )}
                    {selectedTab === 2 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handlePreviewSurvey(item)}
                      >
                        Preview
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
      <Typography variant="h4" gutterBottom>
        Content Review
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

      {renderContent()}

      {/* Review Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !processingAction && setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Review {selectedTab === 0 ? 'Course' : selectedTab === 1 ? 'Blog' : 'Survey'}: {selectedContent?.title || selectedContent?.surveyTitle}
        </DialogTitle>
        <DialogContent dividers>
          {selectedContent && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Author:</strong> {selectedTab === 0 ? selectedContent.creatorName : 
                  selectedTab === 1 ? selectedContent.authorName : selectedContent.createdBy}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Created at:</strong> {formatDate(selectedContent.createdAt)}
              </Typography>
              {selectedTab === 0 && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Topic:</strong> {selectedContent.topicName}
                </Typography>
              )}
              {selectedTab === 1 && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Topic:</strong> {selectedContent.topic}
                </Typography>
              )}
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Description</Typography>
              <Typography variant="body1" paragraph>
                {selectedContent.description}
              </Typography>
              
              {selectedTab === 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Content</Typography>
                  <Typography variant="body1">
                    {selectedContent.content}
                  </Typography>
                </>
              )}
              
              {selectedTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handlePreviewBlog(selectedContent)}
                    sx={{ mb: 2 }}
                  >
                    Preview Blog Content
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            disabled={processingAction}
            startIcon={processingAction ? <CircularProgress size={20} /> : <CloseIcon />}
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
            disabled={processingAction}
            startIcon={processingAction ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Blog Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ ...previewDialog, open: false })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {previewDialog.title || 'Blog Preview'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <div dangerouslySetInnerHTML={{ __html: previewDialog.content }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ ...previewDialog, open: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContentReview; 