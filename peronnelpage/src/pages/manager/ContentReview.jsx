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
        id = selectedContent.id; // Sử dụng id thay vì surveyId theo API mới
        endpoint = `/manager/surveys/${id}/approval?status=${status}`;
      }

      await apiClient.patch(endpoint);

      // Remove the approved item from the list
      if (selectedTab === 0) {
        setCourses(courses.filter(c => c.id !== selectedContent.id));
      } else if (selectedTab === 1) {
        setBlogs(blogs.filter(b => b.id !== selectedContent.id));
      } else if (selectedTab === 2) {
        setSurveys(surveys.filter(s => s.id !== selectedContent.id)); // Sử dụng id thay vì surveyId
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
        id = selectedContent.id;
        endpoint = `/manager/surveys/${id}/approval?status=${status}`;
      }

      await apiClient.patch(endpoint);

      // Remove the rejected item from the list
      if (selectedTab === 0) {
        setCourses(courses.filter(c => c.id !== selectedContent.id));
      } else if (selectedTab === 1) {
        setBlogs(blogs.filter(b => b.id !== selectedContent.id));
      } else if (selectedTab === 2) {
        setSurveys(surveys.filter(s => s.id !== selectedContent.id));
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
    // Tạo nội dung HTML để hiển thị khóa học
    let previewContent = `<div style="padding: 10px;">
      <h3>${content.title}</h3>
      <p>${content.description || ''}</p>`;
    
    // Hiển thị các module và video
    if (content.modules && content.modules.length > 0) {
      previewContent += '<h4>Danh sách Module:</h4>';
      
      content.modules.forEach((module, mIndex) => {
        previewContent += `<div style="margin-top: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px;">
          <h5>${mIndex + 1}. ${module.title}</h5>`;
        
        if (module.videos && module.videos.length > 0) {
          previewContent += '<ul>';
          module.videos.forEach((video, vIndex) => {
            previewContent += `<li>
              ${video.title} 
              ${video.videoUrl ? `<a href="${video.videoUrl}" target="_blank" style="color: blue; text-decoration: underline;">Xem video</a>` : ''}
            </li>`;
          });
          previewContent += '</ul>';
        }
        
        previewContent += '</div>';
      });
    }
    
    // Hiển thị quiz nếu có
    if (content.quiz) {
      previewContent += `<div style="margin-top: 20px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px;">
        <h4>Quiz cuối khóa: ${content.quiz.title}</h4>
        <p>${content.quiz.description || ''}</p>`;
      
      if (content.quiz.sections && content.quiz.sections.length > 0) {
        content.quiz.sections.forEach((section, sIndex) => {
          previewContent += `<div style="margin-top: 10px;">
            <h5>Phần ${sIndex + 1}: ${section.sectionName}</h5>`;
          
          if (section.questions && section.questions.length > 0) {
            section.questions.forEach((question, qIndex) => {
              previewContent += `<p><strong>Câu ${qIndex + 1}: ${question.questionText}</strong></p>`;
              
              if (question.options && question.options.length > 0) {
                previewContent += '<ul>';
                question.options.forEach((option, oIndex) => {
                  previewContent += `<li>${String.fromCharCode(65 + oIndex)}. ${option.optionText} ${option.score > 0 ? `<strong>(${option.score} điểm)</strong>` : ''}</li>`;
                });
                previewContent += '</ul>';
              }
            });
          }
          
          previewContent += '</div>';
        });
      }
      
      previewContent += '</div>';
    }
    
    // Hiển thị điều kiện nếu có
    if (content.quiz && content.quiz.conditions && content.quiz.conditions.length > 0) {
      previewContent += `<div style="margin-top: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px;">
        <h4>Điều kiện đạt:</h4>
        <ul>`;
      
      content.quiz.conditions.forEach((condition, cIndex) => {
        previewContent += `<li><strong>${condition.operator} ${condition.value}:</strong> ${condition.message}</li>`;
      });
      
      previewContent += `</ul></div>`;
    }
    
    previewContent += '</div>';
    
    setPreviewDialog({
      open: true,
      content: previewContent,
      title: 'Xem trước khóa học'
    });
  };

  const handlePreviewSurvey = (content) => {
    // Tạo nội dung HTML để hiển thị khảo sát
    let previewContent = `<div style="padding: 10px;">
      <h3>${content.title}</h3>
      <div>${content.description || ''}</div>`;
    
    // Hiển thị các phần và câu hỏi
    if (content.sections && content.sections.length > 0) {
      content.sections.forEach((section, sIndex) => {
        previewContent += `<div style="margin-top: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px;">
          <h4>Phần ${sIndex + 1}: ${section.sectionName}</h4>`;
        
        if (section.questions && section.questions.length > 0) {
          section.questions.forEach((question, qIndex) => {
            previewContent += `<div style="margin-top: 10px;">
              <p><strong>Câu ${qIndex + 1}: ${question.questionText}</strong></p>`;
            
            if (question.options && question.options.length > 0) {
              previewContent += '<ul style="list-style-type: none; padding-left: 10px;">';
              question.options.forEach((option, oIndex) => {
                previewContent += `<li style="margin: 5px 0;">
                  ${String.fromCharCode(65 + oIndex)}. ${option.optionText} ${option.score > 0 ? `(${option.score} điểm)` : ''}
                </li>`;
              });
              previewContent += '</ul>';
            }
            
            previewContent += '</div>';
          });
        }
        
        previewContent += '</div>';
      });
    }
    
    // Hiển thị điều kiện nếu có
    if (content.conditions && content.conditions.length > 0) {
      previewContent += `<div style="margin-top: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px;">
        <h4>Điều kiện:</h4>
        <ul>`;
      
      content.conditions.forEach((condition, cIndex) => {
        previewContent += `<li>${condition.operator} ${condition.value}: ${condition.message}</li>`;
      });
      
      previewContent += `</ul></div>`;
    }
    
    previewContent += '</div>';
    
    setPreviewDialog({
      open: true,
      content: previewContent,
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
            const id = item.id;
            const title = item.title;
            const authorName = selectedTab === 0 ? item.creator : selectedTab === 1 ? item.authorName : item.createdBy || 'Không xác định';
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
                        <Typography variant="body2" sx={{ 
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontStyle: 'italic',
                          color: 'text.secondary'
                        }}>
                          Nhấn vào "Xem trước" để xem chi tiết khảo sát
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label="Đang chờ"
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
                <strong>Người tạo:</strong> {selectedContent.creator || 'Không xác định'}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Ngày tạo:</strong> {formatDate(selectedContent.createdAt)}
              </Typography>
              
              {/* Nội dung bài viết */}
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
              
              {/* Mô tả chung cho tất cả các loại nội dung */}
              {selectedContent.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Mô tả:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}>
                    <div dangerouslySetInnerHTML={{ __html: selectedContent.description }} />
                  </Paper>
                </Box>
              )}
              
              {/* Chi tiết khóa học */}
              {selectedTab === 0 && selectedContent.modules && selectedContent.modules.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Danh sách module:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                    {selectedContent.modules.map((module, index) => (
                      <Box key={module.id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {index + 1}. {module.title}
                        </Typography>
                        {module.videos && module.videos.length > 0 && (
                          <Box sx={{ ml: 2, mt: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              Videos:
                            </Typography>
                            {module.videos.map((video, vIndex) => (
                              <Box key={video.id} sx={{ mb: 0.5 }}>
                                <Typography variant="body2">
                                  {vIndex + 1}. {video.title}
                                  {video.videoUrl && (
                                    <Button 
                                      size="small" 
                                      variant="text" 
                                      color="primary"
                                      sx={{ ml: 1 }}
                                      onClick={() => window.open(video.videoUrl, '_blank')}
                                    >
                                      Xem video
                                    </Button>
                                  )}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}
              
              {/* Quiz của khóa học */}
              {selectedTab === 0 && selectedContent.quiz && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Quiz cuối khóa:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {selectedContent.quiz.title}
                    </Typography>
                    
                    {selectedContent.quiz.description && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {selectedContent.quiz.description}
                      </Typography>
                    )}
                    
                    {selectedContent.quiz.sections && selectedContent.quiz.sections.map((section, sIndex) => (
                      <Box key={section.id} sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          Phần {sIndex + 1}: {section.sectionName}
                        </Typography>
                        
                        {section.questions && section.questions.map((question, qIndex) => (
                          <Box key={question.id} sx={{ ml: 2, mt: 1, mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              Câu hỏi {qIndex + 1}: {question.questionText}
                            </Typography>
                            
                            {question.options && question.options.map((option, oIndex) => (
                              <Box key={option.id} sx={{ ml: 2, mt: 0.5 }}>
                                <Typography variant="body2">
                                  {String.fromCharCode(65 + oIndex)}. {option.optionText} {option.score > 0 && `(${option.score} điểm)`}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    ))}
                    
                    {selectedContent.quiz.conditions && selectedContent.quiz.conditions.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          Điều kiện đạt:
                        </Typography>
                        {selectedContent.quiz.conditions.map((condition, cIndex) => (
                          <Box key={cIndex} sx={{ ml: 2, mt: 0.5 }}>
                            <Typography variant="body2">
                              {condition.operator} {condition.value}: {condition.message}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}
              
              {/* Chi tiết khảo sát */}
              {selectedTab === 2 && selectedContent.sections && selectedContent.sections.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Nội dung khảo sát:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                    {selectedContent.sections.map((section, sIndex) => (
                      <Box key={section.id} sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          Phần {sIndex + 1}: {section.sectionName}
                        </Typography>
                        
                        {section.questions && section.questions.map((question, qIndex) => (
                          <Box key={question.id} sx={{ ml: 2, mt: 1, mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              Câu hỏi {qIndex + 1}: {question.questionText}
                            </Typography>
                            
                            {question.options && question.options.map((option, oIndex) => (
                              <Box key={option.id} sx={{ ml: 2, mt: 0.5 }}>
                                <Typography variant="body2">
                                  {String.fromCharCode(65 + oIndex)}. {option.optionText} {option.score > 0 && `(${option.score} điểm)`}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    ))}
                    
                    {selectedContent.conditions && selectedContent.conditions.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          Điều kiện:
                        </Typography>
                        {selectedContent.conditions.map((condition, cIndex) => (
                          <Box key={cIndex} sx={{ ml: 2, mt: 0.5 }}>
                            <Typography variant="body2">
                              {condition.operator} {condition.value}: {condition.message}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
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