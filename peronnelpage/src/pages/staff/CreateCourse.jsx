import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  IconButton,
  Grid,
  Paper,
  ToggleButtonGroup,
  ToggleButton
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
// Import TinyMCE Editor - need to install: npm install @tinymce/tinymce-react
import { Editor } from '@tinymce/tinymce-react';

// API Base URL - adjust this based on your backend configuration
const API_BASE_URL = 'http://localhost:8080'; // Update this to match your backend URL

// Helper function to get auth token
const getAuthToken = () => {
  // Try to get token from localStorage
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  
  return token;
};

// Create axios instance with auth headers
const createAuthAxios = () => {
  const token = getAuthToken();
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': '*/*'
    }
  });
};

const CreateCourse = () => {
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
    quiz: null
  });

  // Additional states
  const [topics, setTopics] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Load initial data: topics and surveys
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        // Create authorized axios instance
        const authAxios = createAuthAxios();
        
        // Fetch topics first with detailed logging
        try {
          const topicsUrl = `/api/topics`;
          console.log('Fetching topics from:', API_BASE_URL + topicsUrl);
          
          const topicsResponse = await authAxios.get(topicsUrl);
          console.log('Topics API response:', topicsResponse);
          
          if (topicsResponse.data && Array.isArray(topicsResponse.data)) {
            setTopics(topicsResponse.data);
            console.log('Topics loaded:', topicsResponse.data.length);
          } else {
            console.error('Topics data format error:', topicsResponse.data);
            setApiError('Topics data format is not as expected');
            showSnackbar('Topics data format is not as expected', 'error');
          }
        } catch (topicError) {
          console.error('Error fetching topics:', topicError);
          setApiError(`Error loading topics: ${topicError.message}`);
          showSnackbar(`Error loading topics: ${topicError.message}`, 'error');
        }
        
        // Now fetch surveys
        try {
          const surveysUrl = `/api/staff/surveys`;
          console.log('Fetching surveys from:', API_BASE_URL + surveysUrl);
          
          const surveysResponse = await authAxios.get(surveysUrl);
          console.log('Surveys API response:', surveysResponse);
          
          if (surveysResponse.data && Array.isArray(surveysResponse.data)) {
            // Filter only surveys that are for courses
            setSurveys(surveysResponse.data.filter(survey => survey.forCourse) || []);
            console.log('Surveys loaded:', surveysResponse.data.length);
          } else {
            console.error('Surveys data format error:', surveysResponse.data);
            showSnackbar('Surveys data format is not as expected', 'error');
          }
        } catch (surveyError) {
          console.error('Error fetching surveys:', surveyError);
          showSnackbar(`Error loading surveys: ${surveyError.message}`, 'error');
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();

    // Load draft if available
    const savedDraft = localStorage.getItem('courseDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setCourse(parsedDraft);
        if (parsedDraft.coverImage && parsedDraft.imagePreview) {
          setImagePreview(parsedDraft.imagePreview);
        }
        showSnackbar('Draft loaded successfully', 'info');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }

    // Setup auto-save timer
    const timer = setInterval(() => {
      saveDraft();
    }, 60000); // Auto-save every minute
    setAutoSaveTimer(timer);

    // Cleanup
    return () => {
      isMounted.current = false;
      clearInterval(autoSaveTimer);
    };
  }, []);

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
        localStorage.setItem('courseDraft', JSON.stringify(updatedCourse));
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
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting course data:', course);
      
      // Prepare form data for multipart submission
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('topicId', course.topicId);
      formData.append('description', course.description);
      formData.append('content', currentContent);
      formData.append('duration', course.duration);
      
      if (course.coverImage) {
        formData.append('coverImage', course.coverImage);
      }
      
      // Append modules as JSON string
      formData.append('modules', JSON.stringify(course.modules));
      
      // Append quiz if selected
      if (course.quiz) {
        formData.append('quiz', JSON.stringify(course.quiz));
      }
      
      // Create authorized axios instance for submission
      const authAxios = createAuthAxios();
      
      // Submit the course
      const submitUrl = `/api/staff/course`;
      console.log('Submitting course to:', API_BASE_URL + submitUrl);
      
      await authAxios.post(submitUrl, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          // Auth headers are already added in the authAxios instance
        }
      });
      
      showSnackbar('Course created successfully!', 'success');
      
      // Clear the form and draft
      localStorage.removeItem('courseDraft');
      setCourse({
        title: '',
        topicId: '',
        description: '',
        content: '',
        duration: 0,
        coverImage: null,
        modules: [],
        quiz: null
      });
      setImagePreview(null);
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
      
    } catch (error) {
      console.error('Error creating course:', error);
      showSnackbar(`Error creating course: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving draft
  const handleSaveDraft = () => {
    if (saveDraft()) {
      showSnackbar('Draft saved successfully', 'success');
    } else {
      showSnackbar('Error saving draft', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Course
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Course title */}
        <TextField
          fullWidth
          label="Tên khóa học"
          name="title"
          value={course.title}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
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
            sx={{ flex: 3 }}
            error={!!apiError}
            helperText={apiError ? 'Error loading topics' : ''}
          >
            {loading && (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
              </MenuItem>
            )}
            
            {!loading && topics.length === 0 && (
              <MenuItem disabled value="">
                No topics available - Check console for errors
              </MenuItem>
            )}
            
            {topics.map(topic => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.topicName || "Unnamed Topic"} (ID: {topic.id})
              </MenuItem>
            ))}
          </TextField>
          
          {/* Image upload */}
          <Box
            sx={{
              flex: 1,
              border: '1px solid #c4c4c4',
              borderRadius: 1,
              height: 56,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
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
          sx={{ mb: 2 }}
        />
        
        {/* TinyMCE Editor - completely revised */}
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
              overflow: 'hidden'
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
                  // Basic config needed
                  browser_spellcheck: true,
                  directionality: 'ltr',
                  entity_encoding: 'raw',
                  convert_urls: false,
                  // Remove onchange event handlers from TinyMCE's config
                  setup: function(editor) {
                    editor.on('init', function(e) {
                      // One time set direction on init
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
          sx={{ mb: 4 }}
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
                mb: 4
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
                sx={{ mb: 2 }}
              />
              
              {/* Module title field */}
              <TextField
                fullWidth
                label="Textfield của module_title"
                value={module.title}
                onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
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
              {module.videos.map((video, videoIndex) => (
                <Box 
                  key={videoIndex} 
                  sx={{ 
                    border: '1px solid #c4c4c4',
                    borderRadius: '20px',
                    p: 3,
                    position: 'relative',
                    mb: 2
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
                    sx={{ mb: 2 }}
                  />
                  
                  {/* Video URL */}
                  <TextField
                    fullWidth
                    label="Textfield của link video"
                    value={video.videoUrl}
                    onChange={(e) => updateVideo(moduleIndex, videoIndex, 'videoUrl', e.target.value)}
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Quiz section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quiz
          </Typography>
          <TextField
            select
            fullWidth
            label="Bài khảo sát"
            value={course.quiz ? course.quiz.surveyId : ''}
            onChange={(e) => {
              const surveyId = e.target.value;
              const selectedSurvey = surveys.find(s => s.surveyId.toString() === surveyId.toString());
              setCourse(prev => ({
                ...prev,
                quiz: selectedSurvey || null
              }));
            }}
            variant="outlined"
            error={surveys.length === 0 && !loading}
            helperText={surveys.length === 0 && !loading ? 'No surveys available' : ''}
          >
            {loading && (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
              </MenuItem>
            )}
          
            <MenuItem value="">
              <em>Không có quiz</em>
            </MenuItem>
            
            {surveys.map((survey) => (
              <MenuItem key={survey.surveyId} value={survey.surveyId}>
                {survey.surveyTitle} {survey.forCourse ? '(Course Quiz)' : ''}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
          >
            Lưu nháp
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Lưu khóa học'}
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
        autoHideDuration={6000}
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

export default CreateCourse; 