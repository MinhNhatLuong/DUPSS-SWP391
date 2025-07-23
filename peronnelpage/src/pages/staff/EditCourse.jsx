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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Code as CodeIcon
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
    topicId: '',
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

  // UI visibility states
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [showConditionsSection, setShowConditionsSection] = useState(false);
  
  // Load initial data: topics and course
  useEffect(() => {
    const fetchData = async () => {
      try {
        setApiError(null);
        
        // Fetch topics with apiClient
        try {
          console.log('Fetching topics...');
          
          // Use apiClient to fetch topics
          const topicsResponse = await apiClient.get('/topics');
          const topicsData = topicsResponse.data;
          
          console.log('Topics API response:', topicsData);
          
          // Handle topics data
          if (Array.isArray(topicsData)) {
            setTopics(topicsData);
            console.log('Topics loaded:', topicsData.length);
          } else {
            console.error('Topics data format error - not an array:', topicsData);
            setTopics([]);
            showSnackbar('Error loading topics data', 'error');
          }
        } catch (topicError) {
          console.error('Error fetching topics:', topicError);
          setTopics([]);
          setApiError(`Error loading topics: ${topicError.message}`);
          showSnackbar(`Failed to load topics: ${topicError.message}`, 'error');
        }
        
        // Fetch course data with updated API endpoint
        try {
          console.log('Fetching course data...');
          const courseResponse = await apiClient.get(`/staff/course/${id}`);
          const courseData = courseResponse.data;
          
          console.log('Course data:', courseData);
          
          // Convert topicId to number if it's a string to match with dropdown values
          const topicId = courseData.topicId ? 
            (typeof courseData.topicId === 'string' ? parseInt(courseData.topicId, 10) : courseData.topicId) : 
            '';
            
          console.log('Setting course data with topicId:', topicId);
          
          // Update course state with fetched data
          setCourse({
            title: courseData.title || '',
            topicId: topicId,
            description: courseData.description || '',
            content: courseData.content || '',
            duration: courseData.duration || 0,
            coverImage: null, // We'll just store the URL in imagePreview
            modules: courseData.modules || [],
            quiz: courseData.quiz || {
              sections: [],
              conditions: []
            }
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
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [id]);
  
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
    setCourse(prev => ({ ...prev, [name]: value }));
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
      title: '',
      description: '',
      content: '',
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
      
      // Build the final data structure based on all collected course information
      const courseData = {
        title: course.title,
        topicId: course.topicId,
        description: course.description,
        content: currentContent,
        duration: course.duration,
        coverImage: course.coverImage,
        modules: course.modules,
        quiz: course.quiz
      };

      // Prepare form data for submission with files
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('topicId', courseData.topicId);
      formData.append('description', courseData.description);
      formData.append('content', courseData.content);
      formData.append('duration', courseData.duration);
      
      if (courseData.coverImage && typeof courseData.coverImage !== 'string') {
        formData.append('coverImage', courseData.coverImage);
      }
      
      // Append modules as JSON string
      formData.append('modules', JSON.stringify(courseData.modules));
      
      // Append quiz data
      if (courseData.quiz && courseData.quiz.sections.length > 0) {
        const quizData = {
          title: courseData.title,
          description: courseData.description,
          imageCover: courseData.coverImage ? 
            (typeof courseData.coverImage === 'string' ? courseData.coverImage : courseData.coverImage.name) : "",
          sections: courseData.quiz.sections,
          conditions: courseData.quiz.conditions
        };
        formData.append('quiz', JSON.stringify(quizData));
      }
      
      // Log for debugging
      console.log('Submitting course form data with modules:', courseData.modules.length);

      // Set header for multipart form data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Use the API_URL with axios (since apiClient doesn't handle FormData well)
      const submitUrl = `${API_URL}/courses/${id}`;
      console.log('Submitting to URL:', submitUrl);
      
      // Using axios directly here because we need to handle FormData with specific config
      const response = await axios.patch(submitUrl, formData, config);
      
      console.log('Course update response:', response);
      showSnackbar('Khóa học đã được cập nhật thành công!', 'success');
      
      // Clear the draft
      localStorage.removeItem('courseEditDraft');
      
      // Navigate back to history page after successful update
      setTimeout(() => {
        navigate('/staff/history');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating course:', error);
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
          <TextField
            select
            fullWidth
            label="Chủ đề"
            name="topicId"
            value={course.topicId}
            onChange={handleChange}
            variant="outlined"
            sx={{ 
              flex: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 1
              }
            }}
            error={!!apiError}
            helperText={apiError ? 'Using mock topics data' : ''}
          >
            {topics.length === 0 && (
              <MenuItem disabled value="">
                No topics available - Check console for errors
              </MenuItem>
            )}
            
            {topics.map(topic => (
              <MenuItem key={topic.id} value={typeof topic.id === 'string' ? parseInt(topic.id, 10) : topic.id}>
                {topic.topicName || "Unnamed Topic"}
              </MenuItem>
            ))}
          </TextField>
          
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
                WYSIWYG Editor
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
                        updatedSections[sectionIndex] = { sectionName: '', questions: [] };
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
                          updatedSections[sectionIndex] = { questions: [] };
                        }
                        if (!updatedSections[sectionIndex].questions) {
                          updatedSections[sectionIndex].questions = [];
                        }
                        updatedSections[sectionIndex].questions.push({
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu khóa học'}
          </Button>
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