import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  MenuItem,
  IconButton,
  Grid,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Code as CodeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
// Import TinyMCE Editor
import { Editor } from '@tinymce/tinymce-react';
import apiClient from '../../services/apiService';
import { API_URL } from '../../services/config';
import { getAccessToken } from '../../utils/auth';
import { useParams, useNavigate } from 'react-router-dom';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  const editorRef = useRef(null);
  
  // Main course state
  const [course, setCourse] = useState({
    title: '',
    topicId: '', // Empty string for initial state
    description: '',
    content: '',
    duration: 0,
    coverImage: null,
    modules: [],
    quiz: {
      sections: [],
      conditions: []
    }
  });

  // Additional states
  const [topics, setTopics] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [lastSaved, setLastSaved] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalCourse, setOriginalCourse] = useState(null);

  // UI visibility states
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [showConditionsSection, setShowConditionsSection] = useState(false);
  
  // Load initial data: first fetch topics, then course
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch topics
        let topicsData = [];
        try {
          const topicsResponse = await apiClient.get('/topics');
          if (Array.isArray(topicsResponse.data)) {
            topicsData = topicsResponse.data;
            setTopics(topicsData);
          } else {
            setTopics([]);
            setApiError('Topics data format error');
          }
        } catch (topicError) {
          setTopics([]);
          setApiError(`Error loading topics: ${topicError.message}`);
        }
        
        // Then fetch course data
        try {
          const courseResponse = await apiClient.get(`/staff/course/${id}`);
          const courseData = courseResponse.data;
          
          // Find topic ID by name
          let topicId = '';
          if (courseData.topicName && topicsData.length > 0) {
            // Try exact match first
            const matchingTopic = topicsData.find(t => t.topicName === courseData.topicName);
            if (matchingTopic) {
              topicId = Number(matchingTopic.id);
            } else {
              // Try case-insensitive match
              const caseInsensitiveMatch = topicsData.find(
                t => t.topicName.toLowerCase() === courseData.topicName.toLowerCase()
              );
              if (caseInsensitiveMatch) {
                topicId = Number(caseInsensitiveMatch.id);
              }
            }
          }
          
          // Create course data object
          const courseDataObj = {
            title: courseData.title || '',
            topicId: topicId,
            description: courseData.description || '',
            content: courseData.content || '',
            duration: courseData.duration || 0,
            coverImage: null,
            // Map modules correctly with consistent ID field names
            modules: Array.isArray(courseData.modules) ? courseData.modules.map(module => ({
              courseModuleId: module.id, // Use courseModuleId as the key identifier
              title: module.title || '',
              orderIndex: module.orderIndex || 0,
              videos: Array.isArray(module.videos) ? module.videos.map(video => ({
                videoModuleId: video.id, // Use videoModuleId as the key identifier
                title: video.title || '',
                videoUrl: video.videoUrl || ''
              })) : []
            })) : [],
            quiz: courseData.quiz || {
              sections: [],
              conditions: []
            }
          };
          
          // Store the course data with the found topicId
          setCourse(courseDataObj);
          
          // Store original data for comparison
          setOriginalCourse({
            ...courseDataObj,
            content: courseData.content || ''
          });
          
          // Set image preview if available
          if (courseData.coverImage) {
            setImagePreview(courseData.coverImage);
          }
          
          // Initialize quiz sections visibility if quiz exists
          if (courseData.quiz && courseData.quiz.sections && courseData.quiz.sections.length > 0) {
            setShowQuizSection(true);
          }
          
          // Initialize conditions visibility if conditions exist
          if (courseData.quiz && courseData.quiz.conditions && courseData.quiz.conditions.length > 0) {
            setShowConditionsSection(true);
          }
          
        } catch (courseError) {
          console.error('Error fetching course:', courseError);
          setApiError(`Error loading course: ${courseError.message}`);
          showSnackbar('Không thể tải thông tin khóa học. Vui lòng thử lại sau.', 'error');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Check for changes
  useEffect(() => {
    if (!originalCourse) return;
    
    // Get current content from editor
    const currentContent = editorRef.current ? editorRef.current.getContent() : course.content;
    
    // Deep comparison function for objects
    const isEqual = (obj1, obj2) => {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    };
    
    // Check if any field has changed
    const hasContentChanged = currentContent !== originalCourse.content;
    const hasTitleChanged = course.title !== originalCourse.title;
    const hasDescriptionChanged = course.description !== originalCourse.description;
    const hasTopicChanged = course.topicId !== originalCourse.topicId;
    const hasDurationChanged = course.duration !== originalCourse.duration;
    const hasModulesChanged = !isEqual(course.modules, originalCourse.modules);
    const hasQuizChanged = !isEqual(course.quiz, originalCourse.quiz);
    const hasImageChanged = course.coverImage !== null;
    
    const changes = hasContentChanged || 
                   hasTitleChanged || 
                   hasDescriptionChanged || 
                   hasTopicChanged || 
                   hasDurationChanged || 
                   hasModulesChanged || 
                   hasQuizChanged ||
                   hasImageChanged;
    
    setHasChanges(changes);
  }, [course, originalCourse]);
  
  // Save draft to local storage
  const saveDraft = () => {
    try {
      if (editorRef.current) {
        const editorContent = editorRef.current.getContent();
        const updatedCourse = {
          ...course,
          content: editorContent,
          imagePreview: imagePreview
        };
        localStorage.setItem('courseEditDraft', JSON.stringify(updatedCourse));
        setLastSaved(new Date());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for topicId to ensure it's a number
    if (name === 'topicId') {
      const numericValue = value === '' ? '' : Number(value);
      setCourse(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setCourse(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Module management functions
  const addModule = () => {
    const newModule = {
      courseModuleId: null, // Use null for new modules
      title: '',
      description: '',
      orderIndex: course.modules.length + 1,
      videos: []
    };
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (index, field, value) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      updatedModules[index] = {
        ...updatedModules[index],
        [field]: value
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const deleteModule = (index) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      updatedModules.splice(index, 1);
      
      // Update order indices
      const reindexedModules = updatedModules.map((mod, idx) => ({
        ...mod,
        orderIndex: idx + 1
      }));
      
      return { ...prev, modules: reindexedModules };
    });
  };

  // Video management functions
  const addVideo = (moduleIndex) => {
    const newVideo = {
      videoModuleId: null, // Use null for new videos
      title: '',
      videoUrl: ''
    };
    
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        videos: [...updatedModules[moduleIndex].videos, newVideo]
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const updateVideo = (moduleIndex, videoIndex, field, value) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      const updatedVideos = [...updatedModules[moduleIndex].videos];
      updatedVideos[videoIndex] = {
        ...updatedVideos[videoIndex],
        [field]: value
      };
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        videos: updatedVideos
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const deleteVideo = (moduleIndex, videoIndex) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      const updatedVideos = [...updatedModules[moduleIndex].videos];
      updatedVideos.splice(videoIndex, 1);
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        videos: updatedVideos
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Snackbar management
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current content from editor ref
    const currentContent = editorRef.current ? editorRef.current.getContent() : course.content;
    
    if (!course.title || !course.topicId || !course.description || !currentContent) {
      showSnackbar('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    // Set submitting state
    setIsSubmitting(true);
    // Show processing notification
    showSnackbar('Đang xử lý yêu cầu...', 'warning');

    try {
      setIsSubmitting(true);
      const token = getAccessToken();
      
      // Format the modules data for backend
      const modulesData = course.modules.map(module => ({
        // Use courseModuleId if available, otherwise null for new modules
        courseModuleId: module.courseModuleId,
        title: module.title,
        orderIndex: module.orderIndex,
        videos: module.videos.map(video => ({
          // Use videoModuleId if available, otherwise null for new videos
          videoModuleId: video.videoModuleId,
          title: video.title,
          videoUrl: video.videoUrl
        }))
      }));
      
      console.log("Sending modules data:", modulesData);
      
      // Prepare form data for submission with files
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('topicId', course.topicId);
      formData.append('description', course.description);
      formData.append('content', currentContent);
      formData.append('duration', course.duration);
      
      if (course.coverImage && typeof course.coverImage !== 'string') {
        formData.append('coverImage', course.coverImage);
      }
      
      // Append modules as JSON string
      formData.append('modules', JSON.stringify(modulesData));
      
      // Append quiz data
      if (course.quiz && course.quiz.sections.length > 0) {
        const quizData = {
          title: course.title,
          description: course.description,
          imageCover: course.coverImage ? 
            (typeof course.coverImage === 'string' ? course.coverImage : course.coverImage.name) : "",
          sections: course.quiz.sections.map(section => ({
            sectionId: section.id || section.sectionId || null,
            sectionName: section.sectionName,
            questions: section.questions.map(question => ({
              questionId: question.id || question.questionId || null,
              questionText: question.questionText,
              options: question.options.map(option => ({
                optionId: option.id || option.optionId || null,
                optionText: option.optionText,
                score: option.score
              }))
            }))
          })),
          conditions: course.quiz.conditions.map(condition => ({
            conditionId: condition.id || condition.conditionId || null,
            operator: condition.operator,
            value: condition.value,
            message: condition.message
          }))
        };
        formData.append('quiz', JSON.stringify(quizData));
      }
      
      // Set header for multipart form data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Use the API_URL with axios (since apiClient doesn't handle FormData well)
      const submitUrl = `${API_URL}/courses/${id}`;
      
      // Using axios directly here because we need to handle FormData with specific config
      const response = await axios.patch(submitUrl, formData, config);
      
      showSnackbar('Khóa học đã được cập nhật thành công!', 'success');
      
      // Clear the draft
      localStorage.removeItem('courseEditDraft');
      
      // Navigate back to history page after successful update
      setTimeout(() => {
        navigate('/staff/history');
      }, 2000);
      
    } catch (error) {
      // More detailed error message
      let errorMsg = 'Lỗi khi cập nhật khóa học';
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMsg += `: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg += ': Không nhận được phản hồi từ server, vui lòng thử lại sau';
      } else {
        // Something happened in setting up the request
        errorMsg += `: ${error.message}`;
      }
      showSnackbar(errorMsg, 'error');
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Handle saving draft
  const handleSaveDraft = () => {
    if (saveDraft()) {
      showSnackbar('Lưu bảng nháp thành công!', 'success');
    } else {
      showSnackbar('Lỗi khi lưu bảng nháp', 'error');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Debug log right before rendering
  console.log('Rendering EditCourse with course state:', course);
  console.log('Current topicId type:', typeof course.topicId, 'value:', course.topicId);
  console.log('Available topics:', topics);
  
  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'left' }}>
        Chỉnh Sửa Khóa Học
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Course title */}
        <TextField
          fullWidth
          label="Tên khóa học"
          name="title"
          value={course.title}
          onChange={handleChange}
          variant="outlined"
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 1
            }
          }}
        />
        
        {/* Topic and Image side by side */}
        <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
          {/* Topic selection */}
          <FormControl 
            fullWidth
            sx={{ 
              flex: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 1
              }
            }}
            error={!!apiError}
          >
            <InputLabel>Chủ đề</InputLabel>
            <Select
              label="Chủ đề"
              name="topicId"
              value={course.topicId !== undefined && course.topicId !== '' ? Number(course.topicId) : ''}
              onChange={(e) => {
                handleChange(e);
              }}
              disabled={topics.length === 0}
            >
              <MenuItem value="">
                <em>Chọn chủ đề</em>
              </MenuItem>
              
              {topics.map(topic => {
                const topicId = Number(topic.id);
                return (
                  <MenuItem key={topic.id} value={topicId}>
                    {topic.topicName || "Unnamed Topic"}
                  </MenuItem>
                );
              })}
            </Select>
            {apiError && <FormHelperText>Using mock topics data</FormHelperText>}
          </FormControl>
          
          {/* Image upload */}
          <Box
            sx={{
              flex: 1,
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: 1,
              height: 56,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              backgroundColor: 'white'
            }}
          >
            {!imagePreview ? (
              <Button 
                component="label"
                fullWidth
                sx={{ height: '100%' }}
              >
                Chọn ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            ) : (
              <>
                <img
                  src={imagePreview}
                  alt="Course preview"
                  style={{ maxWidth: '100%', maxHeight: 54, objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.7)'
                  }}
                  onClick={() => {
                    setImagePreview(null);
                    setCourse(prev => ({ ...prev, coverImage: null }));
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        
        {/* Description */}
        <TextField
          fullWidth
          label="Mô tả"
          name="description"
          value={course.description}
          onChange={handleChange}
          variant="outlined"
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 1
            }
          }}
        />
        
        {/* TinyMCE Editor */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium">Nội dung khóa học</Typography>
          </Box>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              height: 500, 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="text.secondary">
                Nội dung
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Editor
                apiKey="dpd386vjz5110tuev4munelye54caj3z0xj031ujmmahsu4h"
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                }}
                initialValue={course.content}
                init={{
                  height: '100%',
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                    'codesample'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | link image media | code preview fullscreen',
                  content_style: `
                    body { 
                      font-family: Helvetica, Arial, sans-serif; 
                      font-size: 14px;
                      direction: ltr;
                      text-align: left;
                    }
                  `,
                  browser_spellcheck: true,
                  directionality: 'ltr',
                  entity_encoding: 'raw',
                  convert_urls: false,
                  setup: function(editor) {
                    editor.on('init', function(e) {
                      editor.getBody().style.direction = 'ltr';
                      editor.getBody().style.textAlign = 'left';
                    });
                  }
                }}
              />
            </Box>
          </Paper>
        </Box>
        
        {/* Duration */}
        <TextField
          fullWidth
          label="Thời lượng"
          name="duration"
          type="number"
          value={course.duration}
          onChange={handleChange}
          variant="outlined"
          InputProps={{
            inputProps: { min: 1 }
          }}
          sx={{ 
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 1
            }
          }}
        />
        
        <Divider sx={{ my: 3 }} />
        
        {/* Modules section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Module</Typography>
            <Button
              variant="outlined"
              onClick={addModule}
            >
              Add module
            </Button>
          </Box>
          
          {course.modules.map((module, moduleIndex) => (
            <Box 
              key={moduleIndex} 
              sx={{ 
                border: '1px solid #c4c4c4',
                borderRadius: '30px',
                p: 3,
                position: 'relative',
                mb: 4,
                backgroundColor: 'white'
              }}
            >
              {/* X button to delete module */}
              <Box sx={{ position: 'absolute', top: -20, right: -20 }}>
                <IconButton 
                  sx={{ bgcolor: 'background.paper', border: '1px solid #c4c4c4' }}
                  onClick={() => deleteModule(moduleIndex)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              
              {/* Module order_index field */}
              <TextField
                fullWidth
                label="Textfield type int - order_index"
                type="number"
                value={module.orderIndex}
                InputProps={{
                  readOnly: true
                }}
                variant="outlined"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 1
                  }
                }}
              />
              
              {/* Module title field */}
              <TextField
                fullWidth
                label="Textfield của module_title"
                value={module.title}
                onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                variant="outlined"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 1
                  }
                }}
              />
              
              {/* Add video button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => addVideo(moduleIndex)}
                >
                  Add video
                </Button>
              </Box>
              
              {/* Videos list */}
              {module.videos && module.videos.map((video, videoIndex) => (
                <Box 
                  key={videoIndex} 
                  sx={{ 
                    border: '1px solid #c4c4c4',
                    borderRadius: '20px',
                    p: 3,
                    position: 'relative',
                    mb: 2,
                    backgroundColor: 'white'
                  }}
                >
                  {/* Delete video button */}
                  <IconButton 
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => deleteVideo(moduleIndex, videoIndex)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  
                  {/* Video title */}
                  <TextField
                    fullWidth
                    label="Textfield của title video"
                    value={video.title}
                    onChange={(e) => updateVideo(moduleIndex, videoIndex, 'title', e.target.value)}
                    variant="outlined"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1
                      }
                    }}
                  />
                  
                  {/* Video URL */}
                  <TextField
                    fullWidth
                    label="Textfield của link video"
                    value={video.videoUrl}
                    onChange={(e) => updateVideo(moduleIndex, videoIndex, 'videoUrl', e.target.value)}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Quiz section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Quiz</Typography>
            <Button
              variant="outlined"
              onClick={() => {
                if (!showQuizSection) {
                  setShowQuizSection(true);
                  if (course.quiz.sections.length === 0) {
                    // Add a default section when first opening
                    setCourse(prev => ({
                      ...prev,
                      quiz: {
                        ...prev.quiz,
                        sections: [...(prev.quiz?.sections || []), {
                          sectionId: null,
                          sectionName: '',
                          questions: []
                        }]
                      }
                    }));
                  }
                } else {
                  // Add another section if already showing
                  setCourse(prev => ({
                    ...prev,
                    quiz: {
                      ...prev.quiz,
                      sections: [...(prev.quiz?.sections || []), {
                        sectionId: null,
                        sectionName: '',
                        questions: []
                      }]
                    }
                  }));
                }
              }}
            >
              Add section
            </Button>
          </Box>
          
          {showQuizSection && course.quiz && (
            <Box>
              {/* Quiz Sections */}
              {course.quiz.sections.map((section, sectionIndex) => (
                <Box 
                  key={sectionIndex}
                  sx={{ 
                    mb: 3, 
                    p: 3,
                    border: '1px solid #c4c4c4',
                    borderRadius: '30px',
                    position: 'relative',
                    backgroundColor: 'white'
                  }}
                >
                  {/* X button to delete section */}
                  <Box sx={{ position: 'absolute', top: -20, right: -20 }}>
                    <IconButton 
                      sx={{ bgcolor: 'background.paper', border: '1px solid #c4c4c4' }}
                      onClick={() => {
                        const updatedSections = [...(course.quiz?.sections || [])];
                        updatedSections.splice(sectionIndex, 1);
                        setCourse(prev => ({
                          ...prev,
                          quiz: {
                            ...prev.quiz,
                            sections: updatedSections
                          }
                        }));
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  
                  {/* Section Name */}
                  <TextField
                    fullWidth
                    label="Textfield của section_name"
                    value={section.sectionName}
                    onChange={(e) => {
                      const updatedSections = [...(course.quiz?.sections || [])];
                      if (!updatedSections[sectionIndex]) {
                        updatedSections[sectionIndex] = { sectionId: section.sectionId || null, sectionName: '', questions: [] };
                      }
                      updatedSections[sectionIndex].sectionName = e.target.value;
                      setCourse(prev => ({
                        ...prev,
                        quiz: {
                          ...prev.quiz,
                          sections: updatedSections
                        }
                      }));
                    }}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  {/* Add Question Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button 
                      variant="outlined"
                      onClick={() => {
                        const updatedSections = [...(course.quiz?.sections || [])];
                        if (!updatedSections[sectionIndex]) {
                          updatedSections[sectionIndex] = { sectionId: section.sectionId || null, questions: [] };
                        }
                        if (!updatedSections[sectionIndex].questions) {
                          updatedSections[sectionIndex].questions = [];
                        }
                        updatedSections[sectionIndex].questions.push({
                          questionId: null,
                          questionText: '',
                          options: []
                        });
                        setCourse(prev => ({
                          ...prev,
                          quiz: {
                            ...prev.quiz,
                            sections: updatedSections
                          }
                        }));
                      }}
                    >
                      Add question
                    </Button>
                  </Box>
                  
                  {/* Questions */}
                  {section.questions && section.questions.map((question, questionIndex) => (
                    <Box 
                      key={questionIndex}
                      sx={{ 
                        mb: 3, 
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        position: 'relative'
                      }}
                    >
                      {/* Delete Question Button */}
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => {
                          const updatedSections = [...(course.quiz?.sections || [])];
                          if (updatedSections[sectionIndex] && updatedSections[sectionIndex].questions) {
                            updatedSections[sectionIndex].questions.splice(questionIndex, 1);
                            setCourse(prev => ({
                              ...prev,
                              quiz: {
                                ...prev.quiz,
                                sections: updatedSections
                              }
                            }));
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                      
                      {/* Question Text */}
                      <TextField
                        fullWidth
                        label="Textfield của questiontext"
                        value={question.questionText}
                        onChange={(e) => {
                          const updatedSections = [...(course.quiz?.sections || [])];
                          if (updatedSections[sectionIndex] && 
                              updatedSections[sectionIndex].questions && 
                              updatedSections[sectionIndex].questions[questionIndex]) {
                            updatedSections[sectionIndex].questions[questionIndex].questionText = e.target.value;
                            setCourse(prev => ({
                              ...prev,
                              quiz: {
                                ...prev.quiz,
                                sections: updatedSections
                              }
                            }));
                          }
                        }}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      
                      {/* Add Option Button */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button 
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const updatedSections = [...(course.quiz?.sections || [])];
                            if (!updatedSections[sectionIndex].questions[questionIndex].options) {
                              updatedSections[sectionIndex].questions[questionIndex].options = [];
                            }
                            updatedSections[sectionIndex].questions[questionIndex].options.push({
                              optionId: null,
                              optionText: '',
                              score: 0
                            });
                            setCourse(prev => ({
                              ...prev,
                              quiz: {
                                ...prev.quiz,
                                sections: updatedSections
                              }
                            }));
                          }}
                        >
                          Add option
                        </Button>
                      </Box>
                      
                      {/* Options */}
                      {question.options && question.options.map((option, optionIndex) => (
                        <Box 
                          key={optionIndex}
                          sx={{ 
                            mb: 2, 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          {/* Option Text */}
                          <TextField
                            fullWidth
                            label="Textfield của option_text"
                            value={option.optionText}
                            onChange={(e) => {
                              const updatedSections = [...(course.quiz?.sections || [])];
                              if (updatedSections[sectionIndex] && 
                                  updatedSections[sectionIndex].questions && 
                                  updatedSections[sectionIndex].questions[questionIndex] &&
                                  updatedSections[sectionIndex].questions[questionIndex].options &&
                                  updatedSections[sectionIndex].questions[questionIndex].options[optionIndex]) {
                                updatedSections[sectionIndex].questions[questionIndex].options[optionIndex].optionText = e.target.value;
                                setCourse(prev => ({
                                  ...prev,
                                  quiz: {
                                    ...prev.quiz,
                                    sections: updatedSections
                                  }
                                }));
                              }
                            }}
                            variant="outlined"
                          />
                          
                          {/* Option Score */}
                          <TextField
                            label="Textfield int score"
                            type="number"
                            value={option.score}
                            onChange={(e) => {
                              const updatedSections = [...(course.quiz?.sections || [])];
                              if (updatedSections[sectionIndex] && 
                                  updatedSections[sectionIndex].questions && 
                                  updatedSections[sectionIndex].questions[questionIndex] &&
                                  updatedSections[sectionIndex].questions[questionIndex].options) {
                                updatedSections[sectionIndex].questions[questionIndex].options[optionIndex].score = parseInt(e.target.value, 10) || 0;
                                setCourse(prev => ({
                                  ...prev,
                                  quiz: {
                                    ...prev.quiz,
                                    sections: updatedSections
                                  }
                                }));
                              }
                            }}
                            variant="outlined"
                            sx={{ width: '150px' }}
                          />
                          
                          {/* Delete Option Button */}
                          <IconButton
                            size="small"
                            onClick={() => {
                              const updatedSections = [...(course.quiz?.sections || [])];
                              if (updatedSections[sectionIndex] && 
                                  updatedSections[sectionIndex].questions && 
                                  updatedSections[sectionIndex].questions[questionIndex] &&
                                  updatedSections[sectionIndex].questions[questionIndex].options) {
                                updatedSections[sectionIndex].questions[questionIndex].options.splice(optionIndex, 1);
                                setCourse(prev => ({
                                  ...prev,
                                  quiz: {
                                    ...prev.quiz,
                                    sections: updatedSections
                                  }
                                }));
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Conditions section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Conditions</Typography>
            <Button
              variant="outlined"
              onClick={() => {
                if (!showConditionsSection) {
                  setShowConditionsSection(true);
                  if (course.quiz.conditions.length === 0) {
                    // Add a default condition when first opening
                    setCourse(prev => ({
                      ...prev,
                      quiz: {
                        ...prev.quiz,
                        conditions: [...(prev.quiz?.conditions || []), {
                          conditionId: null,
                          message: '',
                          value: 0,
                          operator: '='
                        }]
                      }
                    }));
                  }
                } else {
                  // Add another condition if already showing
                  setCourse(prev => ({
                    ...prev,
                    quiz: {
                      ...prev.quiz,
                      conditions: [...(prev.quiz?.conditions || []), {
                        conditionId: null,
                        message: '',
                        value: 0,
                        operator: '='
                      }]
                    }
                  }));
                }
              }}
            >
              Add conditions
            </Button>
          </Box>
          
          {showConditionsSection && course.quiz && (
            <Box sx={{ 
              border: '1px solid #c4c4c4',
              borderRadius: '30px',
              p: 3,
              backgroundColor: 'white'
            }}>
              {/* Conditions List */}
              {course.quiz.conditions.map((condition, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    mb: 2, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  {/* Message Text */}
                  <TextField
                    label="Textfield của message_text"
                    value={condition.message}
                    onChange={(e) => {
                      const updatedConditions = [...(course.quiz?.conditions || [])];
                      if (updatedConditions[index]) {
                        updatedConditions[index].message = e.target.value;
                        setCourse(prev => ({
                          ...prev,
                          quiz: {
                            ...prev.quiz,
                            conditions: updatedConditions
                          }
                        }));
                      }
                    }}
                    variant="outlined"
                    sx={{ flexGrow: 1 }}
                  />
                  
                  {/* Condition Value */}
                  <TextField
                    label="Textfield kiểu int của value"
                    type="number"
                    value={condition.value}
                    onChange={(e) => {
                      const updatedConditions = [...(course.quiz?.conditions || [])];
                      updatedConditions[index].value = parseInt(e.target.value, 10) || 0;
                      setCourse(prev => ({
                        ...prev,
                        quiz: {
                          ...prev.quiz,
                          conditions: updatedConditions
                        }
                      }));
                    }}
                    variant="outlined"
                    sx={{ width: '150px' }}
                  />
                  
                  {/* Operator */}
                  <TextField
                    select
                    label="operator (dấu)"
                    value={condition.operator}
                    onChange={(e) => {
                      const updatedConditions = [...(course.quiz?.conditions || [])];
                      updatedConditions[index].operator = e.target.value;
                      setCourse(prev => ({
                        ...prev,
                        quiz: {
                          ...prev.quiz,
                          conditions: updatedConditions
                        }
                      }));
                    }}
                    variant="outlined"
                    sx={{ width: '120px' }}
                  >
                    <MenuItem value="<">{"<"}</MenuItem>
                    <MenuItem value=">">{">"}</MenuItem>
                    <MenuItem value="=">{"="}</MenuItem>
                    <MenuItem value="<=">{"<="}</MenuItem>
                    <MenuItem value=">=">{">="}</MenuItem>
                  </TextField>
                  
                  {/* Delete Condition */}
                  <IconButton
                    size="small"
                    onClick={() => {
                      const updatedConditions = [...(course.quiz?.conditions || [])];
                      updatedConditions.splice(index, 1);
                      setCourse(prev => ({
                        ...prev,
                        quiz: {
                          ...prev.quiz,
                          conditions: updatedConditions
                        }
                      }));
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/staff/history')}
          >
            Quay lại
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              Lưu nháp
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Lưu thay đổi'}
            </Button>
          </Box>
        </Box>
      </Box>
      
      {lastSaved && (
        <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
          Lần lưu tự động gần nhất: {lastSaved.toLocaleTimeString()}
        </Typography>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'warning' ? null : 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditCourse; 