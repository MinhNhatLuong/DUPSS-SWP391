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
    quiz: {
      sections: [],
      conditions: []
    }
  });

  // Additional states
  const [topics, setTopics] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [apiError, setApiError] = useState(null);

  // UI visibility states
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [showConditionsSection, setShowConditionsSection] = useState(false);

  // Load initial data: topics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        // Fetch topics with simpler approach
        try {
          const topicsUrl = `${API_BASE_URL}/api/topics`;
          console.log('Fetching topics from:', topicsUrl);
          
          // Simple fetch without auth headers first to test API
          const response = await fetch(topicsUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Topics API response:', data);
          
          // Even if the API returns empty array, we'll handle it gracefully
          if (Array.isArray(data)) {
            setTopics(data);
            console.log('Topics loaded:', data.length);
          } else {
            console.error('Topics data format error - not an array:', data);
            
            // Use mock data if API fails
            const mockTopics = [
              {
                id: 1,
                topicName: "Healthy Lifestyle",
                topicDescription: "Topics related to maintaining a healthy lifestyle",
                creatorName: "Admin",
                createdAt: "2023-06-24T04:48:10.755Z",
                updatedAt: "2023-06-24T04:48:10.755Z"
              },
              {
                id: 2,
                topicName: "Mental Health",
                topicDescription: "Topics focused on mental wellbeing",
                creatorName: "Admin",
                createdAt: "2023-06-24T04:48:10.755Z",
                updatedAt: "2023-06-24T04:48:10.755Z"
              },
              {
                id: 3,
                topicName: "Nutrition",
                topicDescription: "All about healthy eating and nutrition",
                creatorName: "Admin",
                createdAt: "2023-06-24T04:48:10.755Z",
                updatedAt: "2023-06-24T04:48:10.755Z"
              }
            ];
            
            setTopics(mockTopics);
            showSnackbar('Using mock topics data for development', 'info');
          }
        } catch (topicError) {
          console.error('Error fetching topics:', topicError);
          
          // Provide fallback mock data for development
          const mockTopics = [
            {
              id: 1,
              topicName: "Healthy Lifestyle",
              topicDescription: "Topics related to maintaining a healthy lifestyle",
              creatorName: "Admin",
              createdAt: "2023-06-24T04:48:10.755Z",
              updatedAt: "2023-06-24T04:48:10.755Z"
            },
            {
              id: 2,
              topicName: "Mental Health",
              topicDescription: "Topics focused on mental wellbeing",
              creatorName: "Admin",
              createdAt: "2023-06-24T04:48:10.755Z",
              updatedAt: "2023-06-24T04:48:10.755Z"
            },
            {
              id: 3,
              topicName: "Nutrition",
              topicDescription: "All about healthy eating and nutrition",
              creatorName: "Admin",
              createdAt: "2023-06-24T04:48:10.755Z",
              updatedAt: "2023-06-24T04:48:10.755Z"
            }
          ];
          
          setTopics(mockTopics);
          setApiError(`Error loading topics: ${topicError.message} - Using mock data`);
          showSnackbar(`Using mock topics data for development`, 'info');
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

    // Cleanup
    return () => {
      isMounted.current = false;
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
      
      // Append quiz data
      if (course.quiz && course.quiz.sections.length > 0) {
        const quizData = {
          title: course.title,
          description: course.description,
          imageCover: course.coverImage ? course.coverImage.name : "",
          sections: course.quiz.sections,
          conditions: course.quiz.conditions
        };
        formData.append('quiz', JSON.stringify(quizData));
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
        quiz: {
          sections: [],
          conditions: []
        }
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
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'left' }}>
        Tạo Khóa Học
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
              {module.videos.map((video, videoIndex) => (
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
        
        {/* Quiz section - updated layout */}
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
        
        {/* Conditions section - updated layout */}
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