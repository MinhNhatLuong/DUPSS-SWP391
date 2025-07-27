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
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccessToken, checkAndRefreshToken } from '../../utils/auth';
import apiClient from '../../services/apiService';
import { API_URL } from '../../services/config';

const EditSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  // State for survey data
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    imageCover: null,
    active: true,
    forCourse: false,
    sections: [],
    conditions: []
  });

  // UI visibility states
  const [showSectionsUI, setShowSectionsUI] = useState(false);
  const [showConditionsUI, setShowConditionsUI] = useState(false);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success', action: null });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSurvey, setOriginalSurvey] = useState(null);

  // Fetch survey data
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setInitialLoading(true);
        
        // Ensure we have a valid token
        await checkAndRefreshToken();
        const token = getAccessToken();
        
        // Use axios directly with proper headers
        const response = await axios.get(`${API_URL}/staff/surveys/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const surveyData = response.data;
        
        // Format the survey data to match our state structure
        
        const surveyObj = {
          title: surveyData.title || surveyData.surveyTitle || '',
          description: surveyData.description || '',
          imageCover: null,
          active: surveyData.active !== false,
          forCourse: surveyData.forCourse || false,
          sections: surveyData.sections?.map(section => ({
            sectionId: section.sectionId || null,
            sectionName: section.sectionName || '',
            questions: section.questions?.map(question => ({
              questionId: question.questionId || null,
              questionText: question.questionText || '',
              options: question.options?.map(option => ({
                optionId: option.optionId || null,
                optionText: option.optionText || '',
                score: option.score || 0
              })) || []
            })) || []
          })) || [],
          conditions: surveyData.conditions?.map(condition => ({
            conditionId: condition.conditionId || null,
            message: condition.message || '',
            value: condition.value || 0,
            operator: condition.operator || '='
          })) || []
        };
        
        setSurvey(surveyObj);
        
        // Store original data for comparison
        setOriginalSurvey({
          ...surveyObj,
          description: surveyData.description || ''
        });
        
        // Set image preview if available
        if (surveyData.surveyImage) {
          setImagePreview(surveyData.surveyImage);
        }
        
        // Set UI visibility based on data
        if (surveyData.sections && surveyData.sections.length > 0) {
          setShowSectionsUI(true);
        }
        
        if (surveyData.conditions && surveyData.conditions.length > 0) {
          setShowConditionsUI(true);
        }
        
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin khảo sát. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchSurvey();
  }, [id]);

  // Load draft from local storage
  useEffect(() => {
    if (!id) return;
    
    const savedDraft = localStorage.getItem(`surveyEditDraft_${id}`);
    if (savedDraft && !initialLoading) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        
        setSnackbar({
          open: true,
          message: 'Đã tìm thấy bản nháp. Bạn có muốn tải lên?',
          severity: 'info',
          action: (
            <Button color="inherit" size="small" onClick={() => {
              setSurvey(parsedDraft);
              if (parsedDraft.imagePreview) {
                setImagePreview(parsedDraft.imagePreview);
              }
              if (parsedDraft.sections && parsedDraft.sections.length > 0) {
                setShowSectionsUI(true);
              }
              if (parsedDraft.conditions && parsedDraft.conditions.length > 0) {
                setShowConditionsUI(true);
              }
              setSnackbar({
                open: true,
                message: 'Đã tải bản nháp thành công!',
                severity: 'success'
              });
            }}>
              Tải lên
            </Button>
          )
        });
      } catch (error) {
        // Error parsing draft, ignore silently
        console.error("Error parsing draft:", error);
      }
    }
  }, [id, initialLoading]);

  // Check for changes
  useEffect(() => {
    if (!originalSurvey) return;
    
    // Get current content from editor
    const currentContent = editorRef.current ? editorRef.current.getContent() : survey.description;
    
    // Deep comparison function for objects
    const isEqual = (obj1, obj2) => {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    };
    
    // Check if any field has changed
    const hasContentChanged = currentContent !== originalSurvey.description;
    const hasTitleChanged = survey.title !== originalSurvey.title;
    const hasActiveChanged = survey.active !== originalSurvey.active;
    const hasForCourseChanged = survey.forCourse !== originalSurvey.forCourse;
    const hasSectionsChanged = !isEqual(survey.sections, originalSurvey.sections);
    const hasConditionsChanged = !isEqual(survey.conditions, originalSurvey.conditions);
    const hasImageChanged = survey.imageCover !== null;
    
    const changes = hasContentChanged || 
                   hasTitleChanged || 
                   hasActiveChanged || 
                   hasForCourseChanged || 
                   hasSectionsChanged || 
                   hasConditionsChanged ||
                   hasImageChanged;
    
    setHasChanges(changes);
  }, [survey, originalSurvey]);

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
    
    localStorage.setItem(`surveyEditDraft_${id}`, JSON.stringify(updatedSurvey));
    
    setSnackbar({
      open: true,
      message: 'Lưu bảng nháp thành công!',
      severity: 'success'
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current content from editor ref
    const currentContent = editorRef.current ? editorRef.current.getContent() : survey.description;
    
    // Validate all required fields
    const validationErrors = [];
    
    if (!survey.title || survey.title.trim() === '') {
      validationErrors.push('Tiêu đề khảo sát không được để trống');
    }
    
    if (!currentContent || currentContent.trim() === '') {
      validationErrors.push('Mô tả khảo sát không được để trống');
    }
    
    if (!survey.sections || survey.sections.length === 0) {
      validationErrors.push('Phải có ít nhất một section');
    } else {
      // Check if each section has at least one question
      const sectionsWithoutQuestions = survey.sections.filter(section => 
        !section.questions || section.questions.length === 0
      );
      
      if (sectionsWithoutQuestions.length > 0) {
        validationErrors.push('Mỗi section phải có ít nhất một câu hỏi');
      } else {
        // Check if section names are filled
        const sectionsWithEmptyNames = survey.sections.filter(section => 
          !section.sectionName || section.sectionName.trim() === ''
        );
        
        if (sectionsWithEmptyNames.length > 0) {
          validationErrors.push('Tên section không được để trống');
        }
        
        // Check if question texts are filled
        let hasEmptyQuestionText = false;
        for (const section of survey.sections) {
          for (const question of section.questions) {
            if (!question.questionText || question.questionText.trim() === '') {
              hasEmptyQuestionText = true;
              break;
            }
          }
          if (hasEmptyQuestionText) break;
        }
        
        if (hasEmptyQuestionText) {
          validationErrors.push('Nội dung câu hỏi không được để trống');
        }
        
        // Check if each question has at least one option
        let hasQuestionWithoutOptions = false;
        let hasEmptyOptionText = false;
        
        for (const section of survey.sections) {
          for (const question of section.questions) {
            if (!question.options || question.options.length === 0) {
              hasQuestionWithoutOptions = true;
              break;
            }
            
            // Check if option texts are filled
            for (const option of question.options) {
              if (!option.optionText || option.optionText.trim() === '') {
                hasEmptyOptionText = true;
                break;
              }
            }
            if (hasEmptyOptionText) break;
          }
          if (hasQuestionWithoutOptions || hasEmptyOptionText) break;
        }
        
        if (hasQuestionWithoutOptions) {
          validationErrors.push('Mỗi câu hỏi phải có ít nhất một lựa chọn');
        }
        
        if (hasEmptyOptionText) {
          validationErrors.push('Nội dung lựa chọn không được để trống');
        }
      }
    }
    
    if (!survey.conditions || survey.conditions.length === 0) {
      validationErrors.push('Phải có ít nhất một điều kiện');
    } else {
      // Check if condition messages are filled
      const conditionsWithEmptyMessages = survey.conditions.filter(condition => 
        !condition.message || condition.message.trim() === ''
      );
      
      if (conditionsWithEmptyMessages.length > 0) {
        validationErrors.push('Nội dung điều kiện không được để trống');
      }
    }
    
    // If there are validation errors, show them and stop submission
    if (validationErrors.length > 0) {
      setSnackbar({
        open: true,
        message: `Có lỗi khi cập nhật khảo sát: ${validationErrors.join(', ')}`,
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Ensure we have a valid token
      const isTokenValid = await checkAndRefreshToken();
      
      if (!isTokenValid) {
        setSnackbar({
          open: true,
          message: 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Get fresh token after potential refresh
      const accessToken = getAccessToken();
      
      // Create survey request object according to required format
      const surveyRequest = {
        title: survey.title,
        description: currentContent,
        active: survey.active,
        forCourse: survey.forCourse,
        sections: survey.sections.map(section => ({
          sectionId: section.sectionId || null,
          sectionName: section.sectionName,
          questions: section.questions.map(question => ({
            questionId: question.questionId || null,
            questionText: question.questionText,
            options: question.options.map(option => ({
              optionId: option.optionId || null,
              optionText: option.optionText,
              score: option.score
            }))
          }))
        })),
        conditions: survey.conditions.map(condition => ({
          conditionId: condition.conditionId || null,
          operator: condition.operator,
          value: condition.value,
          message: condition.message
        }))
      };
      
      console.log('Sending survey update request:', surveyRequest);
      
      // Prepare form data for multipart submission
      const formData = new FormData();
      
      // Add the JSON request as a blob with parameter "request"
      formData.append('request', new Blob([JSON.stringify(surveyRequest)], {
        type: 'application/json'
      }));
      
      // Add the cover image if it exists - use the correct parameter name 'images'
      if (survey.imageCover) {
        formData.append('images', survey.imageCover);
      }
      
      // Submit the survey using axios with proper headers
      const response = await axios({
        method: 'patch',
        url: `${API_URL}/staff/survey/${id}`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Khảo sát đã được cập nhật thành công!',
        severity: 'success'
      });
      
      // Clear the draft
      localStorage.removeItem(`surveyEditDraft_${id}`);
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/staff/history');
      }, 2000);
      
    } catch (error) {
      let errorMessage = 'Có lỗi khi cập nhật khảo sát';
      
      console.error('Error updating survey:', error);
      console.error('Error response:', error.response?.data || 'No response data');
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = `${errorMessage}: ${error.response.data.message}`;
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      } else {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
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
        sectionId: null,
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
      questionId: null,
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
      optionId: null,
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
        conditionId: null,
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

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'left' }}>
        Chỉnh Sửa Khảo Sát
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
              height: 500, 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" color="text.secondary">
                Mô tả
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
                  min_height: 450,
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
              disabled={loading}
            >
              Lưu nháp
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading || !hasChanges}
            >
              {loading ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
            </Button>
          </Box>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          action={snackbar.action}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditSurvey; 