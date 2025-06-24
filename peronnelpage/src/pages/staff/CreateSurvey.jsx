import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Divider,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const API_BASE_URL = 'http://localhost:8080'; // Update this to match your backend URL

// Helper function to get auth token
const getAuthToken = () => {
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

const CreateSurvey = () => {
  const editorRef = useRef(null);
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    imageCover: null,
    sections: [],
    conditions: []
  });

  // UI visibility states
  const [showSectionsUI, setShowSectionsUI] = useState(false);
  const [showConditionsUI, setShowConditionsUI] = useState(false);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Handle basic field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSurvey(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSurvey(prev => ({ ...prev, imageCover: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save draft to local storage
  const handleSaveDraft = () => {
    const currentContent = editorRef.current ? editorRef.current.getContent() : '';
    const updatedSurvey = {
      ...survey,
      description: currentContent,
      imagePreview: imagePreview
    };
    
    localStorage.setItem('surveyDraft', JSON.stringify(updatedSurvey));
    
    setSnackbar({
      open: true,
      message: 'Bản nháp đã được lưu thành công!',
      severity: 'success'
    });
  };

  // Load draft from local storage
  useEffect(() => {
    const savedDraft = localStorage.getItem('surveyDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setSurvey(parsedDraft);
        if (parsedDraft.imagePreview) {
          setImagePreview(parsedDraft.imagePreview);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current content from editor ref
    const currentContent = editorRef.current ? editorRef.current.getContent() : survey.description;
    
    if (!survey.title || !currentContent) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ tiêu đề và mô tả.',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare form data for multipart submission
      const formData = new FormData();
      formData.append('title', survey.title);
      formData.append('description', currentContent);
      
      if (survey.imageCover) {
        formData.append('imageCover', survey.imageCover);
      }
      
      // Append sections and conditions as JSON strings
      formData.append('sections', JSON.stringify(survey.sections));
      formData.append('conditions', JSON.stringify(survey.conditions));
      
      // Create authorized axios instance for submission
      const authAxios = createAuthAxios();
      
      // Submit the survey
      await authAxios.post('/api/survey', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Khảo sát đã được tạo thành công!',
        severity: 'success'
      });
      
      // Clear the form and draft
      localStorage.removeItem('surveyDraft');
      setSurvey({
        title: '',
        description: '',
        imageCover: null,
        sections: [],
        conditions: []
      });
      setImagePreview(null);
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
      
      // Reset UI visibility
      setShowSectionsUI(false);
      setShowConditionsUI(false);
    } catch (error) {
      console.error('Error creating survey:', error);
      setSnackbar({
        open: true,
        message: `Có lỗi khi tạo khảo sát: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a section
  const addSection = () => {
    if (!showSectionsUI) {
      setShowSectionsUI(true);
    }
    
    setSurvey(prev => ({
      ...prev,
      sections: [...prev.sections, {
        sectionName: '',
        questions: []
      }]
    }));
  };

  // Handle adding a question to a section
  const addQuestion = (sectionIndex) => {
    const updatedSections = [...survey.sections];
    if (!updatedSections[sectionIndex].questions) {
      updatedSections[sectionIndex].questions = [];
    }
    
    updatedSections[sectionIndex].questions.push({
      questionText: '',
      options: []
    });
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle adding an option to a question
  const addOption = (sectionIndex, questionIndex) => {
    const updatedSections = [...survey.sections];
    if (!updatedSections[sectionIndex].questions[questionIndex].options) {
      updatedSections[sectionIndex].questions[questionIndex].options = [];
    }
    
    updatedSections[sectionIndex].questions[questionIndex].options.push({
      optionText: '',
      score: 0
    });
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle adding a condition
  const addCondition = () => {
    if (!showConditionsUI) {
      setShowConditionsUI(true);
    }
    
    setSurvey(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        message: '',
        value: 0,
        operator: '='
      }]
    }));
  };

  // Handle section name change
  const updateSectionName = (index, value) => {
    const updatedSections = [...survey.sections];
    updatedSections[index].sectionName = value;
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle question text change
  const updateQuestionText = (sectionIndex, questionIndex, value) => {
    const updatedSections = [...survey.sections];
    updatedSections[sectionIndex].questions[questionIndex].questionText = value;
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle option update
  const updateOption = (sectionIndex, questionIndex, optionIndex, field, value) => {
    const updatedSections = [...survey.sections];
    updatedSections[sectionIndex].questions[questionIndex].options[optionIndex][field] = 
      field === 'score' ? parseInt(value, 10) || 0 : value;
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle condition update
  const updateCondition = (index, field, value) => {
    const updatedConditions = [...survey.conditions];
    updatedConditions[index][field] = field === 'value' ? parseInt(value, 10) || 0 : value;
    
    setSurvey(prev => ({
      ...prev,
      conditions: updatedConditions
    }));
  };

  // Handle delete section
  const deleteSection = (index) => {
    const updatedSections = [...survey.sections];
    updatedSections.splice(index, 1);
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));

    if (updatedSections.length === 0) {
      setShowSectionsUI(false);
    }
  };

  // Handle delete question
  const deleteQuestion = (sectionIndex, questionIndex) => {
    const updatedSections = [...survey.sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle delete option
  const deleteOption = (sectionIndex, questionIndex, optionIndex) => {
    const updatedSections = [...survey.sections];
    updatedSections[sectionIndex].questions[questionIndex].options.splice(optionIndex, 1);
    
    setSurvey(prev => ({
      ...prev,
      sections: updatedSections
    }));
  };

  // Handle delete condition
  const deleteCondition = (index) => {
    const updatedConditions = [...survey.conditions];
    updatedConditions.splice(index, 1);
    
    setSurvey(prev => ({
      ...prev,
      conditions: updatedConditions
    }));

    if (updatedConditions.length === 0) {
      setShowConditionsUI(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'left' }}>
        Tạo Khảo Sát
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Title and Image */}
        <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
          {/* Survey title */}
          <TextField
            fullWidth
            label="Tên khảo sát"
            name="title"
            value={survey.title}
            onChange={handleChange}
            variant="outlined"
            sx={{ 
              flex: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 1
              }
            }}
          />
          
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
                  onChange={handleImageChange}
                />
              </Button>
            ) : (
              <>
                <img
                  src={imagePreview}
                  alt="Survey preview"
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
                    setSurvey(prev => ({ ...prev, imageCover: null }));
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        
        {/* TinyMCE Editor for Description */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium">Mô tả khảo sát</Typography>
          </Box>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              height: 300, 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="text.secondary">
                Text editor vĩ dụ Tiny MCE cho phần description
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Editor
                apiKey="dpd386vjz5110tuev4munelye54caj3z0xj031ujmmahsu4h"
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                }}
                initialValue={survey.description}
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
        
        <Divider sx={{ my: 3 }} />
        
        {/* Sections */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Survey</Typography>
            <Button
              variant="outlined"
              onClick={addSection}
            >
              Add Section
            </Button>
          </Box>
          
          {showSectionsUI && (
            <Box>
              {survey.sections.map((section, sectionIndex) => (
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
                      onClick={() => deleteSection(sectionIndex)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  
                  {/* Section Name */}
                  <TextField
                    fullWidth
                    label="Textfield của section_name"
                    value={section.sectionName}
                    onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  {/* Add Question Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button 
                      variant="outlined"
                      onClick={() => addQuestion(sectionIndex)}
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
                        onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                      
                      {/* Question Text */}
                      <TextField
                        fullWidth
                        label="Textfield của questionText"
                        value={question.questionText}
                        onChange={(e) => updateQuestionText(sectionIndex, questionIndex, e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      
                      {/* Add Option Button */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button 
                          variant="outlined"
                          size="small"
                          onClick={() => addOption(sectionIndex, questionIndex)}
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
                            onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, 'optionText', e.target.value)}
                            variant="outlined"
                          />
                          
                          {/* Option Score */}
                          <TextField
                            label="Textfield int score"
                            type="number"
                            value={option.score}
                            onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, 'score', e.target.value)}
                            variant="outlined"
                            sx={{ width: '150px' }}
                          />
                          
                          {/* Delete Option Button */}
                          <IconButton
                            size="small"
                            onClick={() => deleteOption(sectionIndex, questionIndex, optionIndex)}
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
        
        {/* Conditions */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Conditions</Typography>
            <Button
              variant="outlined"
              onClick={addCondition}
            >
              Add conditions
            </Button>
          </Box>
          
          {showConditionsUI && (
            <Box sx={{ 
              border: '1px solid #c4c4c4',
              borderRadius: '30px',
              p: 3,
              backgroundColor: 'white'
            }}>
              {/* Conditions List */}
              {survey.conditions.map((condition, index) => (
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
                    onChange={(e) => updateCondition(index, 'message', e.target.value)}
                    variant="outlined"
                    sx={{ flexGrow: 1 }}
                  />
                  
                  {/* Condition Value */}
                  <TextField
                    label="Textfield kiểu int của value"
                    type="number"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    variant="outlined"
                    sx={{ width: '150px' }}
                  />
                  
                  {/* Operator */}
                  <TextField
                    select
                    label="operator (dấu)"
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
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
                    onClick={() => deleteCondition(index)}
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
            {loading ? <CircularProgress size={24} /> : 'Lưu khảo sát'}
          </Button>
        </Box>
      </Box>
      
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

export default CreateSurvey; 